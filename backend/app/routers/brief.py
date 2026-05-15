from fastapi import APIRouter
from datetime import datetime, timezone, date
from ..schemas import BriefResponse, Signal, Stat
from ..mock_data import SIGNALS, MARKET_PULSE, STATS

router = APIRouter(prefix="/api", tags=["brief"])

# ── Domain → signal label map ──────────────────────────────────────────────
_DOMAIN_LABELS = {
    "robotics": ("🤖 Robotics", "cyan"),
    "edge-ai":  ("⚡ Edge AI",  "amber"),
    "llm":      ("🧠 LLM",      "green"),
    "startup":  ("💰 Funding",  "amber"),
    "physical-ai": ("🦾 Physical AI", "cyan"),
    "agentic":  ("🔗 Agents",   "green"),
    "embedded": ("🔌 Embedded", "muted"),
    "generative": ("🎨 GenAI",  "green"),
    "tech":     ("📡 Tech",     "muted"),
}

_SIGNAL_TEXTS = {
    "robotics":    "New manipulation + locomotion breakthroughs hitting production.",
    "edge-ai":     "On-device inference models shrinking fast — Jetson + MCU targets.",
    "llm":         "Foundation model releases accelerating. Fine-tuning cost dropping.",
    "startup":     "VC rounds closing in robotics / physical AI. Seed + Series A active.",
    "physical-ai": "Humanoid + sim-to-real papers signaling near-term deployment.",
    "agentic":     "Agentic frameworks maturing. Tool use + multi-agent patterns emerging.",
    "embedded":    "RTOS + firmware toolchains seeing ML integration pushes.",
    "generative":  "Multimodal + VLM capabilities expanding into robotics pipelines.",
    "tech":        "General tech signal — cross-cutting infrastructure moves.",
}

_PULSE_TEMPLATES = [
    "Edge AI and robotics signals converging — deployment beats research this cycle.",
    "Physical AI momentum building; humanoid + manipulation papers at record pace.",
    "LLM cost floor dropping weekly — on-device fine-tuning now viable at scale.",
    "Funding active in robotics / autonomous systems despite macro headwinds.",
    "Sim-to-real gap narrowing — Isaac Lab + Genesis enabling faster iteration.",
    "Foundation models commoditizing; toolchain and runtime layer becoming the moat.",
    "Embodied AI pipelines maturing — perception + planning coupling tighter.",
]


def _build_brief_from_cache() -> BriefResponse:
    """Generate market_pulse + signals from cached news. No API key needed."""
    from ..ingestion.sources import read_cache

    news = read_cache("news") or []
    meta = read_cache("meta") or {}

    # Count tags across all news items
    tag_counts: dict[str, int] = {}
    for item in news:
        for tag in item.get("tags", []):
            tag_counts[tag] = tag_counts.get(tag, 0) + 1

    # Top 4 tags → signals
    top_tags = sorted(tag_counts, key=lambda t: -tag_counts[t])[:4]
    if not top_tags:
        top_tags = ["robotics", "edge-ai", "llm", "startup"]

    signals: list[Signal] = []
    for tag in top_tags:
        label_str, color_str = _DOMAIN_LABELS.get(tag, ("📡 Tech", "muted"))
        count = tag_counts.get(tag, 0)
        delta = f"+{count}" if count else "—"
        text = _SIGNAL_TEXTS.get(tag, "Cross-domain signals active.")
        signals.append(Signal(
            label=label_str,
            delta=delta,
            color=color_str,  # type: ignore[arg-type]
            text=text,
        ))

    # Pad to 4 if needed
    while len(signals) < 4:
        signals.append(Signal(
            label="📡 Tech",
            delta="—",
            color="muted",
            text="General tech signal — cross-cutting infrastructure moves.",
        ))

    # Market pulse — rotate daily or use news-derived
    day = date.today().timetuple().tm_yday
    if news:
        # Use top news headline to anchor pulse
        top = news[0]
        title_frag = top["title"][:60].rsplit(" ", 1)[0]
        pulse = (
            f"{title_frag}… — {_PULSE_TEMPLATES[day % len(_PULSE_TEMPLATES)]}"
        )
    else:
        pulse = _PULSE_TEMPLATES[day % len(_PULSE_TEMPLATES)]

    return BriefResponse(
        market_pulse=pulse,
        signals=signals,
        timestamp=datetime.now(timezone.utc).strftime("%H:%M UTC · %b %-d"),
    )


def _build_stats_from_cache() -> list[Stat]:
    """Return live counts from cache:meta. Falls back to mock if no data."""
    from ..ingestion.sources import read_cache

    meta = read_cache("meta") or {}
    counts = meta.get("counts", {})
    last_refresh = meta.get("last_refresh", "")

    news_n  = counts.get("news", 0)
    jobs_n  = counts.get("jobs", 0)
    paper_n = counts.get("papers", 0)

    if not any([news_n, jobs_n, paper_n]):
        return STATS

    # Format delta as time since refresh
    if last_refresh:
        try:
            ts = datetime.fromisoformat(last_refresh.replace("Z", "+00:00"))
            diff = datetime.now(timezone.utc) - ts
            hrs = int(diff.total_seconds() // 3600)
            refresh_label = f"↑ {hrs}h ago" if hrs < 24 else "↑ today"
        except Exception:
            refresh_label = "↑ live"
    else:
        refresh_label = "↑ live"

    return [
        Stat(label="Signals Tracked", value=str(news_n + jobs_n + paper_n),
             delta=refresh_label, up=True),
        Stat(label="Jobs Indexed",    value=str(jobs_n),  delta=f"+{jobs_n} live", up=True),
        Stat(label="Papers",          value=str(paper_n), delta="↑ arXiv", up=True),
        Stat(label="News Items",      value=str(news_n),  delta=refresh_label, up=True),
    ]


@router.get("/brief", response_model=BriefResponse)
async def get_brief() -> BriefResponse:
    try:
        brief = _build_brief_from_cache()
        # If no meaningful signals built, fall back to mock
        if brief.signals[0].label == "📡 Tech" and brief.signals[0].delta == "—":
            return BriefResponse(
                market_pulse=MARKET_PULSE,
                signals=SIGNALS,
                timestamp=datetime.now(timezone.utc).strftime("%H:%M UTC · %b %-d"),
            )
        return brief
    except Exception:
        return BriefResponse(
            market_pulse=MARKET_PULSE,
            signals=SIGNALS,
            timestamp=datetime.now(timezone.utc).strftime("%H:%M UTC · %b %-d"),
        )


@router.get("/stats", response_model=list[Stat])
async def get_stats() -> list[Stat]:
    try:
        return _build_stats_from_cache()
    except Exception:
        return STATS
