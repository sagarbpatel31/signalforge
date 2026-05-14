from datetime import date
from fastapi import APIRouter
from ..schemas import Post
from ..mock_data import POSTS

router = APIRouter(prefix="/api", tags=["twitter"])

# ── Domain → hashtag map ───────────────────────────────────────────────────
_DOMAIN_TAGS: dict[str, list[str]] = {
    "Edge AI":      ["EdgeAI", "TinyML", "OnDeviceAI"],
    "Robotics":     ["Robotics", "ROS2", "PhysicalAI"],
    "Physical AI":  ["PhysicalAI", "Humanoids", "Robotics"],
    "Embedded":     ["Embedded", "Firmware", "RTOS"],
}

# ── Template banks — rotate daily ─────────────────────────────────────────
# Each slot: callable(headline, tag1, tag2) → str (≤280 chars)

def _take_templates(h: str, t1: str, t2: str) -> list[str]:
    return [
        f"{h}.\n\nThis is what the inflection point looks like. Not hype — production.\n\n#{t1} #{t2}",
        f"Signal: {h}.\n\nWhoever owns the toolchain here owns the next decade.\n\n#{t1} #{t2}",
        f"⚡ {h}\n\nThe gap between research and production just closed. Pay attention.\n\n#{t1} #{t2}",
        f"Read this twice: {h}.\n\nInfrastructure eats every AI wave. Same story here.\n\n#{t1} #{t2}",
        f"🔥 {h}\n\nThis shifts the competitive map. Engineers who ignore it fall behind.\n\n#{t1} #{t2}",
        f"{h}.\n\nBullish on the compiler/runtime layer. Models commoditize. Tools don't.\n\n#{t1} #{t2}",
        f"Worth noting: {h}.\n\nDeployment > training. Always has been.\n\n#{t1} #{t2}",
    ]

def _thread_templates(h: str, t1: str) -> list[str]:
    return [
        f"🧵 {h}\n\nWhat every {t1} engineer needs to know right now:",
        f"🧵 Big one: {h}\n\nBreaking down what this means for the field:",
        f"🧵 {h}\n\nThree things this changes for practitioners:",
        f"🧵 Let's talk about {h}\n\nMost people are missing the real story:",
        f"🧵 {h}\n\nQuick take on why this matters for {t1} builders:",
        f"🧵 {h}\n\nI've been tracking this space. Here's the signal in the noise:",
        f"🧵 Underrated story: {h}\n\nThread on what the industry gets wrong about this:",
    ]

def _contrarian_templates(h: str, t1: str, t2: str) -> list[str]:
    return [
        f"Unpopular opinion: {h} gets all the attention.\n\nBut the real moat is in the runtime layer. Nobody talks about that.\n\n#{t1} #{t2}",
        f"Hot take: {h} is a distraction.\n\nThe companies winning long-term are the ones solving deployment, not training.\n\n#{t1} #{t2}",
        f"Everyone's excited about {h}.\n\nI'm more excited about whoever builds the boring infrastructure underneath it.\n\n#{t1} #{t2}",
        f"Contrarian: {h} matters less than the toolchain around it.\n\nHistory backs this up. Compilers > chips.\n\n#{t1} #{t2}",
        f"The {h} hype is real but misallocated.\n\nEngineers: build for the deployment problem, not the model problem.\n\n#{t1} #{t2}",
        f"Take: {h} is exciting, but edge deployment is still broken.\n\nThat's the unsexy trillion-dollar problem.\n\n#{t1} #{t2}",
        f"Fight me: {h} isn't the hard part.\n\nGetting it to run reliably on constrained hardware at scale — that's the hard part.\n\n#{t1} #{t2}",
    ]


def _clean(title: str, max_len: int = 80) -> str:
    """Strip source suffixes, clean punctuation, truncate."""
    for sep in [" - ", " | ", " — ", " · "]:
        title = title.split(sep)[0]
    title = title.rstrip(".,: ")
    if len(title) > max_len:
        title = title[:max_len - 1].rsplit(" ", 1)[0].rstrip(".,") + "…"
    return title


def _truncate(text: str, limit: int = 280) -> str:
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
    """Build 3 X/Twitter drafts from cached news. No API key needed."""
    from ..ingestion.sources import read_cache

    news    = read_cache("news") or []
    domains = _profile_domains() or ["Edge AI", "Robotics"]

    d1  = domains[0]
    d2  = domains[1] if len(domains) > 1 else domains[0]
    t1  = _DOMAIN_TAGS.get(d1, [d1.replace(" ", "")])[0]
    t2  = _DOMAIN_TAGS.get(d2, [d2.replace(" ", "")])[0]

    if not news:
        return []

    n   = len(news)
    day = date.today().timetuple().tm_yday  # 1-366 — changes daily

    # Pick 3 distinct news items, rotating by day
    def pick(offset: int) -> dict:
        return news[(day + offset * max(1, n // 3)) % n]

    item_take       = pick(0)
    item_thread     = pick(1)
    item_contrarian = pick(2)

    # Variant index also rotates daily (7 variants each)
    v = day % 7

    posts: list[Post] = []

    # ── Take ───────────────────────────────────────────────────────────────
    h1 = _clean(item_take["title"], 85)
    takes = _take_templates(h1, t1, t2)
    posts.append(Post(
        angle="Take",
        text=_truncate(takes[v]),
        tags=[t1, t2],
        source_ref=item_take.get("source", ""),
    ))

    # ── Thread ────────────────────────────────────────────────────────────
    h2 = _clean(item_thread["title"], 100)
    threads = _thread_templates(h2, t1)
    posts.append(Post(
        angle="Thread",
        text=_truncate(threads[v]),
        tags=[t1],
        source_ref=item_thread.get("source", ""),
    ))

    # ── Contrarian ────────────────────────────────────────────────────────
    h3 = _clean(item_contrarian["title"], 55)
    contras = _contrarian_templates(h3, t1, t2)
    posts.append(Post(
        angle="Contrarian",
        text=_truncate(contras[v]),
        tags=[t1, t2],
        source_ref=item_contrarian.get("source", ""),
    ))

    return posts


@router.get("/posts", response_model=list[Post])
async def get_posts() -> list[Post]:
    """Return today's drafts from cache → generate from news → mock fallback."""
    from ..ingestion.sources import read_cache, write_cache

    cached = read_cache("posts")
    if cached and isinstance(cached, list) and len(cached) >= 3:
        return [Post(**p) for p in cached]

    posts = generate_posts_from_cache()
    if posts:
        write_cache("posts", [p.model_dump() for p in posts])
        return posts

    return POSTS


@router.post("/posts/refresh", response_model=list[Post])
async def refresh_posts() -> list[Post]:
    """Regenerate drafts from latest news and persist."""
    from ..ingestion.sources import write_cache

    posts = generate_posts_from_cache()
    if not posts:
        return POSTS
    write_cache("posts", [p.model_dump() for p in posts])
    return posts
