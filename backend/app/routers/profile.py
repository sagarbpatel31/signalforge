from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..kv import kv_get, kv_set

router = APIRouter(prefix="/api", tags=["profile"])

_KV_KEY = "profile"


class UserProfile(BaseModel):
    name: str
    handle: str = ""
    domains: list[str]
    experience: str
    goal: str
    current_projects: str = ""


def _load() -> Optional[UserProfile]:
    data = kv_get(_KV_KEY)
    return UserProfile(**data) if data else None


def _save(profile: UserProfile) -> None:
    kv_set(_KV_KEY, profile.model_dump(), ttl=365 * 86_400)


@router.get("/profile", response_model=UserProfile)
async def get_profile() -> UserProfile:
    profile = _load()
    if profile is None:
        raise HTTPException(status_code=404, detail="No profile found")
    return profile


@router.post("/profile", response_model=UserProfile)
async def save_profile(profile: UserProfile) -> UserProfile:
    _save(profile)
    return profile
