from fastapi import APIRouter
from ..schemas import Role
from ..mock_data import ROLES
from ..ingestion.sources import read_cache

router = APIRouter(prefix="/api", tags=["career"])

_COLOR_MAP = {
    "robotics": "cyan",
    "edge-ai": "cyan",
    "llm": "amber",
    "startup": "green",
    "embedded": "amber",
    "physical-ai": "cyan",
    "agentic": "green",
}


def _job_to_role(job: dict) -> Role:
    tags = job.get("tags", [])
    color = next((_COLOR_MAP[t] for t in tags if t in _COLOR_MAP), "muted")
    location = job.get("location", "Remote")[:24]
    source = job.get("source", "")
    return Role(
        company=job.get("company", ""),
        role=job.get("title", ""),
        type=f"{job.get('job_type', 'Full-time')} · {location}",
        signal=f"LIVE · {source}",
        color=color,
    )


@router.get("/career", response_model=list[Role])
async def get_career() -> list[Role]:
    cached = read_cache("jobs")
    if cached:
        return [_job_to_role(j) for j in cached[:12]]
    return ROLES
