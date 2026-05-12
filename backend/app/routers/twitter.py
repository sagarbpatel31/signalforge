from datetime import date
from fastapi import APIRouter
from ..schemas import Post
from ..mock_data import POSTS

router = APIRouter(prefix="/api", tags=["twitter"])

# ── Post templates ─────────────────────────────────────────────────────────
# Each keeps hard 280-char limit for X free accounts.

_DOMAIN_TAGS: dict[str, list[str]] = {
    "Edge AI":      ["EdgeAI", "TinyML", "OnDeviceAI"],
    "Robotics":     ["Robotics", "ROS2", "PhysicalAI"],
    "Physical AI":  ["PhysicalAI", "Humanoids", "Robotics"],
    "Embedded":     ["Embedded", "Firmware", "RTOS"],
}

_ANGLES = [
    {
        "angle": "Take",
        "template": (
            "{emoji} {headline}\n\n"
            "{implication}\n\n"
            "#{tag1} #{tag2}"
        ),
    },
    {
        "angle": "Thread",
        "template": (
            "🧵 {headline}\n\n"
            "What this means for {domain} engineers — a quick breakdown:\n\n"
            "#{tag1}"
        ),
    },
    {
        "angle": "Contrarian",
        "template": (
            "Hot take: everyone's watching {subject}.\n\n"
            "The actual opportunity? {contrarian}.\n\n"
            "#{tag1} #{tag2}"
        ),
    },
]

_EMOJIS = ["⚡", "🔥", "🚀", "🧠", "📡", "🤖", "💡", "⚙️"]

_CONTRARIAN_FILLERS = [
    "the infrastructure layer — compilers, runtimes, edge deployment",
    "whoever owns the toolchain owns the market",
    "hardware-software co-design, not just bigger models",
    "the firms doing boring embedded integration work",
    "open-source inference engines running on $5 chips",
]


def _truncate(text: str, limit: int = 280) -> str:
    """Hard-cut to limit, break at word boundary."""
    if len(text) <= limit:
        return text
    cut = text[:limit].rsplit(" ", 1)[0]
    return cut.rstrip(".,\n") + "…"


def _profile_domains() -> list[str]:
    try:
        from ..routers.profile import _load
        p = _load()
        return p.model_dump().get("domains", []) if p else []
    except Exception:
        return []


def generate_posts_from_cache() -> list[Post]:
    """Generate 3 X post drafts from cached news — no Claude needed."""
    from ..ingestion.sources import read_cache

    news    = read_cache("news") or []
    domains = _profile_domains() or ["Edge AI", "Robotics"]

    # Primary tag from first domain
    d1, d2 = domains[0], domains[1] if len(domains) > 1 else domains[0]
    tags1   = _DOMAIN_TAGS.get(d1, [d1.replace(" ", "")])
    tags2   = _DOMAIN_TAGS.get(d2, [d2.replace(" ", "")])
    tag1, tag2 = tags1[0], tags2[0]

    if not news:
        return []

    # Daily rotation — pick 3 distinct news items deterministically
    day = date.today().timetuple().tm_yday   # 1-366
    n   = len(news)
    idx = [day % n, (day + max(1, n // 3)) % n, (day + max(1, 2 * n // 3)) % n]

    # Deduplicate indices if news pool is small
    seen = []
    for i in idx:
        if i not in seen:
            seen.append(i)
    while len(seen) < 3:
        seen.append(seen[-1])
    i0, i1, i2 = seen[0], seen[1], seen[2]

    posts: list[Post] = []

    # ── 1. Take ──────────────────────────────────────────────────────────────
    item   = news[i0]
    title  = item["title"]
    emoji  = _EMOJIS[day % len(_EMOJIS)]

    # Short headline: strip source prefixes and trailing punctuation
    short  = title.split(" - ")[0].split(" | ")[0].rstrip(".,:")
    if len(short) > 90:
        short = short[:87] + "…"

    impl   = f"This pushes {d1.lower()} closer to real production — not just research labs."
    text1  = f"{emoji} {short}\n\n{impl}\n\n#{tag1} #{tag2}"
    posts.append(Post(
        angle="Take",
        text=_truncate(text1),
        tags=[tag1, tag2],
        source_ref=item.get("source", ""),
    ))

    # ── 2. Thread hook ────────────────────────────────────────────────────────
    item2  = news[i1]
    short2 = item2["title"].split(" - ")[0].split(" | ")[0].rstrip(".,:")
    if len(short2) > 80:
        short2 = short2[:77] + "…"

    text2 = (
        f"🧵 {short2}\n\n"
        f"What this means for {d1} engineers — quick breakdown:\n\n"
        f"#{tag1}"
    )
    posts.append(Post(
        angle="Thread",
        text=_truncate(text2),
        tags=[tag1],
        source_ref=item2.get("source", ""),
    ))

    # ── 3. Contrarian ─────────────────────────────────────────────────────────
    item3   = news[i2]
    subject = item3["title"].split(" - ")[0].split(" | ")[0].rstrip(".,:")
    if len(subject) > 50:
        subject = subject[:47] + "…"
    contra = _CONTRARIAN_FILLERS[day % len(_CONTRARIAN_FILLERS)]

    text3 = (
        f"Hot take: everyone's watching {subject}.\n\n"
        f"The actual opportunity? {contra}.\n\n"
        f"#{tag1} #{tag2}"
    )
    posts.append(Post(
        angle="Contrarian",
        text=_truncate(text3),
        tags=[tag1, tag2],
        source_ref=item3.get("source", ""),
    ))

    return posts


@router.get("/posts", response_model=list[Post])
async def get_posts() -> list[Post]:
    """Return today's post drafts from live news cache. Falls back to mock."""
    from ..ingestion.sources import read_cache, write_cache

    # Try cached posts first (written by ingest or /posts/refresh)
    cached = read_cache("posts")
    if cached and isinstance(cached, list) and len(cached) >= 3:
        return [Post(**p) for p in cached]

    # Generate fresh from news cache
    posts = generate_posts_from_cache()
    if posts:
        write_cache("posts", [p.model_dump() for p in posts])
        return posts

    # Last resort: static mock
    return POSTS


@router.post("/posts/refresh", response_model=list[Post])
async def refresh_posts() -> list[Post]:
    """Regenerate post drafts from latest news cache and persist."""
    from ..ingestion.sources import write_cache

    posts = generate_posts_from_cache()
    if not posts:
        return POSTS
    write_cache("posts", [p.model_dump() for p in posts])
    return posts
