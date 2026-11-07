import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, computed_field

from .enums import (CATEGORY_LABELS, Category, Frequency, OutputType, Plan,
                    SolutionStatus, WillingToPay)


class InputField(BaseModel):
    """Describes one input the user must provide. File uploads are a TODO
    (needs type/size validation + malware scanning before being offered)."""

    name: str = Field(pattern=r"^[a-z][a-z0-9_]{0,39}$")
    label: str = Field(max_length=80)
    type: Literal["text", "textarea", "select", "number"]
    required: bool = True
    placeholder: str | None = Field(default=None, max_length=160)
    options: list[str] | None = None
    max_length: int | None = Field(default=None, ge=1, le=20000)


class SolutionSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    slug: str
    category: Category
    description: str
    plan: Plan
    status: SolutionStatus
    is_featured: bool
    output_type: OutputType
    tags: list[str]

    @computed_field  # type: ignore[prop-decorator]
    @property
    def category_label(self) -> str:
        return CATEGORY_LABELS[self.category.value]


class SolutionDetail(SolutionSummary):
    problem_solved: str
    target_audience: str
    input_fields: list[InputField]
    output_description: str
    created_at: datetime
    updated_at: datetime


class SolutionPage(BaseModel):
    items: list[SolutionSummary]
    total: int
    limit: int
    offset: int


class CategoryOut(BaseModel):
    value: Category
    label: str
    count: int


class SolutionRequestIn(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    problem: str = Field(min_length=10, max_length=2000)
    task_to_automate: str = Field(min_length=5, max_length=2000)
    target_audience: str = Field(min_length=2, max_length=255)
    frequency: Frequency
    willing_to_pay: WillingToPay
    contact_email: EmailStr | None = None
    related_solution_slug: str | None = Field(default=None, pattern=r"^[a-z0-9-]{1,120}$")
    website: str | None = Field(default=None, max_length=200)  # honeypot; humans leave empty


class SolutionRequestOut(BaseModel):
    id: uuid.UUID
    message: str
