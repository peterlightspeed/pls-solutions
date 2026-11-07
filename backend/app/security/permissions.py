"""Server-side permission model (scaffolding only: no authentication exists yet).

Rules this design follows:
  * The server decides. Roles and permissions are never read from the request body, query or headers.
  * Default is DENY. Until real auth is wired into `current_principal`, everyone is an anonymous guest.
  * Three layers, checked in order: workspace role -> solution entitlement (plan) -> usage limits.

TODO(auth): make `current_principal` return the signed-in user (session cookie / verified Google token),
load role and workspace membership from the database, and load subscription status from payment webhooks.
"""
from dataclasses import dataclass, field
from enum import Enum

from fastapi import Depends, HTTPException


class Role(str, Enum):
    GUEST = "guest"
    MEMBER = "member"          # registered user
    WORKSPACE_ADMIN = "workspace_admin"
    STAFF = "staff"            # PLS Tech team


class Permission(str, Enum):
    SOLUTION_BROWSE = "solution:browse"
    SOLUTION_USE = "solution:use"
    SOLUTION_USE_PREMIUM = "solution:use_premium"
    WORK_SAVE = "work:save"
    INTEGRATION_MANAGE = "integration:manage"   # future: connect databases, Git, Slack, ...
    WORKSPACE_ADMIN = "workspace:admin"
    AUDIT_READ = "audit:read"


# Static role -> permissions map. Entitlements that depend on a plan are checked separately (see user_has_pro).
ROLE_PERMISSIONS: dict[Role, frozenset[Permission]] = {
    Role.GUEST: frozenset({Permission.SOLUTION_BROWSE}),
    Role.MEMBER: frozenset({Permission.SOLUTION_BROWSE, Permission.SOLUTION_USE, Permission.WORK_SAVE}),
    Role.WORKSPACE_ADMIN: frozenset(
        {Permission.SOLUTION_BROWSE, Permission.SOLUTION_USE, Permission.WORK_SAVE,
         Permission.INTEGRATION_MANAGE, Permission.WORKSPACE_ADMIN}
    ),
    Role.STAFF: frozenset(Permission),
}


@dataclass(frozen=True)
class Principal:
    user_id: str | None = None
    role: Role = Role.GUEST
    workspace_id: str | None = None
    extra: frozenset[Permission] = field(default_factory=frozenset)

    def can(self, permission: Permission) -> bool:
        return permission in ROLE_PERMISSIONS[self.role] or permission in self.extra


def current_principal() -> Principal:
    return Principal()  # TODO(auth): resolve from the verified session. Anonymous guest until then.


def require_permission(permission: Permission):
    """FastAPI dependency factory: `Depends(require_permission(Permission.SOLUTION_USE))`."""
    def dep(principal: Principal = Depends(current_principal)) -> Principal:
        if not principal.can(permission):
            status = 403 if principal.user_id else 401
            raise HTTPException(
                status_code=status,
                detail={"code": "forbidden" if status == 403 else "auth_required",
                        "message": "You do not have access to this. Sign in or upgrade your plan."},
            )
        return principal
    return dep
