import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.solutions import solutions_router
from app.solutions.db import Base
from app.solutions import models  # noqa: F401  (registers tables)
from app.solutions.seed import seed_solutions

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./dev.db")
os.environ["DATABASE_URL"] = DATABASE_URL

app = FastAPI(title="PLS Tech API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(solutions_router, prefix="/api")


@app.on_event("startup")
def _dev_setup():
    # DEV ONLY: use Alembic migrations in production.
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(engine)
    with Session(engine) as s:
        seed_solutions(s)
