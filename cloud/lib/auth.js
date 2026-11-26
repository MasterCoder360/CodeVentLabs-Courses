/* Accounts: password hashing, sessions, and the sign-up / sign-in routes.

   Passwords are never stored. Each account keeps a random salt and a
   PBKDF2-SHA256 hash of the password; the browser only ever holds an
   opaque session token whose SHA-256 is what the sessions table stores. */

import { reply, fail, readJson } from './http.js';
import { loadProgress, saveProgress, sanitizeState } from './progress.js';

/* 100000 is the highest PBKDF2 iteration count Cloudflare Workers
   allow; asking for more fails at runtime. */
const PBKDF2_ITERATIONS = 100000;
const SESSION_DAYS = 60;
const MAX_ATTEMPTS = 12;          // failed sign-ins per email+IP
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

const encoder = new TextEncoder();

/* ---------- Crypto helpers ---------- */
function bytesToHex(bytes) {
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

function bytesToBase64Url(bytes) {
    let binary = '';
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomBytes(length) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
}

async function sha256Hex(text) {
    const digest = await crypto.subtle.digest('SHA-256', encoder.encode(text));
    return bytesToHex(new Uint8Array(digest));
}

async function hashPassword(password, saltHex) {
    const salt = new Uint8Array(saltHex.match(/../g).map(h => parseInt(h, 16)));
    const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
        key, 256);
    return bytesToHex(new Uint8Array(bits));
}

/* Length-independent comparison so a wrong password always takes the
   same time to reject. */
function safeEqual(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}

/* ---------- Validation ---------- */
function cleanName(raw) {
    const name = String(raw == null ? '' : raw).trim().replace(/\s+/g, ' ');
    if (name.length < 2) return { error: 'Please use at least 2 characters for your name.', field: 'name' };
    if (name.length > 40) return { error: 'Names can be at most 40 characters.', field: 'name' };
    if (/[\u0000-\u001f\u007f]/.test(name)) return { error: 'That name contains characters we can’t use.', field: 'name' };
    return { value: name };
}

function cleanEmail(raw) {
    const email = String(raw == null ? '' : raw).trim().toLowerCase();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        return { error: 'That email address doesn’t look right.', field: 'email' };
    }
    return { value: email };
}

function cleanPassword(raw) {
    const password = String(raw == null ? '' : raw);
    if (password.length < 8) return { error: 'Passwords need at least 8 characters.', field: 'password' };
    if (password.length > 200) return { error: 'Passwords can be at most 200 characters.', field: 'password' };
    return { value: password };
}

export function publicUser(row) {
    return { id: row.id, name: row.name, email: row.email, createdAt: row.created_at };
}

/* ---------- Sessions ---------- */
async function createSession(env, userId) {
    const token = bytesToBase64Url(randomBytes(32));
    const now = Date.now();
    const expires = now + SESSION_DAYS * 86400000;
    await env.DB.prepare(
        'INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)'
    ).bind(await sha256Hex(token), userId, now, expires).run();
    return { token, expiresAt: expires };
}

function bearerToken(request) {
    const match = /^Bearer\s+(\S+)$/i.exec(request.headers.get('Authorization') || '');
    return match ? match[1] : null;
}

export async function currentSession(request, env) {
    const token = bearerToken(request);
    if (!token || token.length > 200) return null;
    const tokenHash = await sha256Hex(token);
    const row = await env.DB.prepare(
        `SELECT s.token_hash AS token_hash, s.expires_at AS expires_at,
                u.id AS id, u.name AS name, u.email AS email, u.created_at AS created_at
           FROM sessions s JOIN users u ON u.id = s.user_id
          WHERE s.token_hash = ?`
    ).bind(tokenHash).first();
    if (!row) return null;
    if (row.expires_at < Date.now()) {
        await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run();
        return null;
    }
    return { tokenHash, user: publicUser(row) };
}

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

    const salt = bytesToHex(randomBytes(16));
    const passwordHash = await hashPassword(password.value, salt);
    const userId = crypto.randomUUID();
    const now = Date.now();

    try {
        await env.DB.prepare(
            `INSERT INTO users (id, name, email, password_hash, salt, created_at)
             VALUES (?, ?, ?, ?, ?, ?)`
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
    return reply(request, {
        token: session.token,
        expiresAt: session.expiresAt,
        user: { id: userId, name: name.value, email: email.value, createdAt: now },
        state,
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

    const row = await env.DB.prepare(
        'SELECT id, name, email, password_hash, salt, created_at FROM users WHERE email = ?'
    ).bind(email.value).first();

    // Hash even when the account is missing so a wrong email and a wrong
    // password take the same time.
    const salt = row ? row.salt : bytesToHex(randomBytes(16));
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
    if (session) {
        await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(session.tokenHash).run();
    }
    return reply(request, { ok: true });
}

export async function handleMe(request, env) {
    const session = await currentSession(request, env);
    if (!session) return fail(request, 401, 'Please sign in.');
    return reply(request, {
        user: session.user,
        state: await loadProgress(env, session.user.id),
    });
}
