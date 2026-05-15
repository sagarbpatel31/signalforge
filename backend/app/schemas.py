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


class Stat(BaseModel):
    label: str
    value: str
    delta: str
    up: Optional[bool]


class Opportunity(BaseModel):
    rank: str
    title: str
    domain: str
    signal: Literal["HIGH", "MEDIUM", "LOW"]
    fit: int
    why: str


class Startup(BaseModel):
    name: str
    stage: str
    domain: str
    signal: Literal["Hot", "Watch", "Track"]
    note: str
    website: str = ""


class Role(BaseModel):
    company: str
    role: str
    type: str
    signal: str
    color: Literal["cyan", "amber", "green", "red", "muted"]
    url: str = ""


class Paper(BaseModel):
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


class Person(BaseModel):
    name: str
    handle: str
    url: str = ""
    context: str
    urgency: Literal["Overdue", "This week", "Waiting"]
    days: int


class ConvictionBet(BaseModel):
    label: str
    conviction: int


class WeeklyResponse(BaseModel):
    wins: list[str]
    gaps: list[str]
    conviction_bets: list[ConvictionBet]
    next_week_focus: str
