/* ============================================================
   CodeVent Labs — accounts page logic

   Signed out: sign in, create an account, ask for a reset link, or use
   GitHub / Google when the API has those configured.
   Signed in: profile, email confirmation and cloud progress.
   An emailed link lands back here as account.html#verify=… or
   #reset=…; a social sign-in lands as #session=… . The fragment is
   read once and then cleared from the address bar.

   The local game state under cvl_courses_v1 stays the working copy the
   courses page reads; signing in merges it with the account and writes
   the result back so both pages agree.
   ============================================================ */

const UNIT1_LESSONS = Object.keys(LESSONS).filter(id => id.startsWith('l1-'));

const LABELS = {
    login: ['SIGN IN', 'SIGNING IN…'],
    signup: ['CREATE ACCOUNT', 'CREATING…'],
    forgot: ['SEND RESET LINK', 'SENDING…'],
};

const PROVIDER_NAMES = { github: 'GitHub', google: 'Google' };

const signedOutEl = document.getElementById('signedOut');
const signedInEl = document.getElementById('signedIn');
const resetPanel = document.getElementById('resetPanel');
const loadingEl = document.getElementById('accountLoading');

const form = document.getElementById('authForm');
const nameField = document.getElementById('nameField');
const nameInput = document.getElementById('authName');
const emailInput = document.getElementById('authEmail');
const passwordField = document.getElementById('passwordField');
const passwordInput = document.getElementById('authPassword');
const forgotWrap = document.getElementById('forgotWrap');
const errorEl = document.getElementById('authError');
const noticeEl = document.getElementById('authNotice');
const submitBtn = document.getElementById('authSubmit');
const eyeBtn = document.getElementById('authEye');
const noteEl = document.getElementById('authNote');
const tabLogin = document.getElementById('tabLogin');
const tabSignup = document.getElementById('tabSignup');
const socialEl = document.getElementById('authSocial');
const socialButtons = document.getElementById('socialButtons');
const verifyBanner = document.getElementById('verifyBanner');
const verifyText = document.getElementById('verifyText');

let mode = 'login';
let busy = false;
let currentState = null;
let config = { providers: {}, mail: false };

/* ---------- Local progress ---------- */
function readGuestState() {
    try {
        const raw = localStorage.getItem(CVL_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
        return null;
    }
}

function writeLocalState(state, user) {
    try {
        localStorage.setItem(CVL_STORAGE_KEY, JSON.stringify(Object.assign({}, state, { user: user || null })));
    } catch { /* nothing we can do about a full or blocked store */ }
}

function countCompleted(state) {
    if (!state || !state.completed) return 0;
    return Object.values(state.completed).reduce((total, ids) => total + (Array.isArray(ids) ? ids.length : 0), 0);
}

/* ---------- Small DOM helpers ---------- */
function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
}

function hideError() {
    errorEl.hidden = true;
    errorEl.textContent = '';
}

function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
}

function hideNotice() {
    noticeEl.hidden = true;
    noticeEl.textContent = '';
}

/* Newlines are kept as separate lines; nothing here is user HTML. */
function showNotice(message, link) {
    noticeEl.textContent = '';
    noticeEl.appendChild(el('span', '', message));
    if (link) {
        noticeEl.appendChild(document.createTextNode(' '));
        const anchor = el('a', 'notice-link', 'Open the link');
        anchor.href = link;
        noticeEl.appendChild(anchor);
    }
    noticeEl.hidden = false;
}

function setMode(next) {
    mode = next;
    const signup = mode === 'signup';
    const forgot = mode === 'forgot';

    tabLogin.classList.toggle('active', !signup);
    tabSignup.classList.toggle('active', signup);
    tabLogin.setAttribute('aria-selected', String(!signup));
    tabSignup.setAttribute('aria-selected', String(signup));

    nameField.hidden = !signup;
    passwordField.hidden = forgot;
    forgotWrap.hidden = mode !== 'login';
    passwordInput.autocomplete = signup ? 'new-password' : 'current-password';
    submitBtn.textContent = LABELS[mode][0];

    const guest = readGuestState();
    const guestLessons = countCompleted(guest);
    noteEl.innerHTML = '';
    if (forgot) {
        noteEl.appendChild(document.createTextNode(
            'Enter the email you signed up with and we’ll send a link to choose a new password. '));
        noteEl.appendChild(el('strong', '', 'Back to sign in?'));
        noteEl.appendChild(document.createTextNode(' Just choose Sign in above.'));
    } else if (signup) {
        noteEl.appendChild(document.createTextNode(
            guestLessons
                ? `Your ${guestLessons} finished lesson${guestLessons === 1 ? '' : 's'} on this device will be added to the new account. `
                : 'Free to create — just a name, an email and a password. '));
        noteEl.appendChild(el('strong', '', 'Already have an account?'));
        noteEl.appendChild(document.createTextNode(' Sign in instead.'));
    } else {
        noteEl.appendChild(document.createTextNode('New here? Choose '));
        noteEl.appendChild(el('strong', '', 'Create account'));
        noteEl.appendChild(document.createTextNode(
            guestLessons ? ' and your guest progress comes with you.' : ' — it only takes a moment.'));
    }
    hideError();
}

function setBusy(next) {
    busy = next;
    submitBtn.disabled = next;
    emailInput.disabled = next;
    passwordInput.disabled = next;
    nameInput.disabled = next;
    submitBtn.textContent = next ? LABELS[mode][1] : LABELS[mode][0];
}

/* ---------- Social buttons ---------- */
function renderSocialButtons() {
    socialButtons.innerHTML = '';
    const available = Object.keys(PROVIDER_NAMES).filter(name => config.providers && config.providers[name]);
    if (!available.length) {
        socialEl.hidden = true;
        return;
    }

    available.forEach(name => {
        const button = el('button', 'social-btn');
        button.type = 'button';
        button.appendChild(iconEl(name));
        button.appendChild(el('span', '', 'Continue with ' + PROVIDER_NAMES[name]));
        button.addEventListener('click', () => {
            window.location.href = CLOUD.oauthUrl(name);
        });
        socialButtons.appendChild(button);
    });
    socialEl.hidden = false;
}

/* ---------- Signed-in view ---------- */
function formatDate(timestamp) {
    if (!timestamp) return '';
    try {
        return new Date(timestamp).toLocaleDateString(undefined, {
            month: 'long', day: 'numeric', year: 'numeric',
        });
    } catch {
        return '';
    }
}

function badge(icon, text, tone) {
    const chip = el('span', 'badge' + (tone ? ' ' + tone : ''));
    chip.appendChild(iconEl(icon));
    chip.appendChild(el('span', '', text));
    return chip;
}

function renderBadges(user, providers) {
    const holder = document.getElementById('profileBadges');
    holder.innerHTML = '';
    if (user.emailVerified) holder.appendChild(badge('check', 'EMAIL CONFIRMED', 'good'));
    (providers || []).forEach(name => {
        if (PROVIDER_NAMES[name]) holder.appendChild(badge(name, PROVIDER_NAMES[name].toUpperCase()));
    });
}

function setVerifyMessage(message, link) {
    verifyText.textContent = message;
    if (link) {
        verifyText.appendChild(document.createTextNode(' '));
        const anchor = el('a', 'notice-link', 'Open the link');
        anchor.href = link;
        verifyText.appendChild(anchor);
    }
    verifyBanner.hidden = false;
}

function renderSignedIn(user, state, providers) {
    signedOutEl.classList.add('hidden');
    resetPanel.classList.add('hidden');
    signedInEl.classList.remove('hidden');
    loadingEl.hidden = true;

    currentState = state || {};
    document.getElementById('profileName').textContent = user.name || 'Learner';
    document.getElementById('profileEmail').textContent = user.email || '';
    document.getElementById('profileSince').textContent =
        user.createdAt ? 'Member since ' + formatDate(user.createdAt) : '';

    renderBadges(user, providers);
    verifyBanner.hidden = true;
    if (!user.emailVerified) {
        setVerifyMessage(mailMessage('Confirm your email address so we can help you recover your account.'));
    }

    const stats = document.getElementById('accountStats');
    stats.innerHTML = '';
    [
        ['zap', state.xp || 0, 'XP'],
        ['flame', state.streak || 0, 'day streak'],
        ['gem', state.gems || 0, 'gems'],
        ['heart', state.hearts || 0, 'hearts'],
    ].forEach(([icon, value, label]) => {
        const cell = el('div', 'account-stat');
        const iconWrap = el('span', 'account-stat-icon');
        iconWrap.appendChild(iconEl(icon));
        cell.appendChild(iconWrap);
        cell.appendChild(el('b', '', String(value)));
        cell.appendChild(el('span', '', label));
        stats.appendChild(cell);
    });

    const done = new Set((state.completed && state.completed.python) || []);
    const list = document.getElementById('accountLessons');
    list.innerHTML = '';
    UNIT1_LESSONS.forEach(id => {
        const lesson = LESSONS[id];
        const item = el('li', done.has(id) ? 'done' : '');
        const mark = el('span', 'lesson-mark');
        mark.appendChild(iconEl(done.has(id) ? 'check' : 'book'));
        item.appendChild(mark);
        item.appendChild(el('span', 'lesson-name', lesson ? lesson.title : id));
        item.appendChild(el('span', 'lesson-state', done.has(id) ? 'DONE' : 'TO DO'));
        list.appendChild(item);
    });

    setSyncText();
    hydrateIcons(signedInEl);
}

function mailMessage(base) {
    return config.mail ? base : base + ' (Email sending isn’t set up on this site yet, so links can’t be sent right now.)';
}

function setSyncText(savedAt) {
    const text = document.getElementById('syncText');
    if (!text) return;
    const count = countCompleted(currentState);
    const when = savedAt
        ? new Date(savedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
        : '';
    text.textContent = when
        ? `${count} lesson${count === 1 ? '' : 's'} saved · updated ${when}`
        : `${count} lesson${count === 1 ? '' : 's'} saved to the cloud`;
}

/* ---------- Sign in / create / reset request ---------- */
async function submit() {
    if (busy) return;
    hideError();
    hideNotice();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const name = nameInput.value.trim();

    if (mode === 'signup' && name.length < 2) {
        showError('Please enter your name.');
        nameInput.focus();
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        showError('That email address doesn’t look right.');
        emailInput.focus();
        return;
    }
    if (mode !== 'forgot' && password.length < 8) {
        showError('Passwords need at least 8 characters.');
        passwordInput.focus();
        return;
    }

    setBusy(true);
    try {
        if (mode === 'forgot') {
            const result = await CLOUD.forgotPassword(email);
            const link = result.mail && result.mail.link;
            showNotice(
                config.mail
                    ? 'If an account exists for ' + email + ', a link to choose a new password is on its way.'
                    : 'Email sending isn’t set up on this site yet, so no link could be sent.',
                link);
            setMode('login');
            emailInput.value = email;
            return;
        }

        const guest = readGuestState();
        const guestIsAccountless = !guest || !guest.user;
        let result;

        if (mode === 'signup') {
            result = await CLOUD.signup(name, email, password, guestIsAccountless ? guest || {} : {});
        } else {
            result = await CLOUD.login(email, password);
        }

        let state = result.state || {};
        if (mode === 'login' && guestIsAccountless && guest) {
            state = CLOUD.mergeProgress(guest, state);
        }

        writeLocalState(state, result.user);
        passwordInput.value = '';
        if (mode === 'signup') {
            passwordInput.value = '';
            renderSignedIn(result.user, state, []);
            const link = result.verification && result.verification.link;
            if (result.verification && result.verification.sent) {
                setVerifyMessage('We sent a confirmation link to ' + result.user.email + '.');
            } else if (link) {
                setVerifyMessage('Confirm ' + result.user.email + ':', link);
            }
            await CLOUD.saveProgress(state);
            setSyncText(Date.now());
            return;
        }

        renderSignedIn(result.user, state, result.providers || []);
        await CLOUD.saveProgress(state);
        setSyncText(Date.now());
    } catch (err) {
        showError(err.message || 'Something went wrong. Please try again.');
        if (err.field === 'name') nameInput.focus();
        else if (err.field === 'email') emailInput.focus();
        else if (err.field === 'password') passwordInput.focus();
    } finally {
        setBusy(false);
    }
}

form.addEventListener('submit', event => {
    event.preventDefault();
    submit();
});

[tabLogin, tabSignup].forEach(tab => {
    tab.addEventListener('click', () => {
        if (busy) return;
        hideNotice();
        setMode(tab.dataset.mode);
    });
});

document.getElementById('forgotBtn').addEventListener('click', () => {
    if (busy) return;
    hideNotice();
    setMode('forgot');
    emailInput.focus();
    emailInput.value = emailInput.value || '';
});

eyeBtn.addEventListener('click', () => {
    const hidden = passwordInput.type === 'password';
    passwordInput.type = hidden ? 'text' : 'password';
    eyeBtn.textContent = '';
    eyeBtn.appendChild(iconEl(hidden ? 'eye-off' : 'eye'));
    eyeBtn.setAttribute('aria-label', hidden ? 'Hide password' : 'Show password');
});

document.getElementById('signOut').addEventListener('click', async () => {
    const button = document.getElementById('signOut');
    button.disabled = true;
    await CLOUD.logout();
    signedInEl.classList.add('hidden');
    signedOutEl.classList.remove('hidden');
    button.disabled = false;
    hideNotice();
    setMode('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ---------- Email confirmation ---------- */
document.getElementById('verifyResend').addEventListener('click', async () => {
    const button = document.getElementById('verifyResend');
    button.disabled = true;
    const label = button.textContent;
    button.textContent = 'SENDING…';
    try {
        const result = await CLOUD.resendVerification();
        if (result.alreadyVerified) {
            verifyBanner.hidden = true;
        } else if (result.mail && result.mail.sent) {
            setVerifyMessage('Confirmation link sent. Check your inbox.');
        } else if (result.mail && result.mail.link) {
            setVerifyMessage('Confirm your email:', result.mail.link);
        } else if (result.mail && result.mail.reason === 'unconfigured') {
            setVerifyMessage(mailMessage('Confirm your email address so we can help you recover your account.'));
        } else {
            setVerifyMessage('We couldn’t send that link. Try again in a moment.');
        }
    } catch (err) {
        setVerifyMessage(err.message || 'We couldn’t send that link. Try again in a moment.');
    } finally {
        button.disabled = false;
        button.textContent = label;
    }
});

/* ---------- Password reset panel ---------- */
const resetForm = document.getElementById('resetForm');
const resetPassword = document.getElementById('resetPassword');
const resetPassword2 = document.getElementById('resetPassword2');
const resetError = document.getElementById('resetError');
const resetSubmit = document.getElementById('resetSubmit');
let resetToken = null;

function showResetPanel(token) {
    resetToken = token;
    loadingEl.hidden = true;
    signedOutEl.classList.add('hidden');
    signedInEl.classList.add('hidden');
    resetPanel.classList.remove('hidden');
    resetPassword.focus();
    window.scrollTo({ top: 0 });
}

resetForm.addEventListener('submit', async event => {
    event.preventDefault();
    resetError.hidden = true;

    if (resetPassword.value.length < 8) {
        resetError.textContent = 'Passwords need at least 8 characters.';
        resetError.hidden = false;
        resetPassword.focus();
        return;
    }
    if (resetPassword.value !== resetPassword2.value) {
        resetError.textContent = 'Those two passwords are not the same.';
        resetError.hidden = false;
        resetPassword2.focus();
        return;
    }

    resetSubmit.disabled = true;
    resetSubmit.textContent = 'SAVING…';
    try {
        const result = await CLOUD.resetPassword(resetToken, resetPassword.value);
        writeLocalState(result.state, result.user);
        resetPassword.value = '';
        resetPassword2.value = '';
        renderSignedIn(result.user, result.state, result.providers || []);
        setSyncText(Date.now());
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        resetError.textContent = err.message || 'Something went wrong. Please try again.';
        resetError.hidden = false;
    } finally {
        resetSubmit.disabled = false;
        resetSubmit.textContent = 'SAVE AND SIGN IN';
    }
});

/* ---------- Links back from email or a provider ---------- */
function readHash() {
    const raw = location.hash.replace(/^#/, '');
    if (!raw) return null;
    try {
        history.replaceState(null, '', location.pathname + location.search);
    } catch { /* older browsers: the hash stays, no harm */ }

    const params = new URLSearchParams(raw);
    if (params.get('session')) return { kind: 'session', token: params.get('session') };
    if (params.get('verify')) return { kind: 'verify', token: params.get('verify') };
    if (params.get('reset')) return { kind: 'reset', token: params.get('reset') };
    if (params.get('oauth-error')) return { kind: 'error', code: params.get('oauth-error') };
    return null;
}

const OAUTH_ERRORS = {
    cancelled: 'That sign-in was cancelled. You can try again or use your email and password.',
    expired: 'That sign-in took too long. Please try again.',
    failed: 'We couldn’t finish that sign-in. Please try again.',
    'no-email': 'That account doesn’t share a verified email address, so we can’t use it here.',
};

/* ---------- Init ---------- */
async function init() {
    hydrateIcons();
    eyeBtn.appendChild(iconEl('eye'));
    setMode('login');

    try {
        config = await CLOUD.config();
    } catch { /* the page still works without the extras */ }
    renderSocialButtons();

    const action = readHash();

    if (action && action.kind === 'reset') {
        showResetPanel(action.token);
        return;
    }

    if (action && action.kind === 'session') {
        CLOUD.setToken(action.token);
    }

    let verifyResult = null;
    if (action && action.kind === 'verify') {
        try {
            const data = await CLOUD.verifyEmail(action.token);
            verifyResult = { ok: true, email: data.email };
        } catch (err) {
            verifyResult = { ok: false, message: err.message };
        }
    }

    if (!CLOUD.hasToken()) {
        const cached = CLOUD.cachedUser();
        if (cached) CLOUD.forget();
        loadingEl.hidden = true;
        signedOutEl.classList.remove('hidden');

        if (verifyResult) {
            if (verifyResult.ok) showNotice('Email confirmed for ' + verifyResult.email + '. Sign in to continue.');
            else showError(verifyResult.message);
        } else if (action && action.kind === 'error') {
            showError(OAUTH_ERRORS[action.code] || OAUTH_ERRORS.failed);
        } else if (action && action.kind === 'session') {
            showError('That sign-in link has expired. Please try again.');
        }
        return;
    }

    loadingEl.hidden = false;
    signedOutEl.classList.add('hidden');
    try {
        const data = await CLOUD.me();
        writeLocalState(data.state, data.user);
        renderSignedIn(data.user, data.state, data.providers || []);
    } catch (err) {
        if (err.status === 401) CLOUD.forget();
        loadingEl.hidden = true;
        signedOutEl.classList.remove('hidden');
        if (err.status !== 401) showError(err.message);
    }
}

init();
