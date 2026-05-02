import json
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["profile"])

_PROFILE_FILE = Path(__file__).parent.parent.parent / "data" / "profile.json"
_PROFILE_FILE.parent.mkdir(exist_ok=True)


class UserProfile(BaseModel):
    name: str
    handle: str = ""
    domains: list[str]
    experience: str
    goal: str
    current_projects: str = ""


def _load() -> Optional[UserProfile]:
    if _PROFILE_FILE.exists():
        return UserProfile(**json.loads(_PROFILE_FILE.read_text()))
    return None


def _save(profile: UserProfile) -> None:
    _PROFILE_FILE.write_text(profile.model_dump_json())


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
