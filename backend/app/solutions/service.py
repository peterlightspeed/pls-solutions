from sqlalchemy import String, cast, func, or_, select
from sqlalchemy.orm import Session

from .enums import SolutionStatus
from .models import Solution

MAX_TERMS = 6
MAX_TERM_LEN = 50


def _visible():
    """Public visibility rule, applied to every public query."""
    return (Solution.is_active.is_(True), Solution.status != SolutionStatus.DRAFT.value)


def _escape_like(value: str) -> str:
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def list_solutions(
    db: Session,
    *,
    q: str | None = None,
    category: str | None = None,
    plan: str | None = None,
    featured: bool | None = None,
    limit: int = 12,
    offset: int = 0,
) -> tuple[list[Solution], int]:
    conditions = list(_visible())
    if category:
        conditions.append(Solution.category == category)
    if plan:
        conditions.append(Solution.plan == plan)
    if featured is not None:
        conditions.append(Solution.is_featured.is_(featured))

    # Every word must match somewhere (title, description, problem, tags).
    # TODO: switch to Postgres full-text search / pg_trgm once the catalog grows.
    for term in [t for t in (q or "").split() if t][:MAX_TERMS]:
        pattern = f"%{_escape_like(term[:MAX_TERM_LEN])}%"
        conditions.append(
            or_(
                Solution.title.ilike(pattern, escape="\\"),
                Solution.description.ilike(pattern, escape="\\"),
                Solution.problem_solved.ilike(pattern, escape="\\"),
                cast(Solution.tags, String).ilike(pattern, escape="\\"),
            )
        )

    total = db.scalar(select(func.count()).select_from(Solution).where(*conditions)) or 0
    rows = db.scalars(
        select(Solution)
        .where(*conditions)
        .order_by(Solution.is_featured.desc(), Solution.title.asc())
        .limit(limit)
        .offset(offset)
    ).all()
    return list(rows), total


def get_solution_by_slug(db: Session, slug: str) -> Solution | None:
    return db.scalar(select(Solution).where(Solution.slug == slug, *_visible()))


def category_counts(db: Session) -> dict[str, int]:
    rows = db.execute(
        select(Solution.category, func.count()).where(*_visible()).group_by(Solution.category)
    ).all()
    return {cat: n for cat, n in rows}
