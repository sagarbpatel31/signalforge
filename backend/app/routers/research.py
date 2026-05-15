from fastapi import APIRouter
from ..schemas import Paper
from ..mock_data import PAPERS
from ..ingestion.sources import read_cache

router = APIRouter(prefix="/api", tags=["research"])


def _fix_arxiv_url(url: str) -> str:
    """Ensure arXiv links use https://arxiv.org/abs/ format."""
    if not url:
        return url
    # Convert http://arxiv.org/abs/ → https://arxiv.org/abs/
    url = url.replace("http://arxiv.org/", "https://arxiv.org/")
    # Convert https://arxiv.org/abs/XXXX.XXXXXv1 → strip version suffix
    if "arxiv.org/abs/" in url and url.endswith(("v1", "v2", "v3", "v4", "v5")):
        url = url[: url.rfind("v")]
    return url


def _cache_to_papers(items: list, limit: int | None = None) -> list[Paper]:
    subset = items[:limit] if limit else items
    return [
        Paper(
            title=p["title"][:120],
            venue=p.get("venue", "arXiv"),
            tags=p.get("tags", [])[:3],
            read=p.get("read", False),
            url=_fix_arxiv_url(p.get("url", "")),
        )
        for p in subset
    ]


async def _ensure_papers() -> list:
    """Return cached papers; if empty, fetch live."""
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


@router.get("/research", response_model=list[Paper])
async def get_research() -> list[Paper]:
    cached = await _ensure_papers()
    if cached:
        return _cache_to_papers(cached, limit=4)
    return PAPERS[:4]


@router.get("/research/all", response_model=list[Paper])
async def get_research_all() -> list[Paper]:
    cached = await _ensure_papers()
    if cached:
        return _cache_to_papers(cached)
    return PAPERS
