from fastapi import APIRouter
from ..schemas import Role
from ..mock_data import ROLES

router = APIRouter(prefix="/api", tags=["career"])


@router.get("/career", response_model=list[Role])
async def get_career() -> list[Role]:
    return ROLES
