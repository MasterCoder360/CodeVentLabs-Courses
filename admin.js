/* ============================================================
   CodeVent Labs — admin dashboard (admin.html)

   Owner-only. The page asks the Worker for /api/admin/overview with the
   signed-in session; the Worker has the final say and answers

     401  nobody is signed in
     403  signed in, but not an admin account
     200  the owner: accounts and totals

   Nothing here is a secret — the data only arrives over an authorised
   request, so the gate is the server's, not this file's.
   ============================================================ */

const loadingEl = document.getElementById('adminLoading');
const deniedEl = document.getElementById('adminDenied');
const panelEl = document.getElementById('adminPanel');
const errorEl = document.getElementById('adminError');

const deniedTitle = document.getElementById('deniedTitle');
const deniedText = document.getElementById('deniedText');
const deniedAction = document.getElementById('deniedAction');

const statsEl = document.getElementById('adminStats');
const rowsEl = document.getElementById('adminRows');
const emptyEl = document.getElementById('adminEmpty');
const countEl = document.getElementById('adminCount');
const subEl = document.getElementById('adminSub');
const footEl = document.getElementById('adminFoot');
const searchEl = document.getElementById('adminSearch');
const refreshBtn = document.getElementById('adminRefresh');

let everyone = [];

function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
}

function formatDate(timestamp, withTime) {
    if (!timestamp) return '—';
    try {
        return new Date(timestamp).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric',
            ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
        });
    } catch {
        return '—';
    }
}

function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
}

function hideError() {
    errorEl.hidden = true;
    errorEl.textContent = '';
}

function showDenied(kind) {
    loadingEl.hidden = true;
    panelEl.classList.add('hidden');
    deniedEl.classList.remove('hidden');

    if (kind === 'signed-out') {
        deniedTitle.textContent = 'Sign in first';
        deniedText.textContent = 'This page belongs to the site owner. Sign in with that account to see it.';
        deniedAction.textContent = 'SIGN IN';
        deniedAction.href = 'account.html';
    } else {
        deniedTitle.textContent = 'Admins only';
        deniedText.textContent = 'The account you are signed in with is not the site owner’s, so there is nothing to show here.';
        deniedAction.textContent = 'GO TO YOUR ACCOUNT';
        deniedAction.href = 'account.html';
    }
    hydrateIcons(deniedEl);
    window.scrollTo({ top: 0 });
}

/* ---------- Overview numbers ---------- */
const CARDS = [
    ['users', 'accounts', 'Accounts'],
    ['shield-check', 'verified', 'Email confirmed'],
    ['book', 'learners', 'Learners with progress'],
    ['check', 'lessons', 'Lessons finished'],
    ['zap', 'xp', 'Total XP'],
    ['user-plus', 'newThisWeek', 'Joined this week'],
];

function renderStats(totals) {
    statsEl.innerHTML = '';
    CARDS.forEach(([icon, key, label]) => {
        const cell = el('div', 'account-stat');
        const iconWrap = el('span', 'account-stat-icon');
        iconWrap.appendChild(iconEl(icon));
        cell.appendChild(iconWrap);
        cell.appendChild(el('b', '', String(totals[key] || 0)));
        cell.appendChild(el('span', '', label));
        statsEl.appendChild(cell);
    });
}

/* ---------- Accounts table ---------- */
function renderRows() {
    const term = searchEl.value.trim().toLowerCase();
    const shown = term
        ? everyone.filter(user =>
            (user.name || '').toLowerCase().includes(term) ||
            (user.email || '').toLowerCase().includes(term))
        : everyone;

    rowsEl.innerHTML = '';
    shown.forEach(user => {
        const row = el('tr');

        const who = el('td');
        who.appendChild(el('span', 'admin-name', user.name || 'Learner'));
        who.appendChild(el('span', 'admin-email', user.email || ''));

        const joined = el('td', 'admin-date', formatDate(user.createdAt));
        const lessons = el('td', 'num', String(user.lessons || 0));
        const xp = el('td', 'num', String(user.xp || 0));

        const status = el('td');
        const chip = el('span', 'badge' + (user.emailVerified ? ' good' : ''));
        chip.appendChild(iconEl(user.emailVerified ? 'check' : 'mail'));
        chip.appendChild(el('span', '', user.emailVerified ? 'CONFIRMED' : 'UNCONFIRMED'));
        status.appendChild(chip);

        [who, joined, lessons, xp, status].forEach(cell => row.appendChild(cell));
        rowsEl.appendChild(row);
    });

    emptyEl.hidden = shown.length > 0;
    countEl.textContent = term
        ? `${shown.length} of ${everyone.length} account${everyone.length === 1 ? '' : 's'}`
        : `${everyone.length} account${everyone.length === 1 ? '' : 's'}`;
}

/* ---------- Load ---------- */
function showPanel(data) {
    hideError();
    everyone = Array.isArray(data.users) ? data.users : [];

    loadingEl.hidden = true;
    deniedEl.classList.add('hidden');
    panelEl.classList.remove('hidden');

    renderStats(data.totals || {});
    renderRows();

    subEl.textContent = 'Signed in as ' + data.admin
        + ' · updated ' + formatDate(data.generatedAt || Date.now(), true);
    footEl.textContent = 'Passwords and sessions are never part of this page; '
        + 'accounts with no progress simply show 0 lessons.';

    hydrateIcons(panelEl);
    window.scrollTo({ top: 0 });
}

async function load() {
    hideError();
    refreshBtn.disabled = true;
    loadingEl.hidden = false;

    if (!CLOUD.hasToken()) {
        CLOUD.forget();
        showDenied('signed-out');
        refreshBtn.disabled = false;
        return;
    }

    try {
        const data = await CLOUD.adminOverview();
        showPanel(data);
    } catch (err) {
        if (err.status === 401) {
            CLOUD.forget();
            showDenied('signed-out');
        } else if (err.status === 403) {
            showDenied('not-admin');
        } else {
            loadingEl.hidden = true;
            panelEl.classList.add('hidden');
            deniedEl.classList.add('hidden');
            showError(err.message || 'Could not load the dashboard. Try again in a moment.');
        }
    } finally {
        refreshBtn.disabled = false;
        hydrateIcons(document);
    }
}

refreshBtn.addEventListener('click', load);
searchEl.addEventListener('input', renderRows);

hydrateIcons();
load();
