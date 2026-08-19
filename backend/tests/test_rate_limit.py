import pytest
from fastapi import HTTPException

from app import rate_limit


def _local_limits(monkeypatch, now: int = 1_800_000_000) -> None:
    monkeypatch.setattr(rate_limit, "kv_increment", lambda key, ttl: None)
    monkeypatch.setattr(rate_limit.time, "time", lambda: now)
    rate_limit._memory_windows.clear()


def test_fixed_window_rejects_requests_over_budget(monkeypatch):
    _local_limits(monkeypatch)

    rate_limit.enforce_rate_limit("test", "user-a", limit=2, window_seconds=60)
    rate_limit.enforce_rate_limit("test", "user-a", limit=2, window_seconds=60)

    with pytest.raises(HTTPException) as exc:
        rate_limit.enforce_rate_limit("test", "user-a", limit=2, window_seconds=60)

    assert exc.value.status_code == 429
    assert exc.value.detail == "Request limit reached. Try again later."
    assert int(exc.value.headers["Retry-After"]) > 0


def test_rate_limits_are_isolated_by_identity(monkeypatch):
    _local_limits(monkeypatch)

    rate_limit.enforce_rate_limit("test", "user-a", limit=1, window_seconds=60)
    rate_limit.enforce_rate_limit("test", "user-b", limit=1, window_seconds=60)


def test_rate_limit_uses_hashed_redis_keys(monkeypatch):
    seen: list[tuple[str, int]] = []
    monkeypatch.setattr(
        rate_limit,
        "kv_increment",
        lambda key, ttl: seen.append((key, ttl)) or 1,
    )
    monkeypatch.setattr(rate_limit.time, "time", lambda: 1_800_000_000)

    rate_limit.enforce_rate_limit("ai", "private-user-id", limit=1, window_seconds=60)

    assert seen
    assert "private-user-id" not in seen[0][0]
    assert seen[0][0].startswith("rate:ai:")
