import asyncio
import logging
from datetime import datetime, timezone, timedelta

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from .sources import fetch_news, fetch_papers, fetch_jobs, write_cache, read_cache

logger = logging.getLogger(__name__)


def _update_weekly_baseline(counts: dict) -> None:
    """
    Persist weekly_baseline only when:
      - no baseline exists yet, OR
      - baseline is older than 7 days (roll to new week)
    This gives us real "vs last week" deltas in the stat bar.
    """
    from ..kv import kv_get, kv_set

    baseline = kv_get("cache:weekly_baseline")
    now = datetime.now(timezone.utc)

    if baseline:
        try:
            saved_at = datetime.fromisoformat(baseline["saved_at"])
            age = now - saved_at
            if age < timedelta(days=7):
                return  # still within current week — don't overwrite
        except Exception:
            pass  # malformed baseline → overwrite

    snapshot = {
        "news":    counts.get("news", 0),
        "papers":  counts.get("papers", 0),
        "jobs":    counts.get("jobs", 0),
        "saved_at": now.isoformat(),
    }
    kv_set("cache:weekly_baseline", snapshot, ttl=60 * 60 * 24 * 14)  # keep 2 weeks
    logger.info("Weekly baseline saved: %s", snapshot)


HISTORY_DAYS = 30


def _record_daily_snapshot(counts: dict) -> None:
    """
    Append today's counts to cache:history, keeping one entry per UTC date and
    the last HISTORY_DAYS days. Ingestion runs twice a day, so the same-date
    entry is overwritten rather than duplicated. This is what turns the stat
    bar's sparklines into real series instead of decoration.
    """
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


async def run_ingestion() -> dict:
    logger.info("Ingestion started")

    results = await asyncio.gather(
        fetch_news(),
        fetch_papers(),
        fetch_jobs(),
        return_exceptions=True,
    )

    news   = results[0] if isinstance(results[0], list) else []
    papers = results[1] if isinstance(results[1], list) else []
    jobs   = results[2] if isinstance(results[2], list) else []

    if news:
        write_cache("news", news)
    if papers:
        write_cache("papers", papers)
    if jobs:
        write_cache("jobs", jobs)

    counts = {"news": len(news), "papers": len(papers), "jobs": len(jobs)}
    write_cache(
        "meta",
        {"last_refresh": datetime.now(timezone.utc).isoformat(), "counts": counts},
    )

    # Roll weekly baseline if needed
    _update_weekly_baseline(counts)
    _record_daily_snapshot(counts)

    logger.info("Ingestion complete: %s", counts)

    # Refresh X post drafts from live news (no API key needed)
    try:
        from ..routers.twitter import generate_posts_from_cache
        posts = generate_posts_from_cache()
        if posts:
            write_cache("posts", [p.model_dump() for p in posts])
            logger.info("  posts: %d drafts refreshed", len(posts))
    except Exception as exc:
        logger.error("  posts refresh failed: %s", exc)

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
