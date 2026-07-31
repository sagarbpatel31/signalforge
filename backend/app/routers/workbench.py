from fastapi import APIRouter, Depends

from ..auth import current_user
from ..kv import kv_get, kv_set
from ..schemas import WorkbenchState
from ..user_scope import DEFAULT_USER_KEY

router = APIRouter(prefix="/api", tags=["workbench"])


def _kv_key(user_key: str | None = None) -> str:
    if not user_key or user_key == DEFAULT_USER_KEY:
        return "workbench"
    return f"workbench:{user_key}"


def _load(user_key: str | None = None) -> WorkbenchState:
    data = kv_get(_kv_key(user_key))
    return WorkbenchState(**data) if data else WorkbenchState()


def _save(state: WorkbenchState, user_key: str | None = None) -> None:
    kv_set(_kv_key(user_key), state.model_dump(), ttl=365 * 86_400)


@router.get("/workbench", response_model=WorkbenchState)
async def get_workbench(user_id: str = Depends(current_user)) -> WorkbenchState:
    return _load(user_id)


@router.post("/workbench", response_model=WorkbenchState)
async def save_workbench(
    state: WorkbenchState, user_id: str = Depends(current_user)
) -> WorkbenchState:
    _save(state, user_id)
    return state
