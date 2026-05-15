import asyncio
from fastapi import APIRouter, BackgroundTasks
from ..ingestion.sources import read_cache, fetch_sheet_companies

router = APIRouter(prefix="/api/feeds", tags=["feeds"])


async def _bg_fetch_news():
    """Background refresh: fetch + cache news (runs after response sent)."""
    try:
        from ..ingestion.sources import fetch_news, write_cache
        from datetime import datetime, timezone
        news = await fetch_news(limit=50)
        if news:
            write_cache("news", news)
            meta = read_cache("meta") or {"last_refresh": None, "counts": {}}
            meta["counts"]["news"] = len(news)
            meta["last_refresh"] = datetime.now(timezone.utc).isoformat()
            write_cache("meta", meta)
    except Exception:
        pass


async def _bg_fetch_jobs():
    try:
        from ..ingestion.sources import fetch_jobs, write_cache
        from datetime import datetime, timezone
        jobs = await fetch_jobs(limit=100)
        if jobs:
            write_cache("jobs", jobs)
            meta = read_cache("meta") or {"last_refresh": None, "counts": {}}
            meta["counts"]["jobs"] = len(jobs)
            meta["last_refresh"] = datetime.now(timezone.utc).isoformat()
            write_cache("meta", meta)
    except Exception:
        pass


async def _bg_fetch_papers():
    try:
        from ..ingestion.sources import fetch_papers, write_cache
        from datetime import datetime, timezone
        papers = await fetch_papers(limit=24)
        if papers:
            write_cache("papers", papers)
            meta = read_cache("meta") or {"last_refresh": None, "counts": {}}
            meta["counts"]["papers"] = len(papers)
            meta["last_refresh"] = datetime.now(timezone.utc).isoformat()
            write_cache("meta", meta)
    except Exception:
        pass


@router.get("/news")
async def get_news(background_tasks: BackgroundTasks):
    cached = read_cache("news")
    if cached and isinstance(cached, list) and len(cached) > 0:
        return cached
    # Cache cold → trigger background fetch and return empty for now
    # (client can poll or reload; next hit will have data)
    background_tasks.add_task(_bg_fetch_news)
    # Attempt a fast synchronous news fetch (3 sources, short timeout)
    try:
        from ..ingestion.sources import RSS_SOURCES, _HEADERS, _is_relevant, _extract_tags
        import feedparser, httpx
        items = []
        fast_sources = RSS_SOURCES[:4]  # first 4 are fastest
        async with httpx.AsyncClient(timeout=5, follow_redirects=True) as client:
            tasks = [client.get(url, headers=_HEADERS) for _, url in fast_sources]
            responses = await asyncio.gather(*tasks, return_exceptions=True)
        for resp in responses:
            if isinstance(resp, Exception):
                continue
            feed = feedparser.parse(resp.text)
            for entry in feed.entries[:10]:
                title = entry.get("title", "")
                body  = entry.get("summary", "")
                if _is_relevant(title + " " + body):
                    items.append({
                        "title": title,
                        "url": entry.get("link", ""),
                        "source": entry.get("feed", {}).get("title", "News"),
                        "published": entry.get("published", ""),
                        "tags": _extract_tags(title + " " + body),
                    })
        if items:
            from ..ingestion.sources import write_cache
            write_cache("news", items)
            return items
    except Exception:
        pass
    return []


@router.get("/jobs")
async def get_jobs(background_tasks: BackgroundTasks):
    cached = read_cache("jobs")
    if cached and isinstance(cached, list) and len(cached) > 0:
        return cached
    background_tasks.add_task(_bg_fetch_jobs)
    return []


@router.get("/papers")
async def get_papers(background_tasks: BackgroundTasks):
    cached = read_cache("papers")
    if cached and isinstance(cached, list) and len(cached) > 0:
        return cached
    background_tasks.add_task(_bg_fetch_papers)
    return []


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
