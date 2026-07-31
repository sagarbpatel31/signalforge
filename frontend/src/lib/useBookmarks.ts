"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { fetchBookmarks, saveBookmarks } from "./api";
import { getBrowserSessionToken, userIdFromToken } from "./identity";

export interface BookmarkItem {
  id: string;       // unique key (url or title)
  title: string;
  sub: string;      // venue / company+type / stage
  url?: string;
  type: "paper" | "startup" | "role" | "opportunity";
}

export interface Bookmarks {
  papers:   BookmarkItem[];
  startups: BookmarkItem[];
  roles:    BookmarkItem[];
  opportunities: BookmarkItem[];
}

const EMPTY: Bookmarks = { papers: [], startups: [], roles: [], opportunities: [] };
const LIST_KEYS: (keyof Bookmarks)[] = ["papers", "startups", "roles", "opportunities"];

// Single shared store so every BookmarkButton and the /bookmarks page stay in sync.
const listeners = new Set<() => void>();
let snapshot: Bookmarks | null = null;
let hydratePromise: Promise<void> | null = null;
let lastSavedJson = "";
let activeUserId = "anon";

function currentUserId(): string {
  return userIdFromToken(getBrowserSessionToken()) || "anon";
}

// localStorage is now an offline cache in front of the server, not the source
// of truth — bookmarks follow the session across devices. Namespacing by
// session id keeps two accounts on one browser from seeing each other's list.
function storageKey(userId = activeUserId): string {
  return `sf-bookmarks:${userId || "anon"}`;
}

function normalize(raw: Partial<Bookmarks> | null): Bookmarks {
  const out = { ...EMPTY };
  for (const key of LIST_KEYS) {
    const list = raw?.[key];
    out[key] = Array.isArray(list) ? list : [];
  }
  return out;
}

function load(): Bookmarks {
  if (typeof window === "undefined") return EMPTY;
  try {
    activeUserId = currentUserId();
    const raw = localStorage.getItem(storageKey());
    return raw ? normalize(JSON.parse(raw) as Partial<Bookmarks>) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function persist(next: Bookmarks) {
  snapshot = next;
  try {
    activeUserId = currentUserId();
    localStorage.setItem(storageKey(), JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

/** Union by id per list, so a bookmark added offline on one device survives a
 *  merge with a server list that never saw it. */
function mergeState(local: Bookmarks, remote: Bookmarks): Bookmarks {
  const merged = { ...EMPTY };
  for (const key of LIST_KEYS) {
    const byId = new Map<string, BookmarkItem>();
    for (const item of remote[key]) byId.set(item.id, item);
    for (const item of local[key]) byId.set(item.id, item);
    merged[key] = Array.from(byId.values());
  }
  return merged;
}

async function pushRemote(next: Bookmarks) {
  const json = JSON.stringify(next);
  if (json === lastSavedJson) return;
  try {
    const saved = await saveBookmarks(next);
    lastSavedJson = JSON.stringify(saved);
  } catch {
    // No session yet, or the API is unreachable — keep the local state.
  }
}

async function hydrateRemote() {
  if (typeof window === "undefined") return;
  if (hydratePromise) return hydratePromise;

  hydratePromise = (async () => {
    activeUserId = currentUserId();
    const local = getSnapshot();
    try {
      const remote = await fetchBookmarks();
      const merged = mergeState(local, remote);
      persist(merged);
      await pushRemote(merged);
    } catch {
      lastSavedJson = JSON.stringify(local);
    }
  })();

  return hydratePromise;
}

export function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

// Cached snapshot keeps a stable reference between renders (required by
// useSyncExternalStore); it is only replaced when bookmarks actually change,
// or when the session changes underneath us.
export function getSnapshot(): Bookmarks {
  const nextUserId = typeof window === "undefined" ? activeUserId : currentUserId();
  if (snapshot === null || nextUserId !== activeUserId) {
    activeUserId = nextUserId;
    snapshot = load();
    hydratePromise = null;
    lastSavedJson = "";
  }
  return snapshot;
}

export function getServerSnapshot(): Bookmarks {
  return EMPTY;
}

export function removeBookmark(listKey: keyof Bookmarks, id: string) {
  const prev = getSnapshot();
  const next = { ...prev, [listKey]: prev[listKey].filter((b) => b.id !== id) };
  persist(next);
  void pushRemote(next);
}

export function useBookmarks() {
  const bookmarks = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    void hydrateRemote();
  }, []);

  const toggle = useCallback((item: BookmarkItem) => {
    const prev = getSnapshot();
    const key = `${item.type}s` as keyof Bookmarks;
    const list = prev[key];
    const exists = list.some((b) => b.id === item.id);
    const next = { ...prev, [key]: exists ? list.filter((b) => b.id !== item.id) : [...list, item] };
    persist(next);
    void pushRemote(next);
  }, []);

  const isBookmarked = useCallback(
    (id: string) =>
      bookmarks.papers.some((b) => b.id === id) ||
      bookmarks.startups.some((b) => b.id === id) ||
      bookmarks.roles.some((b) => b.id === id) ||
      bookmarks.opportunities.some((b) => b.id === id),
    [bookmarks]
  );

  return { bookmarks, toggle, isBookmarked };
}
