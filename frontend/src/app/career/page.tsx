"use client";

import { useEffect, useState, useMemo } from "react";
import { SubNav } from "@/components/nav/SubNav";
import { SfTag } from "@/components/ui/sf-tag";
import { BookmarkButton } from "@/components/ui/BookmarkButton";
import { FilterTabs, matchesFilter } from "@/components/ui/FilterTabs";
import { fetchAllCareer } from "@/lib/api";
import type { Role } from "@/lib/types";
import type { FilterTab } from "@/components/ui/FilterTabs";

const CAREER_FILTERS: FilterTab[] = [
  { key: "all",       label: "All",           tags: [] },
  { key: "robotics",  label: "Robotics",      tags: ["robotics", "physical-ai"] },
  { key: "edge-ai",   label: "Edge AI",       tags: ["edge-ai", "embedded"] },
  { key: "genai",     label: "Generative AI", tags: ["llm", "generative", "agentic"] },
  { key: "startup",   label: "Startups",      tags: ["startup"] },
];

export default function CareerPage() {
  const [roles, setRoles]       = useState<Role[]>([]);
  const [loading, setLoading]   = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    fetchAllCareer().then((data) => {
      setRoles(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const tab = CAREER_FILTERS.find((f) => f.key === activeFilter);
    if (!tab || tab.tags.length === 0) return roles;
    return roles.filter((r) => matchesFilter(r.tags ?? [], tab.tags));
  }, [roles, activeFilter]);

  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const tab of CAREER_FILTERS) {
      result[tab.key] = tab.tags.length === 0
        ? roles.length
        : roles.filter((r) => matchesFilter(r.tags ?? [], tab.tags)).length;
    }
    return result;
  }, [roles]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <SubNav backLabel="Dashboard" />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px 60px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 4 }}>
              Career Radar
            </h1>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.06em" }}>
              {loading
                ? "LOADING…"
                : `${filtered.length}${filtered.length !== roles.length ? ` / ${roles.length}` : ""} ROLES · LIVE · FILTERED FOR YOUR DOMAINS`}
            </p>
          </div>
          <SfTag color="cyan" dot>LIVE</SfTag>
        </div>

        {/* Filter tabs */}
        {!loading && roles.length > 0 && (
          <FilterTabs
            tabs={CAREER_FILTERS}
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
                  height: 62,
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

        {/* Role list */}
        {!loading && roles.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {filtered.length === 0 && (
              <div style={{ padding: "32px 0", textAlign: "center", color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                No roles match this filter yet — data refreshes every 12h.
              </div>
            )}
            {filtered.map((role, i) => (
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
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover, var(--surface))")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface)")}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{role.company}</span>
                    <span style={{ color: "var(--text-4)", fontSize: 12 }}>·</span>
                    <span style={{ fontSize: 13, color: "var(--text-2)" }}>{role.role}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-3)" }}>
                      {role.type}
                    </span>
                    <SfTag color={role.color}>{role.signal}</SfTag>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <BookmarkButton
                    item={{
                      id: role.url ?? `${role.company}-${role.role}`,
                      title: `${role.company} · ${role.role}`,
                      sub: role.type ?? "",
                      url: role.url,
                      type: "role",
                    }}
                  />
                  {role.url ? (
                    <a
                      href={role.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-blue"
                      style={{ borderRadius: 8, whiteSpace: "nowrap" }}
                    >
                      Apply →
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && roles.length === 0 && (
          <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
            No roles cached yet — trigger ingestion from dashboard.
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
