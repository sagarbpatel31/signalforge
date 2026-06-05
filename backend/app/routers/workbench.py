from fastapi import APIRouter, Header

from ..kv import kv_get, kv_set
from ..schemas import WorkbenchState
from ..user_scope import DEFAULT_USER_KEY, normalize_user_key

router = APIRouter(prefix="/api", tags=["workbench"])


def _kv_key(user_key: str | None = None) -> str:
    normalized = normalize_user_key(user_key)
    if normalized == DEFAULT_USER_KEY:
        return "workbench"
    return f"workbench:{normalized}"


def _load(user_key: str | None = None) -> WorkbenchState:
    data = kv_get(_kv_key(user_key))
    return WorkbenchState(**data) if data else WorkbenchState()


def _save(state: WorkbenchState, user_key: str | None = None) -> None:
    kv_set(_kv_key(user_key), state.model_dump(), ttl=365 * 86_400)


@router.get("/workbench", response_model=WorkbenchState)
async def get_workbench(x_signalforge_user: str | None = Header(default=None)) -> WorkbenchState:
    return _load(x_signalforge_user)


@router.post("/workbench", response_model=WorkbenchState)
async def save_workbench(state: WorkbenchState, x_signalforge_user: str | None = Header(default=None)) -> WorkbenchState:
    _save(state, x_signalforge_user)
    return state
