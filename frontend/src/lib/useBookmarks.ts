"use client";

import { useState, useEffect, useCallback } from "react";

export interface BookmarkItem {
  id: string;       // unique key (url or title)
  title: string;
  sub: string;      // venue / company+type / stage
  url?: string;
  type: "paper" | "startup" | "role";
}

interface Bookmarks {
  papers:   BookmarkItem[];
  startups: BookmarkItem[];
  roles:    BookmarkItem[];
}

const STORAGE_KEY = "sf-bookmarks";

function read(): Bookmarks {
  if (typeof window === "undefined") return { papers: [], startups: [], roles: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { papers: [], startups: [], roles: [] };
  } catch {
    return { papers: [], startups: [], roles: [] };
  }
}

function write(data: Bookmarks) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmarks>({ papers: [], startups: [], roles: [] });

  useEffect(() => { setBookmarks(read()); }, []);

  const toggle = useCallback((item: BookmarkItem) => {
    setBookmarks((prev) => {
      const list = prev[`${item.type}s` as keyof Bookmarks] as BookmarkItem[];
      const exists = list.some((b) => b.id === item.id);
      const next = exists ? list.filter((b) => b.id !== item.id) : [...list, item];
      const updated = { ...prev, [`${item.type}s`]: next };
      write(updated);
      return updated;
    });
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
