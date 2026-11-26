/* Progress documents.

   The client sends the same object it keeps in localStorage, minus the
   user. Everything is clamped and whitelisted here so a crafted request
   cannot store junk. */

export const COURSE_IDS = ['python', 'webdev', 'robotics', 'scratch', 'ai'];

function clampInt(value, min, max, fallback) {
    const n = Math.floor(Number(value));
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
}

export function sanitizeState(raw) {
    const source = (raw && typeof raw === 'object') ? raw : {};
    const state = {
        course: COURSE_IDS.includes(source.course) ? source.course : 'python',
        xp: clampInt(source.xp, 0, 1000000, 0),
        gems: clampInt(source.gems, 0, 1000000, 500),
        hearts: clampInt(source.hearts, 0, 5, 5),
        streak: clampInt(source.streak, 0, 10000, 0),
        lastActive: typeof source.lastActive === 'string' && source.lastActive.length <= 40
            ? source.lastActive : null,
        completed: {},
    };

    const completed = (source.completed && typeof source.completed === 'object') ? source.completed : {};
    let courses = 0;
    for (const courseId of Object.keys(completed)) {
        if (!COURSE_IDS.includes(courseId)) continue;
        if (++courses > 20) break;
        const ids = Array.isArray(completed[courseId]) ? completed[courseId] : [];
        const unique = [];
        for (const id of ids) {
            if (typeof id !== 'string' || !/^[a-z0-9][a-z0-9-]{0,39}$/.test(id)) continue;
            if (!unique.includes(id)) unique.push(id);
            if (unique.length >= 500) break;
        }
        if (unique.length) state.completed[courseId] = unique;
    }
    return state;
}

export async function loadProgress(env, userId) {
    const row = await env.DB.prepare('SELECT data FROM progress WHERE user_id = ?')
        .bind(userId).first();
    if (!row) return sanitizeState(null);
    let parsed = null;
    try { parsed = JSON.parse(row.data); } catch { parsed = null; }
    return sanitizeState(parsed);
}

export async function saveProgress(env, userId, state) {
    const now = Date.now();
    await env.DB.prepare(
        `INSERT INTO progress (user_id, data, updated_at) VALUES (?, ?, ?)
         ON CONFLICT (user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`
    ).bind(userId, JSON.stringify(state), now).run();
    return now;
}
