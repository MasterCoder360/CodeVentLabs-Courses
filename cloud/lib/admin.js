/* Admin routes: the owner's dashboard and database upkeep.

   Two ways in, and nothing leaks without one of them:

   - A signed-in account whose email is listed in ADMIN_EMAILS (which
     defaults to the site owner). This is what admin.html uses, so the
     page needs no secret typed into the browser.
   - An ADMIN_TOKEN secret sent in the X-Admin-Token header, for upkeep
     from a terminal. Without that secret those routes answer 404.

     GET  /api/admin/overview  accounts + totals for the owner's page
     GET  /api/admin/users     list accounts (no passwords or sessions)
     POST /api/admin/prune     { keep: ["email@example.com", …] }
                               delete every account not in that list
*/

import { reply, fail, readJson } from './http.js';
import { safeEqual } from './crypto.js';
import { currentSession } from './session.js';

/* The addresses allowed into the admin page. ADMIN_EMAILS can hold a
   comma, space or semicolon separated list; the owner's address is the
   built-in default so the page works before anything is configured. */
const DEFAULT_ADMIN_EMAILS = ['raahilaalam0804@gmail.com'];

export function adminEmails(env) {
    const configured = String((env && env.ADMIN_EMAILS) || '')
        .split(/[\s,;]+/)
        .map(address => address.trim().toLowerCase())
        .filter(Boolean);
    return configured.length ? configured : DEFAULT_ADMIN_EMAILS;
}

export function isAdminEmail(env, email) {
    const candidate = String(email || '').trim().toLowerCase();
    return !!candidate && adminEmails(env).includes(candidate);
}

export async function handleAdminOverview(request, env) {
    const session = await currentSession(request, env);
    if (!session) return fail(request, 401, 'Please sign in.');
    if (!isAdminEmail(env, session.user.email)) {
        return fail(request, 403, 'This page is only available to the site owner.');
    }

    const rows = await env.DB.prepare(
        `SELECT u.id AS id, u.name AS name, u.email AS email,
                u.created_at AS created_at, u.email_verified AS email_verified,
                p.data AS progress, p.updated_at AS updated_at
           FROM users u LEFT JOIN progress p ON p.user_id = u.id
          ORDER BY u.created_at DESC`
    ).all();

    const weekAgo = Date.now() - 7 * 86400000;
    const totals = { accounts: 0, verified: 0, learners: 0, lessons: 0, xp: 0, newThisWeek: 0 };
    const users = [];

    for (const row of rows.results || []) {
        let xp = 0, streak = 0, gems = 0, lessons = 0, lastActive = null;
        if (row.progress) {
            try {
                const state = JSON.parse(row.progress);
                xp = Math.max(0, Math.floor(Number(state.xp) || 0));
                streak = Math.max(0, Math.floor(Number(state.streak) || 0));
                gems = Math.max(0, Math.floor(Number(state.gems) || 0));
                lastActive = typeof state.lastActive === 'string' ? state.lastActive : null;
                lessons = Object.values(state.completed || {})
                    .reduce((total, ids) => total + (Array.isArray(ids) ? ids.length : 0), 0);
            } catch { lessons = 0; }
        }

        totals.accounts++;
        if (row.email_verified) totals.verified++;
        if (row.created_at >= weekAgo) totals.newThisWeek++;
        if (lessons) totals.learners++;
        totals.lessons += lessons;
        totals.xp += xp;

        users.push({
            id: row.id,
            name: row.name,
            email: row.email,
            createdAt: row.created_at,
            emailVerified: !!row.email_verified,
            xp,
            streak,
            gems,
            lessons,
            lastActive,
            progressUpdatedAt: row.updated_at || null,
        });
    }

    return reply(request, {
        ok: true,
        admin: session.user.email,
        generatedAt: Date.now(),
        totals,
        users,
    });
}

function authorised(request, env) {
    if (!env.ADMIN_TOKEN) return false;
    const given = request.headers.get('X-Admin-Token') || '';
    return safeEqual(given, env.ADMIN_TOKEN);
}

export async function handleAdminUsers(request, env) {
    if (!env.ADMIN_TOKEN) return fail(request, 404, 'Not found.');
    if (!authorised(request, env)) return fail(request, 403, 'Forbidden.');

    const rows = await env.DB.prepare(
        `SELECT u.id, u.name, u.email, u.created_at, u.email_verified,
                (SELECT COUNT(*) FROM progress p WHERE p.user_id = u.id) AS has_progress
           FROM users u ORDER BY u.created_at`
    ).all();

    const users = [];
    for (const row of rows.results || []) {
        const progress = await env.DB.prepare('SELECT data FROM progress WHERE user_id = ?')
            .bind(row.id).first();
        let lessons = 0;
        if (progress) {
            try {
                const state = JSON.parse(progress.data);
                lessons = Object.values(state.completed || {})
                    .reduce((total, ids) => total + (Array.isArray(ids) ? ids.length : 0), 0);
            } catch { lessons = 0; }
        }
        users.push({
            id: row.id,
            name: row.name,
            email: row.email,
            createdAt: row.created_at,
            emailVerified: !!row.email_verified,
            lessons,
        });
    }
    return reply(request, { ok: true, count: users.length, users });
}

export async function handleAdminPrune(request, env) {
    if (!env.ADMIN_TOKEN) return fail(request, 404, 'Not found.');
    if (!authorised(request, env)) return fail(request, 403, 'Forbidden.');

    const body = await readJson(request);
    if (body.invalid) return fail(request, 400, 'We couldn’t read that request.');
    const keepRaw = Array.isArray(body.value.keep) ? body.value.keep : null;
    if (!keepRaw) return fail(request, 400, 'Send { "keep": [ "email@example.com" ] }.');

    const keep = new Set(keepRaw.map(e => String(e || '').trim().toLowerCase()).filter(Boolean));

    const rows = await env.DB.prepare('SELECT id, email FROM users').all();
    const removed = [];
    const kept = [];
    for (const row of rows.results || []) {
        if (keep.has(String(row.email).toLowerCase())) {
            kept.push(row.email);
            continue;
        }
        const id = row.id;
        await env.DB.batch([
            env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(id),
            env.DB.prepare('DELETE FROM progress WHERE user_id = ?').bind(id),
            env.DB.prepare('DELETE FROM email_tokens WHERE user_id = ?').bind(id),
            env.DB.prepare('DELETE FROM identities WHERE user_id = ?').bind(id),
            env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id),
        ]);
        removed.push(row.email);
    }

    const missing = [...keep].filter(email => !kept.map(k => k.toLowerCase()).includes(email));
    return reply(request, { ok: true, kept, removed, missing });
}
