# CosmosPark Courses — courses.labs.cosmospark.org

Duolingo-style course map for CodeVent Labs (CosmosPark). Static site, deployable to GitHub Pages as its own repository.

## Files
- `index.html` — courses page (nav, stats bar, unit/path map, modals)
- `script.js` — game logic: XP, gems, hearts, streaks, unlock progression (kept in localStorage under `cvl_courses_v1` and synced to the signed-in account)
- `lessons.js` — lesson content (cards + questions) for the lesson player
- `icons.js` — inline Lucide icon set plus the Python brand mark
- `cloud.js` — client for the accounts API (session token, sign up / sign in, progress sync)
- `account.html`, `account.js`, `account.css` — accounts page
- `style.css` — CodeVent Labs design language + Duolingo palette
- `cloud/` — the accounts & progress API (Cloudflare Worker + D1): `worker.js`, `deploy.json`, `schema.sql`
- `CNAME` — points to `courses.labs.cosmospark.org`

## Accounts & cloud progress
The site stays static; only accounts and progress live in the cloud.

- API: `https://codevent-labs-accounts-u0ia1p-preview.freebuff.site` — Worker in `cloud/worker.js`, D1 database bound as `DB`
- Routes: `POST /api/signup`, `POST /api/login`, `POST /api/logout`, `GET /api/me`, `PUT /api/progress`
- Passwords are stored as salted PBKDF2-SHA256 hashes (the platform caps this at 100,000 iterations); the browser only holds an opaque 60-day session token, and the database stores its SHA-256
- CORS allows exactly `https://courses.labs.cosmospark.org` plus localhost ports for development
- Progress documents are clamped and whitelisted server-side, so only known course/lesson ids and sane counters are stored
- Signing in merges guest progress from the device (union of finished lessons, best of the counters) and pushes the result
- Local development: `wrangler dev` with a D1 binding named `DB`
- Moving to another server only means changing `CLOUD_API` in `cloud.js`

## Deploy (GitHub Pages)
1. Settings → Pages → Source: `Deploy from a branch` → `main` / `(root)`.
2. Custom domain is set via `CNAME`; DNS record `CNAME courses.labs -> <username>.github.io`.
3. Enforce HTTPS once the certificate is issued.

## Roadmap
- Section 2: Units 2–3 lessons (Control Flow, Functions)
- Section 3: the other courses behind the course flags
