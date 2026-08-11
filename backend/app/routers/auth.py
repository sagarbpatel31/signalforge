from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel

from ..auth import (
    clerk_configured,
    current_clerk_user,
    issue_token,
    legacy_sessions_allowed,
    optional_user,
    resolve_user,
)
from ..kv import kv_delete, kv_get, kv_set

router = APIRouter(prefix="/api/auth", tags=["auth"])


class SessionResponse(BaseModel):
    token: str
    user_id: str


class SessionStatus(BaseModel):
    authenticated: bool
    user_id: Optional[str] = None


class MigrationResponse(BaseModel):
    migrated: bool
    profile_migrated: bool
    workbench_items: int
    bookmarks: int


@router.post("/session", response_model=SessionResponse)
async def create_session() -> SessionResponse:
    """Mint a session. Called once, from onboarding, before the first profile save."""
    if clerk_configured() and not legacy_sessions_allowed():
        raise HTTPException(status_code=403, detail="Account sign-in is required")
    token = issue_token()
    return SessionResponse(token=token, user_id=token.rpartition(".")[0])


@router.get("/session", response_model=SessionStatus)
async def read_session(
    user_id: Optional[str] = Depends(optional_user),
) -> SessionStatus:
    return SessionStatus(authenticated=user_id is not None, user_id=user_id)


def _merge_workbench(source: dict, target: dict) -> dict:
    dismissed = list(dict.fromkeys([
        *target.get("dismissed", []),
        *source.get("dismissed", []),
    ]))
    tasks: dict[str, dict] = {}
    for item in source.get("custom_tasks", []):
        tasks[str(item.get("id"))] = item
    for item in target.get("custom_tasks", []):
        tasks[str(item.get("id"))] = item

    source_daily = source.get("daily_progress") or {}
    target_daily = target.get("daily_progress") or {}
    source_date = str(source_daily.get("date", ""))
    target_date = str(target_daily.get("date", ""))
    if source_date > target_date:
        daily_progress = source_daily
    elif target_date > source_date:
        daily_progress = target_daily
    else:
        source_updated = str(source_daily.get("updated_at", ""))
        target_updated = str(target_daily.get("updated_at", ""))
        if source_updated > target_updated:
            daily_progress = source_daily
        elif target_updated > source_updated:
            daily_progress = target_daily
        else:
            daily_progress = {
                "date": source_date,
                "updated_at": source_updated,
                "reviewed_signal_ids": list(dict.fromkeys([
                    *target_daily.get("reviewed_signal_ids", []),
                    *source_daily.get("reviewed_signal_ids", []),
                ])),
                "completed_task_ids": list(dict.fromkeys([
                    *target_daily.get("completed_task_ids", []),
                    *source_daily.get("completed_task_ids", []),
                ])),
                "post_done": bool(
                    target_daily.get("post_done") or source_daily.get("post_done")
                ),
            }
    return {
        "dismissed": dismissed,
        "custom_tasks": list(tasks.values()),
        "daily_progress": daily_progress,
    }


def _merge_bookmarks(source: dict, target: dict) -> dict:
    merged: dict[str, list[dict]] = {}
    for key in ("papers", "startups", "roles", "opportunities"):
        items: dict[str, dict] = {}
        for item in source.get(key, []):
            items[str(item.get("id"))] = item
        for item in target.get(key, []):
            items[str(item.get("id"))] = item
        merged[key] = list(items.values())
    return merged


@router.post("/migrate", response_model=MigrationResponse)
async def migrate_legacy_session(
    account_id: str = Depends(current_clerk_user),
    legacy_token: Optional[str] = Header(
        default=None, alias="X-SignalForge-Legacy-Token"
    ),
) -> MigrationResponse:
    legacy_id = resolve_user(legacy_token)
    if legacy_id is None:
        raise HTTPException(status_code=400, detail="Invalid legacy session")

    source_profile = kv_get(f"profile:{legacy_id}")
    source_workbench = kv_get(f"workbench:{legacy_id}") or {}
    source_bookmarks = kv_get(f"bookmarks:{legacy_id}") or {}

    target_profile = kv_get(f"profile:{account_id}")
    target_workbench = kv_get(f"workbench:{account_id}") or {}
    target_bookmarks = kv_get(f"bookmarks:{account_id}") or {}

    profile_migrated = bool(source_profile and not target_profile)
    if profile_migrated:
        kv_set(f"profile:{account_id}", source_profile, ttl=365 * 86_400)

    merged_workbench = _merge_workbench(source_workbench, target_workbench)
    merged_bookmarks = _merge_bookmarks(source_bookmarks, target_bookmarks)
    kv_set(f"workbench:{account_id}", merged_workbench, ttl=365 * 86_400)
    kv_set(f"bookmarks:{account_id}", merged_bookmarks, ttl=365 * 86_400)

    for prefix in ("profile", "workbench", "bookmarks"):
        kv_delete(f"{prefix}:{legacy_id}")

    bookmark_count = sum(len(items) for items in merged_bookmarks.values())
    workbench_items = len(merged_workbench["dismissed"]) + len(
        merged_workbench["custom_tasks"]
    )
    return MigrationResponse(
        migrated=bool(source_profile or source_workbench or source_bookmarks),
        profile_migrated=profile_migrated,
        workbench_items=workbench_items,
        bookmarks=bookmark_count,
    )
