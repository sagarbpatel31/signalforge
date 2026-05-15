from fastapi import APIRouter
from ..ingestion.sources import read_cache, fetch_sheet_companies

router = APIRouter(prefix="/api/feeds", tags=["feeds"])


async def _ensure_news() -> list:
    """Return cached news; if empty, fetch live and cache it."""
    cached = read_cache("news")
    if cached and isinstance(cached, list) and len(cached) > 0:
        return cached
    # Cold cache — fetch on-demand
    try:
        from ..ingestion.sources import fetch_news, write_cache
        news = await fetch_news(limit=50)
        if news:
            write_cache("news", news)
        return news
    except Exception:
        return []


async def _ensure_jobs() -> list:
    """Return cached jobs; if empty, fetch live and cache it."""
    cached = read_cache("jobs")
    if cached and isinstance(cached, list) and len(cached) > 0:
        return cached
    try:
        from ..ingestion.sources import fetch_jobs, write_cache
        jobs = await fetch_jobs(limit=100)
        if jobs:
            write_cache("jobs", jobs)
        return jobs
    except Exception:
        return []


async def _ensure_papers() -> list:
    """Return cached papers; if empty, fetch live and cache it."""
    cached = read_cache("papers")
    if cached and isinstance(cached, list) and len(cached) > 0:
        return cached
    try:
        from ..ingestion.sources import fetch_papers, write_cache
        papers = await fetch_papers(limit=24)
        if papers:
            write_cache("papers", papers)
        return papers
    except Exception:
        return []


@router.get("/news")
async def get_news():
    return await _ensure_news()


@router.get("/jobs")
async def get_jobs():
    return await _ensure_jobs()


@router.get("/papers")
async def get_papers():
    return await _ensure_papers()


@router.get("/digest")
async def get_digest():
    return read_cache("digest") or {"headline": None, "sections": [], "action_item": None, "generated_at": None}


@router.get("/meta")
async def get_meta():
    return read_cache("meta") or {"last_refresh": None, "counts": {}}


@router.get("/sheet-companies")
async def get_sheet_companies():
    """Returns all company names from the Google Sheet watchlist."""
    return await fetch_sheet_companies()
