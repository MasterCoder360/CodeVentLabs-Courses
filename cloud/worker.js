/* ============================================================
   CodeVent Labs — Accounts & Progress API

   A small, dependency-free Worker that gives the courses site real
   accounts in the cloud:

     POST /api/signup            create an account (name, email, password)
     POST /api/login             sign in, returns a session token
     POST /api/logout            revoke the current session
     GET  /api/me                current user, providers and progress
     PUT  /api/progress          save progress for the current user

     POST /api/verify            confirm an email with an emailed token
     POST /api/verify/resend     send a fresh confirmation link
     POST /api/password/forgot   email a reset link
     POST /api/password/reset    set a new password with that link

     GET  /api/oauth/:provider/start      GitHub / Google sign-in
     GET  /api/oauth/:provider/callback   …and the way back

     GET  /api/config            which extras are configured
     GET  /api/ping              health check

     GET  /api/admin/users       list accounts   (X-Admin-Token)
     POST /api/admin/prune       delete accounts not in a keep list

   Storage is a D1 database (binding: DB). This file only routes;
   lib/http.js has the shared HTTP helpers, lib/db.js the schema,
   lib/crypto.js + lib/session.js + lib/validate.js the primitives,
   lib/auth.js the account routes, lib/tokens.js email verification and
   password resets, lib/oauth.js social sign-in, lib/admin.js upkeep and
   lib/progress.js the progress documents.
   ============================================================ */

import { corsHeaders, reply, fail, readJson } from './lib/http.js';
import { ensureSchema } from './lib/db.js';
import { handleSignup, handleLogin, handleLogout, handleMe } from './lib/auth.js';
import { currentSession } from './lib/session.js';
import { sanitizeState, saveProgress } from './lib/progress.js';
import { handleVerify, handleVerifyResend, handleForgot, handleReset } from './lib/tokens.js';
import { handleOauthStart, handleOauthCallback, providerStatus } from './lib/oauth.js';
import { handleAdminUsers, handleAdminPrune } from './lib/admin.js';
import { mailConfigured, siteUrl } from './lib/mail.js';

const VERSION = '2';

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

            if (url.pathname === '/api/config' && request.method === 'GET') {
                return reply(request, {
                    ok: true,
                    version: VERSION,
                    site: siteUrl(env),
                    mail: mailConfigured(env),
                    providers: providerStatus(env),
                });
            }

            await ensureSchema(env);

            const post = request.method === 'POST';
            if (url.pathname === '/api/signup' && post) return await handleSignup(request, env);
            if (url.pathname === '/api/login' && post) return await handleLogin(request, env);
            if (url.pathname === '/api/logout' && post) return await handleLogout(request, env);
            if (url.pathname === '/api/me' && request.method === 'GET') return await handleMe(request, env);
            if (url.pathname === '/api/progress' && request.method === 'PUT') return await handleSaveProgress(request, env);

            if (url.pathname === '/api/verify' && post) return await handleVerify(request, env);
            if (url.pathname === '/api/verify/resend' && post) return await handleVerifyResend(request, env);
            if (url.pathname === '/api/password/forgot' && post) return await handleForgot(request, env);
            if (url.pathname === '/api/password/reset' && post) return await handleReset(request, env);

            const oauth = /^\/api\/oauth\/([a-z]+)\/(start|callback)$/.exec(url.pathname);
            if (oauth) {
                if (oauth[2] === 'start') return await handleOauthStart(request, env, oauth[1], url);
                return await handleOauthCallback(request, env, oauth[1], url);
            }

            if (url.pathname === '/api/admin/users' && request.method === 'GET') return await handleAdminUsers(request, env);
            if (url.pathname === '/api/admin/prune' && post) return await handleAdminPrune(request, env);

            return fail(request, 404, 'Not found.');
        } catch (err) {
            console.error('accounts api error', err && err.stack || err);
            return fail(request, 500, 'Something went wrong on our side. Please try again.');
        }
    },
};
