from fastapi import APIRouter
from ..schemas import Startup
from ..mock_data import STARTUPS
from ..kv import kv_get

router = APIRouter(prefix="/api", tags=["startups"])


@router.get("/startups", response_model=list[Startup])
async def get_startups() -> list[Startup]:
    return STARTUPS


@router.get("/startups/flagged")
async def get_flagged_startups() -> list[dict]:
    """
    Derives actively-hiring companies from the cached jobs feed.
    Groups by company name, computes role counts, tags, and a new-flag.
    Falls back to mock STARTUPS reshaped if cache is empty.
    """
    raw_jobs: list[dict] | None = kv_get("cache:jobs")

    if not raw_jobs or not isinstance(raw_jobs, list) or len(raw_jobs) == 0:
        # Fallback: reshape mock STARTUPS into FlaggedCompany shape
        fallback = []
        for s in STARTUPS:
            fallback.append({
                "name": s.name,
                "job_count": 0,
                "tags": [s.domain],
                "source": "Curated",
                "is_new": s.signal == "Hot",
                "roles_preview": [],
            })
        return fallback

    # Group jobs by company
    company_map: dict[str, list[dict]] = {}
    for job in raw_jobs:
        company = job.get("company", "Unknown")
        if company not in company_map:
            company_map[company] = []
        company_map[company].append(job)

    current_company_count = len(company_map)
    current_job_count = len(raw_jobs)

    # Approximate new count: top 15% of companies by job_count treated as "new"
    new_count = max(0, round(current_company_count * 0.15))

    # Build sorted list (by job_count desc) to assign is_new to top entries
    results = []
    for company, jobs in company_map.items():
        # Deduplicate and cap tags at 3
        all_tags: list[str] = []
        seen_tags: set[str] = set()
        for job in jobs:
            for tag in job.get("tags", []):
                if tag not in seen_tags:
                    seen_tags.add(tag)
                    all_tags.append(tag)
        capped_tags = all_tags[:3]

        # Source from first job with a source field
        source = next((j.get("source", "") for j in jobs if j.get("source")), "Unknown")

        # Preview: up to 2 role titles
        roles_preview = [j.get("title", "") for j in jobs[:2] if j.get("title")]

        results.append({
            "name": company,
            "job_count": len(jobs),
            "tags": capped_tags,
            "source": source,
            "is_new": False,  # will set below
            "roles_preview": roles_preview,
        })

    # Sort by job_count descending
    results.sort(key=lambda x: x["job_count"], reverse=True)

    # Mark top new_count entries as new
    for i, entry in enumerate(results):
        entry["is_new"] = i < new_count

    return results
