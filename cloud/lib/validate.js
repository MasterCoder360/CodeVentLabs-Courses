/* Input cleaning shared by sign-up, sign-in and password resets. */

export function cleanName(raw) {
    const name = String(raw == null ? '' : raw).trim().replace(/\s+/g, ' ');
    if (name.length < 2) return { error: 'Please use at least 2 characters for your name.', field: 'name' };
    if (name.length > 40) return { error: 'Names can be at most 40 characters.', field: 'name' };
    if (/[\u0000-\u001f\u007f]/.test(name)) return { error: 'That name contains characters we can’t use.', field: 'name' };
    return { value: name };
}

export function cleanEmail(raw) {
    const email = String(raw == null ? '' : raw).trim().toLowerCase();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        return { error: 'That email address doesn’t look right.', field: 'email' };
    }
    return { value: email };
}

export function cleanPassword(raw) {
    const password = String(raw == null ? '' : raw);
    if (password.length < 8) return { error: 'Passwords need at least 8 characters.', field: 'password' };
    if (password.length > 200) return { error: 'Passwords can be at most 200 characters.', field: 'password' };
    return { value: password };
}
