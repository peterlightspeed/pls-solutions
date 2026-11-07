"""Thin DB adapter.

TODO(integration): if the main app already has a declarative Base and get_db,
delete this file and import those instead, so Alembic sees these tables.
"""
import os
from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


class Base(DeclarativeBase):
    pass


_session_factory: sessionmaker[Session] | None = None


def get_db() -> Iterator[Session]:
    global _session_factory
    if _session_factory is None:
        url = os.environ.get("DATABASE_URL")
        if not url:
            raise RuntimeError("DATABASE_URL is not set")
        _session_factory = sessionmaker(bind=create_engine(url, pool_pre_ping=True))
    db = _session_factory()
    try:
        yield db
    finally:
        db.close()
