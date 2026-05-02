import asyncio
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Union

import feedparser
import httpx

CACHE_DIR = Path(__file__).parent.parent.parent / "data" / "cache"

KEYWORDS = [
    "robot", "robotics", "edge ai", "embedded", "physical ai", "agentic",
    "agent", "llm", "language model", "gpt", "multimodal", "humanoid",
    "autonomous", "tinyml", "fpga", "jetson", "mcu", "firmware",
    "openai", "anthropic", "deepmind", "nvidia", "generative", "gen ai",
    "startup", "funding", "series a", "series b", "raised", "vc",
    "transformer", "diffusion", "reinforcement learning", "computer vision",
    "foundation model", "inference", "ros2", "manipulation", "locomotion",
    "simulation", "imitation learning", "world model",
]

RSS_SOURCES = [
    ("TechCrunch AI", "https://techcrunch.com/category/artificial-intelligence/feed/"),
    ("MIT Tech Review", "https://www.technologyreview.com/feed/"),
    ("VentureBeat AI", "https://venturebeat.com/feed/"),
    ("IEEE Spectrum", "https://spectrum.ieee.org/rss/fulltext"),
    ("Wired AI", "https://www.wired.com/feed/tag/artificial-intelligence/latest/rss"),
    ("Hacker News", "https://news.ycombinator.com/rss"),
    ("OpenAI", "https://openai.com/news/rss.xml"),
    ("Hugging Face", "https://huggingface.co/blog/feed.xml"),
]

ARXIV_QUERIES = [
    ("cat:cs.RO", "Robotics"),
    ("cat:cs.AI", "Artificial Intelligence"),
    ("cat:cs.LG", "Machine Learning"),
    ("cat:eess.SY", "Systems & Control"),
    ("all:edge+ai+inference", "Edge AI"),
    ("all:humanoid+robot+learning", "Physical AI"),
]

# Verified working Lever slugs (2026-05-02)
LEVER_COMPANIES = [
    "mistral",
]

# Verified working Greenhouse slugs (2026-05-02)
GREENHOUSE_COMPANIES = [
    "anthropic",
    "waymo",
    "figure",
    "apptronik",
    "nuro",
    "motional",
    "helsing",
]

REMOTIVE_SEARCHES = ["robotics", "embedded systems", "edge ai", "machine learning engineer"]

_HEADERS = {"User-Agent": "SignalForge/1.0 (intelligence terminal)"}


def _is_relevant(text: str) -> bool:
    t = text.lower()
    return any(kw in t for kw in KEYWORDS)


def _extract_tags(text: str) -> list:
    t = text.lower()
    tag_map = {
        "robotics": ["robot", "ros", "manipulation", "locomotion", "lidar", "slam"],
        "edge-ai": ["edge ai", "tinyml", "on-device", "jetson", "fpga", "mcu", "embedded ml"],
        "llm": ["llm", "language model", "gpt", "claude", "mistral", "transformer", "foundation model"],
        "startup": ["startup", "funding", "series", "raised", "vc", "seed"],
        "physical-ai": ["physical ai", "humanoid", "embodied", "sim-to-real"],
        "agentic": ["agent", "agentic", "multi-agent", "reasoning", "tool use"],
        "embedded": ["embedded", "rtos", "firmware", "microcontroller", "fpga", "mcu"],
        "generative": ["diffusion", "generative", "gen ai", "multimodal", "vlm"],
    }
    found = [tag for tag, kws in tag_map.items() if any(k in t for k in kws)]
    return found[:3] if found else ["tech"]


async def fetch_news(limit: int = 50) -> list:
    items = []
    async with httpx.AsyncClient(timeout=12, follow_redirects=True) as client:
        for name, url in RSS_SOURCES:
            try:
                resp = await client.get(url, headers=_HEADERS)
                feed = feedparser.parse(resp.text)
                for entry in feed.entries[:15]:
                    title = entry.get("title", "")
                    body = entry.get("summary", entry.get("description", ""))
                    if _is_relevant(title + " " + body):
                        items.append({
                            "title": title,
                            "url": entry.get("link", ""),
                            "source": name,
                            "published": entry.get("published", ""),
                            "tags": _extract_tags(title + " " + body),
                        })
            except Exception:
                pass
    seen: set = set()
    unique = []
    for item in items:
        if item["url"] not in seen:
            seen.add(item["url"])
            unique.append(item)
    return unique[:limit]


async def fetch_papers(limit: int = 24) -> list:
    papers = []
    async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
        for query, label in ARXIV_QUERIES:
            try:
                resp = await client.get(
                    "http://export.arxiv.org/api/query",
                    params={
                        "search_query": query,
                        "max_results": 6,
                        "sortBy": "submittedDate",
                        "sortOrder": "descending",
                    },
                    headers=_HEADERS,
                )
                feed = feedparser.parse(resp.text)
                for entry in feed.entries:
                    title = entry.get("title", "").replace("\n", " ").strip()
                    raw_tags = [t.get("term", "") for t in entry.get("tags", [])]
                    papers.append({
                        "title": title,
                        "venue": f"arXiv · {label}",
                        "tags": (raw_tags[:3] if raw_tags else [label]),
                        "read": False,
                        "url": entry.get("id", entry.get("link", "")),
                    })
            except Exception:
                pass
    # deduplicate by url
    seen: set = set()
    unique = []
    for p in papers:
        if p["url"] not in seen:
            seen.add(p["url"])
            unique.append(p)
    return unique[:limit]


async def _lever_jobs(client: httpx.AsyncClient, company: str) -> list:
    try:
        resp = await client.get(
            f"https://api.lever.co/v0/postings/{company}?mode=json",
            headers=_HEADERS,
        )
        if resp.status_code != 200:
            return []
        jobs = []
        for j in resp.json()[:6]:
            cats = j.get("categories", {})
            jobs.append({
                "title": j.get("text", ""),
                "company": company.replace("-", " ").title(),
                "location": cats.get("location", "Remote / Unspecified"),
                "url": j.get("hostedUrl", ""),
                "job_type": cats.get("team", "Engineering"),
                "tags": _extract_tags(j.get("text", "") + " " + str(cats)),
                "source": "Lever",
            })
        return jobs
    except Exception:
        return []


async def _greenhouse_jobs(client: httpx.AsyncClient, company: str) -> list:
    try:
        resp = await client.get(
            f"https://boards-api.greenhouse.io/v1/boards/{company}/jobs",
            headers=_HEADERS,
        )
        if resp.status_code != 200:
            return []
        jobs = []
        for j in resp.json().get("jobs", [])[:6]:
            jobs.append({
                "title": j.get("title", ""),
                "company": company.replace("-", " ").title(),
                "location": j.get("location", {}).get("name", "Remote"),
                "url": j.get("absolute_url", ""),
                "job_type": "Engineering",
                "tags": _extract_tags(j.get("title", "")),
                "source": "Greenhouse",
            })
        return jobs
    except Exception:
        return []


async def _remotive_jobs() -> list:
    jobs = []
    try:
        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            for term in REMOTIVE_SEARCHES:
                try:
                    resp = await client.get(
                        f"https://remotive.com/api/remote-jobs?search={term}&limit=8",
                        headers=_HEADERS,
                    )
                    if resp.status_code == 200:
                        for j in resp.json().get("jobs", [])[:5]:
                            jobs.append({
                                "title": j.get("title", ""),
                                "company": j.get("company_name", ""),
                                "location": j.get("candidate_required_location", "Remote"),
                                "url": j.get("url", ""),
                                "job_type": j.get("job_type", "Full-time"),
                                "tags": _extract_tags(j.get("title", "") + " " + j.get("category", "")),
                                "source": "Remotive",
                            })
                except Exception:
                    pass
    except Exception:
        pass
    return jobs


async def fetch_jobs(limit: int = 50) -> list:
    async with httpx.AsyncClient(timeout=12, follow_redirects=True) as client:
        tasks = (
            [_lever_jobs(client, co) for co in LEVER_COMPANIES] +
            [_greenhouse_jobs(client, co) for co in GREENHOUSE_COMPANIES]
        )
        results = await asyncio.gather(*tasks, return_exceptions=True)

    jobs = []
    for r in results:
        if isinstance(r, list):
            jobs.extend(r)

    remotive = await _remotive_jobs()
    jobs.extend(remotive)

    seen: set = set()
    unique = []
    for job in jobs:
        key = job.get("url") or job.get("title", "")
        if key and key not in seen:
            seen.add(key)
            unique.append(job)
    return unique[:limit]


def read_cache(name: str) -> Optional[Union[list, dict]]:
    path = CACHE_DIR / f"{name}.json"
    if path.exists():
        try:
            return json.loads(path.read_text())
        except Exception:
            return None
    return None


def write_cache(name: str, data: Union[list, dict]) -> None:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    (CACHE_DIR / f"{name}.json").write_text(json.dumps(data, ensure_ascii=False, indent=2))
