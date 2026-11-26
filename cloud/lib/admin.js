/* Admin routes used to tidy up the accounts database.

   They only answer when an ADMIN_TOKEN secret is set on the site, and
   every request must send it in the X-Admin-Token header. Nothing about
   the routes leaks without that token.

     GET  /api/admin/users   list accounts (no passwords or sessions)
     POST /api/admin/prune   { keep: ["email@example.com", …] }
                             delete every account not in that list
*/

import { reply, fail, readJson } from './http.js';
import { safeEqual } from './crypto.js';

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
