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
- `cloud/` — the accounts & progress API (Cloudflare Worker + D1): `worker.js`, `deploy.json`, `schema.sql`, `test-api.mjs`, and `lib/` (`http`, `db`, `crypto`, `session`, `validate`, `mail`, `auth`, `tokens`, `oauth`, `admin`, `progress`)
- `CNAME` — points to `courses.labs.cosmospark.org`

## Accounts & cloud progress
The site stays static; only accounts and progress live in the cloud.

- API: `https://codevent-labs-accounts-u0ia1p-preview.freebuff.site` — Worker in `cloud/worker.js`, D1 database bound as `DB`
- Routes: `POST /api/signup`, `POST /api/login`, `POST /api/logout`, `GET /api/me`, `PUT /api/progress`
- Email routes: `POST /api/verify`, `POST /api/verify/resend`, `POST /api/password/forgot`, `POST /api/password/reset`
- Social routes: `GET /api/oauth/{github|google}/start` and `/callback`
- `GET /api/config` reports which extras (mail, providers) this deployment has configured; the page uses it to hide buttons that would not work
- Passwords are stored as salted PBKDF2-SHA256 hashes (the platform caps this at 100,000 iterations); the browser only holds an opaque 60-day session token, and the database stores its SHA-256
- CORS allows exactly `https://courses.labs.cosmospark.org` plus localhost ports for development
- Progress documents are clamped and whitelisted server-side, so only known course/lesson ids and sane counters are stored
- Signing in merges guest progress from the device (union of finished lessons, best of the counters) and pushes the result
- Local development: `wrangler dev` with a D1 binding named `DB`
- Moving to another server only means changing `CLOUD_API` in `cloud.js`

### Email verification and password resets
Both use one-time links: a random token is emailed, only its SHA-256 is stored, it is single-use and expires (24 h to confirm an address, 2 h to reset a password). The link opens `account.html#verify=…` or `account.html#reset=…` and the page posts the token back to the API. A reset also confirms the address, invalidates every other session and signs this device in.

Mail is sent through Resend with a plain `fetch` (see `cloud/lib/mail.js`). Set these on the site (Sites → Secrets):

| Name | Value |
| --- | --- |
| `RESEND_API_KEY` | your Resend API key |
| `MAIL_FROM` | e.g. `CodeVent Labs <accounts@labs.cosmospark.org>` — the domain must be verified in Resend |

Until both are set, `GET /api/config` reports `mail: false`, nothing is sent, and the page says so instead of pretending a link is on its way.

### Social sign-in
GitHub and Google use the authorization-code flow, handled entirely by the Worker so no client secret reaches the browser. After sign-in the browser lands on `account.html#session=…`, which stores the token and clears the fragment. An account is matched by provider id first, then by verified email; a new one is created only when neither matches.

| Name | Value |
| --- | --- |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | a GitHub OAuth app |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | a Google OAuth client |

Register the callbacks `https://<api-host>/api/oauth/github/callback` and `https://<api-host>/api/oauth/google/callback`. A provider stays hidden on the page until its two secrets exist.

### Admin upkeep
The API can list and prune accounts when an `ADMIN_TOKEN` secret is set; every request sends it as `X-Admin-Token`, and without the secret the routes answer 404.

```sh
curl -H "X-Admin-Token: $ADMIN_TOKEN" https://<api-host>/api/admin/users
curl -X POST -H "X-Admin-Token: $ADMIN_TOKEN" -H 'Content-Type: application/json' \
     -d '{"keep":["someone@example.com"]}' https://<api-host>/api/admin/prune
```

Local development: `cloud/test-api.mjs` runs a full pass (sign-up, verification, reset, progress, prune) against a local `wrangler dev`. Set `MAIL_DEV_ECHO=1` to get emailed links back in the JSON, and `MAIL_ENDPOINT` to point at a throwaway HTTP server instead of Resend.

## Deploy (GitHub Pages)
1. Settings → Pages → Source: `Deploy from a branch` → `main` / `(root)`.
2. Custom domain is set via `CNAME`; DNS record `CNAME courses.labs -> <username>.github.io`.
3. Enforce HTTPS once the certificate is issued.

## Roadmap
- Section 2: Units 2–3 lessons (Control Flow, Functions)
- Section 3: the other courses behind the course flags
