import type { UserProfile } from "./types";

export const USER_COOKIE_NAME = "sf_user";
const USER_STORAGE_KEY = "sf-user";

export function normalizeUserKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[-._]+|[-._]+$/g, "") || "default";
}

export function deriveUserKey(profile: Pick<UserProfile, "handle" | "name">): string {
  return normalizeUserKey(profile.handle || profile.name || "default");
}

function readBrowserCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : "";
}

export function getBrowserUserKey(): string {
  if (typeof window === "undefined") return "";
  const stored = window.localStorage.getItem(USER_STORAGE_KEY) ?? "";
  return normalizeUserKey(stored || readBrowserCookie(USER_COOKIE_NAME) || "");
}

export function setActiveUserKey(userKey: string) {
  if (typeof window === "undefined") return;
  const normalized = normalizeUserKey(userKey);
  window.localStorage.setItem(USER_STORAGE_KEY, normalized);
  document.cookie = `${USER_COOKIE_NAME}=${encodeURIComponent(normalized)}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export async function getUserHeaders(overrideUserKey?: string): Promise<Record<string, string>> {
  const userKey = overrideUserKey
    ? normalizeUserKey(overrideUserKey)
    : (typeof window !== "undefined" ? getBrowserUserKey() : "default");

  return userKey && userKey !== "default"
    ? { "X-SignalForge-User": userKey }
    : {};
}
