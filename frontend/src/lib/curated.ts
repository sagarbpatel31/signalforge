export type ContentKind =
  | "brief"
  | "signal"
  | "opportunity"
  | "startup"
  | "role"
  | "paper";

export type FreshnessState = "current" | "stale" | "unverified";

const FRESHNESS_DAYS: Record<ContentKind, number> = {
  brief: 2,
  signal: 2,
  opportunity: 30,
  startup: 30,
  role: 7,
  paper: 90,
};

const DAY_MS = 86_400_000;

function parseIsoDate(value?: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const timestamp = Date.UTC(year, month - 1, day);
  const parsed = new Date(timestamp);

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }
  return timestamp;
}

export function getFreshnessState(
  lastVerified: string | undefined,
  kind: ContentKind,
  now = new Date(),
): FreshnessState {
  const verifiedAt = parseIsoDate(lastVerified);
  if (verifiedAt === null) return "unverified";

  const todayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const ageDays = Math.floor((todayUtc - verifiedAt) / DAY_MS);
  if (ageDays < 0) return "unverified";
  return ageDays <= FRESHNESS_DAYS[kind] ? "current" : "stale";
}

export function formatVerifiedDate(value?: string): string {
  const timestamp = parseIsoDate(value);
  if (timestamp === null) return "Unknown";
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function freshnessRank(state: FreshnessState): number {
  if (state === "current") return 0;
  if (state === "stale") return 1;
  return 2;
}

export function currentCuratedItems<T extends { last_verified?: string }>(
  items: T[],
  kind: ContentKind,
  now = new Date(),
): T[] {
  return items.filter(
    (item) => getFreshnessState(item.last_verified, kind, now) === "current",
  );
}

export function sortCuratedItems<T extends { last_verified?: string }>(
  items: T[],
  kind: ContentKind,
  now = new Date(),
): T[] {
  return [...items].sort((left, right) => {
    const freshnessDelta =
      freshnessRank(getFreshnessState(left.last_verified, kind, now)) -
      freshnessRank(getFreshnessState(right.last_verified, kind, now));
    if (freshnessDelta !== 0) return freshnessDelta;
    return (right.last_verified ?? "").localeCompare(left.last_verified ?? "");
  });
}
