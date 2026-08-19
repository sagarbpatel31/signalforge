"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { SubNav } from "@/components/nav/SubNav";
import { SfTag } from "@/components/ui/sf-tag";
import { FilterTabs, matchesFilter } from "@/components/ui/FilterTabs";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { fetchFeedMeta, fetchNewsItems, triggerIngest } from "@/lib/api";
import { summarizeFeedStatus } from "@/lib/intelligence";
import type { FeedSourceIndicator } from "@/lib/intelligence";
import type { NewsItem, TagColor } from "@/lib/types";
import type { FilterTab } from "@/components/ui/FilterTabs";

const NEWS_FILTERS: FilterTab[] = [
  { key: "all",       label: "All",          tags: [] },
  { key: "robotics",  label: "Robotics",     tags: ["robotics", "physical-ai"] },
  { key: "edge-ai",   label: "Edge AI",      tags: ["edge-ai", "embedded"] },
  { key: "genai",     label: "Generative AI", tags: ["llm", "generative", "agentic"] },
  { key: "startups",  label: "Startups",     tags: ["startup"] },
];

const SOURCE_COLOR: Record<string, TagColor> = {
  "TechCrunch AI":       "cyan",
  "TechCrunch Startups": "green",
  "MIT Tech Review":     "amber",
  "Hacker News":         "amber",
  "OpenAI":              "green",
  "Hugging Face":        "cyan",
  "VentureBeat AI":      "muted",
  "IEEE Spectrum":       "muted",
  "Wired AI":            "muted",
  "Crunchbase News":     "green",
  "The Robot Report":    "cyan",
  "Robohub":             "cyan",
  "NVIDIA Developer":    "green",
  "Embedded.com":        "muted",
  "Ars Technica AI":     "amber",
};

const TAG_COLOR: Record<string, TagColor> = {
  "robotics": "cyan",
  "edge-ai": "amber",
  "physical-ai": "cyan",
  "llm": "green",
  "startup": "green",
  "agentic": "green",
  "embedded": "muted",
  "generative": "amber",
};

export default function NewsPage() {
  const [items, setItems]       = useState<NewsItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string>("");
  const [feedDetail, setFeedDetail] = useState("");
  const [feedSources, setFeedSources] = useState<FeedSourceIndicator[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const tab = NEWS_FILTERS.find((f) => f.key === activeFilter);
    if (!tab || tab.tags.length === 0) return items;
    return items.filter((item) => matchesFilter(item.tags, tab.tags));
  }, [items, activeFilter]);

  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const tab of NEWS_FILTERS) {
      result[tab.key] = tab.tags.length === 0
        ? items.length
        : items.filter((item) => matchesFilter(item.tags, tab.tags)).length;
    }
    return result;
  }, [items]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, meta] = await Promise.all([fetchNewsItems(), fetchFeedMeta()]);
      setItems(data);
      const status = summarizeFeedStatus(meta);
      setFeedDetail(status.detail);
      setFeedSources(status.sources);
      if (data.length > 0) setLastRefresh(new Date().toLocaleTimeString());
      return data;
    } catch {
      setError("The feed could not be loaded. Check the API connection and try again.");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount: load, and if empty auto-trigger a refresh once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await load();
      // If still empty after load, trigger refresh + reload after delay
      if (cancelled || data.length > 0) return;
      setIngesting(true);
      setError(null);
      try {
        await triggerIngest();
        // Wait for the background fetch to write to Redis, then reload
        await new Promise(r => setTimeout(r, 3000));
        if (!cancelled) await load();
      } catch {
        if (!cancelled) setError("Automatic feed ingestion failed. You can retry it manually.");
      } finally {
        if (!cancelled) setIngesting(false);
      }
    })();
    return () => { cancelled = true; };
  }, [load]);

  async function handleRefresh() {
    setIngesting(true);
    setError(null);
    try {
      await triggerIngest();
      await new Promise(r => setTimeout(r, 2000));
      await load();
    } catch {
      setError("Feed refresh failed. Existing cached signals are unchanged.");
    } finally {
      setIngesting(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <SubNav backLabel="Dashboard" />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 60px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 28,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                marginBottom: 4,
              }}
            >
              Intelligence Feed
            </h1>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--text-3)",
                letterSpacing: "0.06em",
              }}
            >
              {loading || ingesting
                ? "LOADING…"
                : `${filtered.length}${filtered.length !== items.length ? ` / ${items.length}` : ""} SIGNALS · REFRESHED EVERY 12H`}
              {lastRefresh && !loading && !ingesting && (
                <span style={{ marginLeft: 12, color: "var(--green)" }}>
                  ↑ {lastRefresh}
                </span>
              )}
            </p>
            {feedDetail && !loading && (
              <p
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: "var(--text-3)",
                  lineHeight: 1.5,
                }}
              >
                {feedDetail}
              </p>
            )}
            {!loading && feedSources.length > 0 && (
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 10 }}>
                {feedSources.map((source) => (
                  <span
                    key={source.key}
                    title={source.detail}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      color: source.status === "healthy"
                        ? "var(--green)"
                        : source.status === "error"
                          ? "var(--orange)"
                          : "var(--text-3)",
                      border: "1px solid var(--hairline)",
                      borderRadius: 999,
                      padding: "3px 7px",
                    }}
                  >
                    {source.label} {source.itemCount} · {source.status}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleRefresh}
            disabled={ingesting || loading}
            className="btn btn-blue"
            style={{
              padding: "6px 14px",
              fontSize: 11,
              borderRadius: 8,
              opacity: ingesting || loading ? 0.5 : 1,
            }}
          >
            {ingesting ? "Fetching…" : "⟳ Refresh Feed"}
          </button>
        </div>

        {error && <InlineNotice message={error} onRetry={handleRefresh} retryLabel="Retry refresh" />}

        {/* Filter tabs */}
        {!loading && items.length > 0 && (
          <FilterTabs
            tabs={NEWS_FILTERS}
            active={activeFilter}
            counts={counts}
            onChange={setActiveFilter}
          />
        )}

        {/* Loading skeleton */}
        {(loading || ingesting) && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 60,
                  borderRadius: 8,
                  background: "var(--surface)",
                  border: "1px solid var(--hairline)",
                  opacity: 1 - i * 0.1,
                  animation: "pulse 1.5s ease-in-out infinite",
                  animationDelay: `${i * 80}ms`,
                }}
              />
            ))}
            {ingesting && (
              <p
                style={{
                  textAlign: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--text-3)",
                  marginTop: 12,
                  letterSpacing: "0.06em",
                }}
              >
                Ingesting RSS feeds, arXiv, and job boards…
              </p>
            )}
          </div>
        )}

        {/* Feed items */}
        {!loading && !ingesting && items.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {filtered.length === 0 && (
              <div style={{ padding: "32px 0", textAlign: "center", color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                No signals match this filter yet — data refreshes every 12h.
              </div>
            )}
            {filtered.map((item, i) => (
              <div
                key={i}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--hairline)",
                  borderRadius:
                    i === 0
                      ? "12px 12px 4px 4px"
                      : i === filtered.length - 1
                      ? "4px 4px 12px 12px"
                      : 4,
                  padding: "12px 18px",
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  alignItems: "center",
                  gap: 16,
                  transition: "background 0.15s",
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.background = "var(--surface-hover, var(--surface))")
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.background = "var(--surface)")
                }
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      lineHeight: 1.4,
                      marginBottom: 6,
                      color: "var(--text)",
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    <SfTag color={SOURCE_COLOR[item.source] ?? "muted"}>
                      {item.source}
                    </SfTag>
                    {item.tags.slice(0, 2).map((t) => (
                      <SfTag key={t} color={TAG_COLOR[t] ?? "muted"}>
                        {t}
                      </SfTag>
                    ))}
                    {item.published && (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 9,
                          color: "var(--text-4)",
                        }}
                      >
                        {item.published.slice(0, 16)}
                      </span>
                    )}
                  </div>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-blue"
                  style={{ borderRadius: 8, whiteSpace: "nowrap" }}
                >
                  Read →
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !ingesting && items.length === 0 && (
          <div
            style={{
              padding: "60px 0",
              textAlign: "center",
              color: "var(--text-3)",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              lineHeight: 1.8,
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 12 }}>📡</div>
            No signals cached yet.
            <br />
            Click <strong style={{ color: "var(--blue)" }}>⟳ Refresh Feed</strong> to ingest RSS + arXiv + job boards.
            <br />
            <span style={{ fontSize: 10, color: "var(--text-4)" }}>
              Runs automatically every 12h via cron after first populate.
            </span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
