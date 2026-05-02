import asyncio
import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import brief, opportunities, startups, career, research, twitter, tasks, people, weekly, profile, generate, feeds
from app.ingestion.scheduler import create_scheduler, run_ingestion

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler = create_scheduler()
    scheduler.start()
    # Kick off initial ingestion without blocking startup
    asyncio.create_task(run_ingestion())
    yield
    scheduler.shutdown(wait=False)


app = FastAPI(title="SignalForge API", version="0.2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
    generate.router,
    feeds.router,
]:
    app.include_router(router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "service": "signalforge-api"}
