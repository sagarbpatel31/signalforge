from fastapi import APIRouter, Depends

from ..auth import current_user
from ..kv import kv_get, kv_set
from ..schemas import BookmarksState
from ..user_scope import DEFAULT_USER_KEY

router = APIRouter(prefix="/api", tags=["bookmarks"])


def _kv_key(user_key: str | None = None) -> str:
    if not user_key or user_key == DEFAULT_USER_KEY:
        return "bookmarks"
    return f"bookmarks:{user_key}"


def _load(user_key: str | None = None) -> BookmarksState:
    data = kv_get(_kv_key(user_key))
    return BookmarksState(**data) if data else BookmarksState()


def _save(state: BookmarksState, user_key: str | None = None) -> None:
    kv_set(_kv_key(user_key), state.model_dump(), ttl=365 * 86_400)


@router.get("/bookmarks", response_model=BookmarksState)
async def get_bookmarks(user_id: str = Depends(current_user)) -> BookmarksState:
    return _load(user_id)


@router.post("/bookmarks", response_model=BookmarksState)
async def save_bookmarks(
    state: BookmarksState, user_id: str = Depends(current_user)
) -> BookmarksState:
    _save(state, user_id)
    return state
