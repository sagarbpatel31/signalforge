from fastapi import APIRouter
from ..schemas import Paper
from ..mock_data import PAPERS

router = APIRouter(prefix="/api", tags=["research"])


@router.get("/research", response_model=list[Paper])
async def get_research() -> list[Paper]:
    return PAPERS
