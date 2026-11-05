import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, DateTime, Index, String, Text, Uuid
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base
from .enums import Frequency, Plan, RequestStatus, SolutionStatus

JSONType = JSON().with_variant(JSONB(), "postgresql")


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Solution(Base):
    __tablename__ = "solutions"
    __table_args__ = (Index("ix_solutions_category_active", "category", "is_active"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(120))
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    category: Mapped[str] = mapped_column(String(32))
    description: Mapped[str] = mapped_column(Text)
    # Added beyond the minimum field list because the detail page needs them:
    problem_solved: Mapped[str] = mapped_column(Text)
    target_audience: Mapped[str] = mapped_column(String(255))
    output_description: Mapped[str] = mapped_column(Text)

    plan: Mapped[str] = mapped_column(String(8), default=Plan.FREE.value)
    status: Mapped[str] = mapped_column(String(16), default=SolutionStatus.DRAFT.value)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    input_fields: Mapped[list] = mapped_column(JSONType, default=list)
    output_type: Mapped[str] = mapped_column(String(16))
    tags: Mapped[list] = mapped_column(JSONType, default=list)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, onupdate=_now
    )


class SolutionRequest(Base):
    __tablename__ = "solution_requests"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    # No FK yet: the users table lives outside this module. TODO(integration): add FK.
    user_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, nullable=True, index=True)
    problem: Mapped[str] = mapped_column(Text)
    task_to_automate: Mapped[str] = mapped_column(Text)
    target_audience: Mapped[str] = mapped_column(String(255))
    frequency: Mapped[str] = mapped_column(String(16), default=Frequency.OCCASIONALLY.value)
    willing_to_pay: Mapped[str] = mapped_column(String(8))
    contact_email: Mapped[str | None] = mapped_column(String(254), nullable=True)
    related_solution_slug: Mapped[str | None] = mapped_column(String(120), nullable=True)
    status: Mapped[str] = mapped_column(String(16), default=RequestStatus.NEW.value, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
