from fastapi.testclient import TestClient

import main
from app import auth


def _client_and_token(monkeypatch) -> tuple[TestClient, str]:
    monkeypatch.setenv("SESSION_SECRET", "test-secret")
    monkeypatch.setattr(auth, "_cached_secret", None)
    client = TestClient(main.app)
    return client, client.post("/api/auth/session").json()["token"]


def test_workbench_requires_a_session(monkeypatch):
    client, _ = _client_and_token(monkeypatch)
    assert client.get("/api/workbench").status_code == 401


def test_workbench_defaults_empty(monkeypatch):
    client, token = _client_and_token(monkeypatch)
    res = client.get("/api/workbench", headers={"X-SignalForge-Token": token})
    assert res.status_code == 200
    assert res.json() == {
        "dismissed": [],
        "custom_tasks": [],
        "daily_progress": {
            "date": "",
            "updated_at": "",
            "reviewed_signal_ids": [],
            "completed_task_ids": [],
            "post_done": False,
        },
    }


def test_workbench_roundtrip(monkeypatch):
    store: dict[str, object] = {}

    monkeypatch.setattr("app.routers.workbench.kv_get", lambda key: store.get(key))
    monkeypatch.setattr(
        "app.routers.workbench.kv_set",
        lambda key, value, ttl=0: store.__setitem__(key, value),
    )

    client, token = _client_and_token(monkeypatch)
    headers = {"X-SignalForge-Token": token}
    payload = {
        "dismissed": ["opportunity:foo"],
        "custom_tasks": [
            {
                "id": "startup:bar",
                "priority": "P1",
                "task": "Research startup: Bar",
                "domain": "Edge AI",
                "time": "30m",
                "description": "Investigate this company",
            }
        ],
        "daily_progress": {
            "date": "2026-08-11",
            "updated_at": "2026-08-11T18:00:00.000Z",
            "reviewed_signal_ids": ["signal-a"],
            "completed_task_ids": ["startup:bar"],
            "post_done": True,
        },
    }

    post = client.post("/api/workbench", json=payload, headers=headers)
    assert post.status_code == 200
    assert post.json() == payload

    get = client.get("/api/workbench", headers=headers)
    assert get.status_code == 200
    assert get.json() == payload
