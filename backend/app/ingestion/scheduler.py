import asyncio
import logging
import os
from datetime import datetime, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from .sources import fetch_news, fetch_papers, fetch_jobs, write_cache

logger = logging.getLogger(__name__)


async def run_ingestion() -> dict:
    logger.info("Ingestion started")

    # Fetch all sources in parallel to stay within Vercel's 10s function limit
    results = await asyncio.gather(
        fetch_news(),
        fetch_papers(),
        fetch_jobs(),
        return_exceptions=True,
    )

    news = results[0] if isinstance(results[0], list) else []
    papers = results[1] if isinstance(results[1], list) else []
    jobs = results[2] if isinstance(results[2], list) else []

    if news:
        write_cache("news", news)
    if papers:
        write_cache("papers", papers)
    if jobs:
        write_cache("jobs", jobs)

    counts = {"news": len(news), "papers": len(papers), "jobs": len(jobs)}
    write_cache("meta", {"last_refresh": datetime.now(timezone.utc).isoformat(), "counts": counts})

    logger.info("Ingestion complete: %s", counts)

    # Auto-generate digest if OpenAI key present (skipped on Vercel cron — too slow)
    if not os.environ.get("VERCEL") and os.environ.get("OPENAI_API_KEY", "") not in ("", "your_key_here"):
        try:
            from ..routers.generate import _generate_digest_content
            digest = await _generate_digest_content()
            write_cache("digest", digest)
            logger.info("  digest: generated")
        except Exception as exc:
            logger.error("  digest failed: %s", exc)

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
