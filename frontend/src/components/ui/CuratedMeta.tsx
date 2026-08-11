"use client";

import {
  formatVerifiedDate,
  getFreshnessState,
  type ContentKind,
} from "@/lib/curated";
import type { CuratedSource } from "@/lib/types";

export function CuratedMeta({
  kind,
  lastVerified,
  sources = [],
}: {
  kind: ContentKind;
  lastVerified?: string;
  sources?: CuratedSource[];
}) {
  if (!lastVerified && sources.length === 0) return null;
  const freshness = getFreshnessState(lastVerified, kind);
  const freshnessLabel = freshness === "current"
    ? "Current"
    : freshness === "stale"
      ? "Stale"
      : "Unverified";
  const freshnessColor = freshness === "current"
    ? "var(--green)"
    : freshness === "stale"
      ? "var(--orange)"
      : "var(--red)";

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 8 }}>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: freshnessColor,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          border: `1px solid color-mix(in oklch, ${freshnessColor} 28%, transparent)`,
          borderRadius: 999,
          padding: "2px 7px",
        }}
        title={freshness === "current" ? "Within the freshness window" : "Excluded from current dashboard rankings"}
      >
        {freshnessLabel}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: "var(--text-4)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        Last verified {formatVerifiedDate(lastVerified)}
      </span>
      {sources.slice(0, 3).map((source) => (
        <a
          key={`${source.label}-${source.url}`}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            color: "var(--blue)",
            textDecoration: "none",
            letterSpacing: "0.04em",
          }}
        >
          Source: {source.label} ↗
        </a>
      ))}
    </div>
  );
}
