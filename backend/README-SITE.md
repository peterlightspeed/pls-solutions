# PLS Tech site shell (step 2)

Adds the company website around the Solutions module: header with logo, Home, Services, Products,
Pricing, About, FAQ, Contact and legal placeholders, plus a real `POST /api/contact` backend.

## Apply (from ~/pls-solutions/pls-solutions)
1. Backend: copy `backend/app/contact/`, `backend/app/main.py` (replaces yours) and `backend/tests/test_contact.py`
   into your `backend/`, then run `pytest -v`. Delete `backend/dev.db` once so the new `contacts` table is created
   (or it will be added by create_all automatically if you keep the file; either works).
2. Frontend: copy `web/index.html`, `web/vite.config.js`, `web/public/logo.jpeg`, `web/src/main.jsx`,
   `web/src/site/` and `web/src/features/` into your `web/` (features/ replaces the old copy: `request` is now exported).
3. `npm run dev` and `python -m uvicorn app.main:app --reload`.

## Edit your content in ONE place
`web/src/site/siteContent.js`: company text, founder bio, services, products, plans, FAQ.

## TODO / honest gaps
- Logo is only ~100px wide, so it's fine in the header but will blur if enlarged. Send a larger PNG (transparent background).
- No sign-up, login, dashboard or payments yet. All "Get early access" buttons go to the contact form on purpose.
- No testimonials, client logos or statistics: none exist yet and none were invented.
- Pricing shows "coming soon": no prices were provided.
- Products: PLS Jarvis is marked Live (your deployed app); the other two are marked "In development". Confirm in siteContent.js.
- Business email and founder photo are empty placeholders in siteContent.js.
- Legal pages are draft placeholders; a lawyer must write them before launch.
- Not run here (no packages/network): backend compiles, frontend untested. Report any console error.
