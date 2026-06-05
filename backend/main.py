import asyncio
import hmac
import logging
import re
from contextlib import asynccontextmanager
from urllib.parse import urlparse

from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")

import os
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routers import brief, opportunities, startups, career, research, twitter, tasks, people, weekly, profile, generate, feeds, email, workbench
from app.ingestion.scheduler import create_scheduler, run_ingestion

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not os.environ.get("VERCEL"):
        scheduler = create_scheduler()
        scheduler.start()
        asyncio.create_task(run_ingestion())
        yield
        scheduler.shutdown(wait=False)
    else:
        yield


app = FastAPI(title="SignalForge API", version="0.2.0", lifespan=lifespan)

_extra = os.environ.get("FRONTEND_URL", "")
_allowed_origins = ["http://localhost:3000"] + ([_extra] if _extra else [])


def _build_origin_regex() -> str | None:
    """Scope the Vercel preview wildcard to THIS project's subdomains instead of
    allowing every *.vercel.app. Override with CORS_ALLOW_ORIGIN_REGEX if needed."""
    override = os.environ.get("CORS_ALLOW_ORIGIN_REGEX", "")
    if override:
        return override
    host = urlparse(_extra).hostname or ""
    if host.endswith(".vercel.app"):
        slug = re.escape(host.split(".")[0])
        # Production (<slug>.vercel.app) + previews (<slug>-<hash|branch>.vercel.app)
        return rf"https://{slug}(-[\w-]+)?\.vercel\.app"
    return None


app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_origin_regex=_build_origin_regex(),
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

for router in [
    brief.router,
    opportunities.router,
    startups.router,
    career.router,
    research.router,
    twitter.router,
    tasks.router,
    people.router,
    weekly.router,
    profile.router,
    workbench.router,
    generate.router,
    feeds.router,
    email.router,
]:
    app.include_router(router)


@app.get("/health")
async def health() -> dict:
    from app.kv import kv_get, kv_set
    kv_set("health_check", {"ok": True}, ttl=60)
    result = kv_get("health_check")
    redis_url = os.environ.get("UPSTASH_REDIS_REST_URL", "")[:40]
    return {
        "status": "ok",
        "redis_write_read": result is not None,
        "redis_url_prefix": redis_url or "NOT SET",
    }


def _verify_cron(authorization: str | None) -> None:
    """Guard the cron ingest endpoint. Vercel cron sends the secret as a Bearer token.
    When CRON_SECRET is unset (local dev / unconfigured), the endpoint stays open."""
    secret = os.environ.get("CRON_SECRET", "")
    if not secret:
        return
    expected = f"Bearer {secret}"
    if not authorization or not hmac.compare_digest(authorization, expected):
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.get("/api/ingest")
async def trigger_ingest(authorization: str | None = Header(default=None)) -> dict:
    _verify_cron(authorization)
    from app.ingestion.scheduler import run_ingestion
    result = await run_ingestion()
    # Send daily digest email after ingestion (best-effort — never block ingest)
    try:
        from app.routers.email import send_digest
        await send_digest()
    except Exception:
        pass
    return result
