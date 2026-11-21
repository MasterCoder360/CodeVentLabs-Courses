# CosmosPark Courses — courses.labs.cosmospark.org

Duolingo-style course map for CodeVent Labs (CosmosPark). Static site, deployable to GitHub Pages as its own repository.

## Files
- `index.html` — courses page (nav, stats bar, unit/path map, modals)
- `script.js` — game logic: XP, gems, hearts, streaks, unlock progression (persisted in localStorage under `cvl_courses_v1`; shaped for future Neon per-account sync)
- `style.css` — CodeVent Labs design language + Duolingo palette
- `CNAME` — points to `courses.labs.cosmospark.org` (enable "Custom domain" in repo Settings → Pages)

## Deploy (GitHub Pages)
1. Create a new public/private repo (e.g. `cosmospark-courses`) and push this folder's contents to `main`.
2. Settings → Pages → Source: `Deploy from a branch` → `main` / `(root)`.
3. Settings → Pages → Custom domain: already set via `CNAME`. Add DNS record at your provider:
   - `CNAME  courses.labs  ->  <username>.github.io`
4. Enforce HTTPS once the certificate is issued.

## Roadmap
- Section 2: lesson quiz screen
- Section 3: `account.html` with Neon-backed auth (server-side proxy; never expose connection strings client-side)
