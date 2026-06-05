from fastapi.testclient import TestClient

import main


def test_workbench_defaults_empty():
    client = TestClient(main.app)
    res = client.get("/api/workbench")
    assert res.status_code == 200
    assert res.json() == {"dismissed": [], "custom_tasks": []}


def test_workbench_roundtrip(monkeypatch):
    store: dict[str, object] = {}

    monkeypatch.setattr("app.routers.workbench.kv_get", lambda key: store.get(key))
    monkeypatch.setattr(
        "app.routers.workbench.kv_set",
        lambda key, value, ttl=0: store.__setitem__(key, value),
    )

    client = TestClient(main.app)
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
    }

    post = client.post("/api/workbench", json=payload)
    assert post.status_code == 200
    assert post.json() == payload

    get = client.get("/api/workbench")
    assert get.status_code == 200
    assert get.json() == payload


def test_workbench_is_scoped_by_user_header(monkeypatch):
    store: dict[str, object] = {}

    monkeypatch.setattr("app.routers.workbench.kv_get", lambda key: store.get(key))
    monkeypatch.setattr(
        "app.routers.workbench.kv_set",
        lambda key, value, ttl=0: store.__setitem__(key, value),
    )

    client = TestClient(main.app)
    alpha = {"dismissed": ["opportunity:a"], "custom_tasks": []}
    beta = {"dismissed": ["opportunity:b"], "custom_tasks": []}

    client.post("/api/workbench", json=alpha, headers={"X-SignalForge-User": "alpha"})
    client.post("/api/workbench", json=beta, headers={"X-SignalForge-User": "beta"})

    assert client.get("/api/workbench", headers={"X-SignalForge-User": "alpha"}).json() == alpha
    assert client.get("/api/workbench", headers={"X-SignalForge-User": "beta"}).json() == beta
