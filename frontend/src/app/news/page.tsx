import { SubNav } from "@/components/nav/SubNav";
import { fetchNewsItems } from "@/lib/api";
import { SfTag } from "@/components/ui/sf-tag";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "SignalForge — Intelligence Feed" };

const SOURCE_COLOR: Record<string, "cyan" | "amber" | "green" | "muted"> = {
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
};

export default async function NewsPage() {
  const items = await fetchNewsItems();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <SubNav backLabel="Dashboard" />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 60px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 4 }}>
            Intelligence Feed
          </h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.06em" }}>
            {items.length} SIGNALS · REFRESHED EVERY 12H · ROBOTICS · AI · EDGE · STARTUPS
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--hairline)",
                borderRadius: i === 0 ? "12px 12px 4px 4px" : i === items.length - 1 ? "4px 4px 12px 12px" : 4,
                padding: "12px 18px",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, marginBottom: 6 }}>
                  {item.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <SfTag color={SOURCE_COLOR[item.source] ?? "muted"}>{item.source}</SfTag>
                  {item.tags.slice(0, 2).map((t) => (
                    <SfTag key={t} color="muted">{t}</SfTag>
                  ))}
                  {item.published && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-4)" }}>
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

          {items.length === 0 && (
            <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
              No news cached yet — ingestion runs on server startup and every 12h.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
