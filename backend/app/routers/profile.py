from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..auth import current_user
from ..kv import kv_get, kv_set
from ..user_scope import DEFAULT_USER_KEY

router = APIRouter(prefix="/api", tags=["profile"])


class UserProfile(BaseModel):
    name: str
    handle: str = ""
    domains: list[str]
    experience: str
    goal: str
    current_projects: str = ""


def _kv_key(user_key: str | None = None) -> str:
    """Profiles are keyed by verified session id. The unscoped "profile" key is
    the local-dev seed under backend/data and is never reachable from a token."""
    if not user_key or user_key == DEFAULT_USER_KEY:
        return "profile"
    return f"profile:{user_key}"


def _load(user_key: str | None = None) -> Optional[UserProfile]:
    data = kv_get(_kv_key(user_key))
    return UserProfile(**data) if data else None


def _save(profile: UserProfile, user_key: str | None = None) -> None:
    kv_set(_kv_key(user_key), profile.model_dump(), ttl=365 * 86_400)


@router.get("/profile", response_model=UserProfile)
async def get_profile(user_id: str = Depends(current_user)) -> UserProfile:
    profile = _load(user_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="No profile found")
    return profile


@router.post("/profile", response_model=UserProfile)
async def save_profile(
    profile: UserProfile, user_id: str = Depends(current_user)
) -> UserProfile:
    _save(profile, user_id)
    return profile
