import type { Opportunity, SourceMode, UserProfile } from "./types";

export interface FeedMeta {
  last_refresh?: string | null;
  counts?: {
    news?: number;
    jobs?: number;
    papers?: number;
  };
  source_mode?: SourceMode;
  source_detail?: string;
  sources?: Partial<Record<"news" | "jobs" | "papers", FeedSourceHealth>>;
}

export interface FeedSourceHealth {
  status: "healthy" | "error" | "cold";
  item_count: number;
  last_attempt?: string | null;
  last_success?: string | null;
  error_code?: string | null;
}

export interface FeedSourceIndicator {
  key: "news" | "jobs" | "papers";
  label: string;
  status: FeedSourceHealth["status"];
  itemCount: number;
  detail: string;
}

export interface RankedOpportunity extends Opportunity {
  matchReasons: string[];
  personalizedScore: number;
}

const DOMAIN_ALIASES: Record<string, string[]> = {
  robotics: ["robotics", "ros2", "manipulation", "humanoid"],
  "edge ai": ["edge ai", "inference", "sdk", "on-device", "npu"],
  "physical ai": ["physical ai", "humanoid", "dexterity", "manipulation"],
  embedded: ["embedded", "firmware", "rtos", "zephyr", "mcu"],
  "embedded systems": ["embedded", "firmware", "rtos", "zephyr", "mcu"],
  "generative ai": ["llm", "genai", "language model", "agent"],
  startup: ["startup", "seed", "gtm", "founder"],
  "startup ecosystem": ["startup", "seed", "gtm", "founder"],
};

const GOAL_HINTS: Record<string, string[]> = {
  "land a top job": ["role", "stack", "bridge", "sdk"],
  "build a startup": ["api", "stack", "middleware", "sdk", "seed"],
  "stay ahead of the field": ["research", "radar", "signal", "compiler"],
  "find co-founders / team": ["startup", "community", "bridge"],
  "publish research": ["research", "paper", "benchmark"],
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function tokenize(value: string): string[] {
  return normalize(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 4);
}

function domainKeywords(domains: string[]): string[] {
  return domains.flatMap((domain) => {
    const key = normalize(domain);
    return DOMAIN_ALIASES[key] ?? [key];
  });
}

export function formatRelativeRefresh(lastRefresh?: string | null): string {
  if (!lastRefresh) return "cache cold";

  const ts = new Date(lastRefresh);
  if (Number.isNaN(ts.getTime())) return "refresh unknown";

  const diffMs = Date.now() - ts.getTime();
  const diffMin = Math.max(0, Math.round(diffMs / 60000));

  if (diffMin < 1) return "just refreshed";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHrs = Math.round(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;

  const diffDays = Math.round(diffHrs / 24);
  return `${diffDays}d ago`;
}

export function summarizeFeedStatus(meta?: FeedMeta | null): {
  label: string;
  detail: string;
  tone: "live" | "stale";
  sources: FeedSourceIndicator[];
} {
  const counts = meta?.counts ?? {};
  const total = (counts.news ?? 0) + (counts.jobs ?? 0) + (counts.papers ?? 0);
  const refreshLabel = formatRelativeRefresh(meta?.last_refresh);
  const sourceLabels = { news: "News", papers: "Papers", jobs: "Jobs" } as const;
  const sources = (Object.keys(sourceLabels) as Array<keyof typeof sourceLabels>)
    .map((key) => {
      const health = meta?.sources?.[key];
      const itemCount = health?.item_count ?? counts[key] ?? 0;
      const status = health?.status ?? (itemCount > 0 ? "healthy" : "cold");
      const success = health?.last_success
        ? `last success ${formatRelativeRefresh(health.last_success)}`
        : "no successful refresh";
      return {
        key,
        label: sourceLabels[key],
        status,
        itemCount,
        detail: `${itemCount} cached · ${success}${health?.error_code ? ` · ${health.error_code.replaceAll("_", " ")}` : ""}`,
      } satisfies FeedSourceIndicator;
    });

  if (!total) {
    return {
      label: "Fallback-safe mode",
      detail: meta?.source_detail ?? "Feed cache is cold. The UI is still usable, but live ingestion has not populated local cache yet.",
      tone: "stale",
      sources,
    };
  }

  if (meta?.source_mode === "degraded" || sources.some((source) => source.status === "error")) {
    return {
      label: "Degraded intelligence",
      detail: `${meta?.source_detail ?? "Serving last-known-good cache for one or more sources."} · latest success ${refreshLabel}`,
      tone: "stale",
      sources,
    };
  }

  return {
    label: "Live intelligence",
    detail: meta?.source_detail
      ? `${meta.source_detail} · refreshed ${refreshLabel}`
      : `${total} cached signals · ${counts.news ?? 0} news · ${counts.jobs ?? 0} jobs · ${counts.papers ?? 0} papers · refreshed ${refreshLabel}`,
    tone: "live",
    sources,
  };
}

export function rankOpportunitiesForProfile(
  opportunities: Opportunity[],
  profile: UserProfile | null
): RankedOpportunity[] {
  if (!profile) {
    return opportunities.map((opportunity) => ({
      ...opportunity,
      matchReasons: ["General market signal"],
      personalizedScore: opportunity.fit,
    }));
  }

  const domainHints = domainKeywords(profile.domains);
  const goalHints = GOAL_HINTS[normalize(profile.goal)] ?? [];
  const projectHints = tokenize(profile.current_projects);

  return opportunities
    .map((opportunity) => {
      const haystack = normalize(
        `${opportunity.title} ${opportunity.domain} ${opportunity.why}`
      );

      let score = opportunity.fit;
      const reasons: string[] = [];

      const domainMatch = domainHints.some((hint) => haystack.includes(hint));
      if (domainMatch) {
        score += 12;
        reasons.push(`Matches your ${profile.domains.join(" + ")} focus`);
      }

      const goalMatch = goalHints.some((hint) => haystack.includes(hint));
      if (goalMatch) {
        score += 8;
        reasons.push(`Supports your goal: ${profile.goal}`);
      }

      const projectMatch = projectHints.find(
        (hint) => hint.length >= 5 && haystack.includes(hint)
      );
      if (projectMatch) {
        score += 6;
        reasons.push(`Connects to current project work: ${projectMatch}`);
      }

      if (opportunity.signal === "HIGH") score += 5;
      if (opportunity.signal === "MEDIUM") score += 2;

      if (reasons.length === 0) reasons.push("Broader ecosystem opportunity worth monitoring");

      return {
        ...opportunity,
        matchReasons: reasons.slice(0, 2),
        personalizedScore: score,
      };
    })
    .sort((a, b) => b.personalizedScore - a.personalizedScore);
}
