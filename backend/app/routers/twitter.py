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
    "Generative AI":["GenAI", "LLM", "FoundationModels"],
}

# ── Template banks — 10 variants each, rotate daily ───────────────────────

def _take_templates(h: str, t1: str, t2: str) -> list[str]:
    return [
        f"{h}.\n\nThis is what the inflection point looks like. Not hype — production.\n\n#{t1} #{t2}",
        f"Signal: {h}.\n\nWhoever owns the toolchain here owns the next decade.\n\n#{t1} #{t2}",
        f"⚡ {h}\n\nThe gap between research and production just closed. Pay attention.\n\n#{t1} #{t2}",
        f"Read this twice: {h}.\n\nInfrastructure eats every AI wave. Same story here.\n\n#{t1} #{t2}",
        f"🔥 {h}\n\nThis shifts the competitive map. Engineers who ignore it fall behind.\n\n#{t1} #{t2}",
        f"{h}.\n\nBullish on the compiler/runtime layer. Models commoditize. Tools don't.\n\n#{t1} #{t2}",
        f"Worth noting: {h}.\n\nDeployment > training. Always has been.\n\n#{t1} #{t2}",
        f"Nobody is talking about {h} enough.\n\nThis is the move most people miss.\n\n#{t1} #{t2}",
        f"Quietly important: {h}.\n\nThis is where the next generation of companies is being built.\n\n#{t1} #{t2}",
        f"If you work in {t1}: {h} matters more than you think.\n\nHere's why.\n\n#{t1} #{t2}",
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
        f"🧵 {h}\n\nA practitioner's breakdown — not the hype version:",
        f"🧵 {h} just dropped.\n\nHere's what actually changed and what didn't:",
        f"🧵 Spent the week reading on {h}.\n\nHere's what {t1} engineers should care about:",
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
        f"The narrative around {h} is backwards.\n\nThe real value isn't in the model. It's in the data pipeline nobody wants to build.\n\n#{t1} #{t2}",
        f"People keep asking about {h}.\n\nWrong question. Ask who controls the inference stack in 3 years.\n\n#{t1} #{t2}",
        f"Overrated: chasing {h} benchmarks.\n\nUnderrated: shipping a product that actually runs on the hardware you have.\n\n#{t1} #{t2}",
    ]


def _job_hunt_templates(h: str, t1: str, t2: str) -> list[str]:
    """Career/hiring-signal angle — relevant to engineers job hunting in the space."""
    return [
        f"The companies hiring aggressively right now are all working on {h}.\n\nIf you're a {t1} engineer, this is your moment. The wave is here.\n\n#{t1} #{t2}",
        f"Watching the {h} hiring wave.\n\nEvery robotics/AI company is competing for the same 500 engineers. Stand out by shipping.\n\n#{t1} #{t2}",
        f"{h} = new hiring signal.\n\nIf your resume doesn't show hands-on deployment experience, update it before you apply.\n\n#{t1} #{t2}",
        f"Hiring managers right now: '{h}' in every JD.\n\nWhat they actually want: someone who's shipped in production.\n\n#{t1} #{t2}",
        f"If you want to work on {h}: the bar is practical.\n\nShow a GitHub. Show a demo. Show latency numbers. That's it.\n\n#{t1} #{t2}",
        f"The {h} job market is moving fast.\n\nStarts at the research layer, lands in production 18 months later. Be ready.\n\n#{t1} #{t2}",
        f"Best career moat in {t1} right now?\n\nBe the person who can take {h} from paper → repo → deployed product.\n\n#{t1} #{t2}",
        f"Companies building on {h} are hiring senior engineers at 2× market rate.\n\nBecause there aren't enough of them. Get skilled up.\n\n#{t1} #{t2}",
        f"Job market signal: {h} is showing up in 3× more JDs than 6 months ago.\n\nThe talent gap is real. Fill it.\n\n#{t1} #{t2}",
        f"What the {h} hiring boom means for engineers:\n\nSpecialization > generalization right now. Pick a lane and go deep.\n\n#{t1} #{t2}",
    ]


def _research_templates(h: str, t1: str, t2: str) -> list[str]:
    """Research-signal angle — highlights papers, benchmarks, technical findings."""
    return [
        f"New research on {h}.\n\nThis changes the baseline assumption everyone was working from.\n\n#{t1} #{t2}",
        f"Paper drop: {h}.\n\nRead the ablations before you read the abstract. That's where the real result is.\n\n#{t1} #{t2}",
        f"The research on {h} is ahead of what practitioners are building.\n\nThat gap is an opportunity.\n\n#{t1} #{t2}",
        f"Everyone cites {h}.\n\nFew people have read past page 4. The method section is where the alpha is.\n\n#{t1} #{t2}",
        f"Benchmark result: {h}.\n\nBefore you celebrate — check the eval setup. That's where claims usually fall apart.\n\n#{t1} #{t2}",
        f"Research to production timeline for {h}: about 18 months.\n\nMeaning the papers dropping now = jobs opening mid-2026.\n\n#{t1} #{t2}",
        f"The {h} paper is worth your weekend.\n\nNot because of the result — because of what it implies for deployment.\n\n#{t1} #{t2}",
        f"Underrated finding in recent {h} research:\n\nThe ceiling keeps moving. What was SOTA 6 months ago is the baseline today.\n\n#{t1} #{t2}",
        f"Reading through the {h} literature this week.\n\nKey insight: the hard part was never the model. It was always the data.\n\n#{t1} #{t2}",
        f"{h} research signal: the field is converging on a small number of architectures.\n\nMoat shifts from research to execution.\n\n#{t1} #{t2}",
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
    """Build 5 X/Twitter drafts from cached news. No API key needed."""
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
    day = date.today().timetuple().tm_yday  # 1-366

    # Pick 5 distinct news items, rotating by day
    step = max(1, n // 5)
    def pick(offset: int) -> dict:
        return news[(day + offset * step) % n]

    item_take       = pick(0)
    item_thread     = pick(1)
    item_contrarian = pick(2)
    item_jobs       = pick(3)
    item_research   = pick(4)

    # Variant index rotates daily (10 variants each)
    v = day % 10

    posts: list[Post] = []

    # ── Take ───────────────────────────────────────────────────────────────
    h1 = _clean(item_take["title"], 85)
    posts.append(Post(
        angle="Take",
        text=_truncate(_take_templates(h1, t1, t2)[v]),
        tags=[t1, t2],
        source_ref=item_take.get("source", ""),
    ))

    # ── Thread ────────────────────────────────────────────────────────────
    h2 = _clean(item_thread["title"], 100)
    posts.append(Post(
        angle="Thread",
        text=_truncate(_thread_templates(h2, t1)[v]),
        tags=[t1],
        source_ref=item_thread.get("source", ""),
    ))

    # ── Contrarian ────────────────────────────────────────────────────────
    h3 = _clean(item_contrarian["title"], 55)
    posts.append(Post(
        angle="Contrarian",
        text=_truncate(_contrarian_templates(h3, t1, t2)[v]),
        tags=[t1, t2],
        source_ref=item_contrarian.get("source", ""),
    ))

    # ── Job Hunt ──────────────────────────────────────────────────────────
    h4 = _clean(item_jobs["title"], 65)
    posts.append(Post(
        angle="Job Hunt",
        text=_truncate(_job_hunt_templates(h4, t1, t2)[v]),
        tags=[t1, t2],
        source_ref=item_jobs.get("source", ""),
    ))

    # ── Research ──────────────────────────────────────────────────────────
    h5 = _clean(item_research["title"], 70)
    posts.append(Post(
        angle="Research",
        text=_truncate(_research_templates(h5, t1, t2)[v]),
        tags=[t1, t2],
        source_ref=item_research.get("source", ""),
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
