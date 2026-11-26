/* Database schema for the accounts API. Tables are created on first
   use so a fresh D1 database needs no manual migration; cloud/schema.sql
   has the same statements for anyone provisioning by hand. */

let schemaPromise = null;

/* Older databases already have users, so new columns are added with
   ALTER TABLE and a duplicate-column error means "already there". */
async function addColumn(env, sql) {
    try {
        await env.DB.prepare(sql).run();
    } catch (err) {
        const message = String(err && err.message || '').toLowerCase();
        if (!message.includes('duplicate column')) throw err;
    }
}

export function ensureSchema(env) {
    if (!schemaPromise) {
        schemaPromise = (async () => {
            await env.DB.batch([
                env.DB.prepare(`CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    password_hash TEXT NOT NULL,
                    salt TEXT NOT NULL,
                    created_at INTEGER NOT NULL
                )`),
                env.DB.prepare(`CREATE TABLE IF NOT EXISTS sessions (
                    token_hash TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    created_at INTEGER NOT NULL,
                    expires_at INTEGER NOT NULL
                )`),
                env.DB.prepare(`CREATE INDEX IF NOT EXISTS sessions_user ON sessions (user_id)`),
                env.DB.prepare(`CREATE TABLE IF NOT EXISTS progress (
                    user_id TEXT PRIMARY KEY,
                    data TEXT NOT NULL,
                    updated_at INTEGER NOT NULL
                )`),
                env.DB.prepare(`CREATE TABLE IF NOT EXISTS email_tokens (
                    token_hash TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    kind TEXT NOT NULL,
                    email TEXT NOT NULL,
                    created_at INTEGER NOT NULL,
                    expires_at INTEGER NOT NULL,
                    used_at INTEGER
                )`),
                env.DB.prepare(`CREATE INDEX IF NOT EXISTS email_tokens_user ON email_tokens (user_id, kind)`),
                env.DB.prepare(`CREATE TABLE IF NOT EXISTS identities (
                    provider TEXT NOT NULL,
                    provider_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    created_at INTEGER NOT NULL,
                    PRIMARY KEY (provider, provider_id)
                )`),
                env.DB.prepare(`CREATE INDEX IF NOT EXISTS identities_user ON identities (user_id)`),
                env.DB.prepare(`CREATE TABLE IF NOT EXISTS oauth_states (
                    state_hash TEXT PRIMARY KEY,
                    created_at INTEGER NOT NULL,
                    expires_at INTEGER NOT NULL,
                    redirect TEXT NOT NULL
                )`),
            ]);

            await addColumn(env, 'ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0');
        })().catch(err => {
            schemaPromise = null;          // let the next request retry
            throw err;
        });
    }
    return schemaPromise;
}
