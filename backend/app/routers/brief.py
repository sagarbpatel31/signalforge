from fastapi import APIRouter
from datetime import datetime, timezone
from ..schemas import BriefResponse, Stat
from ..mock_data import SIGNALS, MARKET_PULSE, STATS

router = APIRouter(prefix="/api", tags=["brief"])


@router.get("/brief", response_model=BriefResponse)
async def get_brief() -> BriefResponse:
    return BriefResponse(
        market_pulse=MARKET_PULSE,
        signals=SIGNALS,
        timestamp=datetime.now(timezone.utc).strftime("%H:%M UTC · %b %-d"),
    )


@router.get("/stats", response_model=list[Stat])
async def get_stats() -> list[Stat]:
    return STATS
