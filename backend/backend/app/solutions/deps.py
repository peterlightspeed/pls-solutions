"""Integration points with the main app's auth/billing.

SAFE DEFAULTS: until wired, nobody is authenticated and nobody has Pro, so
protected actions are denied rather than accidentally open.
TODO(integration): replace these with the real session/JWT dependency and the
subscription check (subscription status must come from the DB, never the client).
"""
import uuid

from fastapi import HTTPException


def get_current_user_optional() -> object | None:
    return None  # TODO: return the authenticated user if a valid session exists


def require_user() -> object:
    raise HTTPException(
        status_code=401,
        detail={"code": "auth_required", "message": "Please sign in to use this solution."},
    )  # TODO: replace with real auth dependency


def user_id_of(user: object | None) -> uuid.UUID | None:
    return None  # TODO: return user.id


def user_has_pro(user: object) -> bool:
    return False  # TODO: check active subscription / trial in the DB
