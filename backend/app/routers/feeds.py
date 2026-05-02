from fastapi import APIRouter
from ..ingestion.sources import read_cache

router = APIRouter(prefix="/api/feeds", tags=["feeds"])


@router.get("/news")
async def get_news():
    return read_cache("news") or []


@router.get("/jobs")
async def get_jobs():
    return read_cache("jobs") or []


@router.get("/digest")
async def get_digest():
    return read_cache("digest") or {"headline": None, "sections": [], "action_item": None, "generated_at": None}


@router.get("/meta")
async def get_meta():
    return read_cache("meta") or {"last_refresh": None, "counts": {}}
