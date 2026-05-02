import json
import os
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException

from ..routers.profile import _load as _load_profile

router = APIRouter(prefix="/api/generate", tags=["generate"])

_SIGNALS_SYSTEM = """You are SignalForge, an AI intelligence terminal for engineers and founders in deep-tech.
Return ONLY valid JSON — no markdown, no explanation.

Generate a personalized daily intelligence brief for the user profile provided.
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
- Grounded in real trends; no fluff"""

_POSTS_SYSTEM = """You are SignalForge, an AI intelligence terminal for engineers and founders in deep-tech.
Return ONLY valid JSON — no markdown, no explanation.

Write 3 X/Twitter post drafts for the user profile provided.
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


def _get_client():
    try:
        from openai import OpenAI
    except ImportError:
        raise HTTPException(status_code=503, detail="openai package not installed")
    key = os.environ.get("OPENAI_API_KEY", "")
    if not key or key == "your_key_here":
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY not configured")
    return OpenAI(api_key=key)


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
    profile = _load_profile()
    client = _get_client()

    response = client.chat.completions.create(
        model="gpt-4o",
        max_tokens=1024,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": _SIGNALS_SYSTEM},
            {"role": "user", "content": f"User profile: {_profile_context(profile)}\n\nGenerate my daily intelligence brief."},
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

    response = client.chat.completions.create(
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
