"""
Key-value storage abstraction.
Production: Upstash Redis (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN)
Local dev:  falls back to file-based storage in backend/data/
"""
import json
import logging
import os
from pathlib import Path

logger = logging.getLogger(__name__)

_DATA_DIR = Path(__file__).parent.parent.parent / "data"
_CACHE_DIR = _DATA_DIR / "cache"


def _redis():
    url = os.environ.get("UPSTASH_REDIS_REST_URL", "")
    token = os.environ.get("UPSTASH_REDIS_REST_TOKEN", "")
    if not (url and token):
        return None
    try:
        from upstash_redis import Redis
        return Redis(url=url, token=token)
    except Exception as exc:
        logger.warning("upstash_redis unavailable: %s", exc)
        return None


def kv_get(key: str):
    r = _redis()
    if r is not None:
        try:
            val = r.get(key)
            return json.loads(val) if val else None
        except Exception as exc:
            logger.warning("Redis GET %s failed: %s", key, exc)

    # File fallback
    try:
        if key.startswith("cache:"):
            p = _CACHE_DIR / f"{key[6:]}.json"
            return json.loads(p.read_text()) if p.exists() else None
        if key == "profile":
            p = _DATA_DIR / "profile.json"
            return json.loads(p.read_text()) if p.exists() else None
    except Exception:
        pass
    return None


def kv_set(key: str, value, ttl: int = 86_400) -> None:  # 24h default; cron overwrites every 12h
    r = _redis()
    if r is not None:
        try:
            r.set(key, json.dumps(value), ex=ttl)
            return
        except Exception as exc:
            logger.warning("Redis SET %s failed: %s", key, exc)

    # File fallback
    try:
        if key.startswith("cache:"):
            _CACHE_DIR.mkdir(parents=True, exist_ok=True)
            (_CACHE_DIR / f"{key[6:]}.json").write_text(json.dumps(value))
        elif key == "profile":
            _DATA_DIR.mkdir(parents=True, exist_ok=True)
            (_DATA_DIR / "profile.json").write_text(json.dumps(value))
    except Exception as exc:
        logger.warning("File fallback SET %s failed: %s", key, exc)
