-- Run ONCE on the Neon database BEFORE deploying the new backend.
-- create_all() at startup never alters existing tables, so without this the waitlist POST would fail.
-- Additive and non-destructive: existing rows are untouched.
ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS role VARCHAR(24);
ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS interest VARCHAR(40);
