import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.contact import contact_router
from app.contact import models as _m  # noqa: F401
from app.contact.models import Contact
from app.contact.router import contact_limiter
from app.solutions.db import Base, get_db

VALID = {"name": "Ada", "email": "ada@example.com", "topic": "consultation",
         "message": "We need help automating invoices."}


@pytest.fixture()
def ctx():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    app = FastAPI()
    app.include_router(contact_router)

    def _db():
        db = Session()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = _db
    contact_limiter.reset()
    return TestClient(app), Session


def test_contact_saved(ctx):
    client, Session = ctx
    assert client.post("/contact", json=VALID).status_code == 201
    with Session() as s:
        assert s.query(Contact).count() == 1


def test_contact_validation(ctx):
    client, _ = ctx
    assert client.post("/contact", json={**VALID, "email": "nope"}).status_code == 422
    assert client.post("/contact", json={**VALID, "topic": "spam"}).status_code == 422
    assert client.post("/contact", json={**VALID, "message": "short"}).status_code == 422


def test_contact_honeypot(ctx):
    client, Session = ctx
    assert client.post("/contact", json={**VALID, "website": "x"}).status_code == 201
    with Session() as s:
        assert s.query(Contact).count() == 0


def test_contact_rate_limit(ctx):
    client, _ = ctx
    codes = [client.post("/contact", json=VALID).status_code for _ in range(6)]
    assert codes[-1] == 429
