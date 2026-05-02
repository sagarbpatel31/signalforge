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
    counts = {}

    try:
        news = await fetch_news()
        write_cache("news", news)
        counts["news"] = len(news)
        logger.info(f"  news: {len(news)} items")
    except Exception as e:
        logger.error(f"  news failed: {e}")
        counts["news"] = 0

    try:
        papers = await fetch_papers()
        write_cache("papers", papers)
        counts["papers"] = len(papers)
        logger.info(f"  papers: {len(papers)} items")
    except Exception as e:
        logger.error(f"  papers failed: {e}")
        counts["papers"] = 0

    try:
        jobs = await fetch_jobs()
        write_cache("jobs", jobs)
        counts["jobs"] = len(jobs)
        logger.info(f"  jobs: {len(jobs)} items")
    except Exception as e:
        logger.error(f"  jobs failed: {e}")
        counts["jobs"] = 0

    meta = {"last_refresh": datetime.now(timezone.utc).isoformat(), "counts": counts}
    write_cache("meta", meta)

    # Auto-generate digest if OpenAI key is configured
    key = os.environ.get("OPENAI_API_KEY", "")
    if key and key != "your_key_here":
        try:
            from ..routers.generate import _generate_digest_content
            digest = await _generate_digest_content()
            write_cache("digest", digest)
            logger.info("  digest: generated")
        except Exception as e:
            logger.error(f"  digest failed: {e}")

    logger.info(f"Ingestion complete: {counts}")
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
