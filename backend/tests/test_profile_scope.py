from fastapi.testclient import TestClient

import main
from app import auth


def test_profile_is_scoped_by_session_token(monkeypatch):
    store: dict[str, object] = {}

    monkeypatch.setenv("SESSION_SECRET", "test-secret")
    monkeypatch.setattr(auth, "_cached_secret", None)
    monkeypatch.setattr("app.routers.profile.kv_get", lambda key: store.get(key))
    monkeypatch.setattr(
        "app.routers.profile.kv_set",
        lambda key, value, ttl=0: store.__setitem__(key, value),
    )

    client = TestClient(main.app)
    alpha_token = client.post("/api/auth/session").json()["token"]
    beta_token = client.post("/api/auth/session").json()["token"]

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

    client.post("/api/profile", json=alpha, headers={"X-SignalForge-Token": alpha_token})
    client.post("/api/profile", json=beta, headers={"X-SignalForge-Token": beta_token})

    assert client.get("/api/profile", headers={"X-SignalForge-Token": alpha_token}).json()["name"] == "Alpha User"
    assert client.get("/api/profile", headers={"X-SignalForge-Token": beta_token}).json()["name"] == "Beta User"

    # Knowing a handle no longer grants access to that handle's profile.
    assert client.get("/api/profile", headers={"X-SignalForge-User": "@alpha"}).status_code == 401
