import importlib

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{tmp_path}/t.db")
    monkeypatch.setenv("CORS_ORIGINS", " https://prod.example.com/ ")
    import app.main as main
    main = importlib.reload(main)

    @main.app.get("/api/_boom")
    def boom():
        raise RuntimeError("secret internal detail")

    with TestClient(main.app, raise_server_exceptions=False) as c:
        yield c


def test_unhandled_error_is_friendly_json_and_keeps_cors(client):
    r = client.get("/api/_boom", headers={"Origin": "https://prod.example.com"})
    assert r.status_code == 500
    assert r.headers["access-control-allow-origin"] == "https://prod.example.com"
    assert r.json()["detail"]["code"] == "server_error"
    assert "secret" not in r.text and "Traceback" not in r.text


def test_cors_allows_only_listed_origins(client):
    ok = client.get("/api/solutions", headers={"Origin": "https://prod.example.com"})
    bad = client.get("/api/solutions", headers={"Origin": "https://evil.example.com"})
    assert ok.headers.get("access-control-allow-origin") == "https://prod.example.com"
    assert "access-control-allow-origin" not in bad.headers


def test_wildcard_is_never_honoured(monkeypatch, tmp_path):
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{tmp_path}/w.db")
    monkeypatch.setenv("CORS_ORIGINS", "*")
    import app.main as main
    assert importlib.reload(main).CORS_ORIGINS == []
