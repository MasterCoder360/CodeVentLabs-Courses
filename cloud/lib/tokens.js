/* Emailed one-time links: email verification and password resets.

   The emailed value is a random token; only its SHA-256 is stored, and
   each token is single-use and expires. Links point back at the static
   site (account.html#verify=… / #reset=…), which posts the token here.

   Routes:
     POST /api/verify          { token }             confirm an email
     POST /api/verify/resend   (signed in)           send a fresh link
     POST /api/password/forgot { email }             send a reset link
     POST /api/password/reset  { token, password }   set a new password
*/

import { reply, fail, readJson } from './http.js';
import { randomHex, randomToken, sha256Hex, hashPassword } from './crypto.js';
import { cleanEmail, cleanPassword } from './validate.js';
import { currentSession, createSession, publicUser, revokeAllSessions, userById, userByEmail } from './session.js';
import { sendMail, siteUrl, mailConfigured, mailShell } from './mail.js';
import { loadProgress } from './progress.js';

const TOKEN_TTL_MS = {
    verify: 24 * 60 * 60 * 1000,   // a day to click the link
    reset: 2 * 60 * 60 * 1000,     // two hours to choose a new password
};

/* In local development there is no mailbox, so setting MAIL_DEV_ECHO=1
   makes the API return the link in the response. Never set it in
   production: it would hand the token to anyone who can post a form. */
function withDevLink(env, result, link) {
    if (env.MAIL_DEV_ECHO === '1') return Object.assign({}, result, { link });
    return result;
}

async function issueToken(env, userId, kind, email) {
    const token = randomToken(32);
    const now = Date.now();
    await env.DB.prepare('DELETE FROM email_tokens WHERE user_id = ? AND kind = ?')
        .bind(userId, kind).run();
    await env.DB.prepare(
        `INSERT INTO email_tokens (token_hash, user_id, kind, email, created_at, expires_at, used_at)
         VALUES (?, ?, ?, ?, ?, ?, NULL)`
    ).bind(await sha256Hex(token), userId, kind, email, now, now + TOKEN_TTL_MS[kind]).run();
    return token;
}

async function consumeToken(env, token, kind) {
    if (typeof token !== 'string' || !token || token.length > 200) return null;
    const hash = await sha256Hex(token);
    const row = await env.DB.prepare('SELECT * FROM email_tokens WHERE token_hash = ?')
        .bind(hash).first();
    if (!row || row.kind !== kind || row.used_at || row.expires_at < Date.now()) return null;
    await env.DB.prepare('UPDATE email_tokens SET used_at = ? WHERE token_hash = ?')
        .bind(Date.now(), hash).run();
    return row;
}

/* ---------- Verification ---------- */
export async function sendVerification(env, user) {
    if (user.email_verified) return { sent: false, reason: 'already-verified' };
    if (!mailConfigured(env)) {
        console.warn('verification email skipped: RESEND_API_KEY / MAIL_FROM not set');
        return { sent: false, reason: 'unconfigured' };
    }

    const token = await issueToken(env, user.id, 'verify', user.email);
    const link = siteUrl(env) + '/account.html#verify=' + token;
    const mail = mailShell(
        'Confirm your email',
        `Hi ${user.name}, tap the button below to confirm this address for your CodeVent Labs account. ` +
        `The link works once and expires in 24 hours.`,
        'CONFIRM MY EMAIL',
        link);
    const result = await sendMail(env, Object.assign({ to: user.email, subject: 'Confirm your CodeVent Labs email' }, mail));
    return withDevLink(env, result, link);
}

export async function handleVerify(request, env) {
    const body = await readJson(request);
    if (body.invalid) return fail(request, 400, 'We couldn’t read that request.');
    const row = await consumeToken(env, body.value.token, 'verify');
    if (!row) {
        return fail(request, 400, 'That confirmation link has expired or was already used. Sign in and send a fresh one.');
    }

    await env.DB.prepare('UPDATE users SET email_verified = 1 WHERE id = ?').bind(row.user_id).run();

    const session = await currentSession(request, env);
    return reply(request, {
        ok: true,
        email: row.email,
        signedIn: Boolean(session && session.user.id === row.user_id),
    });
}

export async function handleVerifyResend(request, env) {
    const session = await currentSession(request, env);
    if (!session) return fail(request, 401, 'Please sign in.');

    const row = await userById(env, session.user.id);
    if (!row) return fail(request, 401, 'Please sign in.');
    if (row.email_verified) return reply(request, { ok: true, alreadyVerified: true });

    const throttle = throttleReply(request, 'verify');
    if (throttle) return throttle;

    const mail = await sendVerification(env, { id: row.id, name: row.name, email: row.email, email_verified: 0 });
    return reply(request, { ok: true, mail });
}

/* ---------- Password reset ---------- */
export async function handleForgot(request, env) {
    const body = await readJson(request);
    if (body.tooLarge) return fail(request, 413, 'That request was too large.');
    if (body.invalid) return fail(request, 400, 'We couldn’t read that request.');

    const throttle = throttleReply(request, 'forgot');
    if (throttle) return throttle;

    const email = cleanEmail(body.value.email);
    if (email.error) return fail(request, 400, email.error, email.field);

    /* The reply is the same whether or not the address is registered, so
       this form cannot be used to find out who has an account. */
    const row = await userByEmail(env, email.value);
    let mail = { sent: false, reason: 'unknown-account' };
    if (row) {
        if (!mailConfigured(env)) {
            console.warn('reset email skipped: RESEND_API_KEY / MAIL_FROM not set');
            mail = { sent: false, reason: 'unconfigured' };
        } else {
            const token = await issueToken(env, row.id, 'reset', row.email);
            const link = siteUrl(env) + '/account.html#reset=' + token;
            const message = mailShell(
                'Reset your password',
                `Hi ${row.name}, someone asked to reset the password for this CodeVent Labs account. ` +
                `Choose a new one with the button below. The link works once and expires in 2 hours.`,
                'CHOOSE A NEW PASSWORD',
                link);
            const result = await sendMail(env, Object.assign({ to: row.email, subject: 'Reset your CodeVent Labs password' }, message));
            mail = withDevLink(env, result, link);
        }
    }

    return reply(request, { ok: true, mail });
}

export async function handleReset(request, env) {
    const body = await readJson(request);
    if (body.tooLarge) return fail(request, 413, 'That request was too large.');
    if (body.invalid) return fail(request, 400, 'We couldn’t read that request.');

    const password = cleanPassword(body.value.password);
    if (password.error) return fail(request, 400, password.error, password.field);

    const row = await consumeToken(env, body.value.token, 'reset');
    if (!row) {
        return fail(request, 400, 'That reset link has expired or was already used. Request a new one.');
    }

    const user = await userById(env, row.user_id);
    if (!user) return fail(request, 400, 'That reset link is no longer valid.');

    const salt = randomHex(16);
    const passwordHash = await hashPassword(password.value, salt);
    await env.DB.prepare(
        'UPDATE users SET password_hash = ?, salt = ?, email_verified = 1 WHERE id = ?'
    ).bind(passwordHash, salt, user.id).run();

    // A reset signs every device out, then signs this one in.
    await revokeAllSessions(env, user.id);
    const session = await createSession(env, user.id);
    const fresh = Object.assign({}, user, { email_verified: 1 });

    return reply(request, {
        ok: true,
        token: session.token,
        expiresAt: session.expiresAt,
        user: publicUser(fresh),
        state: await loadProgress(env, user.id),
    });
}

/* ---------- Simple per-IP throttle for email sending ----------
   Per-isolate and best-effort, like the sign-in throttle: it stops one
   browser from spraying reset emails without needing another table. */
const throttles = new Map();
const THROTTLE_MAX = 5;
const THROTTLE_WINDOW_MS = 15 * 60 * 1000;

function throttleReply(request, scope) {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const key = scope + '|' + ip;
    const now = Date.now();
    const record = throttles.get(key);

    if (!record || now - record.first > THROTTLE_WINDOW_MS) {
        throttles.set(key, { first: now, count: 1 });
        if (throttles.size > 5000) {
            for (const [k, v] of throttles) {
                if (now - v.first > THROTTLE_WINDOW_MS) throttles.delete(k);
            }
        }
        return null;
    }

    if (record.count >= THROTTLE_MAX) {
        return fail(request, 429, 'Too many requests. Wait a few minutes and try again.');
    }
    record.count++;
    return null;
}
