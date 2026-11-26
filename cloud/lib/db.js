/* Database schema for the accounts API. Tables are created on first
   use so a fresh D1 database needs no manual migration; cloud/schema.sql
   has the same statements for anyone provisioning by hand. */

let schemaPromise = null;

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
            ]);
        })().catch(err => {
            schemaPromise = null;          // let the next request retry
            throw err;
        });
    }
    return schemaPromise;
}
