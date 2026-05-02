from fastapi import APIRouter
from ..schemas import Opportunity
from ..mock_data import OPPORTUNITIES

router = APIRouter(prefix="/api", tags=["opportunities"])


@router.get("/opportunities", response_model=list[Opportunity])
async def get_opportunities() -> list[Opportunity]:
    return OPPORTUNITIES
