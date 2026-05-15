"use client";

import { useEffect, useState, useCallback } from "react";
import { SubNav } from "@/components/nav/SubNav";
import { SfTag } from "@/components/ui/sf-tag";
import { fetchNewsItems, triggerIngest } from "@/lib/api";
import type { NewsItem, TagColor } from "@/lib/types";

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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchNewsItems();
      setItems(data);
      if (data.length > 0) setLastRefresh(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount: load, and if empty auto-trigger ingest once
  useEffect(() => {
    load().then(async () => {
      // If still empty after load, trigger ingest + reload after delay
      const data = await fetchNewsItems();
      if (data.length === 0) {
        setIngesting(true);
        try {
          await triggerIngest();
          // Wait for ingest to write to Redis, then reload
          await new Promise(r => setTimeout(r, 3000));
          await load();
        } catch { /* silent */ } finally {
          setIngesting(false);
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleRefresh() {
    setIngesting(true);
    try {
      await triggerIngest();
      await new Promise(r => setTimeout(r, 2000));
      await load();
    } catch { /* silent */ } finally {
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
                : `${items.length} SIGNALS · REFRESHED EVERY 12H · ROBOTICS · AI · EDGE · STARTUPS`}
              {lastRefresh && !loading && !ingesting && (
                <span style={{ marginLeft: 12, color: "var(--green)" }}>
                  ↑ {lastRefresh}
                </span>
              )}
            </p>
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
            {items.map((item, i) => (
              <div
                key={i}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--hairline)",
                  borderRadius:
                    i === 0
                      ? "12px 12px 4px 4px"
                      : i === items.length - 1
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
