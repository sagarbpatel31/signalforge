from typing import Optional
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from ..kv import kv_get, kv_set
from ..user_scope import DEFAULT_USER_KEY, normalize_user_key

router = APIRouter(prefix="/api", tags=["profile"])


class UserProfile(BaseModel):
    name: str
    handle: str = ""
    domains: list[str]
    experience: str
    goal: str
    current_projects: str = ""


def _kv_key(user_key: str | None = None) -> str:
    normalized = normalize_user_key(user_key)
    if normalized == DEFAULT_USER_KEY:
        return "profile"
    return f"profile:{normalized}"


def _load(user_key: str | None = None) -> Optional[UserProfile]:
    data = kv_get(_kv_key(user_key))
    return UserProfile(**data) if data else None


def _save(profile: UserProfile, user_key: str | None = None) -> None:
    kv_set(_kv_key(user_key), profile.model_dump(), ttl=365 * 86_400)


@router.get("/profile", response_model=UserProfile)
async def get_profile(x_signalforge_user: str | None = Header(default=None)) -> UserProfile:
    profile = _load(x_signalforge_user)
    if profile is None:
        raise HTTPException(status_code=404, detail="No profile found")
    return profile


@router.post("/profile", response_model=UserProfile)
async def save_profile(profile: UserProfile, x_signalforge_user: str | None = Header(default=None)) -> UserProfile:
    _save(profile, x_signalforge_user)
    return profile
