/* Local API smoke test for the accounts Worker.

   Run a `wrangler dev` with MAIL_DEV_ECHO=1 (and optionally a mail stub
   via MAIL_ENDPOINT) and point BASE at it:

     BASE=http://127.0.0.1:8789 ADMIN_TOKEN=test-admin-token \
       ADMIN_EMAILS=owner@example.test ADMIN_EMAIL=owner@example.test \
       node cloud/test-api.mjs

   ADMIN_EMAIL is optional: it names the address the local `wrangler dev`
   was started with in ADMIN_EMAILS, so the owner dashboard can be checked
   as well as its signed-out and not-an-admin refusals.

   It signs up, confirms an email, resets a password and prunes an
   account — using throwaway addresses tagged with the current time. */

const BASE = process.env.BASE || 'http://127.0.0.1:8789';
const ADMIN = process.env.ADMIN_TOKEN || '';
const TAG = 't' + Date.now();

let passed = 0;
let failed = 0;

function check(name, condition, detail) {
    if (condition) {
        passed++;
        console.log('  ok   ' + name);
    } else {
        failed++;
        console.log('  FAIL ' + name + (detail ? '  → ' + JSON.stringify(detail) : ''));
    }
}

async function call(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (options.token) headers.Authorization = 'Bearer ' + options.token;
    const response = await fetch(BASE + path, {
        method: options.method || 'GET',
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        redirect: 'manual',
    });
    let data = null;
    try { data = await response.json(); } catch { data = null; }
    return { status: response.status, data, headers: response.headers };
}

const email = `verify.${TAG}@example.test`;
const email2 = `spare.${TAG}@example.test`;
const password = 'first-password-1';
let token = null;

console.log('config');
const config = await call('/api/config');
check('config 200', config.status === 200, config.data);
check('config reports no social providers', config.data.providers.github === false && config.data.providers.google === false, config.data.providers);
check('config reports mail configured', config.data.mail === true, config.data);
check('config site', config.data.site === 'http://127.0.0.1:5500', config.data.site);

console.log('signup');
const signup = await call('/api/signup', {
    method: 'POST',
    body: { name: 'Test Student', email, password, state: { xp: 30, completed: { python: ['l1-1'] } } },
});
check('signup 201', signup.status === 201, signup.data);
check('signup returns a token', typeof signup.data.token === 'string');
check('signup user is unverified', signup.data.user.emailVerified === false);
check('signup sent a verification email', signup.data.verification.sent === true, signup.data.verification);
check('signup kept guest xp', signup.data.state.xp === 30, signup.data.state);
token = signup.data.token;

const verifyLink = signup.data.verification.link || '';
const verifyToken = (verifyLink.split('#verify=')[1] || '');
check('verification link points at the site', verifyLink.startsWith('http://127.0.0.1:5500/account.html#verify='), verifyLink);

console.log('signup guards');
const dupe = await call('/api/signup', { method: 'POST', body: { name: 'Again', email, password } });
check('duplicate email 409', dupe.status === 409, dupe.data);
const badpass = await call('/api/signup', { method: 'POST', body: { name: 'Short', email: `x.${TAG}@example.test`, password: 'short' } });
check('short password 400', badpass.status === 400 && badpass.data.field === 'password', badpass.data);
const badmail = await call('/api/signup', { method: 'POST', body: { name: 'Bad Mail', email: 'nope', password } });
check('bad email 400', badmail.status === 400 && badmail.data.field === 'email', badmail.data);

console.log('email verification');
const meBefore = await call('/api/me', { token });
check('me before verify is unverified', meBefore.data.user.emailVerified === false);
const wrongVerify = await call('/api/verify', { method: 'POST', body: { token: 'not-a-real-token' } });
check('bad verify token 400', wrongVerify.status === 400, wrongVerify.data);
const verify = await call('/api/verify', { method: 'POST', body: { token: verifyToken } });
check('verify 200', verify.status === 200, verify.data);
check('verify reports the address', verify.data.email === email, verify.data);
const verifyAgain = await call('/api/verify', { method: 'POST', body: { token: verifyToken } });
check('verify token is single use', verifyAgain.status === 400, verifyAgain.data);
const meAfter = await call('/api/me', { token });
check('me after verify is verified', meAfter.data.user.emailVerified === true, meAfter.data.user);
const resendAfter = await call('/api/verify/resend', { method: 'POST', token });
check('resend says already verified', resendAfter.data.alreadyVerified === true, resendAfter.data);
const resendAnon = await call('/api/verify/resend', { method: 'POST' });
check('resend without auth 401', resendAnon.status === 401);

console.log('password reset');
const forgotUnknown = await call('/api/password/forgot', { method: 'POST', body: { email: `nobody.${TAG}@example.test` } });
check('forgot unknown address still 200', forgotUnknown.status === 200, forgotUnknown.data);
check('forgot unknown sends nothing', forgotUnknown.data.mail.sent === false && forgotUnknown.data.mail.reason === 'unknown-account', forgotUnknown.data.mail);
const forgot = await call('/api/password/forgot', { method: 'POST', body: { email } });
check('forgot 200', forgot.status === 200, forgot.data);
check('forgot sent a reset email', forgot.data.mail.sent === true, forgot.data.mail);
const resetToken = ((forgot.data.mail.link || '').split('#reset=')[1] || '');
check('reset link points at the site', resetToken.length > 20);

const resetShort = await call('/api/password/reset', { method: 'POST', body: { token: resetToken, password: 'short' } });
check('reset rejects a short password', resetShort.status === 400 && resetShort.data.field === 'password', resetShort.data);
const reset = await call('/api/password/reset', {
    method: 'POST',
    body: { token: resetToken, password: 'second-password-2' },
});
check('reset 200', reset.status === 200, reset.data);
check('reset signs the user in', typeof reset.data.token === 'string' && reset.data.user.emailVerified === true, reset.data.user);
check('reset keeps progress', reset.data.state.xp === 30, reset.data.state);

const oldLogin = await call('/api/login', { method: 'POST', body: { email, password } });
check('old password no longer works', oldLogin.status === 401, oldLogin.data);
const newLogin = await call('/api/login', { method: 'POST', body: { email, password: 'second-password-2' } });
check('new password works', newLogin.status === 200 && newLogin.data.user.emailVerified === true, newLogin.data);
const resetAgain = await call('/api/password/reset', { method: 'POST', body: { token: resetToken, password: 'third-password-3' } });
check('reset token is single use', resetAgain.status === 400, resetAgain.data);

console.log('sessions & progress');
const staleMe = await call('/api/me', { token });
check('reset signed older sessions out', staleMe.status === 401, staleMe.data);
token = newLogin.data.token;
const saved = await call('/api/progress', { method: 'PUT', token, body: { state: { xp: 55, completed: { python: ['l1-1', 'l1-2'] } } } });
check('progress saved', saved.status === 200 && saved.data.state.xp === 55, saved.data);
const meProgress = await call('/api/me', { token });
check('progress read back', meProgress.data.state.completed.python.length === 2, meProgress.data.state);
const logout = await call('/api/logout', { method: 'POST', token });
check('logout 200', logout.status === 200);
const afterLogout = await call('/api/me', { token });
check('token is dead after logout', afterLogout.status === 401);

console.log('social sign-in');
const oauthStart = await call('/api/oauth/github/start');
check('oauth start is 503 until configured', oauthStart.status === 503, oauthStart.data);
const oauthBogus = await call('/api/oauth/twitter/start');
check('unknown provider 404', oauthBogus.status === 404);

console.log('admin');
const adminSignup = await call('/api/signup', {
    method: 'POST',
    body: { name: 'Spare Account', email: email2, password },
});
check('second account created', adminSignup.status === 201);
const adminNoToken = await call('/api/admin/users');
check('admin without token 403', adminNoToken.status === 403, adminNoToken.data);
const adminWrong = await call('/api/admin/users', { headers: { 'X-Admin-Token': 'nope' } });
check('admin with wrong token 403', adminWrong.status === 403);
const adminList = await call('/api/admin/users', { headers: { 'X-Admin-Token': ADMIN } });
check('admin list 200', adminList.status === 200, adminList.data && adminList.data.error);
check('admin list has both accounts', adminList.data.count >= 2, adminList.data.count);
check('admin list exposes no hashes', !JSON.stringify(adminList.data).includes('password'), null);
const pruneNoKeep = await call('/api/admin/prune', { method: 'POST', headers: { 'X-Admin-Token': ADMIN }, body: {} });
check('prune requires a keep list', pruneNoKeep.status === 400, pruneNoKeep.data);
const prune = await call('/api/admin/prune', {
    method: 'POST',
    headers: { 'X-Admin-Token': ADMIN },
    body: { keep: [email] },
});
check('prune 200', prune.status === 200, prune.data);
check('prune kept the named account', prune.data.kept.length === 1 && prune.data.kept[0] === email, prune.data);
check('prune removed the spare', prune.data.removed.includes(email2), prune.data);
check('prune reports missing keeps', prune.data.missing.length === 0, prune.data.missing);
const prunedLogin = await call('/api/login', { method: 'POST', body: { email: email2, password } });
check('pruned account cannot sign in', prunedLogin.status === 401);
const survivor = await call('/api/login', { method: 'POST', body: { email, password: 'second-password-2' } });
check('kept account still signs in', survivor.status === 200);

console.log('admin dashboard');
const overviewAnon = await call('/api/admin/overview');
check('overview without a session 401', overviewAnon.status === 401, overviewAnon.data);
const learnerSession = await call('/api/login', { method: 'POST', body: { email, password: 'second-password-2' } });
const overviewLearner = await call('/api/admin/overview', { token: learnerSession.data.token });
check('overview for a learner 403', overviewLearner.status === 403, overviewLearner.data);
check('learner session is not flagged admin', learnerSession.data.admin === false, learnerSession.data.admin);

const adminEmail = process.env.ADMIN_EMAIL || '';
if (adminEmail) {
    let owner = await call('/api/signup', {
        method: 'POST',
        body: { name: 'Site Owner', email: adminEmail, password },
    });
    if (owner.status === 409) {
        owner = await call('/api/login', { method: 'POST', body: { email: adminEmail, password } });
    }
    check('owner account has a session', owner.status === 200 || owner.status === 201, owner.data);
    check('owner sign-in is flagged admin', owner.data.admin === true, owner.data.admin);

    const overview = await call('/api/admin/overview', { token: owner.data.token });
    check('overview for the owner 200', overview.status === 200, overview.data);
    check('overview counts the accounts', overview.data.totals && overview.data.totals.accounts >= 2, overview.data.totals);
    check('overview rows match the total', Array.isArray(overview.data.users)
        && overview.data.users.length === overview.data.totals.accounts, overview.data.users && overview.data.users.length);
    check('overview knows who is asking', overview.data.admin === adminEmail, overview.data.admin);
    check('overview exposes no secrets', !/password|salt|token_hash/i.test(JSON.stringify(overview.data)), null);
} else {
    console.log('  (skipped owner overview: set ADMIN_EMAILS and ADMIN_EMAIL to check it)');
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
