import type {
  Signal, Stat, Opportunity, Startup, Role,
  Paper, Post, Task, ConvictionBet, UserProfile,
  NewsItem, FlaggedCompany,
} from "./types";
import type { FeedMeta } from "./intelligence";
import type { WorkbenchState } from "./useWorkbench";
import { getUserHeaders } from "./identity";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Standard fetch — 60s ISR cache at Next.js layer (for structured data that rarely changes). */
async function apiFetch<T>(path: string, fallback: T, token?: string): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: 60 },
      headers: await getUserHeaders(token),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json() as Promise<T>;
  } catch {
    return fallback;
  }
}

/** Live fetch — no Next.js cache. For feeds data backed by Redis (backend manages 12h TTL). */
async function apiFetchLive<T>(path: string, fallback: T, token?: string): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      cache: "no-store",
      headers: await getUserHeaders(token),
    });
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
  source_mode: "live" | "fallback";
  source_detail: string;
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
    timestamp: "Curated fallback · Jul 1, 2026",
    source_mode: "fallback",
    source_detail: "API unavailable. Using built-in fallback brief.",
  });

export const fetchStats = () =>
  apiFetchLive<Stat[]>("/api/stats", fallbackStats);

export const fetchOpportunities = () =>
  apiFetch<Opportunity[]>("/api/opportunities", fallbackOpportunities);

export const fetchStartups = () =>
  apiFetch<Startup[]>("/api/startups", fallbackStartups);

export const fetchCareer = (token?: string) =>
  apiFetchLive<Role[]>("/api/career", fallbackRoles, token);

export const fetchAllCareer = (token?: string) =>
  apiFetchLive<Role[]>("/api/career/all", fallbackRoles, token);

export const fetchResearch = () =>
  apiFetchLive<Paper[]>("/api/research", fallbackPapers);

export const fetchAllResearch = () =>
  apiFetchLive<Paper[]>("/api/research/all", fallbackPapers);

export const fetchPosts = () =>
  apiFetch<Post[]>("/api/posts", fallbackPosts);

export const fetchTasks = () =>
  apiFetch<Task[]>("/api/tasks", fallbackTasks);

export const fetchWeekly = () =>
  apiFetch<WeeklyResponse>("/api/weekly", {
    wins: weeklyWins,
    gaps: weeklyGaps,
    conviction_bets: fallbackBets,
    next_week_focus: nextWeekFocus,
  });

export async function fetchProfile(token?: string): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${API_BASE}/api/profile`, {
      cache: "no-store",
      headers: await getUserHeaders(token),
    });
    if (res.status === 404 || res.status === 401) return null;
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json() as Promise<UserProfile>;
  } catch {
    return null;
  }
}

export async function saveProfile(profile: UserProfile, token?: string): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/api/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await getUserHeaders(token)),
    },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error("Failed to save profile");
  return res.json() as Promise<UserProfile>;
}

export async function fetchWorkbench(token?: string): Promise<WorkbenchState> {
  const res = await apiFetchLive<{ dismissed?: string[]; custom_tasks?: Task[] }>(
    "/api/workbench",
    { dismissed: [], custom_tasks: [] },
    token
  );
  return {
    dismissed: Array.isArray(res.dismissed) ? res.dismissed : [],
    customTasks: Array.isArray(res.custom_tasks) ? res.custom_tasks : [],
  };
}

export async function saveWorkbench(state: WorkbenchState): Promise<WorkbenchState> {
  const res = await fetch(`${API_BASE}/api/workbench`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await getUserHeaders()),
    },
    body: JSON.stringify({
      dismissed: state.dismissed,
      custom_tasks: state.customTasks,
    }),
  });
  if (!res.ok) throw new Error("Failed to save workbench");
  const data = await res.json() as { dismissed?: string[]; custom_tasks?: Task[] };
  return {
    dismissed: Array.isArray(data.dismissed) ? data.dismissed : [],
    customTasks: Array.isArray(data.custom_tasks) ? data.custom_tasks : [],
  };
}

export const fetchFlaggedStartups = () =>
  apiFetchLive<FlaggedCompany[]>("/api/startups/flagged", []);

export const fetchNewsItems = () =>
  apiFetchLive<NewsItem[]>("/api/feeds/news", []);

export const fetchFeedMeta = () =>
  apiFetchLive<FeedMeta>("/api/feeds/meta", {
    last_refresh: null,
    counts: {},
    source_mode: "fallback",
    source_detail: "Feed meta unavailable. Treating UI as fallback-safe.",
  });

/** Trigger a feed refresh — schedules background fetches that repopulate the Redis caches.
 * Lightweight and email-free; the cron-protected /api/ingest owns the daily digest. */
export async function triggerIngest(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/api/feeds/refresh`, { method: "POST" });
  if (!res.ok) throw new Error(`refresh failed: ${res.status}`);
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
