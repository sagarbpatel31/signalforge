from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import brief, opportunities, startups, career, research, twitter, tasks, people, weekly

app = FastAPI(title="SignalForge API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET"],
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
]:
    app.include_router(router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "service": "signalforge-api"}
