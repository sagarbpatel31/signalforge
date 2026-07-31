from pydantic import BaseModel
from typing import Literal, Optional


class Signal(BaseModel):
    label: str
    delta: str
    color: Literal["cyan", "amber", "green", "red", "muted"]
    text: str


class BriefResponse(BaseModel):
    market_pulse: str
    signals: list[Signal]
    timestamp: str
    source_mode: Literal["live", "fallback"]
    source_detail: str


class FeedMetaResponse(BaseModel):
    last_refresh: Optional[str] = None
    counts: dict[str, int] = {}
    source_mode: Literal["live", "fallback"]
    source_detail: str


class Stat(BaseModel):
    label: str
    value: str
    delta: str
    up: Optional[bool]
    # Daily counts, oldest first, from cache:history. Empty until at least two
    # ingest days exist — the UI hides the sparkline rather than inventing one.
    series: list[int] = []


class CuratedSource(BaseModel):
    label: str
    url: str
    published_at: str = ""


class CuratedCard(BaseModel):
    last_verified: str = ""
    sources: list[CuratedSource] = []


class Opportunity(CuratedCard):
    rank: str
    title: str
    domain: str
    signal: Literal["HIGH", "MEDIUM", "LOW"]
    fit: int
    why: str
    sourced_fact: str = ""
    editorial_take: str = ""


class Startup(CuratedCard):
    name: str
    stage: str
    domain: str
    signal: Literal["Hot", "Watch", "Track"]
    note: str
    website: str = ""
    sourced_fact: str = ""
    editorial_take: str = ""


class Role(CuratedCard):
    company: str
    role: str
    type: str
    signal: str
    color: Literal["cyan", "amber", "green", "red", "muted"]
    url: str = ""
    tags: list[str] = []


class Paper(CuratedCard):
    title: str
    venue: str
    tags: list[str]
    read: bool
    url: str = ""


class Post(BaseModel):
    angle: str
    text: str
    tags: list[str]
    source_ref: str = ""


class Task(BaseModel):
    id: int
    priority: Literal["P0", "P1", "P2"]
    task: str
    domain: str
    time: str
    description: Optional[str] = None  # expandable detail shown on click


class WorkbenchTask(BaseModel):
    id: int | str
    priority: Literal["P0", "P1", "P2"]
    task: str
    domain: str
    time: str
    description: Optional[str] = None


class ConvictionBet(BaseModel):
    label: str
    conviction: int


class WeeklyResponse(BaseModel):
    wins: list[str]
    gaps: list[str]
    conviction_bets: list[ConvictionBet]
    next_week_focus: str


class WorkbenchState(BaseModel):
    dismissed: list[str] = []
    custom_tasks: list[WorkbenchTask] = []


class BookmarkItem(BaseModel):
    id: str
    title: str
    sub: str = ""
    url: str = ""
    type: Literal["paper", "startup", "role", "opportunity"]


class BookmarksState(BaseModel):
    papers: list[BookmarkItem] = []
    startups: list[BookmarkItem] = []
    roles: list[BookmarkItem] = []
    opportunities: list[BookmarkItem] = []
