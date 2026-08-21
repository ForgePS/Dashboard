# AGENTS.md

## Cursor Cloud specific instructions

### Repository
- GitHub: https://github.com/ForgePS/Dashboard
- Organization: ForgePS (Forge Public Safety)
- Primary contact for org/GitHub access: Admin@forgepublicsafety.com

### What this is
Single Node.js/Express app for Horn Lake Fire Department dashboards (Active911 alerts, MVIX displays, analytics, hydrants). It is deployed as a Firebase Function (`index.js` exports `api`) plus Firebase Hosting, but for local development it runs directly as a standalone Express server via `server.js`.

### Running locally
- Start the dev server with `npm start` (`node server.js`). It listens on `PORT` (default `10000`), e.g. `http://localhost:10000`.
- There is no build step and no watch/hot-reload; restart the process after editing `server.js`.
- Do NOT run via `firebase emulators`/`firebase deploy` for routine local dev — the plain `node server.js` path is the dev entry point.

### Expected local behavior without secrets (not failures)
- Firestore is unavailable locally (no GCP project/credentials), so the server logs `Firestore persistence is unavailable: ...` and `Unable to detect a Project Id`. This is handled gracefully — the server still starts.
- Active911 polling logs `No Active911 access token or refresh token configured`. Expected without `ACTIVE911_*` secrets.
- Endpoints backed by Firestore (e.g. `GET /api/hydrants`) return `{"ok":false,...}` locally. Endpoints backed by local CSV files work fully.

### Good endpoints to verify the server works (no secrets needed)
- `GET /api/health` — service status JSON.
- `GET /api/analytics-dashboard` — parses bundled CSVs (`historical-incidents-start.csv`, etc.) and returns real aggregated analytics.
- `GET /analytics` — full analytics dashboard UI rendering the above data.

### Lint / test / build
- No linter, test framework, or build is configured. The only check is `npm run check` (`node --check server.js`, a syntax check).
