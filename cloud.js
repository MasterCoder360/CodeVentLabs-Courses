/* ============================================================
   CodeVent Labs — cloud accounts client

   Talks to the small accounts API in cloud/worker.js (Cloudflare
   Worker + D1). The site itself stays a static GitHub Pages site;
   only accounts and progress live in the cloud.

   The session token is an opaque random string stored in
   localStorage and sent as `Authorization: Bearer …`. No cookies are
   used, so the cross-origin call from courses.labs.cosmospark.org
   works without third-party cookie rules.

   Changing servers means changing CLOUD_API and nothing else.
   ============================================================ */

const CLOUD_API = 'https://codevent-labs-accounts-u0ia1p-preview.freebuff.site';

/* Same key script.js uses for the local (guest) game state. */
const CVL_STORAGE_KEY = 'cvl_courses_v1';

const CLOUD = (() => {
    const TOKEN_KEY = 'cvl_session_v1';
    const USER_KEY = 'cvl_user_v1';

    function read(key) {
        try { return localStorage.getItem(key); } catch { return null; }
    }
    function write(key, value) {
        try {
            if (value === null) localStorage.removeItem(key);
            else localStorage.setItem(key, value);
        } catch { /* private mode: keep the session in memory only */ }
    }

    let token = read(TOKEN_KEY);
    let user = null;
    try { user = JSON.parse(read(USER_KEY) || 'null'); } catch { user = null; }

    let configCache = null;

    async function request(path, options) {
        const opts = options || {};
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = 'Bearer ' + token;

        let response;
        try {
            response = await fetch(CLOUD_API + path, {
                method: opts.method || 'GET',
                headers,
                body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
            });
        } catch {
            const offline = new Error('Could not reach the CodeVent Labs servers. Check your connection and try again.');
            offline.offline = true;
            throw offline;
        }

        let data = null;
        try { data = await response.json(); } catch { data = null; }

        if (!response.ok) {
            const error = new Error((data && data.error) || 'Something went wrong. Please try again.');
            error.status = response.status;
            error.field = data && data.field;
            throw error;
        }
        return data || {};
    }

    function remember(nextToken, nextUser) {
        token = nextToken || null;
        write(TOKEN_KEY, token);
        user = nextUser || null;
        write(USER_KEY, user ? JSON.stringify(user) : null);
    }

    /* Union of lesson ids, best-of for the counters. Used when a guest
       with progress on this device signs in for the first time. */
    function mergeProgress(local, remote) {
        const base = Object.assign({
            course: 'python', xp: 0, gems: 500, hearts: 5,
            streak: 0, lastActive: null, completed: {},
        }, remote || {});
        if (!local) return base;

        const completed = {};
        const courseIds = new Set([
            ...Object.keys(base.completed || {}),
            ...Object.keys(local.completed || {}),
        ]);
        courseIds.forEach(courseId => {
            const ids = new Set([...(base.completed[courseId] || []), ...(local.completed[courseId] || [])]);
            if (ids.size) completed[courseId] = Array.from(ids);
        });

        const best = (a, b) => Math.max(Number(a) || 0, Number(b) || 0);
        return {
            course: base.course || local.course || 'python',
            xp: best(base.xp, local.xp),
            gems: best(base.gems, local.gems),
            hearts: best(base.hearts, local.hearts),
            streak: best(base.streak, local.streak),
            lastActive: base.lastActive || local.lastActive || null,
            completed,
        };
    }

    /* Which extras this deployment has configured: social sign-in
       providers and email sending. Cached for the life of the page. */
    async function loadConfig() {
        if (!configCache) configCache = await request('/api/config');
        return configCache;
    }

    return {
        mergeProgress,
        config: loadConfig,
        apiBase: CLOUD_API,
        get user() { return user; },
        hasToken() { return !!token; },
        cachedUser() { return user; },

        async signup(name, email, password, state) {
            const data = await request('/api/signup', {
                method: 'POST',
                body: { name, email, password, state },
            });
            remember(data.token, data.user);
            return data;
        },

        async login(email, password) {
            const data = await request('/api/login', {
                method: 'POST',
                body: { email, password },
            });
            remember(data.token, data.user);
            return data;
        },

        async logout() {
            try { await request('/api/logout', { method: 'POST' }); } catch { /* sign out locally anyway */ }
            remember(null, null);
        },

        async me() {
            const data = await request('/api/me');
            if (data.user) remember(token, data.user);
            return data;
        },

        async saveProgress(state) {
            const data = await request('/api/progress', { method: 'PUT', body: { state } });
            return data;
        },

        /* Used after a social sign-in or a password reset hands the page
           a token in the URL fragment. */
        setToken(nextToken) { remember(nextToken, null); },

        async forgotPassword(email) {
            return request('/api/password/forgot', { method: 'POST', body: { email } });
        },

        async resetPassword(resetToken, password) {
            const data = await request('/api/password/reset', {
                method: 'POST',
                body: { token: resetToken, password },
            });
            remember(data.token, data.user);
            return data;
        },

        async verifyEmail(verifyToken) {
            return request('/api/verify', { method: 'POST', body: { token: verifyToken } });
        },

        async resendVerification() {
            return request('/api/verify/resend', { method: 'POST' });
        },

        /* The owner's dashboard. The Worker answers 401 when signed out and
           403 for any account that is not on its admin list. */
        async adminOverview() {
            return request('/api/admin/overview');
        },

        oauthUrl(provider) {
            return CLOUD_API + '/api/oauth/' + encodeURIComponent(provider)
                + '/start?origin=' + encodeURIComponent(location.origin);
        },

        forget() { remember(null, null); },
    };
})();
