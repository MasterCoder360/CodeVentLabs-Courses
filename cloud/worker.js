/* ============================================================
   CodeVent Labs — Accounts & Progress API

   A small, dependency-free Worker that gives the courses site real
   accounts in the cloud:

     POST /api/signup     create an account (name, email, password)
     POST /api/login      sign in, returns a session token
     POST /api/logout     revoke the current session
     GET  /api/me         current user + saved progress
     PUT  /api/progress   save progress for the current user
     GET  /api/ping       health check

   Storage is a D1 database (binding: DB). This file only routes;
   lib/http.js has the shared HTTP helpers, lib/db.js the schema,
   lib/auth.js accounts and sessions, lib/progress.js progress docs.
   ============================================================ */

import { corsHeaders, reply, fail, readJson } from './lib/http.js';
import { ensureSchema } from './lib/db.js';
import {
    currentSession, handleSignup, handleLogin, handleLogout, handleMe,
} from './lib/auth.js';
import { sanitizeState, saveProgress } from './lib/progress.js';

const VERSION = '1';

async function handleSaveProgress(request, env) {
    const session = await currentSession(request, env);
    if (!session) return fail(request, 401, 'Please sign in.');
    const body = await readJson(request);
    if (body.tooLarge) return fail(request, 413, 'That progress file is too large.');
    if (body.invalid) return fail(request, 400, 'We couldn’t read that progress file.');
    const state = sanitizeState(body.value.state);
    const savedAt = await saveProgress(env, session.user.id, state);
    return reply(request, { ok: true, savedAt, state });
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders(request) });
        }

        try {
            if (url.pathname === '/' || url.pathname === '/api' || url.pathname === '/api/ping') {
                return reply(request, { ok: true, service: 'codeventlabs-accounts', version: VERSION });
            }

            await ensureSchema(env);

            const post = request.method === 'POST';
            if (url.pathname === '/api/signup' && post) return await handleSignup(request, env);
            if (url.pathname === '/api/login' && post) return await handleLogin(request, env);
            if (url.pathname === '/api/logout' && post) return await handleLogout(request, env);
            if (url.pathname === '/api/me' && request.method === 'GET') return await handleMe(request, env);
            if (url.pathname === '/api/progress' && request.method === 'PUT') return await handleSaveProgress(request, env);

            return fail(request, 404, 'Not found.');
        } catch (err) {
            console.error('accounts api error', err && err.stack || err);
            return fail(request, 500, 'Something went wrong on our side. Please try again.');
        }
    },
};
