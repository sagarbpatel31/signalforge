import type {
  Signal, Stat, Opportunity, Startup, Role,
  Paper, Post, Task, Person, ConvictionBet, UserProfile,
  JobListing, NewsItem,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json() as Promise<T>;
  } catch {
    return fallback;
  }
}

// ── Imported fallbacks (static mock data) ──────────────────────────────────
import {
  signals as fallbackSignals,
  marketPulse as fallbackPulse,
  stats as fallbackStats,
  opportunities as fallbackOpportunities,
  startups as fallbackStartups,
  roles as fallbackRoles,
  papers as fallbackPapers,
  posts as fallbackPosts,
  tasks as fallbackTasks,
  people as fallbackPeople,
  weeklyWins,
  weeklyGaps,
  convictionBets as fallbackBets,
  nextWeekFocus,
} from "./mock-data";

// ── Response shapes matching FastAPI ───────────────────────────────────────

export interface BriefResponse {
  market_pulse: string;
  signals: Signal[];
  timestamp: string;
}

export interface WeeklyResponse {
  wins: string[];
  gaps: string[];
  conviction_bets: ConvictionBet[];
  next_week_focus: string;
}

// ── Typed fetchers ─────────────────────────────────────────────────────────

export const fetchBrief = () =>
  apiFetch<BriefResponse>("/api/brief", {
    market_pulse: fallbackPulse,
    signals: fallbackSignals,
    timestamp: "07:42 UTC · May 1",
  });

export const fetchStats = () =>
  apiFetch<Stat[]>("/api/stats", fallbackStats);

export const fetchOpportunities = () =>
  apiFetch<Opportunity[]>("/api/opportunities", fallbackOpportunities);

export const fetchStartups = () =>
  apiFetch<Startup[]>("/api/startups", fallbackStartups);

export const fetchCareer = () =>
  apiFetch<Role[]>("/api/career", fallbackRoles);

export const fetchResearch = () =>
  apiFetch<Paper[]>("/api/research", fallbackPapers);

export const fetchPosts = () =>
  apiFetch<Post[]>("/api/posts", fallbackPosts);

export const fetchTasks = () =>
  apiFetch<Task[]>("/api/tasks", fallbackTasks);

export const fetchPeople = () =>
  apiFetch<Person[]>("/api/people", fallbackPeople);

export const fetchWeekly = () =>
  apiFetch<WeeklyResponse>("/api/weekly", {
    wins: weeklyWins,
    gaps: weeklyGaps,
    conviction_bets: fallbackBets,
    next_week_focus: nextWeekFocus,
  });

export async function fetchProfile(): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${API_BASE}/api/profile`, { cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json() as Promise<UserProfile>;
  } catch {
    return null;
  }
}

export async function saveProfile(profile: UserProfile): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/api/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error("Failed to save profile");
  return res.json() as Promise<UserProfile>;
}

export const fetchJobsFull = () =>
  apiFetch<JobListing[]>("/api/feeds/jobs", []);

export const fetchNewsItems = () =>
  apiFetch<NewsItem[]>("/api/feeds/news", []);

export async function generateBrief(): Promise<BriefResponse> {
  const res = await fetch(`${API_BASE}/api/generate/brief`, { method: "POST" });
  if (!res.ok) throw new Error(`generate/brief failed: ${res.status}`);
  return res.json() as Promise<BriefResponse>;
}

export async function generatePosts(): Promise<Post[]> {
  const res = await fetch(`${API_BASE}/api/generate/posts`, { method: "POST" });
  if (!res.ok) throw new Error(`generate/posts failed: ${res.status}`);
  return res.json() as Promise<Post[]>;
}
