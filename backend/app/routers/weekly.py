from fastapi import APIRouter
from ..schemas import WeeklyResponse
from ..mock_data import WEEKLY_WINS, WEEKLY_GAPS, CONVICTION_BETS, NEXT_WEEK_FOCUS

router = APIRouter(prefix="/api", tags=["weekly"])


@router.get("/weekly", response_model=WeeklyResponse)
async def get_weekly() -> WeeklyResponse:
    return WeeklyResponse(
        wins=WEEKLY_WINS,
        gaps=WEEKLY_GAPS,
        conviction_bets=CONVICTION_BETS,
        next_week_focus=NEXT_WEEK_FOCUS,
    )
