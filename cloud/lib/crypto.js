/* Low-level crypto helpers shared by the accounts API.

   Passwords are never stored. Each account keeps a random salt and a
   PBKDF2-SHA256 hash of the password; the browser only ever holds an
   opaque session token whose SHA-256 is what the sessions table stores.

   100000 is the highest PBKDF2 iteration count Cloudflare Workers
   allow; asking for more fails at runtime. */

export const PBKDF2_ITERATIONS = 100000;

const encoder = new TextEncoder();

export function bytesToHex(bytes) {
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

export function bytesToBase64Url(bytes) {
    let binary = '';
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function randomBytes(length) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
}

/* Random hex string, used for salts. */
export function randomHex(length) {
    return bytesToHex(randomBytes(length));
}

/* Random URL-safe token, used for sessions and emailed links. */
export function randomToken(length) {
    return bytesToBase64Url(randomBytes(length));
}

export async function sha256Hex(text) {
    const digest = await crypto.subtle.digest('SHA-256', encoder.encode(text));
    return bytesToHex(new Uint8Array(digest));
}

export async function hashPassword(password, saltHex) {
    const salt = new Uint8Array(saltHex.match(/../g).map(h => parseInt(h, 16)));
    const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
        key, 256);
    return bytesToHex(new Uint8Array(bits));
}

/* Length-independent comparison so a wrong password always takes the
   same time to reject. */
export function safeEqual(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}
