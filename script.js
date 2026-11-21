/* ============================================================
   CodeVent Labs — Courses page logic (courses.labs.cosmospark.org)
   Duolingo-style path, XP / gems / hearts / streak.

   NOTE: This is Section 1 (structure + behavior scaffold).
   Progress currently persists in localStorage under the key
   below; when the Accounts section lands, this same object
   shape will sync to Neon via the API (never expose secrets
   in the client — all writes go through a server function).
   ============================================================ */

const STORAGE_KEY = 'cvl_courses_v1';

/* ---------- Course catalog ---------- */
const COURSES = [
    { id: 'python',  name: 'Python',        emoji: '🐍', available: true  },
    { id: 'webdev',  name: 'Web Dev',       emoji: '🌐', available: false },
    { id: 'robotics',name: 'Robotics',      emoji: '🤖', available: false },
    { id: 'scratch', name: 'Scratch',       emoji: '🐱', available: false },
    { id: 'ai',      name: 'AI Basics',     emoji: '🧠', available: false },
];

/* ---------- Default account state (guest) ---------- */
const DEFAULT_STATE = {
    user: null,            // set by Accounts section (Neon) later
    course: 'python',
    xp: 0,
    gems: 500,
    hearts: 5,
    streak: 0,
    lastActive: null,      // ISO date string of last completed lesson
    completed: {},         // { courseId: [lessonId, ...] }
};

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return structuredClone(DEFAULT_STATE);
        return Object.assign(structuredClone(DEFAULT_STATE), JSON.parse(raw));
    } catch {
        return structuredClone(DEFAULT_STATE);
    }
}

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn('Could not persist progress locally:', e);
    }
}

let state = loadState();

/* ---------- Navbar scroll behavior (same as labs.cosmospark.org) ---------- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

/* ---------- Stats bar rendering ---------- */
function renderStats() {
    document.getElementById('statStreak').textContent = state.streak;
    document.getElementById('statXP').textContent = state.xp;
    document.getElementById('statGems').textContent = state.gems;
    document.getElementById('statHearts').textContent = state.hearts;
    document.getElementById('accountName').textContent =
        (state.user && state.user.name) ? state.user.name : 'Guest';
}

/* ---------- Streak bookkeeping ---------- */
function touchStreak() {
    const today = new Date().toDateString();
    if (state.lastActive === today) return;
    const yesterday = new Date(Date.now() - 864e5).toDateString();
    state.streak = (state.lastActive === yesterday) ? state.streak + 1 : 1;
    state.lastActive = today;
}

/* ---------- Course selector (flag row) ---------- */
function renderCourseSelector() {
    const wrap = document.querySelector('.course-selector-inner');
    wrap.innerHTML = '';
    COURSES.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'course-flag'
            + (c.id === state.course ? ' active' : '')
            + (c.available ? ' available' : ' coming-soon');
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', String(c.id === state.course));
        btn.title = c.available ? c.name : `${c.name} — coming soon`;
        btn.innerHTML = `<span class="flag-emoji">${c.emoji}</span>
                         <span class="flag-name">${c.name}</span>`;
        btn.addEventListener('click', () => {
            if (!c.available) return;           // locked courses do nothing yet
            state.course = c.id;
            saveState();
            renderCourseSelector();
        });
        wrap.appendChild(btn);
    });
}

/* ---------- Path helpers ---------- */
const pathEl = document.getElementById('path');
const nodes = Array.from(pathEl.querySelectorAll('.node'));
const lessonNodes = nodes.filter(n => !n.classList.contains('node-chest')
                                   && !n.classList.contains('node-trophy'));

function completedSet() {
    return new Set((state.completed[state.course] || []));
}

function renderPath() {
    const done = completedSet();
    let currentAssigned = false;

    nodes.forEach(node => {
        const id = node.dataset.lesson;
        node.classList.remove('completed', 'current', 'locked');
        if (done.has(id)) {
            node.classList.add('completed');
        } else if (!currentAssigned && node === lessonNodes.find(n => !done.has(n.dataset.lesson))) {
            node.classList.add('current');
            currentAssigned = true;
        } else {
            node.classList.add('locked');
        }
    });

    // Progress bar = completed lessons / total lesson nodes
    const pct = Math.round((done.size / nodes.length) * 100);
    document.getElementById('pathProgressFill').style.width = pct + '%';
    document.getElementById('pathProgressText').textContent = pct + '%';
}

/* ---------- Modals ---------- */
const lessonModal = document.getElementById('lessonModal');
const authModal = document.getElementById('authModal');

function openModal(m) { m.classList.remove('hidden'); }
function closeModal(m) { m.classList.add('hidden'); }

document.getElementById('lessonModalClose').onclick = () => closeModal(lessonModal);
document.getElementById('lessonModalCancel').onclick = () => closeModal(lessonModal);
document.getElementById('authModalClose').onclick = () => closeModal(authModal);
document.getElementById('authModalLater').onclick = () => closeModal(authModal);
[lessonModal, authModal].forEach(m =>
    m.addEventListener('click', e => { if (e.target === m) closeModal(m); }));

let pendingLesson = null;

function onNodeClick(node) {
    const id = node.dataset.lesson;

    if (node.classList.contains('locked')) {
        document.getElementById('lessonModalTitle').textContent = 'Locked 🔒';
        document.getElementById('lessonModalBody').textContent =
            'Finish the previous lesson to unlock this one.';
        document.getElementById('lessonModalStart').style.display = 'none';
        pendingLesson = null;
        openModal(lessonModal);
        return;
    }

    const isChest = node.classList.contains('node-chest');
    const isTrophy = node.classList.contains('node-trophy');

    document.getElementById('lessonModalTitle').textContent =
        isChest ? 'Reward Chest 🎁' : isTrophy ? 'Unit Review 🏆' : 'Lesson';
    document.getElementById('lessonModalBody').textContent =
        isChest ? 'Open this chest to collect +20 gems.'
                : 'Complete this lesson to earn XP and keep your streak alive!';
    document.getElementById('lessonModalStart').style.display = '';
    document.getElementById('lessonModalStart').textContent = isChest ? 'OPEN' : 'START';
    pendingLesson = { node, id, isChest };
    openModal(lessonModal);
}

document.getElementById('lessonModalStart').addEventListener('click', () => {
    if (!pendingLesson) return;
    const { node, id, isChest } = pendingLesson;

    if (state.hearts <= 0 && !isChest) {
        document.getElementById('lessonModalBody').textContent =
            'You are out of hearts! Wait for them to refill or refill with 350 gems.';
        document.getElementById('lessonModalStart').textContent = 'REFILL (350 💎)';
        if (state.gems >= 350) {
            state.gems -= 350;
            state.hearts = 5;
            saveState();
            renderStats();
            document.getElementById('lessonModalStart').textContent = 'START';
        }
        return;
    }

    const list = state.completed[state.course] || (state.completed[state.course] = []);
    if (!list.includes(id)) {
        list.push(id);
        state.xp += isChest ? 5 : 10;
        if (isChest) state.gems += 20;
        touchStreak();
        saveState();
    }
    pendingLesson = null;
    closeModal(lessonModal);
    renderStats();
    renderPath();
});

nodes.forEach(n => n.addEventListener('click', () => onNodeClick(n)));

/* ---------- Cart badge (kept from main site) ---------- */
const cartCountElement = document.getElementById('cartCount');
function updateCartCount(newCount) { cartCountElement.textContent = newCount; }
function addToCart() { updateCartCount(parseInt(cartCountElement.textContent || '0', 10) + 1); }

/* ---------- Init ---------- */
renderStats();
renderCourseSelector();
renderPath();
