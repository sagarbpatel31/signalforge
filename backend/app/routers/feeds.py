from fastapi import APIRouter, BackgroundTasks, Depends

from ..auth import current_user
from ..ingestion.scheduler import refresh_source, run_ingestion
from ..ingestion.sources import read_cache
from ..rate_limit import enforce_refresh_limit
from ..schemas import FeedMetaResponse

router = APIRouter(prefix="/api/feeds", tags=["feeds"])


@router.post("/refresh")
async def refresh_feeds(
    background_tasks: BackgroundTasks,
    user_id: str = Depends(current_user),
):
    """Schedule one complete refresh for an authenticated, rate-limited user."""
    enforce_refresh_limit(user_id)
    background_tasks.add_task(run_ingestion)
    return {"status": "refreshing"}


@router.get("/news")
async def get_news(background_tasks: BackgroundTasks):
    cached = read_cache("news")
    if isinstance(cached, list) and cached:
        return cached
    background_tasks.add_task(refresh_source, "news")
    return []


@router.get("/jobs")
async def get_jobs(background_tasks: BackgroundTasks):
    cached = read_cache("jobs")
    if isinstance(cached, list) and cached:
        return cached
    background_tasks.add_task(refresh_source, "jobs")
    return []


@router.get("/digest")
async def get_digest():
    return read_cache("digest") or {
        "headline": None,
        "sections": [],
        "action_item": None,
        "generated_at": None,
    }


@router.get("/meta", response_model=FeedMetaResponse)
async def get_meta() -> FeedMetaResponse:
    meta = read_cache("meta")
    meta = meta if isinstance(meta, dict) else {}
    counts = meta.get("counts", {}) if isinstance(meta.get("counts"), dict) else {}
    total = sum(value for value in counts.values() if isinstance(value, int))
    mode = meta.get("source_mode")
    if mode not in {"live", "degraded", "fallback"}:
        mode = "live" if total > 0 else "fallback"

    return FeedMetaResponse(
        last_refresh=meta.get("last_refresh"),
        counts=counts,
        source_mode=mode,
        source_detail=meta.get("source_detail")
        or (
            f"Cache contains {total} tracked feed items."
            if total
            else "Feed cache is cold; curated fallback data remains available."
        ),
        sources=meta.get("sources", {}),
    )
