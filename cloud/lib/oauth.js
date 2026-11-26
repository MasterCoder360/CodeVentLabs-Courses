/* Social sign-in: "Continue with GitHub" and "Continue with Google".

   The whole OAuth dance happens here, on the Worker, so no client
   secret ever reaches the browser. The site stays a static GitHub Pages
   site; after a successful sign-in the user is redirected back to it
   with a session token in the URL fragment.

   Both providers are optional. A provider turns on when its two secrets
   are set on the site:

     GitHub:  GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
     Google:  GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

   Register these callback URLs with each provider:

     https://<api-host>/api/oauth/github/callback
     https://<api-host>/api/oauth/google/callback
*/

import { fail, allowedOrigin } from './http.js';
import { randomHex, randomToken, sha256Hex, hashPassword } from './crypto.js';
import { createSession, publicUser, userByEmail } from './session.js';
import { siteUrl } from './mail.js';
import { sanitizeState, loadProgress, saveProgress } from './progress.js';

const PROVIDERS = {
    github: {
        label: 'GitHub',
        authorize: 'https://github.com/login/oauth/authorize',
        scope: 'read:user user:email',
        clientId: env => env.GITHUB_CLIENT_ID,
        clientSecret: env => env.GITHUB_CLIENT_SECRET,
    },
    google: {
        label: 'Google',
        authorize: 'https://accounts.google.com/o/oauth2/v2/auth',
        scope: 'openid email profile',
        clientId: env => env.GOOGLE_CLIENT_ID,
        clientSecret: env => env.GOOGLE_CLIENT_SECRET,
    },
};

const STATE_TTL_MS = 10 * 60 * 1000;

function provider(env, name) {
    const entry = PROVIDERS[name];
    if (!entry) return null;
    const ready = Boolean(entry.clientId(env) && entry.clientSecret(env));
    return { name, entry, ready };
}

export function providerStatus(env) {
    const status = {};
    for (const name of Object.keys(PROVIDERS)) status[name] = provider(env, name).ready;
    return status;
}

function apiBase(request, env) {
    return String(env.OAUTH_BASE || new URL(request.url).origin).replace(/\/+$/, '');
}

function callbackUrl(request, env, name) {
    return apiBase(request, env) + '/api/oauth/' + name + '/callback';
}

/* ---------- Step 1: send the browser to the provider ---------- */
export async function handleOauthStart(request, env, name, url) {
    const info = provider(env, name);
    if (!info) return fail(request, 404, 'Not found.');
    if (!info.ready) return fail(request, 503, info.entry.label + ' sign-in is not set up yet.');

    const requested = url.searchParams.get('origin') || '';
    const back = allowedOrigin(requested) && requested ? requested : siteUrl(env);

    const state = randomToken(24);
    const now = Date.now();
    await env.DB.prepare(
        'INSERT INTO oauth_states (state_hash, created_at, expires_at, redirect) VALUES (?, ?, ?, ?)'
    ).bind(await sha256Hex(state), now, now + STATE_TTL_MS, back).run();

    const target = new URL(info.entry.authorize);
    target.searchParams.set('client_id', info.entry.clientId(env));
    target.searchParams.set('redirect_uri', callbackUrl(request, env, name));
    target.searchParams.set('scope', info.entry.scope);
    target.searchParams.set('state', state);
    target.searchParams.set('response_type', 'code');
    if (name === 'google') target.searchParams.set('prompt', 'select_account');

    return Response.redirect(target.toString(), 302);
}

/* ---------- Step 2: the provider sends the browser back ---------- */
export async function handleOauthCallback(request, env, name, url) {
    const info = provider(env, name);
    if (!info || !info.ready) return fail(request, 503, 'That sign-in method is not set up yet.');

    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    if (url.searchParams.get('error') || !code || !state) {
        return backToSite(env, '#oauth-error=cancelled');
    }

    const stateHash = await sha256Hex(state);
    const record = await env.DB.prepare('SELECT * FROM oauth_states WHERE state_hash = ?')
        .bind(stateHash).first();
    if (!record || record.expires_at < Date.now()) {
        return backToSite(env, '#oauth-error=expired');
    }
    await env.DB.prepare('DELETE FROM oauth_states WHERE state_hash = ?').bind(stateHash).run();

    let profile;
    try {
        profile = await fetchProfile(name, env, code, callbackUrl(request, env, name));
    } catch (err) {
        console.error('oauth exchange failed', name, err && err.message || err);
        return backToSite(env, '#oauth-error=failed');
    }
    if (!profile || !profile.email) return backToSite(env, '#oauth-error=no-email');

    const user = await findOrCreateUser(env, name, profile);
    const session = await createSession(env, user.id);
    const target = record.redirect || siteUrl(env);
    return Response.redirect(target + '/account.html#session=' + session.token, 302);
}

function backToSite(env, hash) {
    return Response.redirect(siteUrl(env) + '/account.html' + hash, 302);
}

/* ---------- Provider API calls ---------- */
async function fetchProfile(name, env, code, redirectUri) {
    const info = provider(env, name);

    if (name === 'github') {
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'User-Agent': 'codeventlabs-accounts' },
            body: JSON.stringify({
                client_id: info.entry.clientId(env),
                client_secret: info.entry.clientSecret(env),
                code,
                redirect_uri: redirectUri,
            }),
        });
        const tokenData = await tokenResponse.json();
        if (!tokenData.access_token) throw new Error('no access token');

        const headers = { Authorization: 'Bearer ' + tokenData.access_token, 'User-Agent': 'codeventlabs-accounts', Accept: 'application/vnd.github+json' };
        const me = await (await fetch('https://api.github.com/user', { headers })).json();
        let email = typeof me.email === 'string' ? me.email : '';
        const emails = await (await fetch('https://api.github.com/user/emails', { headers })).json();
        if (Array.isArray(emails)) {
            const primary = emails.find(e => e.primary && e.verified) || emails.find(e => e.verified);
            if (primary) email = primary.email;
        }
        return {
            id: me.id ? String(me.id) : '',
            email: String(email || '').toLowerCase(),
            name: (me.name || me.login || '').trim(),
        };
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            code,
            client_id: info.entry.clientId(env),
            client_secret: info.entry.clientSecret(env),
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        }),
    });
    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) throw new Error('no access token');

    const me = await (await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { Authorization: 'Bearer ' + tokenData.access_token },
    })).json();
    return {
        id: me.sub ? String(me.sub) : '',
        email: String(me.email || '').toLowerCase(),
        name: (me.name || '').trim(),
    };
}

/* ---------- Link the provider account to a CodeVent Labs user ---------- */
async function findOrCreateUser(env, name, profile) {
    const identity = await env.DB.prepare(
        'SELECT user_id FROM identities WHERE provider = ? AND provider_id = ?'
    ).bind(name, profile.id).first();

    if (identity) {
        return env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(identity.user_id).first();
    }

    let row = await userByEmail(env, profile.email);
    if (row) {
        // The provider vouches for the address, so it counts as confirmed.
        await env.DB.prepare('UPDATE users SET email_verified = 1 WHERE id = ?').bind(row.id).run();
    } else {
        /* Social accounts have no password to check; a random one keeps
           the column non-null and can never be guessed. */
        const salt = randomHex(16);
        const passwordHash = await hashPassword(randomToken(24), salt);
        const id = crypto.randomUUID();
        await env.DB.prepare(
            `INSERT INTO users (id, name, email, password_hash, salt, created_at, email_verified)
             VALUES (?, ?, ?, ?, ?, ?, 1)`
        ).bind(id, profile.name || profile.email.split('@')[0], profile.email, passwordHash, salt, Date.now()).run();
        row = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
        await saveProgress(env, id, sanitizeState(null));
    }

    await env.DB.prepare(
        'INSERT OR IGNORE INTO identities (provider, provider_id, user_id, created_at) VALUES (?, ?, ?, ?)'
    ).bind(name, profile.id, row.id, Date.now()).run();

    return row;
}

/* /api/me can report which providers an account uses. */
export async function providersFor(env, userId) {
    const rows = await env.DB.prepare('SELECT provider FROM identities WHERE user_id = ?')
        .bind(userId).all();
    return (rows.results || []).map(r => r.provider);
}
