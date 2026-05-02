import json
import os
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException

from ..routers.profile import _load as _load_profile

router = APIRouter(prefix="/api/generate", tags=["generate"])

_SIGNALS_SYSTEM = """You are SignalForge, an AI intelligence terminal for engineers and founders in deep-tech.
Return ONLY valid JSON — no markdown, no explanation.

Generate a personalized daily intelligence brief for the user profile below.
Return exactly this shape:
{
  "market_pulse": "<one punchy sentence on the most important macro signal today>",
  "signals": [
    {"label": "<4-8 char tag>", "delta": "<+X%|↑|↓|→>", "color": "<cyan|amber|green|red|muted>", "text": "<one sentence insight>"},
    ...
  ]
}

Rules:
- 5–6 signals covering the user's domains
- color: green/cyan = bullish/opportunity, amber = watch/mixed, red = risk/decline, muted = neutral
- delta: concise stat or directional arrow
- label: uppercase 4–8 chars (e.g. ARXIV, NVIDIA, EDGE-AI)
- Use the provided real headlines as your primary source — be specific, not generic"""

_POSTS_SYSTEM = """You are SignalForge, an AI intelligence terminal for engineers and founders in deep-tech.
Return ONLY valid JSON — no markdown, no explanation.

Write 3 X/Twitter post drafts for the user profile below.
Return exactly this shape:
{
  "posts": [
    {"angle": "Take", "text": "<tweet>", "tags": ["tag1", "tag2"]},
    {"angle": "Thread", "text": "<opening tweet of a thread>", "tags": ["tag1"]},
    {"angle": "Contrarian", "text": "<tweet>", "tags": ["tag1", "tag2"]}
  ]
}

Rules:
- Each post under 280 chars
- Authentic founder/engineer voice, no corporate speak
- tags: 1–3 lowercase keywords (no # prefix)
- Take: bold opinion; Thread: compelling hook; Contrarian: challenges common assumption"""

_DIGEST_SYSTEM = """You are SignalForge, an AI intelligence terminal for engineers and founders in deep-tech.
Return ONLY valid JSON — no markdown, no explanation.

Generate a personalized intelligence digest from the provided data.
Return exactly this shape:
{
  "headline": "<one strong sentence — the single most important thing happening right now>",
  "sections": [
    {"title": "<section>", "items": ["<specific insight 1>", "<specific insight 2>", "<specific insight 3>"]},
    ...
  ],
  "action_item": "<one concrete action the user should take today based on this data>"
}

Rules:
- 3–4 sections (News, Research, Jobs, Startups — skip if no data)
- 3 items per section, each grounded in the provided data (title/source/company)
- No generic advice — every item must reference something specific from the data
- action_item should be specific and actionable (e.g. "Apply to X at OpenAI", "Read paper Y", "Tweet about Z")"""


def _get_client():
    try:
        from openai import AsyncOpenAI
    except ImportError:
        raise HTTPException(status_code=503, detail="openai package not installed")
    key = os.environ.get("OPENAI_API_KEY", "")
    if not key or key == "your_key_here":
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY not configured")
    return AsyncOpenAI(api_key=key)


def _profile_context(profile: Optional[object]) -> str:
    if profile is None:
        return "domains: [Robotics, Edge AI], experience: Senior Engineer, goal: Build in public"
    p = profile.model_dump()
    parts = [
        f"name: {p.get('name', 'User')}",
        f"domains: {p.get('domains', [])}",
        f"experience: {p.get('experience', '')}",
        f"goal: {p.get('goal', '')}",
    ]
    if p.get("current_projects"):
        parts.append(f"current_projects: {p['current_projects']}")
    return ", ".join(parts)


@router.post("/brief")
async def generate_brief():
    from ..ingestion.sources import read_cache
    profile = _load_profile()
    client = _get_client()

    news_context = ""
    cached_news = read_cache("news")
    if cached_news:
        headlines = "\n".join(
            f"- [{n['source']}] {n['title']}" for n in cached_news[:12]
        )
        news_context = f"\n\nReal headlines from the last 12 hours:\n{headlines}"

    response = await client.chat.completions.create(
        model="gpt-4o",
        max_tokens=1024,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": _SIGNALS_SYSTEM},
            {"role": "user", "content": f"User profile: {_profile_context(profile)}{news_context}\n\nGenerate my daily intelligence brief."},
        ],
    )

    data = json.loads(response.choices[0].message.content)
    timestamp = datetime.now(timezone.utc).strftime("%H:%M UTC · %b %-d")
    return {
        "market_pulse": data["market_pulse"],
        "signals": data["signals"],
        "timestamp": f"{timestamp} · AI",
    }


@router.post("/posts")
async def generate_posts():
    profile = _load_profile()
    client = _get_client()

    response = await client.chat.completions.create(
        model="gpt-4o",
        max_tokens=1024,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": _POSTS_SYSTEM},
            {"role": "user", "content": f"User profile: {_profile_context(profile)}\n\nWrite my X post drafts."},
        ],
    )

    data = json.loads(response.choices[0].message.content)
    return data["posts"]


@router.post("/digest")
async def generate_digest_endpoint():
    from ..ingestion.sources import write_cache
    data = await _generate_digest_content()
    write_cache("digest", data)
    return data


async def _generate_digest_content() -> dict:
    from ..ingestion.sources import read_cache
    profile = _load_profile()
    client = _get_client()

    news = read_cache("news") or []
    papers = read_cache("papers") or []
    jobs = read_cache("jobs") or []

    news_block = "\n".join(f"- [{n['source']}] {n['title']}" for n in news[:20]) or "No news cached yet."
    papers_block = "\n".join(f"- {p['title'][:90]} ({p['venue']})" for p in papers[:10]) or "No papers cached yet."
    jobs_block = "\n".join(f"- {j['title']} @ {j['company']} | {j['location']} ({j['source']})" for j in jobs[:12]) or "No jobs cached yet."

    user_content = f"""User profile: {_profile_context(profile)}

== LATEST NEWS ==
{news_block}

== NEW RESEARCH PAPERS ==
{papers_block}

== JOB OPPORTUNITIES ==
{jobs_block}

Generate my personalized intelligence digest."""

    response = await client.chat.completions.create(
        model="gpt-4o",
        max_tokens=1500,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": _DIGEST_SYSTEM},
            {"role": "user", "content": user_content},
        ],
    )

    data = json.loads(response.choices[0].message.content)
    data["generated_at"] = datetime.now(timezone.utc).isoformat()
    return data
