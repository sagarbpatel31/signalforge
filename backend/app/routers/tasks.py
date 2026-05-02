from fastapi import APIRouter
from ..schemas import Task
from ..mock_data import TASKS

router = APIRouter(prefix="/api", tags=["tasks"])


@router.get("/tasks", response_model=list[Task])
async def get_tasks() -> list[Task]:
    return TASKS
