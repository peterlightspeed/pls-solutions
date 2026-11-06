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
