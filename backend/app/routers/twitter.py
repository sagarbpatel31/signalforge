from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends

from ..auth import current_user, optional_user
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
        f"Signal: {h}.\n\nWhoever owns the toolchain here owns the next decade. Watching closely.\n\n#{t1} #{t2}",
        f"⚡ {h}\n\nThe gap between research and production just closed. 2026 is the deployment year.\n\n#{t1} #{t2}",
        f"Read this twice: {h}.\n\nInfrastructure eats every AI wave. Compilers, runtimes, deployment stacks — that's the moat.\n\n#{t1} #{t2}",
        f"🔥 {h}\n\nShifts the competitive map. Humanoid deployments went from demo to production in 18 months. Same pattern here.\n\n#{t1} #{t2}",
        f"{h}.\n\nModels commoditize fast. The compiler/runtime layer doesn't. That's where I'd be building.\n\n#{t1} #{t2}",
        f"Worth noting: {h}.\n\nDeployment > training. Always has been. The Skild/$14B round just confirmed it.\n\n#{t1} #{t2}",
        f"Nobody is talking about {h} enough.\n\nEveryone's watching foundation model benchmarks. Miss this and you miss the real wave.\n\n#{t1} #{t2}",
        f"Quietly important: {h}.\n\nThis is where the next 10 unicorns are being built. Physical AI + edge = the stack.\n\n#{t1} #{t2}",
        f"If you work in {t1}: {h} matters more than you think.\n\nMCP + agentic tooling + edge inference = new full stack. Pay attention.\n\n#{t1} #{t2}",
    ]


def _thread_templates(h: str, t1: str) -> list[str]:
    return [
        f"🧵 {h}\n\nWhat every {t1} engineer needs to know right now (thread):",
        f"🧵 Big one: {h}\n\nBreaking down what this means for practitioners in 2026:",
        f"🧵 {h}\n\nThree things this changes — and one thing everyone gets wrong:",
        f"🧵 Let's talk about {h}\n\nMost people are missing the real story. Here's mine:",
        f"🧵 {h}\n\nWhy this matters for {t1} builders right now. Quick breakdown:",
        f"🧵 {h}\n\nI've been tracking this space for months. Here's the signal vs. noise:",
        f"🧵 Underrated: {h}\n\nThread on what the industry gets wrong — and the actual opportunity:",
        f"🧵 {h}\n\nPractitioner's take — not the VC version, not the hype version:",
        f"🧵 {h} just dropped.\n\nHere's what actually changed, what didn't, and what to do about it:",
        f"🧵 Spent the week reading on {h}.\n\nHere's what {t1} engineers should actually care about:",
    ]


def _contrarian_templates(h: str, t1: str, t2: str) -> list[str]:
    return [
        f"Unpopular opinion: {h} gets all the attention.\n\nThe real moat is the runtime layer. Nobody wants to build it. That's exactly why you should.\n\n#{t1} #{t2}",
        f"Hot take: {h} isn't the hard part.\n\nGetting it to run reliably on edge hardware at scale — that's the trillion-dollar problem nobody's solved.\n\n#{t1} #{t2}",
        f"Everyone's excited about {h}.\n\nI'm more excited about whoever builds the boring infra underneath it. Happened with cloud. Happening again.\n\n#{t1} #{t2}",
        f"Contrarian: {h} matters less than the toolchain around it.\n\nHistory: Compilers outlasted chips. Kubernetes outlasted Mesos. Same pattern every cycle.\n\n#{t1} #{t2}",
        f"The {h} hype is real but misallocated.\n\nEngineers: solve deployment, not training. The frontier labs have training covered. Nobody has deployment.\n\n#{t1} #{t2}",
        f"Take: {h} is exciting, but edge deployment is still completely broken.\n\nThat unsexy problem is worth more than the model it runs.\n\n#{t1} #{t2}",
        f"Fight me: the {h} benchmark doesn't matter.\n\nWhat matters: does it run at 8ms on the hardware your customer actually has?\n\n#{t1} #{t2}",
        f"The narrative around {h} is backwards.\n\nValue isn't in the model. It's in the data flywheel + inference stack nobody wants to build.\n\n#{t1} #{t2}",
        f"People keep asking about {h}.\n\nWrong question. Ask who controls the inference stack when 12 humanoid platforms are all in production simultaneously.\n\n#{t1} #{t2}",
        f"Overrated: chasing {h} leaderboard scores.\n\nUnderrated: shipping something that runs on the $300 NPU your customer can actually afford.\n\n#{t1} #{t2}",
    ]


def _job_hunt_templates(h: str, t1: str, t2: str) -> list[str]:
    """Career/hiring-signal angle — relevant to engineers job hunting in the space."""
    return [
        f"The companies hiring hardest right now are all working on {h}.\n\nSkild, Apptronik, PI, Axelera — the wave is here. If you're a {t1} engineer, move now.\n\n#{t1} #{t2}",
        f"Watching the {h} hiring wave.\n\n12 humanoid platforms. $4.3B raised in 2026. They're all chasing the same 500 engineers. Stand out by shipping real things.\n\n#{t1} #{t2}",
        f"{h} = new line item in every JD.\n\nIf your resume doesn't show hands-on deployment — Isaac Lab, ROS2, edge inference — update it before you apply.\n\n#{t1} #{t2}",
        f"Hiring managers in {t1} right now: every JD mentions {h}.\n\nWhat they actually want: someone who shipped in production, not someone who read the paper.\n\n#{t1} #{t2}",
        f"Want to work on {h}? The bar is practical, not academic.\n\nGitHub with real commits. A demo with latency numbers. That's it. That's the whole criteria.\n\n#{t1} #{t2}",
        f"The {h} job market moves fast.\n\nResearch → production pipeline is 18 months. Papers dropping today = roles opening Q1 2027. Get ahead of it.\n\n#{t1} #{t2}",
        f"Best career moat in {t1} right now:\n\nBe the engineer who takes {h} from arXiv → GitHub repo → deployed product. That path has maybe 200 people in it globally.\n\n#{t1} #{t2}",
        f"Companies building on {h} are paying 2× market for senior engineers.\n\nBecause there genuinely aren't enough people. The Skild $14B round is the signal — get skilled up.\n\n#{t1} #{t2}",
        f"Job market signal: {h} in 3× more JDs than 6 months ago.\n\nMCP servers, VLA policy, edge inference compilers — pick one lane and go deep right now.\n\n#{t1} #{t2}",
        f"What the {h} hiring boom actually means:\n\nSpecialization wins over generalization in this market. One deep skill beats five shallow ones. Every time.\n\n#{t1} #{t2}",
    ]


def _research_templates(h: str, t1: str, t2: str) -> list[str]:
    """Research-signal angle — highlights papers, benchmarks, technical findings."""
    return [
        f"New research on {h}.\n\nChanges the baseline assumption everyone was working from. Read it before your next system design.\n\n#{t1} #{t2}",
        f"Paper drop: {h}.\n\nRead the ablations before the abstract. That's where the real result lives — not the headline number.\n\n#{t1} #{t2}",
        f"The research on {h} is 18 months ahead of what most practitioners are building.\n\nThat gap is the opportunity. Build there.\n\n#{t1} #{t2}",
        f"Everyone cites {h}. Few people read past page 4.\n\nThe method section is where the alpha is. The conclusion section is for conferences.\n\n#{t1} #{t2}",
        f"Benchmark result: {h}.\n\nBefore you celebrate — check the eval setup. Hardware, dataset, inference precision. Claims fall apart there.\n\n#{t1} #{t2}",
        f"Research-to-production timeline for {h}: ~18 months.\n\nPapers dropping now = jobs opening late 2026/early 2027. Position yourself today.\n\n#{t1} #{t2}",
        f"The {h} paper is worth your weekend.\n\nNot for the headline result — for what it implies about the deployment problem nobody's solved yet.\n\n#{t1} #{t2}",
        f"Underrated finding in {h} research:\n\nSOTA from 6 months ago is now the baseline. The ceiling is moving faster than most teams are building.\n\n#{t1} #{t2}",
        f"Reading {h} research this week.\n\nCore insight: the hard part was never the model architecture. It was always the data pipeline and deployment stack.\n\n#{t1} #{t2}",
        f"{h}: the field is converging on a small set of architectures.\n\nMoat shifts from research novelty to execution speed. Who ships fastest wins.\n\n#{t1} #{t2}",
    ]


def _founder_signal_templates(h: str, t1: str, t2: str) -> list[str]:
    """Startup/funding signal angle — rounds, valuations, market moves."""
    return [
        f"Funding signal: {h}.\n\nMoney follows conviction. When a round this size closes in {t1}, it means the market has made its bet.\n\n#{t1} #{t2}",
        f"{h}.\n\nValuations at this level mean one thing: the category is no longer a bet, it's a land grab. Move fast.\n\n#{t1} #{t2}",
        f"Watch this: {h}.\n\nEvery major {t1} round right now is a signal about where the next 5 years of infra gets built.\n\n#{t1} #{t2}",
        f"Market signal: {h}.\n\nThis isn't a bet on one company. It's a bet on an entire deployment layer that doesn't exist yet.\n\n#{t1} #{t2}",
        f"{h}.\n\nFounding teams with this kind of backing can hire anyone. They're hiring right now. Apply before the round is announced everywhere.\n\n#{t1} #{t2}",
        f"If you missed the {t1} seed wave: {h} is the Series signal.\n\nThe infrastructure play is now. Physical AI, edge inference, agentic tooling — pick one.\n\n#{t1} #{t2}",
        f"Follow the money: {h}.\n\nWhen Skild hits $14B and Apptronik raises $520M in the same quarter, the cycle isn't starting — it's accelerating.\n\n#{t1} #{t2}",
        f"Quietly, {h}.\n\nFounders building in {t1} right now: the funding environment is the best it's been since 2021. Different companies, same window.\n\n#{t1} #{t2}",
        f"Round closed: {h}.\n\nThe companies getting funded at these numbers are solving the deployment bottleneck, not the model problem.\n\n#{t1} #{t2}",
        f"{h} = the market picking winners.\n\nThe {t1} space compresses fast. The companies with this capital will define the stack for a decade.\n\n#{t1} #{t2}",
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


def _profile_domains(user_key: Optional[str] = None) -> list[str]:
    try:
        from ..routers.profile import _load
        p = _load(user_key)
        return p.model_dump().get("domains", []) if p else []
    except Exception:
        return []


def generate_posts_from_cache(user_key: Optional[str] = None) -> list[Post]:
    """Build 5 X/Twitter drafts from cached news. No API key needed."""
    from ..ingestion.sources import read_cache

    news    = read_cache("news") or []
    domains = _profile_domains(user_key) or ["Edge AI", "Robotics"]

    d1  = domains[0]
    d2  = domains[1] if len(domains) > 1 else domains[0]
    t1  = _DOMAIN_TAGS.get(d1, [d1.replace(" ", "")])[0]
    t2  = _DOMAIN_TAGS.get(d2, [d2.replace(" ", "")])[0]

    if not news:
        return []

    n   = len(news)
    day = date.today().timetuple().tm_yday  # 1-366

    # Pick 6 distinct news items, rotating by day
    step = max(1, n // 6)
    def pick(offset: int) -> dict:
        return news[(day + offset * step) % n]

    item_take       = pick(0)
    item_thread     = pick(1)
    item_contrarian = pick(2)
    item_jobs       = pick(3)
    item_research   = pick(4)
    item_founder    = pick(5)

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

    # ── Founder Signal ────────────────────────────────────────────────────
    h6 = _clean(item_founder["title"], 75)
    posts.append(Post(
        angle="Founder Signal",
        text=_truncate(_founder_signal_templates(h6, t1, t2)[v]),
        tags=[t1, t2],
        source_ref=item_founder.get("source", ""),
    ))

    return posts


@router.get("/posts", response_model=list[Post])
async def get_posts(user_id: Optional[str] = Depends(optional_user)) -> list[Post]:
    """Generate cheap drafts per account; never reuse another user's cache."""
    return generate_posts_from_cache(user_id) or POSTS


@router.post("/posts/refresh", response_model=list[Post])
async def refresh_posts(user_id: str = Depends(current_user)) -> list[Post]:
    """Regenerate drafts from the latest news for the verified account."""
    return generate_posts_from_cache(user_id) or POSTS
