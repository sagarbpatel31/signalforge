import type {
  Signal, Stat, Opportunity, Startup, Role,
  Paper, Post, Task, Person, ConvictionBet, UserProfile,
  JobListing, NewsItem,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Standard fetch — 60s ISR cache at Next.js layer (for structured data that rarely changes). */
async function apiFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json() as Promise<T>;
  } catch {
    return fallback;
  }
}

/** Live fetch — no Next.js cache. For feeds data backed by Redis (backend manages 12h TTL). */
async function apiFetchLive<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
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
  apiFetchLive<Stat[]>("/api/stats", fallbackStats);

export const fetchOpportunities = () =>
  apiFetch<Opportunity[]>("/api/opportunities", fallbackOpportunities);

export const fetchStartups = () =>
  apiFetch<Startup[]>("/api/startups", fallbackStartups);

export const fetchCareer = () =>
  apiFetchLive<Role[]>("/api/career", fallbackRoles);

export const fetchAllCareer = () =>
  apiFetchLive<Role[]>("/api/career/all", fallbackRoles);

export const fetchResearch = () =>
  apiFetchLive<Paper[]>("/api/research", fallbackPapers);

export const fetchAllResearch = () =>
  apiFetchLive<Paper[]>("/api/research/all", fallbackPapers);

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
  apiFetchLive<JobListing[]>("/api/feeds/jobs", []);

export const fetchNewsItems = () =>
  apiFetchLive<NewsItem[]>("/api/feeds/news", []);

/** Trigger a full ingest run (cron equivalent — populates all Redis caches). */
export async function triggerIngest(): Promise<{ news: number; papers: number; jobs: number }> {
  const res = await fetch(`${API_BASE}/api/ingest`);
  if (!res.ok) throw new Error(`ingest failed: ${res.status}`);
  return res.json();
}

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

/** Refresh post drafts from live news cache — no Claude needed. */
export async function refreshPosts(): Promise<Post[]> {
  const res = await fetch(`${API_BASE}/api/posts/refresh`, { method: "POST" });
  if (!res.ok) throw new Error(`posts/refresh failed: ${res.status}`);
  return res.json() as Promise<Post[]>;
}

export async function generateTasks(): Promise<Task[]> {
  const res = await fetch(`${API_BASE}/api/generate/tasks`, { method: "POST" });
  if (!res.ok) throw new Error(`generate/tasks failed: ${res.status}`);
  return res.json() as Promise<Task[]>;
}

export async function generateWeekly(): Promise<WeeklyResponse> {
  const res = await fetch(`${API_BASE}/api/generate/weekly`, { method: "POST" });
  if (!res.ok) throw new Error(`generate/weekly failed: ${res.status}`);
  return res.json() as Promise<WeeklyResponse>;
}

/**
 * Stream the AI brief via SSE. Calls onChunk for each partial text chunk,
 * resolves with the final parsed BriefResponse when done.
 */
export async function generateBriefStream(
  onChunk: (text: string) => void
): Promise<BriefResponse> {
  const res = await fetch(`${API_BASE}/api/generate/brief`, { method: "POST" });
  if (!res.ok) throw new Error(`generate/brief failed: ${res.status}`);
  const body = res.body;
  if (!body) throw new Error("No response body");
  const reader = body.getReader();
  const decoder = new TextDecoder();

  return new Promise((resolve, reject) => {
    async function pump() {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const json = JSON.parse(line.slice(6));
              if (json.chunk) {
                onChunk(json.chunk as string);
              } else if (json.done && json.result) {
                resolve(json.result as BriefResponse);
                return;
              } else if (json.error) {
                reject(new Error(json.error as string));
                return;
              }
            } catch {
              // skip malformed lines
            }
          }
        }
        reject(new Error("Stream ended without result"));
      } catch (err) {
        reject(err);
      }
    }
    pump();
  });
}
