from fastapi.testclient import TestClient

import main
from app import auth
from app.routers.auth import _merge_workbench


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

    for path in ("/api/profile", "/api/workbench", "/api/bookmarks"):
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
    empty_daily = {
        "date": "",
        "updated_at": "",
        "reviewed_signal_ids": [],
        "completed_task_ids": [],
        "post_done": False,
    }
    payload_a = {
        "dismissed": ["opportunity:a"],
        "custom_tasks": [],
        "daily_progress": empty_daily,
    }
    payload_b = {
        "dismissed": ["opportunity:b"],
        "custom_tasks": [],
        "daily_progress": empty_daily,
    }

    client.post("/api/workbench", json=payload_a, headers={"X-SignalForge-Token": alpha})
    client.post("/api/workbench", json=payload_b, headers={"X-SignalForge-Token": beta})

    assert client.get("/api/workbench", headers={"X-SignalForge-Token": alpha}).json() == payload_a
    assert client.get("/api/workbench", headers={"X-SignalForge-Token": beta}).json() == payload_b


def test_workbench_merge_keeps_a_newer_explicit_daily_reset():
    stale = {
        "dismissed": [],
        "custom_tasks": [],
        "daily_progress": {
            "date": "2026-08-11",
            "updated_at": "2026-08-11T18:00:00.000Z",
            "reviewed_signal_ids": ["signal-a"],
            "completed_task_ids": ["task-a"],
            "post_done": True,
        },
    }
    reset = {
        "dismissed": [],
        "custom_tasks": [],
        "daily_progress": {
            "date": "2026-08-11",
            "updated_at": "2026-08-11T18:01:00.000Z",
            "reviewed_signal_ids": [],
            "completed_task_ids": [],
            "post_done": False,
        },
    }

    assert _merge_workbench(stale, reset)["daily_progress"] == reset["daily_progress"]


def test_production_without_secret_refuses_to_issue(monkeypatch):
    monkeypatch.delenv("SESSION_SECRET", raising=False)
    monkeypatch.setenv("VERCEL", "1")
    monkeypatch.setattr(auth, "_cached_secret", None)

    client = TestClient(main.app)
    assert client.post("/api/auth/session").status_code == 503
    assert client.get("/api/profile").status_code == 401


def test_clerk_accounts_are_isolated(monkeypatch):
    client = _client(monkeypatch)
    store: dict[str, object] = {}
    monkeypatch.setenv("CLERK_SECRET_KEY", "sk_test_example")
    monkeypatch.setattr(
        auth,
        "_verify_clerk_request",
        lambda request: f"c_{request.headers['authorization'].removeprefix('Bearer ')}",
    )
    monkeypatch.setattr("app.routers.profile.kv_get", lambda key: store.get(key))
    monkeypatch.setattr(
        "app.routers.profile.kv_set",
        lambda key, value, ttl=0: store.__setitem__(key, value),
    )

    alpha = {
        "name": "Alpha",
        "domains": ["Edge AI"],
        "experience": "Senior Engineer",
        "goal": "Build a startup",
    }
    beta = {**alpha, "name": "Beta", "domains": ["Robotics"]}

    client.post("/api/profile", json=alpha, headers={"Authorization": "Bearer alpha"})
    client.post("/api/profile", json=beta, headers={"Authorization": "Bearer beta"})

    assert client.get("/api/profile", headers={"Authorization": "Bearer alpha"}).json()["name"] == "Alpha"
    assert client.get("/api/profile", headers={"Authorization": "Bearer beta"}).json()["name"] == "Beta"


def test_invalid_bearer_never_downgrades_to_legacy_session(monkeypatch):
    client = _client(monkeypatch)
    legacy = _issue(client)
    monkeypatch.setenv("CLERK_SECRET_KEY", "sk_test_example")
    monkeypatch.setattr(auth, "_verify_clerk_request", lambda request: None)

    response = client.get(
        "/api/workbench",
        headers={
            "Authorization": "Bearer invalid",
            "X-SignalForge-Token": legacy,
        },
    )
    assert response.status_code == 401


def test_production_clerk_mode_stops_issuing_guest_sessions(monkeypatch):
    monkeypatch.setenv("VERCEL", "1")
    monkeypatch.setenv("SESSION_SECRET", "test-secret")
    monkeypatch.setenv("CLERK_SECRET_KEY", "sk_test_example")
    monkeypatch.delenv("ALLOW_LEGACY_SESSIONS", raising=False)
    monkeypatch.setattr(auth, "_cached_secret", None)

    client = TestClient(main.app)
    assert client.post("/api/auth/session").status_code == 403


def test_legacy_data_migrates_once_and_source_is_removed(monkeypatch):
    client = _client(monkeypatch)
    legacy = _issue(client)
    legacy_id = legacy.rpartition(".")[0]
    account_id = "c_account"
    store: dict[str, object] = {
        f"profile:{legacy_id}": {
            "name": "Legacy User",
            "domains": ["Robotics"],
            "experience": "Senior Engineer",
            "goal": "Build a startup",
        },
        f"workbench:{legacy_id}": {
            "dismissed": ["startup:legacy"],
            "custom_tasks": [],
            "daily_progress": {
                "date": "2026-08-11",
                "updated_at": "2026-08-11T18:00:00.000Z",
                "reviewed_signal_ids": ["signal-legacy"],
                "completed_task_ids": ["task-legacy"],
                "post_done": True,
            },
        },
        f"bookmarks:{legacy_id}": {
            "papers": [{
                "id": "paper-1",
                "title": "Paper",
                "sub": "arXiv",
                "url": "",
                "type": "paper",
            }],
            "startups": [],
            "roles": [],
            "opportunities": [],
        },
    }
    monkeypatch.setenv("CLERK_SECRET_KEY", "sk_test_example")
    monkeypatch.setattr(auth, "_verify_clerk_request", lambda request: account_id)
    monkeypatch.setattr("app.routers.auth.kv_get", lambda key: store.get(key))
    monkeypatch.setattr(
        "app.routers.auth.kv_set",
        lambda key, value, ttl=0: store.__setitem__(key, value),
    )
    monkeypatch.setattr("app.routers.auth.kv_delete", lambda key: store.pop(key, None))

    headers = {
        "Authorization": "Bearer account",
        "X-SignalForge-Legacy-Token": legacy,
    }
    response = client.post("/api/auth/migrate", headers=headers)
    assert response.status_code == 200
    assert response.json()["profile_migrated"] is True
    assert store[f"profile:{account_id}"]["name"] == "Legacy User"
    assert store[f"workbench:{account_id}"]["dismissed"] == ["startup:legacy"]
    assert store[f"workbench:{account_id}"]["daily_progress"]["post_done"] is True
    assert len(store[f"bookmarks:{account_id}"]["papers"]) == 1
    assert f"profile:{legacy_id}" not in store

    second = client.post("/api/auth/migrate", headers=headers)
    assert second.status_code == 200
    assert second.json()["migrated"] is False


def test_personalized_generation_requires_identity(monkeypatch):
    client = _client(monkeypatch)
    for path in (
        "/api/generate/brief",
        "/api/generate/posts",
        "/api/generate/tasks",
        "/api/generate/weekly",
        "/api/generate/digest",
        "/api/posts/refresh",
        "/api/feeds/refresh",
    ):
        assert client.post(path).status_code == 401
    assert client.get("/api/generate/digest").status_code == 401
