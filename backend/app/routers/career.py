import re
from typing import Optional
from fastapi import APIRouter
from ..schemas import Role
from ..mock_data import ROLES
from ..ingestion.sources import read_cache
from ..routers.profile import _load as _load_profile

router = APIRouter(prefix="/api", tags=["career"])

_DOMAIN_MAP: dict = {
    "Robotics":          {
        "tags": {"robotics", "physical-ai"},
        "kws":  ["robot", "ros", "manipulation", "locomotion", "mechatron", "lidar", "slam", "actuator"],
        "cos":  {"figure", "waymo", "apptronik", "nuro", "motional", "helsing", "agility", "boston dynamics", "boston-dynamics"},
    },
    "Edge AI":           {
        "tags": {"edge-ai", "embedded"},
        "kws":  ["edge inference", "tinyml", "jetson", "fpga", "on-device", "mlops", "edge computing"],
        "cos":  {"helsing", "motional", "waymo"},
    },
    "Physical AI":       {
        "tags": {"physical-ai", "robotics"},
        "kws":  ["physical", "humanoid", "embodied", "sim-to-real", "dexterous", "locomotion"],
        "cos":  {"figure", "apptronik", "agility", "1x", "sanctuary"},
    },
    "Embedded Systems":  {
        "tags": {"embedded", "edge-ai"},
        "kws":  ["embedded", "firmware", "rtos", "mcu", "microcontroller", "baremetal", "c++", "fpga"],
        "cos":  set(),
    },
    "Generative AI":     {
        "tags": {"llm", "generative", "agentic"},
        "kws":  ["llm", "generative", "transformer", "language model", "multimodal", "diffusion", "foundation model"],
        "cos":  {"anthropic", "mistral", "openai"},
    },
    "Startup Ecosystem": {"tags": set(), "kws": [], "cos": set()},  # all jobs qualify
}

_TECH_RE = re.compile(
    r"\b("
    r"software engineer|embedded software|embedded systems|firmware engineer|"
    r"embedded linux|robotics software|robotics ai|ai embedded|edge ai|"
    r"systems engineer|applications engineer|forward deployed|robotics engineer|"
    r"ai engineer|machine learning engineer|ml engineer|perception engineer|"
    r"automation systems|ai automation|ai deployed|full stack ai|founding engineer|"
    r"research engineer|autonomous systems|reinforcement learning|ai infrastructure|"
    r"nvidia research|gen ai engineer|"
    r"engineer(?:ing)?|scientist|researcher|developer|architect|"
    r"software|hardware|firmware|robotics|autonomy|perception|"
    r"simulation|embedded|fpga|inference|"
    r"machine learning|deep learning|computer vision|"
    r"motion planning|path planning|control systems|"
    r"platform engineer|infrastructure|"
    r"tech lead|staff eng|principal eng"
    r")\b",
    re.IGNORECASE,
)

# Exclude clearly non-technical roles
_EXCLUDE_RE = re.compile(
    r"\b(account executive|account manager|sales|recruiter|marketing|"
    r"hr |human resources|legal|finance|accounting|business development|"
    r"growth|content|designer|ux|ui designer|graphic|brand|"
    r"customer success|customer support|operations manager)\b",
    re.IGNORECASE,
)


def _is_tech_role(title: str) -> bool:
    if _EXCLUDE_RE.search(title):
        return False
    return bool(_TECH_RE.search(title))


_COLOR_MAP: dict = {
    "robotics": "cyan", "edge-ai": "cyan", "physical-ai": "cyan",
    "llm": "amber", "agentic": "green", "startup": "green",
    "embedded": "amber", "generative": "amber",
}


def _is_startup_ecosystem(domains: list) -> bool:
    return "Startup Ecosystem" in domains


def _relevant_sets(domains: list) -> tuple:
    tag_set: set = set()
    kw_list: list = []
    co_set: set = set()
    for d in domains:
        entry = _DOMAIN_MAP.get(d, {})
        tag_set |= entry.get("tags", set())
        kw_list.extend(entry.get("kws", []))
        co_set |= entry.get("cos", set())
    return tag_set, kw_list, co_set


def _job_matches(job: dict, tag_set: set, kw_list: list, co_set: set, all_pass: bool) -> bool:
    if all_pass:
        return True
    job_tags = set(job.get("tags", []))
    if job_tags & tag_set:
        return True
    title_lower = job.get("title", "").lower()
    if any(kw in title_lower for kw in kw_list):
        return True
    company_lower = job.get("company", "").lower()
    return any(co in company_lower for co in co_set)


def _job_to_role(job: dict) -> Role:
    tags = job.get("tags", [])
    color = next((_COLOR_MAP[t] for t in tags if t in _COLOR_MAP), "muted")
    location = job.get("location", "Remote")[:28]
    return Role(
        company=job.get("company", ""),
        role=job.get("title", ""),
        type=f"{job.get('job_type', 'Full-time')} · {location}",
        signal=f"LIVE · {job.get('source', '')}",
        color=color,
        url=job.get("url", ""),
    )


def _get_filtered_roles(limit: Optional[int] = None) -> list[Role]:
    cached = read_cache("jobs")
    if not cached:
        return ROLES[:limit] if limit else ROLES

    profile = _load_profile()
    domains = profile.domains if profile else []
    all_pass = _is_startup_ecosystem(domains) or not domains
    tag_set, kw_list, co_set = _relevant_sets(domains)

    filtered = [
        j for j in cached
        if _job_matches(j, tag_set, kw_list, co_set, all_pass) and _is_tech_role(j.get("title", ""))
    ]
    if not filtered:
        filtered = [j for j in cached if _is_tech_role(j.get("title", ""))] or cached

    roles = [_job_to_role(j) for j in filtered]
    if limit:
        # dedupe by company, keep first seen
        seen: set = set()
        deduped = []
        for r in roles:
            if r.company not in seen:
                seen.add(r.company)
                deduped.append(r)
                if len(deduped) >= limit:
                    break
        return deduped
    return roles


@router.get("/career", response_model=list[Role])
async def get_career() -> list[Role]:
    return _get_filtered_roles(limit=4)


@router.get("/career/all", response_model=list[Role])
async def get_career_all() -> list[Role]:
    return _get_filtered_roles(limit=None)
