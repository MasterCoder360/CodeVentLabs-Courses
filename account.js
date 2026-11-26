/* ============================================================
   CodeVent Labs — accounts page logic

   Signed out: sign in or create an account.
   Signed in: profile + cloud progress.
   The local game state under cvl_courses_v1 stays the working copy
   the courses page reads; signing in merges it with the account and
   writes the result back so both pages agree.
   ============================================================ */

const UNIT1_LESSONS = Object.keys(LESSONS).filter(id => id.startsWith('l1-'));

const signedOutEl = document.getElementById('signedOut');
const signedInEl = document.getElementById('signedIn');
const loadingEl = document.getElementById('accountLoading');

const form = document.getElementById('authForm');
const nameField = document.getElementById('nameField');
const nameInput = document.getElementById('authName');
const emailInput = document.getElementById('authEmail');
const passwordInput = document.getElementById('authPassword');
const errorEl = document.getElementById('authError');
const submitBtn = document.getElementById('authSubmit');
const eyeBtn = document.getElementById('authEye');
const noteEl = document.getElementById('authNote');
const tabLogin = document.getElementById('tabLogin');
const tabSignup = document.getElementById('tabSignup');

let mode = 'login';
let busy = false;
let currentState = null;

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

function setMode(next) {
    mode = next;
    const signup = mode === 'signup';

    tabLogin.classList.toggle('active', !signup);
    tabSignup.classList.toggle('active', signup);
    tabLogin.setAttribute('aria-selected', String(!signup));
    tabSignup.setAttribute('aria-selected', String(signup));

    nameField.hidden = !signup;
    passwordInput.autocomplete = signup ? 'new-password' : 'current-password';
    submitBtn.textContent = signup ? 'CREATE ACCOUNT' : 'SIGN IN';

    const guest = readGuestState();
    const guestLessons = countCompleted(guest);
    noteEl.innerHTML = '';
    if (signup) {
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

function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
}

function hideError() {
    errorEl.hidden = true;
    errorEl.textContent = '';
}

function setBusy(next) {
    busy = next;
    submitBtn.disabled = next;
    emailInput.disabled = next;
    passwordInput.disabled = next;
    nameInput.disabled = next;
    submitBtn.textContent = next
        ? (mode === 'signup' ? 'CREATING…' : 'SIGNING IN…')
        : (mode === 'signup' ? 'CREATE ACCOUNT' : 'SIGN IN');
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

function renderSignedIn(user, state, savedAt) {
    signedOutEl.classList.add('hidden');
    signedInEl.classList.remove('hidden');
    loadingEl.hidden = true;

    currentState = state || {};
    document.getElementById('profileName').textContent = user.name || 'Learner';
    document.getElementById('profileEmail').textContent = user.email || '';
    document.getElementById('profileSince').textContent =
        user.createdAt ? 'Member since ' + formatDate(user.createdAt) : '';

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

    setSyncText(savedAt);
    hydrateIcons(signedInEl);
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

/* ---------- Sign in / create ---------- */
async function submit() {
    if (busy) return;
    hideError();

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
    if (password.length < 8) {
        showError('Passwords need at least 8 characters.');
        passwordInput.focus();
        return;
    }

    setBusy(true);
    try {
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
        renderSignedIn(result.user, state);
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
        setMode(tab.dataset.mode);
    });
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
    setMode('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ---------- Init ---------- */
async function init() {
    hydrateIcons();
    eyeBtn.appendChild(iconEl('eye'));
    setMode('login');

    if (!CLOUD.hasToken()) {
        const cached = CLOUD.cachedUser();
        if (cached) CLOUD.forget();
        loadingEl.hidden = true;
        return;
    }

    loadingEl.hidden = false;
    signedOutEl.classList.add('hidden');
    try {
        const data = await CLOUD.me();
        writeLocalState(data.state, data.user);
        renderSignedIn(data.user, data.state);
    } catch (err) {
        if (err.status === 401) CLOUD.forget();
        loadingEl.hidden = true;
        signedOutEl.classList.remove('hidden');
        if (err.status !== 401) showError(err.message);
    }
}

init();
