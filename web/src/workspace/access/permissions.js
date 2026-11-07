// FRONTEND PERMISSION MODEL: DISPLAY ONLY.
// Nothing here grants access. It decides what to show (a lock, a sign-in prompt, a hidden button).
// The backend must re-check every protected action (see backend/app/security/permissions.py).
// Never read roles or permissions from anything the visitor can edit (URL, localStorage, form fields).

export const ROLES = ["guest", "member", "workspace_admin", "staff"];

export const PERMISSIONS = {
  SOLUTION_BROWSE: "solution:browse",
  SOLUTION_USE: "solution:use",
  SOLUTION_USE_PREMIUM: "solution:use_premium",
  WORK_SAVE: "work:save",
  INTEGRATION_MANAGE: "integration:manage",
  WORKSPACE_ADMIN: "workspace:admin",
};

// Must mirror the backend ROLE_PERMISSIONS map. The backend copy is the one that is enforced.
const ROLE_PERMISSIONS = {
  guest: [PERMISSIONS.SOLUTION_BROWSE],
  member: [PERMISSIONS.SOLUTION_BROWSE, PERMISSIONS.SOLUTION_USE, PERMISSIONS.WORK_SAVE],
  workspace_admin: Object.values(PERMISSIONS).filter((p) => p !== PERMISSIONS.SOLUTION_USE_PREMIUM),
  staff: Object.values(PERMISSIONS),
};

// TODO(auth): replace with the signed-in principal returned by the backend (e.g. GET /api/me).
// Until accounts exist, every visitor is a guest.
export function usePrincipal() {
  return { role: "guest", workspaceId: null, signedIn: false };
}

export function usePermissions() {
  const principal = usePrincipal();
  const allowed = new Set(ROLE_PERMISSIONS[principal.role] || []);
  return { principal, can: (permission) => allowed.has(permission) };
}
