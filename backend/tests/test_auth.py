from fastapi.testclient import TestClient

import main
from app import auth


def _client(monkeypatch) -> TestClient:
    monkeypatch.setenv("SESSION_SECRET", "test-secret")
    monkeypatch.setattr(auth, "_cached_secret", None)
    return TestClient(main.app)


def _issue(client: TestClient) -> str:
    res = client.post("/api/auth/session")
    assert res.status_code == 200
    return res.json()["token"]


def test_issued_token_is_opaque_and_verifies(monkeypatch):
    client = _client(monkeypatch)
    token = _issue(client)

    user_id, _, signature = token.rpartition(".")
    assert user_id.startswith("u_")
    assert len(signature) == 64
    assert auth.verify_token(token) == user_id

    status = client.get("/api/auth/session", headers={"X-SignalForge-Token": token})
    assert status.json() == {"authenticated": True, "user_id": user_id}


def test_two_sessions_get_different_ids(monkeypatch):
    client = _client(monkeypatch)
    assert _issue(client) != _issue(client)


def test_tampered_and_guessed_tokens_are_rejected(monkeypatch):
    client = _client(monkeypatch)
    token = _issue(client)
    user_id = token.rpartition(".")[0]

    # A guessed id with no signature, a swapped signature, and the old
    # trust-the-client header must all fail.
    assert auth.verify_token(user_id) is None
    assert auth.verify_token(f"{user_id}.{'0' * 64}") is None
    assert auth.verify_token("sagar-patel.whatever") is None

    forged = f"u_{'a' * 32}.{token.rpartition('.')[2]}"
    assert auth.verify_token(forged) is None


def test_protected_routes_reject_anonymous_and_forged_callers(monkeypatch):
    client = _client(monkeypatch)

    for path in ("/api/profile", "/api/workbench"):
        assert client.get(path).status_code == 401
        # The pre-auth header is no longer honoured.
        assert client.get(path, headers={"X-SignalForge-User": "sagar"}).status_code == 401
        assert client.get(path, headers={"X-SignalForge-Token": "u_deadbeef.bad"}).status_code == 401


def test_sessions_cannot_read_each_others_data(monkeypatch):
    client = _client(monkeypatch)
    store: dict[str, object] = {}
    monkeypatch.setattr("app.routers.workbench.kv_get", lambda key: store.get(key))
    monkeypatch.setattr(
        "app.routers.workbench.kv_set",
        lambda key, value, ttl=0: store.__setitem__(key, value),
    )

    alpha, beta = _issue(client), _issue(client)
    payload_a = {"dismissed": ["opportunity:a"], "custom_tasks": []}
    payload_b = {"dismissed": ["opportunity:b"], "custom_tasks": []}

    client.post("/api/workbench", json=payload_a, headers={"X-SignalForge-Token": alpha})
    client.post("/api/workbench", json=payload_b, headers={"X-SignalForge-Token": beta})

    assert client.get("/api/workbench", headers={"X-SignalForge-Token": alpha}).json() == payload_a
    assert client.get("/api/workbench", headers={"X-SignalForge-Token": beta}).json() == payload_b


def test_production_without_secret_refuses_to_issue(monkeypatch):
    monkeypatch.delenv("SESSION_SECRET", raising=False)
    monkeypatch.setenv("VERCEL", "1")
    monkeypatch.setattr(auth, "_cached_secret", None)

    client = TestClient(main.app)
    assert client.post("/api/auth/session").status_code == 503
    assert client.get("/api/profile").status_code == 401
