-- Optional. Run after deploying the browser-based Invoice Generator so the database matches the Workspace.
-- It runs fully in the browser, so it cannot be gated server-side and is offered as Free.
UPDATE solutions SET plan = 'free' WHERE slug = 'invoice-generator';
