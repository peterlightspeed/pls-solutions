from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

# Everything here is UNTRUSTED input from the browser. Unknown fields are dropped (extra="ignore") and every
# string and list is length-capped, so the assistant only ever sees the small, labelled context we defined.


class _Base(BaseModel):
    model_config = ConfigDict(extra="ignore", str_strip_whitespace=True)


class Msg(_Base):
    role: Literal["user", "assistant"]
    text: str = Field(min_length=1, max_length=4000)


class ModuleCtx(_Base):
    slug: str = Field(max_length=80)
    name: str = Field(max_length=120)
    category: str | None = Field(default=None, max_length=60)
    status: str | None = Field(default=None, max_length=30)
    plan: str | None = Field(default=None, max_length=20)


class PageCtx(_Base):
    type: str = Field(max_length=40)
    title: str = Field(max_length=120)


class SelectionCtx(_Base):
    kind: str = Field(max_length=40)
    id: str | None = Field(default=None, max_length=80)
    label: str | None = Field(default=None, max_length=120)


class ActionCtx(_Base):
    label: str = Field(max_length=80)


class EventCtx(_Base):
    event: str = Field(max_length=60)


class ErrorCtx(_Base):
    kind: str = Field(max_length=30)
    status: int | None = None
    code: str | None = Field(default=None, max_length=60)
    title: str | None = Field(default=None, max_length=120)


class ContextIn(_Base):
    module: ModuleCtx | None = None
    page: PageCtx | None = None
    route: str = Field(default="", max_length=200)
    action: str | None = Field(default=None, max_length=80)
    selection: SelectionCtx | None = None
    availableActions: list[ActionCtx] = Field(default_factory=list, max_length=10)
    recentActivity: list[EventCtx] = Field(default_factory=list, max_length=10)
    errors: list[ErrorCtx] = Field(default_factory=list, max_length=5)


class AssistIn(_Base):
    context: ContextIn = Field(default_factory=ContextIn)
    messages: list[Msg] = Field(min_length=1, max_length=12)


class AssistOut(BaseModel):
    text: str
    redactions: int = 0


class StatusOut(BaseModel):
    available: bool
