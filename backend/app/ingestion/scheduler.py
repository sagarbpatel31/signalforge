import asyncio
import logging
import os
from datetime import datetime, timedelta, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from .sources import fetch_jobs, fetch_news, fetch_papers, read_cache, write_cache

logger = logging.getLogger(__name__)

SOURCE_NAMES = ("news", "papers", "jobs")
HISTORY_DAYS = 30
_meta_lock = asyncio.Lock()
_source_locks = {name: asyncio.Lock() for name in SOURCE_NAMES}


def _update_weekly_baseline(counts: dict) -> None:
    """Persist a comparison baseline once per seven-day window."""
    from ..kv import kv_get, kv_set

    baseline = kv_get("cache:weekly_baseline")
    now = datetime.now(timezone.utc)

    if baseline:
        try:
            saved_at = datetime.fromisoformat(baseline["saved_at"])
            if now - saved_at < timedelta(days=7):
                return
        except Exception:
            pass

    snapshot = {
        "news": counts.get("news", 0),
        "papers": counts.get("papers", 0),
        "jobs": counts.get("jobs", 0),
        "saved_at": now.isoformat(),
    }
    kv_set("cache:weekly_baseline", snapshot, ttl=60 * 60 * 24 * 14)
    logger.info("Weekly baseline saved: %s", snapshot)


def _record_daily_snapshot(counts: dict) -> None:
    """Keep one last-known-good count snapshot per UTC day for 30 days."""
    from ..kv import kv_get, kv_set

    today = datetime.now(timezone.utc).date().isoformat()
    entry = {
        "date": today,
        "news": counts.get("news", 0),
        "papers": counts.get("papers", 0),
        "jobs": counts.get("jobs", 0),
    }

    history = kv_get("cache:history")
    if not isinstance(history, list):
        history = []

    history = [h for h in history if isinstance(h, dict) and h.get("date") != today]
    history.append(entry)
    history.sort(key=lambda h: h.get("date", ""))
    history = history[-HISTORY_DAYS:]

    kv_set("cache:history", history, ttl=60 * 60 * 24 * (HISTORY_DAYS + 7))
    logger.info("Daily snapshot recorded: %s (%d days retained)", entry, len(history))


def _cached_count(name: str, fallback: int = 0) -> int:
    cached = read_cache(name)
    if isinstance(cached, list):
        return len(cached)
    return fallback if isinstance(fallback, int) and fallback >= 0 else 0


def _normalize_sources(meta: dict) -> dict[str, dict]:
    counts = meta.get("counts", {}) if isinstance(meta.get("counts"), dict) else {}
    saved_sources = meta.get("sources", {}) if isinstance(meta.get("sources"), dict) else {}
    last_refresh = meta.get("last_refresh")
    normalized: dict[str, dict] = {}

    for name in SOURCE_NAMES:
        saved = saved_sources.get(name, {}) if isinstance(saved_sources.get(name), dict) else {}
        item_count = _cached_count(name, counts.get(name, 0))
        status = saved.get("status")
        if status not in {"healthy", "error", "cold"}:
            status = "healthy" if item_count > 0 else "cold"
        normalized[name] = {
            "status": status,
            "item_count": item_count,
            "last_attempt": saved.get("last_attempt") or (last_refresh if item_count else None),
            "last_success": saved.get("last_success") or (last_refresh if item_count else None),
            "error_code": saved.get("error_code") if status == "error" else None,
        }
    return normalized


def _error_code(result: object) -> str:
    if isinstance(result, list):
        return "empty_result"
    if isinstance(result, (asyncio.TimeoutError, TimeoutError)) or "timeout" in type(result).__name__.lower():
        return "timeout"
    return "upstream_error"


def _apply_result(name: str, result: object, previous: dict, attempted_at: str) -> dict:
    if isinstance(result, list) and result:
        write_cache(name, result)
        return {
            "status": "healthy",
            "item_count": len(result),
            "last_attempt": attempted_at,
            "last_success": attempted_at,
            "error_code": None,
        }

    code = _error_code(result)
    logger.warning("Ingestion source %s failed with %s", name, code)
    return {
        "status": "error",
        "item_count": _cached_count(name, previous.get("item_count", 0)),
        "last_attempt": attempted_at,
        "last_success": previous.get("last_success"),
        "error_code": code,
    }


def _build_meta(sources: dict[str, dict], previous: dict) -> dict:
    counts = {name: int(sources[name]["item_count"]) for name in SOURCE_NAMES}
    statuses = [sources[name]["status"] for name in SOURCE_NAMES]
    total = sum(counts.values())

    if all(status == "healthy" for status in statuses):
        source_mode = "live"
        source_detail = f"All sources healthy with {total} cached items."
    elif total > 0:
        source_mode = "degraded"
        failed = ", ".join(name for name in SOURCE_NAMES if sources[name]["status"] != "healthy")
        source_detail = f"Serving last-known-good data; source issues: {failed}."
    else:
        source_mode = "fallback"
        source_detail = "Feed cache is cold; curated fallback data remains available."

    successes = [
        source.get("last_success")
        for source in sources.values()
        if source.get("last_success")
    ]
    return {
        "last_refresh": max(successes) if successes else previous.get("last_refresh"),
        "counts": counts,
        "source_mode": source_mode,
        "source_detail": source_detail,
        "sources": sources,
    }


async def _fetch_source(name: str) -> list:
    if name == "news":
        return await fetch_news(limit=50)
    if name == "papers":
        return await fetch_papers(limit=24)
    if name == "jobs":
        return await fetch_jobs(limit=100)
    raise ValueError(f"Unsupported ingestion source: {name}")


def cold_refresh_enabled() -> bool:
    """Allow fallback-triggered fetches locally; production relies on cron."""
    override = os.environ.get("ENABLE_COLD_FEED_REFRESH", "").strip().lower()
    if override in {"1", "true", "yes"}:
        return True
    if override in {"0", "false", "no"}:
        return False
    return not (
        bool(os.environ.get("VERCEL"))
        or os.environ.get("ENV", "").strip().lower() in {"production", "prod"}
    )


async def refresh_source(name: str) -> dict:
    """Refresh one cold source while preserving every other source's health."""
    previous = read_cache("meta")
    previous = previous if isinstance(previous, dict) else {}
    current = _normalize_sources(previous)[name]
    if not cold_refresh_enabled():
        return current

    async with _source_locks[name]:
        previous = read_cache("meta")
        previous = previous if isinstance(previous, dict) else {}
        sources = _normalize_sources(previous)
        last_attempt = sources[name].get("last_attempt")
        if last_attempt:
            try:
                attempted = datetime.fromisoformat(last_attempt)
                if datetime.now(timezone.utc) - attempted < timedelta(seconds=60):
                    return sources[name]
            except (TypeError, ValueError):
                pass

        try:
            result: object = await _fetch_source(name)
        except Exception as exc:
            result = exc
            logger.exception("Ingestion fetch failed for %s", name)

        attempted_at = datetime.now(timezone.utc).isoformat()
        async with _meta_lock:
            previous = read_cache("meta")
            previous = previous if isinstance(previous, dict) else {}
            sources = _normalize_sources(previous)
            sources[name] = _apply_result(name, result, sources[name], attempted_at)
            meta = _build_meta(sources, previous)
            write_cache("meta", meta)
        return sources[name]


async def run_ingestion() -> dict:
    logger.info("Ingestion started")
    results = await asyncio.gather(
        fetch_news(),
        fetch_papers(),
        fetch_jobs(),
        return_exceptions=True,
    )
    attempted_at = datetime.now(timezone.utc).isoformat()

    async with _meta_lock:
        previous = read_cache("meta")
        previous = previous if isinstance(previous, dict) else {}
        sources = _normalize_sources(previous)
        for name, result in zip(SOURCE_NAMES, results):
            sources[name] = _apply_result(name, result, sources[name], attempted_at)
        meta = _build_meta(sources, previous)
        write_cache("meta", meta)

    counts = meta["counts"]
    _update_weekly_baseline(counts)
    _record_daily_snapshot(counts)
    logger.info("Ingestion complete: %s (%s)", counts, meta["source_mode"])

    try:
        from ..routers.twitter import generate_posts_from_cache

        posts = generate_posts_from_cache()
        if posts:
            write_cache("posts", [p.model_dump() for p in posts])
            logger.info("Posts refreshed: %d drafts", len(posts))
    except Exception:
        logger.exception("Post refresh after ingestion failed")

    return counts


def create_scheduler() -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler(timezone="UTC")
    scheduler.add_job(
        run_ingestion,
        trigger=IntervalTrigger(hours=12),
        id="ingestion",
        name="Data Ingestion (12h)",
        replace_existing=True,
        misfire_grace_time=600,
    )
    return scheduler
