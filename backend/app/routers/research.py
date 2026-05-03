from fastapi import APIRouter
from ..schemas import Paper
from ..mock_data import PAPERS
from ..ingestion.sources import read_cache

router = APIRouter(prefix="/api", tags=["research"])


def _cache_to_papers(items: list, limit: int | None = None) -> list[Paper]:
    subset = items[:limit] if limit else items
    return [
        Paper(
            title=p["title"][:120],
            venue=p.get("venue", "arXiv"),
            tags=p.get("tags", [])[:3],
            read=p.get("read", False),
            url=p.get("url", ""),
        )
        for p in subset
    ]


@router.get("/research", response_model=list[Paper])
async def get_research() -> list[Paper]:
    cached = read_cache("papers")
    if cached:
        return _cache_to_papers(cached, limit=4)
    return PAPERS[:4]


@router.get("/research/all", response_model=list[Paper])
async def get_research_all() -> list[Paper]:
    cached = read_cache("papers")
    if cached:
        return _cache_to_papers(cached)
    return PAPERS
