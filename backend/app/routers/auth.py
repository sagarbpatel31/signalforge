from typing import Optional

from fastapi import APIRouter, Header
from pydantic import BaseModel

from ..auth import issue_token, resolve_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


class SessionResponse(BaseModel):
    token: str
    user_id: str


class SessionStatus(BaseModel):
    authenticated: bool
    user_id: Optional[str] = None


@router.post("/session", response_model=SessionResponse)
async def create_session() -> SessionResponse:
    """Mint a session. Called once, from onboarding, before the first profile save."""
    token = issue_token()
    return SessionResponse(token=token, user_id=token.rpartition(".")[0])


@router.get("/session", response_model=SessionStatus)
async def read_session(
    x_signalforge_token: Optional[str] = Header(default=None),
) -> SessionStatus:
    user_id = resolve_user(x_signalforge_token)
    return SessionStatus(authenticated=user_id is not None, user_id=user_id)
