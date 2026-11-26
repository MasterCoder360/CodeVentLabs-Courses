-- CodeVent Labs — accounts database schema (Cloudflare D1 / SQLite).
-- The Worker also creates these tables on first use, so running this
-- by hand is only needed when migrating to a fresh database.

CREATE TABLE IF NOT EXISTS users (
    id             TEXT PRIMARY KEY,
    name           TEXT NOT NULL,
    email          TEXT NOT NULL UNIQUE,  -- stored lowercase
    password_hash  TEXT NOT NULL,         -- PBKDF2-SHA256, hex
    salt           TEXT NOT NULL,         -- random 16 bytes, hex
    created_at     INTEGER NOT NULL,
    email_verified INTEGER NOT NULL DEFAULT 0
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

-- Emailed one-time links: email verification and password resets.
CREATE TABLE IF NOT EXISTS email_tokens (
    token_hash TEXT PRIMARY KEY,          -- SHA-256 of the emailed token
    user_id    TEXT NOT NULL,
    kind       TEXT NOT NULL,             -- 'verify' | 'reset'
    email      TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    used_at    INTEGER                    -- set when the link is used
);

CREATE INDEX IF NOT EXISTS email_tokens_user ON email_tokens (user_id, kind);

-- Social sign-in: which GitHub / Google account belongs to which user.
CREATE TABLE IF NOT EXISTS identities (
    provider    TEXT NOT NULL,            -- 'github' | 'google'
    provider_id TEXT NOT NULL,
    user_id     TEXT NOT NULL,
    created_at  INTEGER NOT NULL,
    PRIMARY KEY (provider, provider_id)
);

CREATE INDEX IF NOT EXISTS identities_user ON identities (user_id);

-- Short-lived CSRF state for an OAuth round trip.
CREATE TABLE IF NOT EXISTS oauth_states (
    state_hash TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    redirect   TEXT NOT NULL              -- where to send the browser back
);
