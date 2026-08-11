import asyncio
import hmac
import logging
import os
import re
import time
from contextlib import asynccontextmanager
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.observability import REQUEST_LOGGER, init_sentry, request_id, request_log
from app.routers import auth, bookmarks, brief, opportunities, startups, career, research, twitter, tasks, weekly, profile, generate, feeds, email, workbench
from app.ingestion.scheduler import create_scheduler, run_ingestion

logging.basicConfig(level=logging.INFO)
init_sentry()


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


app = FastAPI(title="SignalForge API", version="0.3.0", lifespan=lifespan)


@app.exception_handler(Exception)
async def unexpected_error(request: Request, _exc: Exception) -> JSONResponse:
    correlation_id = getattr(request.state, "request_id", request_id(None))
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "request_id": correlation_id,
        },
        headers={"X-Request-ID": correlation_id},
    )


@app.middleware("http")
async def observe_request(request: Request, call_next):
    correlation_id = request_id(request.headers.get("X-Request-ID"))
    request.state.request_id = correlation_id
    started = time.perf_counter()
    status = 500

    try:
        response = await call_next(request)
        status = response.status_code
    except Exception:
        duration_ms = (time.perf_counter() - started) * 1000
        REQUEST_LOGGER.error(
            request_log(
                request_id_value=correlation_id,
                method=request.method,
                path=request.url.path,
                status=status,
                duration_ms=duration_ms,
            )
        )
        raise

    duration_ms = (time.perf_counter() - started) * 1000
    response.headers["X-Request-ID"] = correlation_id
    log = REQUEST_LOGGER.warning if status >= 500 else REQUEST_LOGGER.info
    log(
        request_log(
            request_id_value=correlation_id,
            method=request.method,
            path=request.url.path,
            status=status,
            duration_ms=duration_ms,
        )
    )
    return response


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
    expose_headers=["X-Request-ID"],
)

for router in [
    auth.router,
    bookmarks.router,
    brief.router,
    opportunities.router,
    startups.router,
    career.router,
    research.router,
    twitter.router,
    tasks.router,
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
    from app.ingestion.sources import read_cache
    from app.kv import storage_mode

    meta = read_cache("meta") or {}
    return {
        "status": "ok",
        "service": "signalforge-api",
        "version": app.version,
        "storage": storage_mode(),
        "feeds": {
            "last_refresh": meta.get("last_refresh"),
            "source_mode": meta.get("source_mode", "fallback"),
            "counts": meta.get("counts", {}),
        },
    }


def _verify_cron(authorization: str | None) -> None:
    """Guard the cron ingest endpoint. Vercel cron sends the secret as a Bearer token.

    /api/ingest also fires the daily digest email, so leaving it open in
    production would let anyone trigger sends. Unset CRON_SECRET is tolerated
    only for local dev; in production it fails closed."""
    secret = os.environ.get("CRON_SECRET", "")
    if not secret:
        from app.auth import _is_production

        if _is_production():
            raise HTTPException(status_code=503, detail="CRON_SECRET not configured")
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
