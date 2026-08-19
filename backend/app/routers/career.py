import re
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, BackgroundTasks, Depends
from ..auth import optional_user
from ..schemas import CuratedSource, Role
from ..mock_data import ROLES
from ..ingestion.sources import read_cache
from ..routers.profile import _load as _load_profile

router = APIRouter(prefix="/api", tags=["career"])

_DOMAIN_MAP: dict = {
    "Robotics": {
        "tags": {"robotics", "physical-ai"},
        "kws":  ["robot", "ros", "ros2", "manipulation", "locomotion", "mechatron",
                 "lidar", "slam", "actuator", "motion planning", "pick and place",
                 "grasping", "arm", "mobile robot", "drone", "uav"],
        "cos":  {"figure", "apptronik", "nuro", "motional", "agility", "boston dynamics",
                 "boston-dynamics", "covariant", "collaborative robotics", "gecko robotics",
                 "skild", "physical intelligence", "1x", "1x technologies", "neura",
                 "fourier", "unitree", "machina labs", "viam", "dexterity", "locus",
                 "seegrid", "berkshire grey", "symbotic", "gray orange", "pickle robot",
                 "formant", "polymath robotics", "scythe robotics", "built robotics",
                 "dusty robotics", "carbon robotics", "robust ai", "field ai"},
    },
    "Edge AI": {
        "tags": {"edge-ai", "embedded"},
        "kws":  ["edge inference", "tinyml", "jetson", "fpga", "on-device", "edge computing",
                 "quantization", "int4", "int8", "npu", "neural processing", "onnx",
                 "tensorrt", "openvino", "llama.cpp", "gguf", "hailo", "groq", "inference chip",
                 "model compression", "pruning", "distillation", "mlperf"],
        "cos":  {"hailo", "axelera", "tenstorrent", "etched", "groq", "cerebras", "d-matrix",
                 "recogni", "perceive", "qualcomm", "arm", "sifive", "untether", "quadric",
                 "helsinki", "motional", "waymo", "mobileye", "luminar", "ouster"},
    },
    "Physical AI": {
        "tags": {"physical-ai", "robotics"},
        "kws":  ["physical ai", "humanoid", "embodied", "sim-to-real", "dexterous",
                 "locomotion", "foundation model robot", "vla", "vision language action",
                 "policy learning", "imitation learning", "teleoperation", "diffusion policy",
                 "isaac lab", "groot", "cosmos", "genesis sim", "world model"],
        "cos":  {"figure", "apptronik", "agility", "1x", "1x technologies", "sanctuary",
                 "physical intelligence", "skild", "covariant", "neura", "fourier",
                 "unitree", "boston dynamics", "deepmind", "google deepmind"},
    },
    "Embedded Systems": {
        "tags": {"embedded", "edge-ai"},
        "kws":  ["embedded", "firmware", "rtos", "mcu", "microcontroller", "baremetal",
                 "c++", "fpga", "bare metal", "zephyr", "freertos", "linux kernel",
                 "device driver", "ota update", "can bus", "uart", "spi", "i2c",
                 "motor control", "foc", "stm32", "esp32", "cortex-m"],
        "cos":  {"memfault", "nordic semi", "st microelectronics", "nxp", "ti", "microchip",
                 "silicon labs", "espressif"},
    },
    "Generative AI": {
        "tags": {"llm", "generative", "agentic"},
        "kws":  ["llm", "generative", "transformer", "language model", "multimodal",
                 "diffusion", "foundation model", "fine-tuning", "rlhf", "alignment",
                 "agent", "agentic", "retrieval", "rag", "vla", "vlm", "gpt", "claude",
                 "gemini", "mistral", "llama", "inference optimization"],
        "cos":  {"anthropic", "mistral", "openai", "cohere", "inflection", "adept",
                 "imbue", "cognition", "perplexity", "hugging face", "modal", "together ai",
                 "lambda labs", "coreweave", "groq"},
    },
    "Startup Ecosystem": {"tags": set(), "kws": [], "cos": set()},
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
    r"robot learning|humanoid|locomotion engineer|manipulation engineer|"
    r"foundation model|policy engineer|sim-to-real|simulation engineer|"
    r"inference engineer|compiler engineer|kernel engineer|"
    r"vla|vision language|multimodal|diffusion policy|"
    r"edge inference|tinyml|quantization engineer|npu|"
    r"devops|mlops|platform|infrastructure|"
    r"engineer(?:ing)?|scientist|researcher|developer|architect|"
    r"software|hardware|firmware|robotics|autonomy|perception|"
    r"simulation|embedded|fpga|inference|"
    r"machine learning|deep learning|computer vision|"
    r"motion planning|path planning|control systems|"
    r"tech lead|staff eng|principal eng|"
    r"founding|staff|principal|senior|lead"
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
    url = job.get("url", "")
    source = job.get("source", "")
    return Role(
        company=job.get("company", ""),
        role=job.get("title", ""),
        type=f"{job.get('job_type', 'Full-time')} · {location}",
        signal=f"LIVE · {source}",
        color=color,
        url=url,
        tags=tags,
        last_verified=datetime.now(timezone.utc).date().isoformat(),
        sources=[CuratedSource(label=source or "Job listing", url=url)] if url else [],
    )


def _get_filtered_roles(limit: Optional[int] = None, user_key: str | None = None) -> list[Role]:
    cached = read_cache("jobs")
    if not cached:
        return ROLES[:limit] if limit else ROLES

    profile = _load_profile(user_key)
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
async def get_career(background_tasks: BackgroundTasks, user_id: str | None = Depends(optional_user)) -> list[Role]:
    if not read_cache("jobs"):
        from ..ingestion.scheduler import refresh_source
        background_tasks.add_task(refresh_source, "jobs")
    return _get_filtered_roles(limit=4, user_key=user_id)


@router.get("/career/all", response_model=list[Role])
async def get_career_all(background_tasks: BackgroundTasks, user_id: str | None = Depends(optional_user)) -> list[Role]:
    if not read_cache("jobs"):
        from ..ingestion.scheduler import refresh_source
        background_tasks.add_task(refresh_source, "jobs")
    return _get_filtered_roles(limit=None, user_key=user_id)
