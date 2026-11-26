/* Sessions: the bearer token a browser holds after signing in.
   Only the SHA-256 of a token is stored, so a database leak cannot be
   replayed against the API. */

import { randomToken, sha256Hex } from './crypto.js';

const SESSION_DAYS = 60;

export function publicUser(row) {
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        createdAt: row.created_at,
        emailVerified: !!row.email_verified,
    };
}

export async function createSession(env, userId) {
    const token = randomToken(32);
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
                u.id AS id, u.name AS name, u.email AS email,
                u.created_at AS created_at, u.email_verified AS email_verified
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

export async function revokeSession(env, tokenHash) {
    await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run();
}

/* Used after a password reset: every other device is signed out. */
export async function revokeAllSessions(env, userId) {
    await env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(userId).run();
}

export async function userByEmail(env, email) {
    return env.DB.prepare(
        `SELECT id, name, email, password_hash, salt, created_at, email_verified
           FROM users WHERE email = ?`
    ).bind(email).first();
}

export async function userById(env, id) {
    return env.DB.prepare(
        `SELECT id, name, email, password_hash, salt, created_at, email_verified
           FROM users WHERE id = ?`
    ).bind(id).first();
}
