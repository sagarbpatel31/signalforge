import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..schemas import Signal, Post
from ..routers.profile import _load as _load_profile

router = APIRouter(prefix="/api/generate", tags=["generate"])

_SIGNALS_SYSTEM = """You are SignalForge, an AI intelligence terminal for engineers and founders in deep-tech.
Your output must be valid JSON — no markdown, no explanation, just the JSON object.

Generate a personalized daily intelligence brief for the user profile below.
Return exactly this shape:
{
  "market_pulse": "<one punchy sentence on the most important macro signal today>",
  "signals": [
    {"label": "<4-6 char tag>", "delta": "<+X%|↑|↓|→>", "color": "<cyan|amber|green|red|muted>", "text": "<one sentence insight>"},
    ...
  ]
}

Rules:
- 5–6 signals covering the user's domains
- color: green/cyan = bullish/opportunity, amber = watch/mixed, red = risk/decline, muted = neutral
- delta: concise stat or directional arrow
- label: uppercase 4–8 chars (e.g. ARXIV, NVIDIA, EDGE-AI)
- Grounded in real trends as of today; no fluff"""

_POSTS_SYSTEM = """You are SignalForge, an AI intelligence terminal for engineers and founders in deep-tech.
Your output must be valid JSON — no markdown, no explanation, just the JSON object.

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
- tags: 1–3 relevant lowercase keywords (no # prefix)
- Take: bold opinion
- Thread: compelling hook that makes people want to read more
- Contrarian: challenges a common assumption in their field"""


def _get_client():
    try:
        import anthropic as _anthropic
    except ImportError:
        raise HTTPException(status_code=503, detail="anthropic package not installed")
    key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not key or key == "your_key_here":
        raise HTTPException(status_code=503, detail="ANTHROPIC_API_KEY not configured")
    return _anthropic.Anthropic(api_key=key)


def _extract_json(text: str) -> dict:
    start = text.find("{")
    end = text.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError("No JSON object found in response")
    return json.loads(text[start:end])


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

    system_text = f"{_SIGNALS_SYSTEM}\n\nUser profile: {{{_profile_context(profile)}}}"

    response = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=1024,
        thinking={"type": "adaptive"},
        system=[{"type": "text", "text": system_text, "cache_control": {"type": "ephemeral"}}],
        messages=[{"role": "user", "content": "Generate my daily intelligence brief for right now."}],
    )

    text = next((b.text for b in response.content if b.type == "text"), "")
    data = _extract_json(text)

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

    system_text = f"{_POSTS_SYSTEM}\n\nUser profile: {{{_profile_context(profile)}}}"

    response = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=1024,
        thinking={"type": "adaptive"},
        system=[{"type": "text", "text": system_text, "cache_control": {"type": "ephemeral"}}],
        messages=[{"role": "user", "content": "Write my X post drafts for today."}],
    )

    text = next((b.text for b in response.content if b.type == "text"), "")
    data = _extract_json(text)
    return data["posts"]
