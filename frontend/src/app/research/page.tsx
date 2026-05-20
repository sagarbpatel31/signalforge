"use client";

import { useEffect, useState, useMemo } from "react";
import { SubNav } from "@/components/nav/SubNav";
import { SfTag } from "@/components/ui/sf-tag";
import { FilterTabs, matchesFilter } from "@/components/ui/FilterTabs";
import { BookmarkButton } from "@/components/ui/BookmarkButton";
import { fetchAllResearch } from "@/lib/api";
import type { Paper } from "@/lib/types";
import type { FilterTab } from "@/components/ui/FilterTabs";

const RESEARCH_FILTERS: FilterTab[] = [
  { key: "all",         label: "All",          tags: [] },
  { key: "robotics",    label: "Robotics",     tags: ["robotics", "physical-ai", "manipulation", "locomotion"] },
  { key: "edge-ai",     label: "Edge AI",      tags: ["edge-ai", "embedded", "tinyml", "quantization"] },
  { key: "physical-ai", label: "Physical AI",  tags: ["physical-ai", "humanoid", "vla", "diffusion-policy", "embodied"] },
  { key: "genai",       label: "Generative AI", tags: ["llm", "generative", "foundation-model", "multimodal"] },
];

export default function ResearchPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    fetchAllResearch().then((data) => {
      setPapers(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const tab = RESEARCH_FILTERS.find((f) => f.key === activeFilter);
    if (!tab || tab.tags.length === 0) return papers;
    return papers.filter((p) => matchesFilter(p.tags, tab.tags));
  }, [papers, activeFilter]);

  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const tab of RESEARCH_FILTERS) {
      result[tab.key] = tab.tags.length === 0
        ? papers.length
        : papers.filter((p) => matchesFilter(p.tags, tab.tags)).length;
    }
    return result;
  }, [papers]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <SubNav backLabel="Dashboard" />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 60px" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 4 }}>
            Research Corner
          </h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.06em" }}>
            {loading
              ? "LOADING…"
              : `${filtered.length}${filtered.length !== papers.length ? ` / ${papers.length}` : ""} PAPERS · arXiv cs.RO · cs.AI · cs.LG · eess.SY`}
          </p>
        </div>

        {/* Filter tabs */}
        {!loading && papers.length > 0 && (
          <FilterTabs
            tabs={RESEARCH_FILTERS}
            active={activeFilter}
            counts={counts}
            onChange={setActiveFilter}
          />
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 64,
                  borderRadius: 8,
                  background: "var(--surface)",
                  border: "1px solid var(--hairline)",
                  opacity: 1 - i * 0.12,
                  animation: "pulse 1.5s ease-in-out infinite",
                  animationDelay: `${i * 80}ms`,
                }}
              />
            ))}
          </div>
        )}

        {/* Paper list */}
        {!loading && papers.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {filtered.length === 0 && (
              <div style={{ padding: "32px 0", textAlign: "center", color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                No papers match this filter yet — data refreshes every 12h.
              </div>
            )}
            {filtered.map((p, i) => (
              <div
                key={i}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--hairline)",
                  borderRadius:
                    i === 0 ? "12px 12px 4px 4px"
                    : i === filtered.length - 1 ? "4px 4px 12px 12px"
                    : 4,
                  padding: "14px 18px",
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  alignItems: "center",
                  gap: 16,
                  opacity: p.read ? 0.5 : 1,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover, var(--surface))")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface)")}
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
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <BookmarkButton
                    item={{ id: p.url ?? p.title, title: p.title, sub: p.venue, url: p.url, type: "paper" }}
                  />
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
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && papers.length === 0 && (
          <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
            No papers cached yet — ingestion runs every 12h.
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
