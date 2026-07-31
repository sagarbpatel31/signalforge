from fastapi.testclient import TestClient

import main
from app import auth


def _client_and_token(monkeypatch) -> tuple[TestClient, str]:
    monkeypatch.setenv("SESSION_SECRET", "test-secret")
    monkeypatch.setattr(auth, "_cached_secret", None)
    client = TestClient(main.app)
    return client, client.post("/api/auth/session").json()["token"]


def _fake_store(monkeypatch) -> dict:
    store: dict = {}
    monkeypatch.setattr("app.routers.bookmarks.kv_get", lambda key: store.get(key))
    monkeypatch.setattr(
        "app.routers.bookmarks.kv_set",
        lambda key, value, ttl=0: store.__setitem__(key, value),
    )
    return store


PAPER = {
    "id": "https://arxiv.org/abs/2601.00001",
    "title": "Edge Inference at Scale",
    "sub": "arXiv",
    "url": "https://arxiv.org/abs/2601.00001",
    "type": "paper",
}


def test_bookmarks_require_a_session(monkeypatch):
    client, _ = _client_and_token(monkeypatch)
    assert client.get("/api/bookmarks").status_code == 401
    assert client.post("/api/bookmarks", json={"papers": [PAPER]}).status_code == 401


def test_bookmarks_default_empty(monkeypatch):
    client, token = _client_and_token(monkeypatch)
    _fake_store(monkeypatch)
    res = client.get("/api/bookmarks", headers={"X-SignalForge-Token": token})
    assert res.status_code == 200
    assert res.json() == {"papers": [], "startups": [], "roles": [], "opportunities": []}


def test_bookmarks_roundtrip(monkeypatch):
    client, token = _client_and_token(monkeypatch)
    _fake_store(monkeypatch)
    headers = {"X-SignalForge-Token": token}

    post = client.post("/api/bookmarks", json={"papers": [PAPER]}, headers=headers)
    assert post.status_code == 200

    got = client.get("/api/bookmarks", headers=headers).json()
    assert got["papers"] == [PAPER]
    assert got["roles"] == []


def test_bookmarks_are_scoped_per_session(monkeypatch):
    client, alpha = _client_and_token(monkeypatch)
    _fake_store(monkeypatch)
    beta = client.post("/api/auth/session").json()["token"]

    client.post(
        "/api/bookmarks", json={"papers": [PAPER]}, headers={"X-SignalForge-Token": alpha}
    )

    assert client.get("/api/bookmarks", headers={"X-SignalForge-Token": beta}).json()["papers"] == []
