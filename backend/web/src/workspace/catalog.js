// Single place where the Workspace turns the existing data sources into one catalogue:
//   1. Solutions from the API (database)      -> source: "api"
//   2. Products from site/siteContent.js      -> source: "static"
// Nothing here invents features: only fields that already exist are used.
import { PRODUCTS } from "../site/siteContent";

// Flip to true once POST /solutions/{slug}/try really runs tools (see backend router.py, currently 501).
// Until then no database solution is shown as Available or Beta.
export const EXECUTION_CONNECTED = false;

export const STATUS = {
  available: { label: "Available", note: "Working and ready to use." },
  beta: { label: "Beta", note: "Functional but still being tested." },
  coming_soon: { label: "Coming Soon", note: "Planned or under development." },
  private: { label: "Private", note: "Not publicly accessible." },
};

export const PLAN_LABEL = { free: "Free", pro: "Pro" };

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Extra facts that came from the product owner, keyed by slug. Add more as products are verified.
const PRODUCT_EXTRA = {
  "pls-jarvis": { fullDescription: "PLS Jarvis is an AI personal assistant from PLS Tech." },
  "pls-nexus": { fullDescription: "PLS Nexus is an AI-powered resume and talent intelligence platform from PLS Tech. It is still in development." },
};

// The company site lists Jarvis as live, but its behaviour could not be verified from this codebase,
// so it is shown as Beta. Change it here once confirmed.
const PRODUCT_STATUS = { "pls-jarvis": "beta" };

function fromProduct(p) {
  const slug = slugify(p.name);
  const extra = PRODUCT_EXTRA[slug] || {};
  return {
    source: "static",
    slug,
    name: p.name,
    shortDescription: p.text,
    fullDescription: extra.fullDescription || p.text,
    category: "ai",
    categoryLabel: "AI Assistants",
    plan: null,
    status: PRODUCT_STATUS[slug] || "coming_soon",
    img: p.img,
    externalUrl: p.url || "",
    tags: ["ai", "assistant"],
    features: [],
  };
}

// Tools that really run, entirely in the browser, with no backend call and no stored data.
// They cannot be gated by the server, so they are shown as Free here. Keep the database row in sync
// (backend/migrations/002_invoice_generator_free.sql) so there is one source of truth.
const LOCAL_TOOLS = { "invoice-generator": { status: "beta", plan: "free" } };

export function normalizeApi(s) {
  const local = LOCAL_TOOLS[s.slug];
  let status = "coming_soon";
  if (EXECUTION_CONNECTED) status = s.status === "available" ? "available" : s.status === "preview" ? "beta" : "coming_soon";
  return {
    source: "api",
    slug: s.slug,
    name: s.title,
    shortDescription: s.description,
    fullDescription: s.description,
    category: s.category,
    categoryLabel: s.category_label,
    plan: local ? local.plan : s.plan,
    status: local ? local.status : status,
    localOnly: Boolean(local),
    img: `/img/solutions/${s.slug}.svg`,
    externalUrl: "",
    tags: s.tags || [],
    features: [],
  };
}

export const PRODUCT_ITEMS = PRODUCTS.map(fromProduct);

export const mergeCatalog = (apiItems) => [...apiItems, ...PRODUCT_ITEMS];

export const toolRoute = (item) => `/app/tools/${item.slug}`;
export const detailRoute = (item) => `/app/solutions/${item.slug}`;

export function categoriesOf(items) {
  const map = new Map();
  for (const it of items) {
    const c = map.get(it.category) || { value: it.category, label: it.categoryLabel, count: 0 };
    c.count += 1;
    map.set(it.category, c);
  }
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export function searchItems(items, q) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return items;
  return items.filter((it) => {
    const hay = [it.name, it.shortDescription, it.categoryLabel, ...it.tags].join(" ").toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

export function accessText(item) {
  if (item.externalUrl) return "Opens PLS Jarvis on its own site. Sign-in rules are set there.";
  if (item.localOnly) return "Free. Runs entirely in your browser: nothing you type is sent to our servers or saved.";
  if (item.source === "static") return "Not available to use yet.";
  const plan = item.plan === "pro" ? "Pro plan. Paid plans are not open yet." : "Free plan.";
  return `${plan} Running a tool will need an account, and accounts are not available yet.`;
}
