"use client";

import type { CuratedSource } from "@/lib/types";

function formatVerified(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CuratedMeta({
  lastVerified,
  sources = [],
}: {
  lastVerified?: string;
  sources?: CuratedSource[];
}) {
  if (!lastVerified && sources.length === 0) return null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 8 }}>
      {lastVerified && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            color: "var(--text-4)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Last verified {formatVerified(lastVerified)}
        </span>
      )}
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
