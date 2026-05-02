from fastapi import APIRouter
from ..schemas import Person
from ..mock_data import PEOPLE

router = APIRouter(prefix="/api", tags=["people"])


@router.get("/people", response_model=list[Person])
async def get_people() -> list[Person]:
    return PEOPLE
