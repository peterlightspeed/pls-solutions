import uuid
from enum import Enum

from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy.orm import Session

from app.solutions.db import get_db
from app.solutions.ratelimit import InMemoryRateLimiter  # TODO: Redis-backed limiter

from .models import Contact

router = APIRouter(prefix="/contact", tags=["contact"])
contact_limiter = InMemoryRateLimiter(max_calls=5, window_seconds=3600)


class Topic(str, Enum):
    CONSULTATION = "consultation"
    EARLY_ACCESS = "early_access"
    PROJECT = "project"
    PARTNERSHIP = "partnership"
    OTHER = "other"


class ContactIn(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    company: str | None = Field(default=None, max_length=120)
    topic: Topic
    message: str = Field(min_length=10, max_length=3000)
    website: str | None = Field(default=None, max_length=200)  # honeypot


class ContactOut(BaseModel):
    id: uuid.UUID
    message: str


_THANKS = "Thanks for reaching out. We'll get back to you soon."


@router.post("", response_model=ContactOut, status_code=201, dependencies=[Depends(contact_limiter)])
def create_contact(payload: ContactIn, db: Session = Depends(get_db)):
    if payload.website:  # bot filled the hidden field: pretend success, store nothing
        return ContactOut(id=uuid.uuid4(), message=_THANKS)
    row = Contact(
        name=payload.name, email=payload.email, company=payload.company or None,
        topic=payload.topic.value, message=payload.message,
    )
    db.add(row)
    db.commit()
    # TODO: notify staff (email/Slack) and write an audit_logs entry.
    return ContactOut(id=row.id, message=_THANKS)
