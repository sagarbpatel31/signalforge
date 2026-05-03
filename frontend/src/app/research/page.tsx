import Link from "next/link";
import { fetchAllResearch } from "@/lib/api";
import { SfTag } from "@/components/ui/sf-tag";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "SignalForge — Research Corner" };

export default async function ResearchPage() {
  const papers = await fetchAllResearch();

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
            Research Corner
          </h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--sf-text-3)", margin: "4px 0 0", letterSpacing: "0.06em" }}>
            {papers.length} PAPERS · arXiv cs.RO · cs.AI · cs.LG · eess.SY · EDGE AI · PHYSICAL AI
          </p>
        </div>

        {/* Paper list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {papers.map((p, i) => (
            <div
              key={i}
              style={{
                background: "var(--sf-bg2)",
                border: "1px solid var(--sf-border)",
                padding: "14px 18px",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "center",
                gap: 16,
                opacity: p.read ? 0.5 : 1,
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.45, marginBottom: 6 }}>
                  {p.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--sf-cyan)" }}>
                    {p.venue}
                  </span>
                  {p.tags.slice(0, 3).map(t => (
                    <SfTag key={t} color="muted">{t}</SfTag>
                  ))}
                </div>
              </div>
              {p.url ? (
                <a
                  href={p.url}
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
                  arXiv →
                </a>
              ) : null}
            </div>
          ))}

          {papers.length === 0 && (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--sf-text-3)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
              No papers cached yet — ingestion runs on server startup and every 12h.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
