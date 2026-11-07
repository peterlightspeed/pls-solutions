import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.solutions import solutions_router
from app.solutions.db import Base, get_db
from app.solutions.models import Solution, SolutionRequest
from app.solutions.ratelimit import request_limiter
from app.solutions.seed import seed_solutions

VALID = {
    "problem": "I spend hours writing quotes for clients",
    "task_to_automate": "Quote writing",
    "target_audience": "Freelancers",
    "frequency": "weekly",
    "willing_to_pay": "yes",
}


@pytest.fixture()
def ctx():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    with Session() as s:
        seed_solutions(s)
    app = FastAPI()
    app.include_router(solutions_router)

    def _db():
        db = Session()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = _db
    request_limiter.reset()
    return TestClient(app), Session


def test_seed_is_idempotent(ctx):
    _, Session = ctx
    with Session() as s:
        assert seed_solutions(s) == 0


def test_list_and_category_filter(ctx):
    client, _ = ctx
    r = client.get("/solutions", params={"category": "career"})
    assert r.status_code == 200
    assert {i["slug"] for i in r.json()["items"]} == {"cv-filling-assistant", "job-application-assistant"}


def test_search_by_problem_text_and_tag(ctx):
    client, _ = ctx
    assert any(i["slug"] == "invoice-generator" for i in client.get("/solutions", params={"q": "spreadsheets"}).json()["items"])
    assert client.get("/solutions", params={"q": "whatsapp"}).json()["total"] == 1


def test_search_wildcards_are_literal(ctx):
    client, _ = ctx
    assert client.get("/solutions", params={"q": "%"}).json()["total"] == 0


def test_plan_filter(ctx):
    client, _ = ctx
    items = client.get("/solutions", params={"plan": "free"}).json()["items"]
    assert items and all(i["plan"] == "free" for i in items)


def test_draft_and_inactive_are_hidden(ctx):
    client, Session = ctx
    with Session() as s:
        s.query(Solution).filter_by(slug="invoice-generator").update({"status": "draft"})
        s.query(Solution).filter_by(slug="proposal-generator").update({"is_active": False})
        s.commit()
    slugs = {i["slug"] for i in client.get("/solutions").json()["items"]}
    assert "invoice-generator" not in slugs and "proposal-generator" not in slugs
    assert client.get("/solutions/invoice-generator").status_code == 404


def test_detail_has_required_fields(ctx):
    client, _ = ctx
    d = client.get("/solutions/cv-filling-assistant").json()
    for key in ("problem_solved", "target_audience", "plan", "input_fields", "output_type", "output_description"):
        assert d[key]


def test_categories_endpoint(ctx):
    client, _ = ctx
    cats = client.get("/solutions/categories").json()
    assert len(cats) == 8 and next(c for c in cats if c["value"] == "career")["count"] == 2


def test_request_created(ctx):
    client, Session = ctx
    assert client.post("/solutions/requests", json=VALID).status_code == 201
    with Session() as s:
        assert s.query(SolutionRequest).count() == 1


def test_request_validation(ctx):
    client, _ = ctx
    assert client.post("/solutions/requests", json={**VALID, "problem": "short"}).status_code == 422
    assert client.post("/solutions/requests", json={**VALID, "frequency": "hourly"}).status_code == 422
    assert client.post("/solutions/requests", json={**VALID, "is_admin": True}).status_code == 422


def test_honeypot_stores_nothing(ctx):
    client, Session = ctx
    assert client.post("/solutions/requests", json={**VALID, "website": "http://spam"}).status_code == 201
    with Session() as s:
        assert s.query(SolutionRequest).count() == 0


def test_request_rate_limited(ctx):
    client, _ = ctx
    codes = [client.post("/solutions/requests", json=VALID).status_code for _ in range(6)]
    assert codes[:5] == [201] * 5 and codes[5] == 429


def test_try_requires_auth(ctx):
    client, _ = ctx
    assert client.post("/solutions/cv-filling-assistant/try").status_code == 401
