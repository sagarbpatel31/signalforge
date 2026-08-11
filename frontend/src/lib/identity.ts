/**
 * Session identity.
 *
 * The user key used to be derived from the profile handle and sent as a plain
 * header, which meant anyone could read another user's data by guessing it.
 * The backend now mints an opaque, HMAC-signed token; the client only stores
 * and replays it. Nothing user-chosen ends up in the storage key.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const SESSION_COOKIE_NAME = "sf_session";
export const IDENTITY_CHANGE_EVENT = "sf-identity-changed";
const SESSION_STORAGE_KEY = "sf-session";

type AccountTokenProvider = () => Promise<string | null>;

let accountUserId = "";
let accountTokenProvider: AccountTokenProvider | null = null;

/** The id half of `<user_id>.<signature>` — safe to use for local namespacing. */
export function userIdFromToken(token: string): string {
  const id = token.split(".")[0] ?? "";
  return id.startsWith("u_") ? id : "";
}

export function isLegacySessionToken(token: string): boolean {
  return Boolean(userIdFromToken(token));
}

function readBrowserCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : "";
}

export function getBrowserSessionToken(): string {
  if (typeof window === "undefined") return "";
  return (
    window.localStorage.getItem(SESSION_STORAGE_KEY) ||
    readBrowserCookie(SESSION_COOKIE_NAME) ||
    ""
  );
}

export function setSessionToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_STORAGE_KEY, token);
  // Mirrored into a cookie so Server Components can read it during SSR.
  document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(
    token
  )}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  document.cookie = `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function configureAccountIdentity(
  userId: string,
  tokenProvider: AccountTokenProvider
) {
  accountUserId = userId;
  accountTokenProvider = tokenProvider;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(IDENTITY_CHANGE_EVENT));
  }
}

export function clearAccountIdentity() {
  accountUserId = "";
  accountTokenProvider = null;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(IDENTITY_CHANGE_EVENT));
  }
}

export function getIdentityKey(): string {
  if (accountUserId) return `clerk:${accountUserId}`;
  return userIdFromToken(getBrowserSessionToken()) || "anon";
}

async function getAccountToken(): Promise<string> {
  if (!accountTokenProvider) return "";
  try {
    return (await accountTokenProvider()) ?? "";
  } catch {
    return "";
  }
}

async function legacySessionIsValid(token: string): Promise<boolean | null> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/session`, {
      cache: "no-store",
      headers: { "X-SignalForge-Token": token },
    });
    if (!res.ok) return null;
    const status = (await res.json()) as { authenticated?: boolean };
    return status.authenticated === true;
  } catch {
    // Do not rotate a token merely because the local API is temporarily down.
    return null;
  }
}

/** Return the current identity token, replacing explicitly invalid local sessions. */
export async function ensureSession(): Promise<string> {
  const accountToken = await getAccountToken();
  if (accountToken) return accountToken;

  const existing = getBrowserSessionToken();
  if (existing && isLegacySessionToken(existing)) {
    const valid = await legacySessionIsValid(existing);
    if (valid !== false) return existing;
  }
  if (existing) clearSession();

  const res = await fetch(`${API_BASE}/api/auth/session`, { method: "POST" });
  if (!res.ok) throw new Error(`Could not start a session (${res.status})`);
  const data = (await res.json()) as { token: string };
  setSessionToken(data.token);
  return data.token;
}

export async function getUserHeaders(
  overrideToken?: string
): Promise<Record<string, string>> {
  // On the server the token has to be passed down explicitly — there is no
  // localStorage, and cookies() is only reachable from Server Components.
  const token = overrideToken ?? (
    typeof window !== "undefined"
      ? (await getAccountToken()) || getBrowserSessionToken()
      : ""
  );

  if (!token) return {};
  return isLegacySessionToken(token)
    ? { "X-SignalForge-Token": token }
    : { Authorization: `Bearer ${token}` };
}
