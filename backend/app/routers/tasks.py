from fastapi import APIRouter
from ..schemas import Task
from ..mock_data import TASKS

router = APIRouter(prefix="/api", tags=["tasks"])


@router.get("/tasks", response_model=list[Task])
async def get_tasks() -> list[Task]:
    from ..ingestion.sources import read_cache
    cached = read_cache("tasks")
    if cached and isinstance(cached, list) and len(cached) > 0:
        try:
            return [Task(**t) for t in cached]
        except Exception:
            pass
    return TASKS
