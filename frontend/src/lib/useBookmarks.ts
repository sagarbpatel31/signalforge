"use client";

import { useCallback, useSyncExternalStore } from "react";

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

const STORAGE_KEY = "sf-bookmarks";
const EMPTY: Bookmarks = { papers: [], startups: [], roles: [], opportunities: [] };

// Single shared store so every BookmarkButton and the /bookmarks page stay in sync.
const listeners = new Set<() => void>();
let snapshot: Bookmarks | null = null;

function load(): Bookmarks {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

// Cached snapshot keeps a stable reference between renders (required by
// useSyncExternalStore); it is only replaced when bookmarks actually change.
export function getSnapshot(): Bookmarks {
  if (snapshot === null) snapshot = load();
  return snapshot;
}

export function getServerSnapshot(): Bookmarks {
  return EMPTY;
}

function persist(next: Bookmarks) {
  snapshot = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

export function removeBookmark(listKey: keyof Bookmarks, id: string) {
  const prev = getSnapshot();
  persist({ ...prev, [listKey]: prev[listKey].filter((b) => b.id !== id) });
}

export function useBookmarks() {
  const bookmarks = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((item: BookmarkItem) => {
    const prev = getSnapshot();
    const key = `${item.type}s` as keyof Bookmarks;
    const list = prev[key];
    const exists = list.some((b) => b.id === item.id);
    const next = exists ? list.filter((b) => b.id !== item.id) : [...list, item];
    persist({ ...prev, [key]: next });
  }, []);

  const isBookmarked = useCallback(
    (id: string) =>
      bookmarks.papers.some((b) => b.id === id) ||
      bookmarks.startups.some((b) => b.id === id) ||
      bookmarks.roles.some((b) => b.id === id),
    [bookmarks]
  );

  return { bookmarks, toggle, isBookmarked };
}
