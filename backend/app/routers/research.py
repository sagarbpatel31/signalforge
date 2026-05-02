from fastapi import APIRouter
from ..schemas import Paper
from ..mock_data import PAPERS
from ..ingestion.sources import read_cache

router = APIRouter(prefix="/api", tags=["research"])


@router.get("/research", response_model=list[Paper])
async def get_research() -> list[Paper]:
    cached = read_cache("papers")
    if cached:
        return [
            Paper(
                title=p["title"][:120],
                venue=p.get("venue", "arXiv"),
                tags=p.get("tags", [])[:3],
                read=p.get("read", False),
                url=p.get("url", ""),
            )
            for p in cached[:24]
        ]
    return PAPERS
