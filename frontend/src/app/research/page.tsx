import { SubNav } from "@/components/nav/SubNav";
import { fetchAllResearch } from "@/lib/api";
import { SfTag } from "@/components/ui/sf-tag";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "SignalForge — Research Corner" };

export default async function ResearchPage() {
  const papers = await fetchAllResearch();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <SubNav backLabel="Dashboard" />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 60px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 4 }}>
            Research Corner
          </h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.06em" }}>
            {papers.length} PAPERS · arXiv cs.RO · cs.AI · cs.LG · eess.SY · EDGE AI · PHYSICAL AI
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {papers.map((p, i) => (
            <div
              key={i}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--hairline)",
                borderRadius: i === 0 ? "12px 12px 4px 4px" : i === papers.length - 1 ? "4px 4px 12px 12px" : 4,
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
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--blue)" }}>
                    {p.venue}
                  </span>
                  {p.tags.slice(0, 3).map((t) => (
                    <SfTag key={t} color="muted">{t}</SfTag>
                  ))}
                </div>
              </div>
              {p.url ? (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{ borderRadius: 8, whiteSpace: "nowrap" }}
                >
                  arXiv →
                </a>
              ) : null}
            </div>
          ))}

          {papers.length === 0 && (
            <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
              No papers cached yet — ingestion runs on server startup and every 12h.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
