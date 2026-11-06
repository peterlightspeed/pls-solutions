import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.solutions.db import Base, get_db
from app.waitlist import models as _m  # noqa: F401
from app.waitlist import waitlist_router
from app.waitlist.models import WaitlistSignup
from app.waitlist.router import waitlist_limiter


@pytest.fixture()
def ctx():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    app = FastAPI()
    app.include_router(waitlist_router)

    def _db():
        db = Session()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = _db
    waitlist_limiter.reset()
    return TestClient(app), Session


def test_join_and_count(ctx):
    client, _ = ctx
    assert client.get("/waitlist/count").json() == {"count": 0}
    assert client.post("/waitlist", json={"email": "a@example.com"}).status_code == 201
    assert client.get("/waitlist/count").json() == {"count": 1}


def test_duplicate_email_counted_once_same_response(ctx):
    client, _ = ctx
    r1 = client.post("/waitlist", json={"email": "A@Example.com"})
    r2 = client.post("/waitlist", json={"email": "a@example.com"})
    assert r1.status_code == r2.status_code == 201 and r1.json() == r2.json()
    assert client.get("/waitlist/count").json()["count"] == 1


def test_invalid_email_and_extra_fields(ctx):
    client, _ = ctx
    assert client.post("/waitlist", json={"email": "nope"}).status_code == 422
    assert client.post("/waitlist", json={"email": "a@example.com", "role": "admin"}).status_code == 422


def test_honeypot_not_stored(ctx):
    client, Session = ctx
    client.post("/waitlist", json={"email": "bot@example.com", "website": "x"})
    with Session() as s:
        assert s.query(WaitlistSignup).count() == 0


def test_count_never_exposes_emails(ctx):
    client, _ = ctx
    client.post("/waitlist", json={"email": "secret@example.com"})
    assert "secret" not in client.get("/waitlist/count").text


def test_rate_limited(ctx):
    client, _ = ctx
    codes = [client.post("/waitlist", json={"email": f"u{i}@example.com"}).status_code for i in range(11)]
    assert codes[-1] == 429


def test_optional_role_and_interest_saved_and_filled_later(ctx):
    client, Session = ctx
    assert client.post("/waitlist", json={"email": "b@example.com"}).status_code == 201
    r = client.post("/waitlist", json={"email": "B@example.com", "role": "freelancer", "interest": "invoice-generator"})
    assert r.status_code == 201
    with Session() as db:
        rows = db.query(WaitlistSignup).all()
        assert len(rows) == 1 and rows[0].role == "freelancer" and rows[0].interest == "invoice-generator"
    # a later bare signup must not erase what we already know
    client.post("/waitlist", json={"email": "b@example.com"})
    with Session() as db:
        assert db.query(WaitlistSignup).one().role == "freelancer"


def test_role_and_interest_are_validated(ctx):
    client, _ = ctx
    assert client.post("/waitlist", json={"email": "c@example.com", "role": "wizard"}).status_code == 422
    assert client.post("/waitlist", json={"email": "c@example.com", "interest": "<script>"}).status_code == 422
