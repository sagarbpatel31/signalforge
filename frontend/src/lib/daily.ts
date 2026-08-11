import type { Signal } from "./types";

export const PACIFIC_TIME_ZONE = "America/Los_Angeles";

export interface DailyProgress {
  date: string;
  updatedAt: string;
  reviewedSignalIds: string[];
  completedTaskIds: string[];
  postDone: boolean;
}

export function emptyDailyProgress(date = ""): DailyProgress {
  return {
    date,
    updatedAt: "",
    reviewedSignalIds: [],
    completedTaskIds: [],
    postDone: false,
  };
}

function uniqueStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === "string"))]
    .slice(0, 100);
}

export function normalizeDailyProgress(
  value: Partial<DailyProgress> | null | undefined
): DailyProgress {
  return {
    date: typeof value?.date === "string" ? value.date : "",
    updatedAt: typeof value?.updatedAt === "string" ? value.updatedAt : "",
    reviewedSignalIds: uniqueStrings(value?.reviewedSignalIds),
    completedTaskIds: uniqueStrings(value?.completedTaskIds),
    postDone: value?.postDone === true,
  };
}

export function mergeDailyProgress(
  local: DailyProgress,
  remote: DailyProgress
): DailyProgress {
  const localProgress = normalizeDailyProgress(local);
  const remoteProgress = normalizeDailyProgress(remote);
  if (localProgress.date > remoteProgress.date) return localProgress;
  if (remoteProgress.date > localProgress.date) return remoteProgress;
  if (localProgress.updatedAt > remoteProgress.updatedAt) return localProgress;
  if (remoteProgress.updatedAt > localProgress.updatedAt) return remoteProgress;

  return {
    date: localProgress.date,
    updatedAt: localProgress.updatedAt,
    reviewedSignalIds: uniqueStrings([
      ...remoteProgress.reviewedSignalIds,
      ...localProgress.reviewedSignalIds,
    ]),
    completedTaskIds: uniqueStrings([
      ...remoteProgress.completedTaskIds,
      ...localProgress.completedTaskIds,
    ]),
    postDone: remoteProgress.postDone || localProgress.postDone,
  };
}

export function pacificDateKey(value = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PACIFIC_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

export function signalProgressId(signal: Signal): string {
  const value = `${signal.label}|${signal.delta}|${signal.text}`;
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `signal:${signal.label.toLowerCase()}:${(hash >>> 0).toString(36)}`;
}
