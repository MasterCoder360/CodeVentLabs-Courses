/* Shared HTTP plumbing for the accounts API: CORS, JSON replies and
   safe request-body reading.

   The site is served from courses.labs.cosmospark.org (GitHub Pages),
   so this API answers cross-origin for that one origin, plus local
   hosts while developing. Requests are authenticated with a Bearer
   token instead of cookies, so no third-party cookie rules apply. */

export const MAX_BODY_BYTES = 16 * 1024;

const ALLOWED_ORIGINS = new Set([
    'https://courses.labs.cosmospark.org',
]);

function originAllowed(origin) {
    if (!origin) return false;
    if (ALLOWED_ORIGINS.has(origin)) return true;
    // Local development (any port) so the page can be tested locally.
    return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin);
}

export function corsHeaders(request) {
    const origin = request.headers.get('Origin') || '';
    const headers = { 'Vary': 'Origin' };
    if (originAllowed(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, OPTIONS';
        headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type';
        headers['Access-Control-Max-Age'] = '86400';
    }
    return headers;
}

export function reply(request, data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: Object.assign({
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
        }, corsHeaders(request)),
    });
}

export function fail(request, status, message, field) {
    return reply(request, field ? { error: message, field } : { error: message }, status);
}

export async function readJson(request) {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return { tooLarge: true };
    if (!text) return { value: {} };
    try {
        const value = JSON.parse(text);
        if (!value || typeof value !== 'object') return { value: {} };
        return { value };
    } catch {
        return { invalid: true };
    }
}
