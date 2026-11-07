# PLS Workspace foundation (Phase 2)

Route map: `/app` (home), `/app/solutions`, `/app/solutions/:slug`, `/app/tools/:slug`, `/app/category/:category`.
Public site routes are unchanged. Added: "Workspace" in the header nav and an "Open Workspace" button on the home page.

All workspace code is in `web/src/workspace/`. No backend or database changes.
- `catalog.js`: merges API solutions + products from `site/siteContent.js`; statuses live here. `EXECUTION_CONNECTED` stays `false` until `/try` really runs tools.
- `tools/registry.js`: register a tool component per slug to ship tools one at a time.
- `recommend.js`: rule-based onboarding maps (preferences stay in this browser only).

Run: backend `cd backend && DATABASE_URL=sqlite:///./dev.db python -m uvicorn app.main:app --reload`; frontend `cd web && npm ci && npm run dev`.

## Added after Phase 2
- Waitlist: optional `role` and `interest`. Run `backend/migrations/001_waitlist_role_interest.sql` on Neon BEFORE deploying the backend.
- Invoice Generator: runs fully in the browser (`workspace/tools/invoice-generator/`), shown as Beta + Free. Optional: run `backend/migrations/002_invoice_generator_free.sql` so the database matches.
- PWA: `public/manifest.webmanifest`, `public/sw.js`, `public/offline.html`, icons in `public/icons/`. The service worker never caches `/api` and is registered only in production builds. Icons are upscaled from the 100px logo: replace with a larger logo when you have one.

## Accounts, plans and usage: how to add them later (not built, on purpose)
1. Auth: keep it in FastAPI. Hash passwords or verify Google ID tokens on the server, issue an HttpOnly, Secure, SameSite cookie session. Implement it inside `backend/app/solutions/deps.py` (`require_user`, `get_current_user_optional`) so every route already wired to those starts working.
2. Tables to add only when you build them: `users`, `subscriptions` (status comes from the payment provider's webhook, never from the browser), `usage_records`, `saved_work` (always filtered by the signed-in user id).
3. Enforce plan and usage limits in the route that runs a tool (see `/solutions/{slug}/try`). The frontend badges are display only.
4. Replace the in-memory rate limiter with Redis before running more than one server process.

## Deploy fixes and light mode
- `web/vercel.json`: SPA rewrite so refreshing or opening /waitlist, /app/... directly no longer returns Vercel's 404.
- Backend startup now adds missing nullable columns itself (`app/additive_migrate.py`), so a new column can no longer cause a 500 on Neon. Never drops or rewrites data.
- `CORS_ORIGINS` on Render: comma-separated, e.g. `https://pls-solutions-pi.vercel.app`. Spaces and trailing slashes are ignored. Redeploy after changing it.
- Light mode: toggle in the site header and workspace top bar; dark stays the default; the choice is saved in the browser.

## Workspace Intelligence (architecture only: no AI model is connected)
- `workspace/intelligence/`: `buildContext.js` (what an assistant would know: module, page, route, action, selection, permissions, available actions, docs, recent activity), `contextStore.js` + `useWorkspaceContext.js` (modules publish context with `usePublishContext`), `providers.js` (provider-agnostic interface; the browser never holds model keys), `AIHelpPanel.jsx` (built-in guidance, reserved slot for a future chat).
- Privacy rule: context carries labels, ids, counts and flags only. `toAssistantRequest` allow-lists the fields that may leave the browser.
- To add help for a module: one entry in `modules/helpContent.js`. To add module metadata: one entry in `modules/descriptors.js` (code-level facts; plan, status, tags stay in the database).
- TODO(workspace-intelligence): backend `POST /api/assist` (auth, rate limit, redaction, per-plan limits, provider chosen by server config), then register a thin provider in `providers.js`.

## Integrations (architecture only)
`workspace/integrations/connectors.js` defines connector shapes and the 9 planned connectors; `/app/integrations` lists them as Planned with no connect buttons. Credentials will live encrypted on the server only.

## Security preparation
- Backend: `app/security/permissions.py` (roles, permissions, deny-by-default `require_permission`), `app/audit.py` (audit event interface, log-only today). Tests prove a client cannot grant itself a role.
- Frontend: `workspace/access/` (display-only permissions, `RequirePermission` guard). Never an authority.

## The waitlist 500 / "CORS" error: root cause
The browser's CORS message was a symptom. The backend crashed (new `role`/`interest` columns missing from the existing Neon table, so the INSERT failed), and a crash returns a 500 with no CORS headers, which browsers report as a CORS block. Fixes: startup adds missing nullable columns; a catch-all handler now returns a friendly JSON 500 that still carries CORS headers and logs the real exception; CORS stays an explicit allow-list (never `*`), with local dev ports allowed by default and `CORS_ORIGINS` / optional `CORS_ORIGIN_REGEX` for production.

## Scam X-Ray (business and investment check)
- Backend: `backend/app/checks/` (`domain.py` parses and validates the pasted link, `rdap.py` reads the domain registration date from RDAP, `assess.py` holds every rule, `router.py` is `POST /api/checks/business`). Public, rate limited (20 per hour per IP), stateless: nothing a visitor sends is stored or logged.
- Frontend: `web/src/workspace/tools/scam-xray/`, registered in `tools/registry.js`, shown as Beta + Free (`remote: true` in `catalog.js` LOCAL_TOOLS: it calls our server but needs no account).
- Database: the catalogue row is added by `seed.py` on the next backend start (insert-missing). No migration needed.
- What is automatic: website age (RDAP), link red flags, warning phrases in pasted offer text. What is NOT automatic: CAC and SEC. There is no public API we know of, so the person opens the official search and records the result. TODO: a paid company-verification API (KYB) could fill CAC details automatically.
- Deliberate: NO percentage and no "scam" verdict. There is no data to calibrate one and calling a real business a scam is a serious claim. Output is a risk level (high / caution / clear / incomplete) plus the exact warning signs with evidence.
- Before going live: confirm the host start command passes `--proxy-headers --forwarded-allow-ips="*"` (otherwise every visitor shares one rate-limit bucket), and confirm the official CAC and SEC links in `ScamXray.jsx` (`OFFICIAL`).
- Tests: `backend/tests/test_checks_logic.py` (pure logic), `backend/tests/test_checks_api.py` (endpoint).
