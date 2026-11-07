import { matchPath } from "react-router-dom";
import { PERMISSIONS } from "../access/permissions";
import { getModuleDescriptor } from "../modules/descriptors";
import { getHelp } from "../modules/helpContent";

// WORKSPACE CONTEXT: the object a future assistant receives automatically, so the person never has to
// explain where they are. Pure function: router location + catalogue + published module context in, context out.
//
// @typedef {Object} WorkspaceContext
// @property {{slug,name,category,status,plan}|null} module
// @property {Object|null} descriptor        see modules/descriptors.js
// @property {{type:string,title:string}} page
// @property {string} route                  pathname only (no query string, no hash)
// @property {string|null} action            what the person is doing now, set by the module
// @property {{kind:string,id?:string,label?:string}|null} selection   selected document/record: reference only
// @property {{role:string,granted:string[],note:string}} permissions   DISPLAY ONLY, never trusted by a server
// @property {{label:string,to?:string}[]} availableActions
// @property {{label:string,to:string}[]} documentation
// @property {{event:string,at:number}[]} recentActivity   event names only
// @property {Object} help                   built-in guidance for this page
//
// TODO(workspace-intelligence): the BACKEND must rebuild permissions itself from the session. It must treat
// everything in this object as untrusted hints about where the person is, never as authority.

const ROUTES = [
  ["/app", "workspace-home"],
  ["/app/solutions", "explore"],
  ["/app/solutions/:slug", "solution"],
  ["/app/tools/:slug", "tool"],
  ["/app/category/:category", "category"],
  ["/app/integrations", "integrations"],
];

function resolveRoute(pathname) {
  for (const [pattern, type] of ROUTES) {
    const m = matchPath({ path: pattern, end: true }, pathname);
    if (m) return { type, params: m.params };
  }
  return { type: "unknown", params: {} };
}

export function buildContext({ pathname, items, snapshot, principal, can }) {
  const { type, params } = resolveRoute(pathname);
  const item = params.slug ? items.find((i) => i.slug === params.slug) || null : null;
  const descriptor = item ? getModuleDescriptor(item.slug) : null;

  // Merge what the open module published (the tool page registers under its slug).
  const mod = (item && snapshot.published[`module:${item.slug}`]) || {};
  const help = getHelp({ pageType: type, item, descriptor: descriptor || {} });

  return {
    module: item && { slug: item.slug, name: item.name, category: item.category, status: item.status, plan: item.plan },
    descriptor,
    page: { type, title: item ? item.name : type },
    route: pathname,
    action: mod.action || null,
    selection: mod.selection || null,
    permissions: {
      role: principal.role,
      granted: Object.values(PERMISSIONS).filter((p) => can(p)),
      note: "display-only; the server decides",
    },
    availableActions: [...(mod.availableActions || []), ...help.nextActions],
    documentation: help.docs,
    recentActivity: item ? snapshot.activity[item.slug] || [] : [],
    help,
  };
}
