import Link from "next/link";
import { fetchNewsItems } from "@/lib/api";
import { SfTag } from "@/components/ui/sf-tag";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "SignalForge — Intelligence Feed" };

const SOURCE_COLOR: Record<string, "cyan" | "amber" | "green" | "muted"> = {
  "TechCrunch AI": "cyan",
  "MIT Tech Review": "amber",
  "Hacker News": "amber",
  "OpenAI": "green",
  "Hugging Face": "cyan",
  "VentureBeat AI": "muted",
  "IEEE Spectrum": "muted",
  "Wired AI": "muted",
};

export default async function NewsPage() {
  const items = await fetchNewsItems();

  return (
    <div style={{ minHeight: "100vh", background: "var(--sf-bg)", padding: "32px 24px 60px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ marginBottom: 6 }}>
            <Link href="/" style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--sf-text-3)", letterSpacing: "0.08em", textDecoration: "none" }}>
              ← DASHBOARD
            </Link>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
            Intelligence Feed
          </h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--sf-text-3)", margin: "4px 0 0", letterSpacing: "0.06em" }}>
            {items.length} SIGNALS · REFRESHED EVERY 12H · FILTERED FOR ROBOTICS · AI · EDGE · STARTUPS
          </p>
        </div>

        {/* News list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                background: "var(--sf-bg2)",
                border: "1px solid var(--sf-border)",
                padding: "12px 18px",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, marginBottom: 5 }}>
                  {item.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <SfTag color={SOURCE_COLOR[item.source] ?? "muted"}>{item.source}</SfTag>
                  {item.tags.slice(0, 2).map(t => (
                    <SfTag key={t} color="muted">{t}</SfTag>
                  ))}
                  {item.published && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--sf-text-3)" }}>
                      {item.published.slice(0, 16)}
                    </span>
                  )}
                </div>
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  padding: "6px 14px",
                  background: "transparent",
                  border: "1px solid var(--sf-border)",
                  color: "var(--sf-text-2)",
                  textDecoration: "none",
                  letterSpacing: "0.06em",
                  whiteSpace: "nowrap",
                }}
              >
                Read →
              </a>
            </div>
          ))}

          {items.length === 0 && (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--sf-text-3)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
              No news cached yet — ingestion runs on server startup and every 12h.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
