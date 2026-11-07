// Tiny external store so ANY module can contribute context without prop drilling.
// A tool calls usePublishContext({ action, selection, availableActions }); the help panel reads the merged result.
// PRIVACY RULE: publish labels, ids, counts and flags only. Never form values, document text, files or secrets.
const published = new Map();   // key -> partial context
const activity = new Map();    // module slug -> recent event names (in memory only, newest last)
const listeners = new Set();
let snapshot = { published: {}, activity: {} };
const MAX_ACTIVITY = 10;

function emit() {
  snapshot = { published: Object.fromEntries(published), activity: Object.fromEntries(activity) };
  listeners.forEach((l) => l());
}

export const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };
export const getSnapshot = () => snapshot;

export function publishContext(key, partial) { published.set(key, partial); emit(); }
export function unpublishContext(key) { if (published.delete(key)) emit(); }

// Records WHAT happened ("pdf_requested"), never the content involved.
export function recordActivity(moduleSlug, event) {
  const list = [...(activity.get(moduleSlug) || []), { event, at: Date.now() }].slice(-MAX_ACTIVITY);
  activity.set(moduleSlug, list);
  emit();
}
