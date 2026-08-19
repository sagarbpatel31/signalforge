"""Small fixed-window limits for costly mutation endpoints."""
import hashlib
import os
import threading
import time

from fastapi import HTTPException

from .kv import kv_increment

_memory_lock = threading.Lock()
_memory_windows: dict[str, tuple[int, int]] = {}


def _env_limit(name: str, default: int) -> int:
    try:
        return max(1, int(os.environ.get(name, default)))
    except (TypeError, ValueError):
        return default


def enforce_rate_limit(
    scope: str,
    identifier: str,
    *,
    limit: int,
    window_seconds: int,
) -> None:
    """Raise 429 when an identity exceeds a fixed-window request budget."""
    now = int(time.time())
    bucket = now // window_seconds
    retry_after = max(1, window_seconds - (now % window_seconds))
    identity_hash = hashlib.sha256(identifier.encode()).hexdigest()[:24]
    base_key = f"rate:{scope}:{identity_hash}"
    redis_key = f"{base_key}:{bucket}"

    count = kv_increment(redis_key, window_seconds + 60)
    if count is None:
        with _memory_lock:
            saved_bucket, saved_count = _memory_windows.get(base_key, (-1, 0))
            count = saved_count + 1 if saved_bucket == bucket else 1
            _memory_windows[base_key] = (bucket, count)

    if count > limit:
        raise HTTPException(
            status_code=429,
            detail="Request limit reached. Try again later.",
            headers={
                "Retry-After": str(retry_after),
                "X-RateLimit-Limit": str(limit),
            },
        )


def enforce_ai_limit(user_id: str) -> None:
    enforce_rate_limit(
        "ai-generation",
        user_id,
        limit=_env_limit("AI_RATE_LIMIT_PER_HOUR", 20),
        window_seconds=60 * 60,
    )


def enforce_refresh_limit(user_id: str) -> None:
    enforce_rate_limit(
        "feed-refresh",
        user_id,
        limit=_env_limit("FEED_REFRESH_RATE_LIMIT", 3),
        window_seconds=15 * 60,
    )
