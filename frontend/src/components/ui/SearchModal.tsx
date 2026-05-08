"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { fetchStartups, fetchAllCareer, fetchAllResearch, fetchNewsItems } from "@/lib/api";
import type { Startup, Role, Paper, NewsItem } from "@/lib/types";

interface SearchResult {
  type: "startup" | "career" | "research" | "news";
  title: string;
  sub: string;
  url?: string;
}

interface SearchModalProps {
  onClose: () => void;
}

function categoryLabel(type: SearchResult["type"]): string {
  switch (type) {
    case "startup":  return "Startups";
    case "career":   return "Career";
    case "research": return "Research";
    case "news":     return "News";
  }
}

export function SearchModal({ onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [allData, setAllData] = useState<SearchResult[]>([]);
  const [loaded, setLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input on open
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Load all data once on open
  useEffect(() => {
    async function load() {
      const [startups, roles, papers, news] = await Promise.allSettled([
        fetchStartups(),
        fetchAllCareer(),
        fetchAllResearch(),
        fetchNewsItems(),
      ]);

      const items: SearchResult[] = [];

      if (startups.status === "fulfilled") {
        for (const s of (startups.value as Startup[])) {
          items.push({ type: "startup", title: s.name, sub: s.note ?? "", url: s.website });
        }
      }
      if (roles.status === "fulfilled") {
        for (const r of (roles.value as Role[])) {
          items.push({ type: "career", title: `${r.company} · ${r.role}`, sub: r.type ?? "", url: r.url });
        }
      }
      if (papers.status === "fulfilled") {
        for (const p of (papers.value as Paper[])) {
          items.push({ type: "research", title: p.title, sub: p.venue ?? "", url: p.url });
        }
      }
      if (news.status === "fulfilled") {
        for (const n of (news.value as NewsItem[])) {
          items.push({ type: "news", title: n.title, sub: n.source ?? "", url: n.url });
        }
      }

      setAllData(items);
      setLoaded(true);
    }
    load();
  }, []);

  const filter = useCallback(
    (q: string) => {
      if (!q.trim()) { setResults([]); return; }
      const lower = q.toLowerCase();
      const matched = allData.filter(
        (r) =>
          r.title.toLowerCase().includes(lower) ||
          r.sub.toLowerCase().includes(lower)
      );
      setResults(matched.slice(0, 20));
      setActiveIdx(0);
    },
    [allData]
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => filter(val), 150);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const r = results[activeIdx];
      if (r?.url) { window.open(r.url, "_blank", "noopener"); onClose(); }
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  // Group results by type for display
  const grouped: Record<string, SearchResult[]> = {};
  for (const r of results) {
    if (!grouped[r.type]) grouped[r.type] = [];
    grouped[r.type].push(r);
  }

  // Flat index tracker for keyboard nav
  let flatIdx = 0;

  return (
    <div
      className="search-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="search-box">
        <input
          ref={inputRef}
          className="search-input"
          placeholder={loaded ? "Search startups, roles, papers, news…" : "Loading…"}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={!loaded}
        />

        {query && (
          <div className="search-results">
            {results.length === 0 ? (
              <div style={{ padding: "16px 18px", color: "var(--text-4)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                No results for &ldquo;{query}&rdquo;
              </div>
            ) : (
              (["startup", "career", "research", "news"] as const).map((type) => {
                const group = grouped[type];
                if (!group?.length) return null;
                return (
                  <div key={type}>
                    <div className="search-section-label">{categoryLabel(type)}</div>
                    {group.map((r) => {
                      const idx = flatIdx++;
                      const isActive = idx === activeIdx;
                      return (
                        <a
                          key={r.title + r.sub}
                          href={r.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`search-row${isActive ? " active" : ""}`}
                          onClick={onClose}
                          onMouseEnter={() => setActiveIdx(idx)}
                        >
                          <div>
                            <div className="search-row-title">{r.title}</div>
                            {r.sub && <div className="search-row-sub">{r.sub}</div>}
                          </div>
                        </a>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        )}

        {!query && (
          <div style={{ padding: "12px 18px 14px", display: "flex", gap: 16 }}>
            {(["startup", "career", "research", "news"] as const).map((type) => (
              <span key={type} style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-4)" }}>
                {categoryLabel(type)}
              </span>
            ))}
            <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-4)" }}>
              ESC to close
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
