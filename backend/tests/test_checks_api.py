import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.checks import router as router_module
from app.checks.rdap import Registration
from app.checks.router import check_limiter, router


@pytest.fixture()
def client(monkeypatch):
    from datetime import datetime, timedelta, timezone

    monkeypatch.setattr(router_module, "lookup", lambda domain: Registration("ok", datetime.now(timezone.utc) - timedelta(days=5), None, "R"))
    check_limiter.reset()
    app = FastAPI()
    app.include_router(router)
    return TestClient(app)


def test_website_check_works(client):
    r = client.post("/checks/business", json={"website": "https://brand-new.com"})
    assert r.status_code == 200
    body = r.json()
    assert body["summary"]["level"] == "high" and body["website"]["age_days"] == 5


def test_empty_request_rejected(client):
    assert client.post("/checks/business", json={}).status_code == 422


def test_bad_website_gives_friendly_400(client):
    r = client.post("/checks/business", json={"website": "ftp://x.com"})
    assert r.status_code == 400 and r.json()["detail"]["code"] == "bad_website"


def test_extra_and_invalid_fields_rejected(client):
    assert client.post("/checks/business", json={"website": "https://a.com", "admin": True}).status_code == 422
    assert client.post("/checks/business", json={"website": "https://a.com", "cac_status": "maybe"}).status_code == 422
    assert client.post("/checks/business", json={"offer_text": "x" * 4001}).status_code == 422


def test_never_looks_up_ips_or_platforms(monkeypatch, client):
    called = []
    monkeypatch.setattr(router_module, "lookup", lambda d: called.append(d))
    client.post("/checks/business", json={"website": "http://10.0.0.1"})
    client.post("/checks/business", json={"website": "https://x.vercel.app"})
    client.post("/checks/business", json={"website": "https://bit.ly/a"})
    assert called == []


def test_rate_limited(client):
    codes = [client.post("/checks/business", json={"offer_text": "hello there"}).status_code for _ in range(21)]
    assert codes[-1] == 429
