-- CodeVent Labs — accounts database schema (Cloudflare D1 / SQLite).
-- The Worker also creates these tables on first use, so running this
-- by hand is only needed when migrating to a fresh database.

CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,   -- stored lowercase
    password_hash TEXT NOT NULL,          -- PBKDF2-SHA256, hex
    salt          TEXT NOT NULL,          -- random 16 bytes, hex
    created_at    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,          -- SHA-256 of the bearer token
    user_id    TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_user ON sessions (user_id);

CREATE TABLE IF NOT EXISTS progress (
    user_id    TEXT PRIMARY KEY,
    data       TEXT NOT NULL,             -- JSON progress document
    updated_at INTEGER NOT NULL
);
