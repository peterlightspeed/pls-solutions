// Rule-based recommendations. No AI, no network. Edit the maps to tune the results.
const KEY = "pls.workspace.prefs";

export const WHO = ["Student", "Business owner", "Freelancer", "Professional", "Organisation"];
export const GOALS = [
  "Save time",
  "Create professional documents",
  "Automate tasks",
  "Learn and study better",
  "Manage business activities",
  "Improve productivity",
];

const WHO_CATS = {
  "Student": ["career", "productivity", "documents"],
  "Business owner": ["business", "sales", "customer_support", "automation"],
  "Freelancer": ["sales", "documents", "business", "career"],
  "Professional": ["career", "productivity", "documents"],
  "Organisation": ["business", "automation", "productivity"],
};
const GOAL_CATS = {
  "Save time": ["automation", "productivity", "customer_support", "ai"],
  "Create professional documents": ["documents", "career", "business"],
  "Automate tasks": ["automation", "customer_support", "sales", "ai"],
  "Learn and study better": ["productivity", "content"],
  "Manage business activities": ["business", "sales", "documents"],
  "Improve productivity": ["productivity", "automation", "ai"],
};
const STATUS_RANK = { available: 0, beta: 1, coming_soon: 2, private: 3 };

export function recommend(items, prefs, max = 4) {
  const whoCats = WHO_CATS[prefs.who] || [];
  const goalCats = GOAL_CATS[prefs.goal] || [];
  return items
    .filter((i) => i.status !== "private")
    .map((i) => ({ i, score: (whoCats.includes(i.category) ? 2 : 0) + (goalCats.includes(i.category) ? 2 : 0) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || STATUS_RANK[a.i.status] - STATUS_RANK[b.i.status])
    .slice(0, max)
    .map((x) => x.i);
}

// Preferences live only in this browser. Never trusted for access decisions.
export function loadPrefs() {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || "null");
    return p && typeof p === "object" ? p : null;
  } catch {
    return null;
  }
}
export function savePrefs(p) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* storage unavailable */ }
}
export function clearPrefs() {
  try { localStorage.removeItem(KEY); } catch { /* storage unavailable */ }
}
