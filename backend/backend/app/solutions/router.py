import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from . import service
from .db import get_db
from .deps import get_current_user_optional, require_user, user_has_pro, user_id_of
from .enums import CATEGORY_LABELS, Category, Plan, SolutionStatus
from .models import SolutionRequest
from .ratelimit import request_limiter
from .schemas import (CategoryOut, SolutionDetail, SolutionPage,
                      SolutionRequestIn, SolutionRequestOut, SolutionSummary)

router = APIRouter(prefix="/solutions", tags=["solutions"])

_THANKS = "Thanks! We review every request and will reach out if we build it."


@router.get("", response_model=SolutionPage)
def list_all(
    q: str | None = Query(default=None, max_length=100),
    category: Category | None = None,
    plan: Plan | None = None,
    featured: bool | None = None,
    limit: int = Query(default=12, ge=1, le=50),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    items, total = service.list_solutions(
        db,
        q=q,
        category=category.value if category else None,
        plan=plan.value if plan else None,
        featured=featured,
        limit=limit,
        offset=offset,
    )
    return SolutionPage(
        items=[SolutionSummary.model_validate(i) for i in items],
        total=total, limit=limit, offset=offset,
    )


@router.get("/categories", response_model=list[CategoryOut])
def categories(db: Session = Depends(get_db)):
    counts = service.category_counts(db)
    return [
        CategoryOut(value=c, label=CATEGORY_LABELS[c.value], count=counts.get(c.value, 0))
        for c in Category
    ]


@router.post(
    "/requests",
    response_model=SolutionRequestOut,
    status_code=201,
    dependencies=[Depends(request_limiter)],
)
def create_request(
    payload: SolutionRequestIn,
    db: Session = Depends(get_db),
    user: object | None = Depends(get_current_user_optional),
):
    # Honeypot: bots fill hidden fields. Pretend success, store nothing.
    if payload.website:
        return SolutionRequestOut(id=uuid.uuid4(), message=_THANKS)

    row = SolutionRequest(
        user_id=user_id_of(user),
        problem=payload.problem,
        task_to_automate=payload.task_to_automate,
        target_audience=payload.target_audience,
        frequency=payload.frequency.value,
        willing_to_pay=payload.willing_to_pay.value,
        contact_email=payload.contact_email,
        related_solution_slug=payload.related_solution_slug,
    )
    db.add(row)
    db.commit()
    # TODO: write an audit_logs entry and notify staff (email/Slack).
    return SolutionRequestOut(id=row.id, message=_THANKS)


@router.get("/{slug}", response_model=SolutionDetail)
def detail(slug: str, db: Session = Depends(get_db)):
    solution = service.get_solution_by_slug(db, slug)
    if solution is None:
        raise HTTPException(status_code=404, detail="Solution not found")
    return solution


@router.post("/{slug}/try")
def try_solution(
    slug: str,
    db: Session = Depends(get_db),
    user: object = Depends(require_user),  # authentication required
):
    solution = service.get_solution_by_slug(db, slug)
    if solution is None:
        raise HTTPException(status_code=404, detail="Solution not found")
    if solution.status != SolutionStatus.AVAILABLE.value:
        raise HTTPException(
            status_code=409,
            detail={"code": "not_available", "message": "This solution is not available yet."},
        )
    # Server-side plan enforcement; the frontend badge is display-only.
    if solution.plan == Plan.PRO.value and not user_has_pro(user):
        raise HTTPException(
            status_code=403,
            detail={"code": "upgrade_required", "message": "This solution requires a Pro plan."},
        )
    # TODO: run the solution via the AI orchestration layer (validate inputs
    # against input_fields, enforce usage limits, moderation, prompt-injection
    # guards, usage logging). Intentionally not faked here.
    raise HTTPException(
        status_code=501,
        detail={"code": "not_implemented", "message": "Running solutions is not connected yet."},
    )
