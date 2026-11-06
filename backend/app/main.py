import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.contact import contact_router
from app.contact import models as _contact_models  # noqa: F401
from app.solutions import models as _solution_models  # noqa: F401
from app.solutions import solutions_router
from app.solutions.db import Base
from app.solutions.seed import seed_solutions
from app.waitlist import models as _waitlist_models  # noqa: F401
from app.waitlist import waitlist_router

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./dev.db")
os.environ["DATABASE_URL"] = DATABASE_URL

app = FastAPI(title="PLS Tech API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(solutions_router, prefix="/api")
app.include_router(contact_router, prefix="/api")
app.include_router(waitlist_router, prefix="/api")


@app.on_event("startup")
def _dev_setup():
    # DEV ONLY: use Alembic migrations in production.
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(engine)
    with Session(engine) as s:
        seed_solutions(s)
