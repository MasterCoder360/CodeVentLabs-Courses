/* Accounts: the sign-up / sign-in / sign-out routes.

   Password hashing, sessions and validation live in lib/crypto.js,
   lib/session.js and lib/validate.js so the verification and OAuth
   routes can share them. */

import { reply, fail, readJson } from './http.js';
import { randomHex, hashPassword, safeEqual } from './crypto.js';
import { cleanName, cleanEmail, cleanPassword } from './validate.js';
import { createSession, currentSession, publicUser, revokeSession, userByEmail } from './session.js';
import { loadProgress, saveProgress, sanitizeState } from './progress.js';
import { sendVerification } from './tokens.js';
import { providersFor } from './oauth.js';

const MAX_ATTEMPTS = 12;          // failed sign-ins per email+IP
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

/* ---------- Sign-in throttling ----------
   Per-isolate and best-effort: it slows down repeated guessing without
   needing another table. Passwords are still hashed slowly server-side. */
const attempts = new Map();

function attemptKey(request, email) {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    return ip + '|' + email;
}

function isThrottled(key) {
    const record = attempts.get(key);
    if (!record) return false;
    if (Date.now() - record.first > ATTEMPT_WINDOW_MS) {
        attempts.delete(key);
        return false;
    }
    return record.count >= MAX_ATTEMPTS;
}

function noteFailure(key) {
    const record = attempts.get(key);
    if (!record || Date.now() - record.first > ATTEMPT_WINDOW_MS) {
        attempts.set(key, { first: Date.now(), count: 1 });
        if (attempts.size > 5000) {
            for (const [k, v] of attempts) {
                if (Date.now() - v.first > ATTEMPT_WINDOW_MS) attempts.delete(k);
            }
        }
        return;
    }
    record.count++;
}

/* ---------- Routes ---------- */
export async function handleSignup(request, env) {
    const body = await readJson(request);
    if (body.tooLarge) return fail(request, 413, 'That request was too large.');
    if (body.invalid) return fail(request, 400, 'We couldn’t read that request.');
    const input = body.value;

    const name = cleanName(input.name);
    if (name.error) return fail(request, 400, name.error, name.field);
    const email = cleanEmail(input.email);
    if (email.error) return fail(request, 400, email.error, email.field);
    const password = cleanPassword(input.password);
    if (password.error) return fail(request, 400, password.error, password.field);

    const taken = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
        .bind(email.value).first();
    if (taken) {
        return fail(request, 409, 'An account with that email already exists. Try signing in instead.', 'email');
    }

    const salt = randomHex(16);
    const passwordHash = await hashPassword(password.value, salt);
    const userId = crypto.randomUUID();
    const now = Date.now();

    try {
        await env.DB.prepare(
            `INSERT INTO users (id, name, email, password_hash, salt, created_at, email_verified)
             VALUES (?, ?, ?, ?, ?, ?, 0)`
        ).bind(userId, name.value, email.value, passwordHash, salt, now).run();
    } catch (err) {
        // A race with another signup for the same address.
        if (String(err && err.message).toLowerCase().includes('unique')) {
            return fail(request, 409, 'An account with that email already exists. Try signing in instead.', 'email');
        }
        throw err;
    }

    // Carry over whatever was earned as a guest on this device.
    const state = sanitizeState(input.state);
    await saveProgress(env, userId, state);

    const session = await createSession(env, userId);
    const verification = await sendVerification(env, {
        id: userId, name: name.value, email: email.value, email_verified: 0,
    });

    return reply(request, {
        token: session.token,
        expiresAt: session.expiresAt,
        user: { id: userId, name: name.value, email: email.value, createdAt: now, emailVerified: false },
        state,
        verification,
    }, 201);
}

export async function handleLogin(request, env) {
    const body = await readJson(request);
    if (body.tooLarge) return fail(request, 413, 'That request was too large.');
    if (body.invalid) return fail(request, 400, 'We couldn’t read that request.');
    const input = body.value;

    const email = cleanEmail(input.email);
    if (email.error) return fail(request, 400, email.error, email.field);
    const password = String(input.password == null ? '' : input.password);
    if (!password) return fail(request, 400, 'Enter your password.', 'password');

    const key = attemptKey(request, email.value);
    if (isThrottled(key)) {
        return fail(request, 429, 'Too many attempts. Wait a few minutes and try again.');
    }

    const row = await userByEmail(env, email.value);

    // Hash even when the account is missing so a wrong email and a wrong
    // password take the same time.
    const salt = row ? row.salt : randomHex(16);
    const candidate = await hashPassword(password, salt);
    const ok = !!row && safeEqual(candidate, row.password_hash);

    if (!ok) {
        noteFailure(key);
        return fail(request, 401, 'Email or password is incorrect.');
    }

    attempts.delete(key);
    const session = await createSession(env, row.id);
    return reply(request, {
        token: session.token,
        expiresAt: session.expiresAt,
        user: publicUser(row),
        state: await loadProgress(env, row.id),
    });
}

export async function handleLogout(request, env) {
    const session = await currentSession(request, env);
    if (session) await revokeSession(env, session.tokenHash);
    return reply(request, { ok: true });
}

export async function handleMe(request, env) {
    const session = await currentSession(request, env);
    if (!session) return fail(request, 401, 'Please sign in.');
    return reply(request, {
        user: session.user,
        providers: await providersFor(env, session.user.id),
        state: await loadProgress(env, session.user.id),
    });
}
