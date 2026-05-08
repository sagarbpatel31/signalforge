import json
import os
from datetime import datetime, timezone
from typing import Optional, AsyncGenerator

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from ..routers.profile import _load as _load_profile

router = APIRouter(prefix="/api/generate", tags=["generate"])

# ── System prompts ────────────────────────────────────────────────────────

_SIGNALS_SYSTEM = """You are SignalForge, an AI intelligence terminal for engineers and founders in deep-tech.
Return ONLY valid JSON — no markdown, no explanation, no code fences.

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
- Use provided real headlines as primary source — be specific, not generic"""

_POSTS_SYSTEM = """You are SignalForge, an AI intelligence terminal for engineers and founders in deep-tech.
Return ONLY valid JSON — no markdown, no explanation, no code fences.

Write 3 X/Twitter post drafts for the user profile below.
Return exactly this shape:
{
  "posts": [
    {"angle": "Take", "text": "<tweet>", "tags": ["tag1", "tag2"], "source_ref": "<cited source>"},
    {"angle": "Thread", "text": "<opening tweet of a thread>", "tags": ["tag1"], "source_ref": ""},
    {"angle": "Contrarian", "text": "<tweet>", "tags": ["tag1", "tag2"], "source_ref": "<cited source>"}
  ]
}

Rules:
- Each post under 280 chars
- Authentic founder/engineer voice, no corporate speak
- tags: 1–3 lowercase keywords (no # prefix)
- source_ref: cite real data (company name, metric, date) or leave empty
- Take: bold opinion; Thread: compelling hook; Contrarian: challenges common assumption"""

_DIGEST_SYSTEM = """You are SignalForge, an AI intelligence terminal for engineers and founders in deep-tech.
Return ONLY valid JSON — no markdown, no explanation, no code fences.

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
- 3 items per section, each grounded in the provided data
- No generic advice — every item must reference something specific from the data
- action_item: specific and actionable (e.g. "Apply to X at Hailo", "Read paper Y")"""

_TASKS_SYSTEM = """You are SignalForge, an AI intelligence terminal for engineers and founders in deep-tech.
Return ONLY valid JSON — no markdown, no explanation, no code fences.

Generate 5-6 actionable tasks for this week based on the user profile and live signals below.
Return exactly this shape:
[
  {"id": 1, "priority": "P0", "task": "<specific actionable task>", "domain": "<Edge AI|Robotics|Physical AI|Embedded>", "time": "<1h|2h|3h>"},
  ...
]

Rules:
- P0: must-do this week (1-2 tasks max), P1: high value (2-3 tasks), P2: nice-to-have (1-2 tasks)
- Ground tasks in real companies, tools, papers from the signals — no generic advice
- Be specific: "Apply to Hailo Compiler Eng role" not "Apply to jobs"
- time: honest estimate in hours"""

_WEEKLY_SYSTEM = """You are SignalForge, an AI intelligence terminal for engineers and founders in deep-tech.
Return ONLY valid JSON — no markdown, no explanation, no code fences.

Generate a weekly strategic review for the user profile below.
Return exactly this shape:
{
  "wins": ["<win with metric>", "<win with metric>", "<win with metric>"],
  "gaps": ["<gap with root cause>", "<gap with root cause>"],
  "conviction_bets": [
    {"label": "<technology/market bet>", "conviction": <0-100>},
    {"label": "<technology/market bet>", "conviction": <0-100>},
    {"label": "<technology/market bet>", "conviction": <0-100>}
  ],
  "next_week_focus": "<one Hemingway-simple focus sentence — what matters most next week>"
}

Rules:
- wins: framed as accomplishments with numbers/metrics where possible
- gaps: honest, with root cause (not just "didn't do X" but "why")
- conviction_bets: 3 bets on technologies/markets in the user's domains, scored 0-100
- next_week_focus: direct and energizing, avoid corporate speak"""


# ── Helpers ───────────────────────────────────────────────────────────────

def _validate_key() -> str:
    key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not key or key.startswith("your_"):
        raise HTTPException(status_code=503, detail="ANTHROPIC_API_KEY not configured")
    return key


def _get_client():
    try:
        import anthropic
    except ImportError:
        raise HTTPException(status_code=503, detail="anthropic package not installed")
    return anthropic.AsyncAnthropic(api_key=_validate_key())


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


def _extract_json(text: str) -> dict | list:
    """Strip markdown fences and parse JSON."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])
    return json.loads(text)


def _news_context(limit: int = 15) -> str:
    from ..ingestion.sources import read_cache
    cached = read_cache("news")
    if not cached:
        return ""
    lines = "\n".join(f"- [{n['source']}] {n['title']}" for n in cached[:limit])
    return f"\n\nReal headlines (last 12h):\n{lines}"


# ── Streaming brief ───────────────────────────────────────────────────────

async def _stream_brief_generator() -> AsyncGenerator[str, None]:
    from ..ingestion.sources import read_cache
    import anthropic

    profile = _load_profile()
    client = _get_client()
    news_context = _news_context()

    user_content = (
        f"User profile: {_profile_context(profile)}"
        f"{news_context}\n\nGenerate my daily intelligence brief."
    )

    accumulated = ""
    try:
        async with client.messages.stream(
            model="claude-opus-4-7",
            max_tokens=1200,
            system=[{"type": "text", "text": _SIGNALS_SYSTEM, "cache_control": {"type": "ephemeral"}}],
            messages=[{"role": "user", "content": user_content}],
        ) as stream:
            async for chunk in stream.text_stream:
                accumulated += chunk
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"

        # Parse final result
        data = _extract_json(accumulated)
        timestamp = datetime.now(timezone.utc).strftime("%H:%M UTC · %b %-d")
        result = {
            "market_pulse": data["market_pulse"],
            "signals": data["signals"],
            "timestamp": f"{timestamp} · Claude",
        }
        yield f"data: {json.dumps({'done': True, 'result': result})}\n\n"

    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"


@router.post("/brief")
async def generate_brief():
    _validate_key()
    return StreamingResponse(
        _stream_brief_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ── Posts ─────────────────────────────────────────────────────────────────

@router.post("/posts")
async def generate_posts():
    profile = _load_profile()
    client = _get_client()
    news_context = _news_context(8)

    user_content = (
        f"User profile: {_profile_context(profile)}"
        f"{news_context}\n\nWrite my X post drafts."
    )

    message = await client.messages.create(
        model="claude-opus-4-7",
        max_tokens=1200,
        system=[{"type": "text", "text": _POSTS_SYSTEM, "cache_control": {"type": "ephemeral"}}],
        messages=[{"role": "user", "content": user_content}],
    )

    try:
        data = _extract_json(message.content[0].text)
        return data["posts"]
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to parse posts response")


# ── Tasks ─────────────────────────────────────────────────────────────────

@router.post("/tasks")
async def generate_tasks():
    from ..ingestion.sources import read_cache
    profile = _load_profile()
    client = _get_client()

    news = read_cache("news") or []
    jobs = read_cache("jobs") or []
    news_lines = "\n".join(f"- {n['title']}" for n in news[:10])
    job_lines = "\n".join(f"- {j['title']} @ {j['company']}" for j in jobs[:8])

    user_content = (
        f"User profile: {_profile_context(profile)}\n\n"
        f"Top news signals:\n{news_lines or 'None cached'}\n\n"
        f"Open roles relevant to me:\n{job_lines or 'None cached'}\n\n"
        "Generate my tasks for this week."
    )

    message = await client.messages.create(
        model="claude-opus-4-7",
        max_tokens=800,
        system=[{"type": "text", "text": _TASKS_SYSTEM, "cache_control": {"type": "ephemeral"}}],
        messages=[{"role": "user", "content": user_content}],
    )

    try:
        return _extract_json(message.content[0].text)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to parse tasks response")


# ── Weekly review ─────────────────────────────────────────────────────────

@router.post("/weekly")
async def generate_weekly():
    from ..ingestion.sources import read_cache
    profile = _load_profile()
    client = _get_client()

    news = read_cache("news") or []
    news_lines = "\n".join(f"- {n['title']}" for n in news[:10])

    user_content = (
        f"User profile: {_profile_context(profile)}\n\n"
        f"This week's signals:\n{news_lines or 'None cached'}\n\n"
        "Generate my weekly strategic review."
    )

    message = await client.messages.create(
        model="claude-opus-4-7",
        max_tokens=800,
        system=[{"type": "text", "text": _WEEKLY_SYSTEM, "cache_control": {"type": "ephemeral"}}],
        messages=[{"role": "user", "content": user_content}],
    )

    try:
        return _extract_json(message.content[0].text)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to parse weekly response")


# ── Digest ────────────────────────────────────────────────────────────────

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

    news_block = "\n".join(f"- [{n['source']}] {n['title']}" for n in news[:20]) or "No news cached."
    papers_block = "\n".join(f"- {p['title'][:90]} ({p['venue']})" for p in papers[:10]) or "No papers cached."
    jobs_block = "\n".join(f"- {j['title']} @ {j['company']} | {j.get('location','?')} ({j.get('source','')})" for j in jobs[:12]) or "No jobs cached."

    user_content = (
        f"User profile: {_profile_context(profile)}\n\n"
        f"== LATEST NEWS ==\n{news_block}\n\n"
        f"== NEW RESEARCH PAPERS ==\n{papers_block}\n\n"
        f"== JOB OPPORTUNITIES ==\n{jobs_block}\n\n"
        "Generate my personalized intelligence digest."
    )

    message = await client.messages.create(
        model="claude-opus-4-7",
        max_tokens=1500,
        system=[{"type": "text", "text": _DIGEST_SYSTEM, "cache_control": {"type": "ephemeral"}}],
        messages=[{"role": "user", "content": user_content}],
    )

    try:
        data = _extract_json(message.content[0].text)
        data["generated_at"] = datetime.now(timezone.utc).isoformat()
        return data
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to parse digest response")
