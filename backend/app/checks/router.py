from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.solutions.ratelimit import InMemoryRateLimiter  # TODO: Redis-backed limiter

from .assess import assess
from .domain import InputError, parse_website
from .rdap import lookup

router = APIRouter(prefix="/checks", tags=["checks"])
check_limiter = InMemoryRateLimiter(max_calls=20, window_seconds=3600)


class CheckIn(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    website: str | None = Field(default=None, max_length=300)
    offer_text: str | None = Field(default=None, max_length=4000)
    cac_status: Literal["not_checked", "found_active", "found_inactive", "not_found"] = "not_checked"
    sec_status: Literal["not_checked", "registered", "not_found", "warned", "not_applicable"] = "not_checked"

    @model_validator(mode="after")
    def _something_to_check(self):
        if not (self.website or self.offer_text) and self.cac_status == "not_checked" and self.sec_status == "not_checked":
            raise ValueError("Enter a website, paste the offer, or record what you found on CAC or the SEC.")
        return self


class Flag(BaseModel):
    id: str
    severity: Literal["high", "medium", "low", "info"]
    title: str
    detail: str
    evidence: str | None = None


class CheckItem(BaseModel):
    id: str
    title: str
    state: Literal["ok", "flagged", "unknown", "todo"]
    summary: str


class Counts(BaseModel):
    high: int
    medium: int
    low: int


class Summary(BaseModel):
    level: Literal["high", "caution", "clear", "incomplete"]
    label: str
    message: str
    counts: Counts
    checks_done: int
    checks_total: int


class WebsiteInfo(BaseModel):
    input: str
    host: str
    registrable_domain: str | None
    registered_on: str | None
    expires_on: str | None
    age_days: int | None
    age_text: str | None
    registrar: str | None
    lookup: Literal["ok", "unavailable", "skipped"]


class CheckOut(BaseModel):
    summary: Summary
    flags: list[Flag]
    checks: list[CheckItem]
    website: WebsiteInfo | None
    disclaimer: str


@router.post("/business", response_model=CheckOut, dependencies=[Depends(check_limiter)])
def check_business(payload: CheckIn):
    """Public and stateless: nothing the visitor sends is stored or logged."""
    parsed = reg = None
    if payload.website:
        try:
            parsed = parse_website(payload.website)
        except InputError as e:
            raise HTTPException(status_code=400, detail={"code": "bad_website", "message": str(e)}) from None
        if parsed.kind == "domain" and not parsed.is_ip:
            reg = lookup(parsed.registrable)
    return assess(parsed, reg, payload.offer_text, payload.cac_status, payload.sec_status)
