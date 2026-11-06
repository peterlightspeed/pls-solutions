from typing import Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.solutions.db import get_db
from app.solutions.ratelimit import InMemoryRateLimiter  # TODO: Redis-backed limiter

from .models import WaitlistSignup

router = APIRouter(prefix="/waitlist", tags=["waitlist"])
waitlist_limiter = InMemoryRateLimiter(max_calls=10, window_seconds=3600)

_THANKS = "You're on the list. We'll email you when sign-up opens."


class WaitlistIn(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    email: EmailStr
    source: Literal["home", "pricing", "waitlist", "footer"] = "waitlist"
    # Optional extras. Both are self-reported labels, never used for access decisions.
    role: Literal["student", "business_owner", "freelancer", "professional", "organisation", "other"] | None = None
    interest: str | None = Field(default=None, pattern=r"^[a-z0-9-]{1,40}$")  # a solution slug or "other"
    website: str | None = Field(default=None, max_length=200)  # honeypot


class WaitlistOut(BaseModel):
    message: str


class CountOut(BaseModel):
    count: int


@router.post("", response_model=WaitlistOut, status_code=201, dependencies=[Depends(waitlist_limiter)])
def join(payload: WaitlistIn, db: Session = Depends(get_db)):
    if payload.website:  # bot: pretend success, store nothing
        return WaitlistOut(message=_THANKS)
    email = payload.email.lower()
    # Same response whether or not the email already exists (no email enumeration).
    existing = db.scalar(select(WaitlistSignup).where(WaitlistSignup.email == email))
    if existing is None:
        try:
            db.add(WaitlistSignup(email=email, source=payload.source, role=payload.role, interest=payload.interest))
            db.commit()
        except IntegrityError:  # concurrent duplicate
            db.rollback()
    elif payload.role or payload.interest:
        # Returning signup adds detail: fill it in, never blank anything out.
        existing.role = payload.role or existing.role
        existing.interest = payload.interest or existing.interest
        db.commit()
    return WaitlistOut(message=_THANKS)


@router.get("/count", response_model=CountOut)
def count(db: Session = Depends(get_db)):
    # Real number of distinct signups. Only the count is public, never emails.
    return CountOut(count=db.scalar(select(func.count()).select_from(WaitlistSignup)) or 0)
