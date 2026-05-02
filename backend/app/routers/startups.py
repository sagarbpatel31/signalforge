from fastapi import APIRouter
from ..schemas import Startup
from ..mock_data import STARTUPS

router = APIRouter(prefix="/api", tags=["startups"])


@router.get("/startups", response_model=list[Startup])
async def get_startups() -> list[Startup]:
    return STARTUPS
