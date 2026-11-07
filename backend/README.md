# PLS Tech: Solutions module

Searchable library of business solutions/automations. Services = what PLS Tech sells; Solutions = tools users search for and use.

## Status
**Written but not executed.** No Python packages or network were available when this was built, so the backend tests (`backend/tests/test_solutions.py`) and the React code have never been run. Run them before merging.

## Layout
```
backend/app/solutions/  enums, db (adapter), models, schemas, service, router, deps (auth stubs), ratelimit, seed
backend/tests/test_solutions.py
frontend/src/features/solutions/  api.js, 3 pages, components/, solutions.css
```

## Integrate
1. `pip install -r backend/requirements-solutions.txt`
2. Backend: `app.include_router(solutions_router, prefix="/api")`
3. Replace `db.py` with your project's `Base`/`get_db`, then create the tables via an Alembic migration for `solutions` and `solution_requests`.
4. `python -m app.solutions.seed` loads the 7 starter solutions (idempotent).
5. Frontend (React Router v6):
   ```jsx
   <Route path="/solutions" element={<SolutionsLibraryPage/>} />
   <Route path="/solutions/request" element={<RequestSolutionPage/>} />
   <Route path="/solutions/:slug" element={<SolutionDetailPage/>} />
   ```
   Set `VITE_API_URL` if the API isn't under `/api`. Routes `/pricing` and `/login` are linked and assumed to exist.
6. Wire `deps.py` to real auth and subscription checks.

## What works (by design, once run)
- Search by name/description/problem/tags (all words must match; LIKE wildcards escaped), category + plan filters, pagination.
- Draft or inactive solutions are never returned by public endpoints.
- Detail page: problem, audience, plan, inputs, output, CTAs by status.
- Request flow: validated server-side, honeypot, per-IP rate limit, stored in `solution_requests`.
- `POST /solutions/{slug}/try` enforces auth, availability and Pro plan **server-side**.

## NOT done (TODO)
- **Running a solution.** `/try` returns 501 after its checks. Needs the AI orchestration layer (input validation against `input_fields`, usage limits, moderation, prompt-injection guards, usage logging).
- **Auth/billing wiring.** `deps.py` denies everything by default (401; nobody is Pro) until connected.
- **Rate limiter is in-memory**, per process. Replace with Redis. Proxy IP handling is not configured.
- Admin CRUD for solutions and a triage UI for requests (needs RBAC). Seed is the only way to add solutions for now.
- Audit log entry and staff notification on new requests; FK from `solution_requests.user_id` to users.
- File-upload inputs (CV upload) are deliberately unsupported until validation/size limits/scanning exist; the CV assistant takes pasted text.
- Search uses ILIKE; move to Postgres full-text/pg_trgm if the catalog grows.
- No frontend tests.

## Notes
- Added `problem_solved`, `target_audience`, `output_description` columns beyond your field list; the detail page needs them. Plus a `solution_requests` table.
- Seed statuses: 3 Free + 1 Pro "available", 2 Pro "preview", 1 Pro "coming soon". "Available" means *intended to be tryable*; nothing executes yet.
- `contact_email` on requests is personal data; mention it in the Privacy Policy placeholder.
- Don't touch yet: existing auth, billing/Paystack and pricing code. This module only reads from them through `deps.py`.
