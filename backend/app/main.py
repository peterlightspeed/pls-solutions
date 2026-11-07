import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.checks.router import router as checks_router
from app.contact import contact_router
from app.contact import models as _contact_models  # noqa: F401
from app.additive_migrate import add_missing_nullable_columns
from app.solutions import models as _solution_models  # noqa: F401
from app.solutions import solutions_router
from app.solutions.db import Base
from app.solutions.seed import seed_solutions
from app.waitlist import models as _waitlist_models  # noqa: F401
from app.waitlist import waitlist_router

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./dev.db")
os.environ["DATABASE_URL"] = DATABASE_URL

log = logging.getLogger("pls.api")

# CORS. Explicit origins only, never "*". Comma-separated; spaces and trailing slashes are ignored.
#  - Local development works with no setup (Vite dev and preview ports).
#  - Production: set CORS_ORIGINS on the host, e.g. https://your-site.vercel.app
#  - Optional CORS_ORIGIN_REGEX for preview deployments, e.g. ^https://pls-solutions-[a-z0-9-]+\.vercel\.app$
_DEV_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173"
CORS_ORIGINS = [
    o.strip().rstrip("/") for o in os.environ.get("CORS_ORIGINS", _DEV_ORIGINS).split(",") if o.strip() and o.strip() != "*"
]
CORS_ORIGIN_REGEX = os.environ.get("CORS_ORIGIN_REGEX") or None

app = FastAPI(title="PLS Tech API")


# Added BEFORE the CORS middleware so CORS wraps it. Without this, an unhandled exception becomes a bare 500
# with no CORS headers, and the browser reports a misleading "blocked by CORS policy" error.
@app.middleware("http")
async def friendly_500(request, call_next):
    try:
        return await call_next(request)
    except Exception:  # noqa: BLE001
        log.exception("Unhandled error on %s %s", request.method, request.url.path)  # full detail stays in server logs
        return JSONResponse(
            status_code=500,
            content={"detail": {"code": "server_error", "message": "Something went wrong on our side. Please try again shortly."}},
        )


app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(solutions_router, prefix="/api")
app.include_router(contact_router, prefix="/api")
app.include_router(waitlist_router, prefix="/api")
app.include_router(checks_router, prefix="/api")


@app.on_event("startup")
def _dev_setup():
    # DEV ONLY: use Alembic migrations in production.
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(engine)
    add_missing_nullable_columns(engine, Base.metadata)  # additive only, see additive_migrate.py
    with Session(engine) as s:
        seed_solutions(s)
