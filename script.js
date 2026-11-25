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
    { id: 'python',  name: 'Python',        icon: 'code',                available: true  },
    { id: 'webdev',  name: 'Web Dev',       icon: 'globe',               available: false },
    { id: 'robotics',name: 'Robotics',      icon: 'bot',                 available: false },
    { id: 'scratch', name: 'Scratch',       icon: 'cat',                 available: false },
    { id: 'ai',      name: 'AI Basics',     icon: 'brain',               available: false },
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
        const flagIcon = el('span', 'flag-icon');
        flagIcon.appendChild(iconEl(c.icon));
        btn.appendChild(flagIcon);
        btn.appendChild(el('span', 'flag-name', c.name));
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
    // Nodes unlock strictly in map order: the first unfinished node is "current".
    const currentNode = nodes.find(n => !done.has(n.dataset.lesson));

    nodes.forEach(node => {
        const id = node.dataset.lesson;
        node.classList.remove('completed', 'current', 'locked');
        if (done.has(id)) node.classList.add('completed');
        else if (node === currentNode) node.classList.add('current');
        else node.classList.add('locked');
    });

    // Progress bar = completed nodes / total nodes
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
        setModalTitle('lock', 'Locked');
        document.getElementById('lessonModalBody').textContent =
            'Finish the previous lesson to unlock this one.';
        document.getElementById('lessonModalStart').style.display = 'none';
        pendingLesson = null;
        openModal(lessonModal);
        return;
    }

    const isChest = node.classList.contains('node-chest');
    const isTrophy = node.classList.contains('node-trophy');
    const isPractice = node.classList.contains('node-practice');
    const lesson = LESSONS[id];
    const comingSoon = !isChest && !isTrophy && !isPractice && !lesson;

    setModalTitle(
        isChest ? 'gift' : isTrophy ? 'trophy' : lesson ? lesson.icon : 'book',
        isChest ? 'Reward Chest' : isTrophy ? 'Unit Review'
        : lesson ? lesson.title : 'Lesson');
    document.getElementById('lessonModalBody').textContent =
        isChest ? 'Open this chest to collect +20 gems.'
        : lesson ? lesson.blurb
        : comingSoon ? 'This lesson is still being written. Check back soon!'
        : 'Complete this to earn XP and keep your streak alive!';
    const startBtn = document.getElementById('lessonModalStart');
    startBtn.style.display = comingSoon ? 'none' : '';
    startBtn.textContent = isChest ? 'OPEN' : 'START';
    pendingLesson = { node, id, isChest };
    openModal(lessonModal);
}

document.getElementById('lessonModalStart').addEventListener('click', () => {
    if (!pendingLesson) return;
    const { node, id, isChest } = pendingLesson;

    if (state.hearts <= 0 && !isChest) {
        document.getElementById('lessonModalBody').textContent =
            'You are out of hearts! Wait for them to refill or refill with 350 gems.';
        document.getElementById('lessonModalStart').textContent = 'REFILL · 350 gems';
        if (state.gems >= 350) {
            state.gems -= 350;
            state.hearts = 5;
            saveState();
            renderStats();
            document.getElementById('lessonModalStart').textContent = 'START';
        }
        return;
    }

    // Real lessons open the full-screen lesson player
    if (LESSONS[id]) {
        pendingLesson = null;
        closeModal(lessonModal);
        startLesson(id);
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

/* ============================================================
   LESSON PLAYER
   intro cards -> questions (wrong answers repeat at the end)
   -> result screen. Wrong answer = -1 heart.
   ============================================================ */
const player = document.getElementById('player');
const playerBody = document.getElementById('playerBody');
const playerFooter = document.getElementById('playerFooter');
const playerFeedback = document.getElementById('playerFeedback');
const playerAction = document.getElementById('playerAction');
const playerFill = document.getElementById('playerFill');
const playerHearts = document.getElementById('playerHearts');

const XP_LESSON = 15;
const XP_PERFECT_BONUS = 5;
const XP_REPLAY = 5;

let run = null;   // state of the lesson currently being played

function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
}

function setModalTitle(iconName, text) {
    const title = document.getElementById('lessonModalTitle');
    title.textContent = '';
    if (iconName) title.appendChild(iconEl(iconName));
    title.appendChild(document.createTextNode(text));
}

function renderHearts() {
    playerHearts.textContent = '';
    playerHearts.appendChild(iconEl('heart', 'heart-icon'));
    playerHearts.appendChild(document.createTextNode(String(state.hearts)));
}

function startLesson(id) {
    const lesson = LESSONS[id];
    run = {
        id, lesson,
        phase: 'intro',          // intro | question | done | out
        introIdx: 0,
        queue: lesson.questions.slice(),
        total: lesson.questions.length,
        correct: 0,
        mistakes: 0,
        checked: false,
        selected: null,
        reward: 0
    };
    player.classList.remove('hidden');
    document.body.classList.add('no-scroll');
    renderPlayer();
}

function closePlayer() {
    player.classList.add('hidden');
    document.body.classList.remove('no-scroll');
    run = null;
    renderStats();
    renderPath();
}

function setFooter(mode, title, detail) {
    playerFooter.classList.remove('correct', 'incorrect');
    if (mode) playerFooter.classList.add(mode);
    playerFeedback.textContent = '';
    if (title) {
        playerFeedback.appendChild(el('strong', '', title));
        if (detail) playerFeedback.appendChild(document.createTextNode(detail));
    }
}

function renderPlayer() {
    renderHearts();
    playerBody.innerHTML = '';
    setFooter(null);
    playerAction.disabled = false;

    if (run.phase === 'intro') {
        const card = run.lesson.intro[run.introIdx];
        const wrap = el('div', 'p-card');
        const cardIcon = el('div', 'p-icon');
        cardIcon.appendChild(iconEl(card.icon));
        wrap.appendChild(cardIcon);
        wrap.appendChild(el('h2', 'p-title', card.title));
        card.text.forEach(t => wrap.appendChild(el('p', 'p-text', t)));
        if (card.code) {
            wrap.appendChild(el('div', 'p-label', 'CODE'));
            wrap.appendChild(el('pre', 'p-code', card.code));
        }
        if (card.output) {
            wrap.appendChild(el('div', 'p-label', 'WHAT YOU SEE'));
            wrap.appendChild(el('pre', 'p-output', card.output));
        }
        playerBody.appendChild(wrap);
        playerFill.style.width = '0%';
        const last = run.introIdx === run.lesson.intro.length - 1;
        playerAction.textContent = last ? "LET'S GO!" : 'CONTINUE';
        return;
    }

    if (run.phase === 'question') {
        const q = run.queue[0];
        const wrap = el('div', 'p-question');
        wrap.appendChild(el('h2', 'p-prompt', q.prompt));
        if (q.code) wrap.appendChild(el('pre', 'p-code', q.code));

        if (q.type === 'choice') {
            const list = el('div', 'p-options');
            q.options.forEach((opt, i) => {
                const b = el('button', 'p-option');
                b.type = 'button';
                b.appendChild(el('span', 'p-key', String(i + 1)));
                b.appendChild(el('span', '', opt));
                b.addEventListener('click', () => {
                    if (run.checked) return;
                    run.selected = i;
                    list.querySelectorAll('.p-option').forEach((o, j) =>
                        o.classList.toggle('selected', j === i));
                    playerAction.disabled = false;
                });
                list.appendChild(b);
            });
            wrap.appendChild(list);
        } else {
            const input = el('input', 'p-input');
            input.type = 'text';
            input.id = 'playerInput';
            input.placeholder = q.placeholder || 'Type your answer…';
            input.autocomplete = 'off';
            input.autocapitalize = 'off';
            input.spellcheck = false;
            input.addEventListener('input', () => {
                playerAction.disabled = input.value.trim() === '';
            });
            wrap.appendChild(input);
            setTimeout(() => input.focus(), 50);
        }
        playerBody.appendChild(wrap);

        playerFill.style.width = Math.round((run.correct / run.total) * 100) + '%';
        playerAction.textContent = 'CHECK';
        playerAction.disabled = true;
        return;
    }

    if (run.phase === 'done') {
        const acc = Math.round((run.correct / (run.correct + run.mistakes)) * 100);
        const wrap = el('div', 'p-card');
        const doneIcon = el('div', 'p-icon');
        doneIcon.appendChild(iconEl(run.mistakes === 0 ? 'trophy' : 'party-popper'));
        wrap.appendChild(doneIcon);
        wrap.appendChild(el('h2', 'p-title', 'Lesson complete!'));
        wrap.appendChild(el('p', 'p-text',
            run.mistakes === 0 ? 'Perfect run, no mistakes!' : 'Nice work. Mistakes are how coders learn.'));
        const stats = el('div', 'p-stats');
        [['+' + run.reward, 'XP EARNED'], [acc + '%', 'ACCURACY'], [state.hearts, 'HEARTS LEFT']]
            .forEach(([v, l]) => {
                const s = el('div', 'p-stat');
                s.appendChild(el('b', '', String(v)));
                s.appendChild(el('span', '', l));
                stats.appendChild(s);
            });
        wrap.appendChild(stats);
        playerBody.appendChild(wrap);
        playerFill.style.width = '100%';
        playerAction.textContent = 'CONTINUE';
        return;
    }

    if (run.phase === 'out') {
        const wrap = el('div', 'p-card');
        const outIcon = el('div', 'p-icon out');
        outIcon.appendChild(iconEl('heart-crack'));
        wrap.appendChild(outIcon);
        wrap.appendChild(el('h2', 'p-title', 'Out of hearts!'));
        wrap.appendChild(el('p', 'p-text',
            'No worries. Hearts come back, or you can refill them with gems from the map. Then try this lesson again!'));
        playerBody.appendChild(wrap);
        playerAction.textContent = 'BACK TO MAP';
    }
}

/* Forgiving answer matching for "type it" questions */
function normalize(str, isCode) {
    let s = str.trim().replace(/\s+/g, ' ');
    if (isCode) {
        s = s.replace(/'/g, '"').replace(/\s*\(\s*/g, '(').replace(/\s*\)\s*/g, ')');
    }
    return s;
}

function checkAnswer() {
    const q = run.queue[0];
    let ok, shown;

    if (q.type === 'choice') {
        ok = run.selected === q.answer;
        shown = q.options[q.answer];
        const opts = playerBody.querySelectorAll('.p-option');
        opts.forEach(o => o.classList.add('locked'));
        opts[run.selected].classList.remove('selected');
        opts[run.selected].classList.add(ok ? 'right' : 'wrong');
        if (!ok) opts[q.answer].classList.add('right');
    } else {
        const input = document.getElementById('playerInput');
        const given = normalize(input.value, q.isCode);
        ok = q.answers.some(a => normalize(a, q.isCode) === given);
        shown = q.answers[0];
        input.disabled = true;
        input.classList.add(ok ? 'right' : 'wrong');
    }

    run.checked = true;

    if (ok) {
        run.correct++;
        setFooter('correct', 'Nice!', q.explain);
    } else {
        run.mistakes++;
        state.hearts = Math.max(0, state.hearts - 1);
        saveState();
        renderStats();
        renderHearts();
        run.queue.push(q);   // asked again at the end
        setFooter('incorrect', 'Not quite. Answer: ' + shown, q.explain);
    }
    playerFill.style.width = Math.round((run.correct / run.total) * 100) + '%';
    playerAction.textContent = 'CONTINUE';
    playerAction.disabled = false;
}

function finishLesson() {
    const list = state.completed[state.course] || (state.completed[state.course] = []);
    const first = !list.includes(run.id);
    if (first) list.push(run.id);
    run.reward = first ? XP_LESSON + (run.mistakes === 0 ? XP_PERFECT_BONUS : 0) : XP_REPLAY;
    state.xp += run.reward;
    touchStreak();
    saveState();
    renderStats();
    run.phase = 'done';
    renderPlayer();
}

playerAction.addEventListener('click', () => {
    if (!run) return;

    if (run.phase === 'intro') {
        if (run.introIdx < run.lesson.intro.length - 1) run.introIdx++;
        else run.phase = 'question';
        renderPlayer();
    } else if (run.phase === 'question') {
        if (!run.checked) { checkAnswer(); return; }
        run.queue.shift();
        run.checked = false;
        run.selected = null;
        if (state.hearts <= 0 && run.mistakes > 0 && run.correct < run.total) {
            run.phase = 'out';
            renderPlayer();
        } else if (run.queue.length === 0) {
            finishLesson();
        } else {
            renderPlayer();
        }
    } else {
        closePlayer();   // done / out
    }
});

document.getElementById('playerQuit').addEventListener('click', () => {
    if (!run) return;
    if (run.phase === 'done' || run.phase === 'out' ||
        confirm('Quit this lesson? Your progress in it will be lost.')) closePlayer();
});

/* Keyboard: Enter = Check/Continue, 1-4 pick an answer */
document.addEventListener('keydown', e => {
    if (!run || player.classList.contains('hidden')) return;
    if (e.key === 'Enter' && !playerAction.disabled) {
        e.preventDefault();
        playerAction.click();
    } else if (run.phase === 'question' && !run.checked && /^[1-9]$/.test(e.key)
               && run.queue[0].type === 'choice' && e.target.tagName !== 'INPUT') {
        const opts = playerBody.querySelectorAll('.p-option');
        if (opts[+e.key - 1]) opts[+e.key - 1].click();
    }
});

/* ---------- Cart badge (kept from main site) ---------- */
const cartCountElement = document.getElementById('cartCount');
function updateCartCount(newCount) { cartCountElement.textContent = newCount; }
function addToCart() { updateCartCount(parseInt(cartCountElement.textContent || '0', 10) + 1); }

/* ---------- Init ---------- */
hydrateIcons();
renderStats();
renderCourseSelector();
renderPath();
