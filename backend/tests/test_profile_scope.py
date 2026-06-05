from fastapi.testclient import TestClient

import main


def test_profile_is_scoped_by_user_header(monkeypatch):
    store: dict[str, object] = {}

    monkeypatch.setattr("app.routers.profile.kv_get", lambda key: store.get(key))
    monkeypatch.setattr(
        "app.routers.profile.kv_set",
        lambda key, value, ttl=0: store.__setitem__(key, value),
    )

    client = TestClient(main.app)
    alpha = {
        "name": "Alpha User",
        "handle": "@alpha",
        "domains": ["Edge AI"],
        "experience": "Senior Engineer",
        "goal": "Build a startup",
        "current_projects": "Compiler work",
    }
    beta = {
        "name": "Beta User",
        "handle": "@beta",
        "domains": ["Robotics"],
        "experience": "Mid-level Engineer",
        "goal": "Land a top job",
        "current_projects": "ROS2 stack",
    }

    client.post("/api/profile", json=alpha, headers={"X-SignalForge-User": "alpha"})
    client.post("/api/profile", json=beta, headers={"X-SignalForge-User": "beta"})

    assert client.get("/api/profile", headers={"X-SignalForge-User": "alpha"}).json()["name"] == "Alpha User"
    assert client.get("/api/profile", headers={"X-SignalForge-User": "beta"}).json()["name"] == "Beta User"
