// MODULE DESCRIPTORS: facts about how a module is BUILT (not catalogue/business data).
//
// Source-of-truth split (no duplicates):
//   database (API)  -> title, description, category, tags, plan, status, input fields, audience
//   this file       -> properties of the code: AI context domain, auth need, file types, build stage, enterprise
// catalog.js merges the two. To add a module, add one entry here (or none: sensible defaults apply).
//
// @typedef {Object} ModuleDescriptor
// @property {"none"|"planned"|"available"} aiCapability  "available" only when a real assistant is wired in
// @property {string} aiDomain          what the future assistant should understand for this module
// @property {boolean|null} requiresAuth  null = decided elsewhere (e.g. a separate site)
// @property {"undecided"|"not_planned"|"planned"|"available"} enterprise
// @property {{input:string[], output:string[]}} fileTypes
// @property {"planned"|"in_progress"|"testing"|"ready"|null} stage  honest build stage; null = unknown
// @property {string} helpKey           key into modules/helpContent.js

export const STAGES = { planned: "Planned", in_progress: "In progress", testing: "Testing", ready: "Ready" };

const DEFAULTS = {
  aiCapability: "planned",
  aiDomain: "this tool and the task it helps with",
  requiresAuth: true, // the backend requires sign-in to run API tools
  enterprise: "undecided",
  fileTypes: { input: [], output: [] },
  stage: "planned", // seeded in the catalogue, no working logic yet
  helpKey: "generic-tool",
};

const OVERRIDES = {
  "invoice-generator": {
    aiDomain: "invoices, quotations and receipts",
    requiresAuth: false, // runs in the browser, nothing to protect server-side
    fileTypes: { input: [], output: ["pdf (via the browser print dialog)"] },
    stage: "testing",
    helpKey: "invoice-generator",
  },
  "pls-jarvis": {
    aiDomain: "development, debugging and automation",
    requiresAuth: null,
    stage: null, // live status not verified from this codebase
    helpKey: "external-product",
  },
  "pls-nexus": {
    aiDomain: "resumes, recruitment and talent",
    requiresAuth: null,
    stage: "in_progress",
    helpKey: "external-product",
  },
  "pls-business-ai-assistant": {
    aiDomain: "everyday business tasks",
    requiresAuth: null,
    stage: "in_progress",
    helpKey: "external-product",
  },
};

export function getModuleDescriptor(slug) {
  const o = OVERRIDES[slug] || {};
  return { ...DEFAULTS, ...o, fileTypes: o.fileTypes || DEFAULTS.fileTypes };
}
