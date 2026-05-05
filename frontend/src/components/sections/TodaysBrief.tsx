"use client";

import { useState } from "react";
import Link from "next/link";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SfTag } from "@/components/ui/sf-tag";
import { generateBrief } from "@/lib/api";
import type { BriefResponse } from "@/lib/api";

export function TodaysBrief({ initialBrief }: { initialBrief: BriefResponse }) {
  const [brief, setBrief] = useState(initialBrief);
  const [loading, setLoading] = useState(false);

  async function handleRegenerate() {
    setLoading(true);
    try {
      const fresh = await generateBrief();
      setBrief(fresh);
    } finally {
      setLoading(false);
    }
  }

  const { market_pulse, signals, timestamp } = brief;

  return (
    <SfCard glow>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <SectionLabel icon="📡">Today&apos;s Brief</SectionLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link
            href="/news"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-3)",
              textDecoration: "none",
              letterSpacing: "0.04em",
            }}
          >
            View Feed →
          </Link>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-4)" }}>
            {timestamp}
          </span>
          <button
            onClick={handleRegenerate}
            disabled={loading}
            className={`btn ${loading ? "" : "btn-blue"}`}
            style={{ borderRadius: 8 }}
          >
            {loading ? "GENERATING..." : "⟳ AI BRIEF"}
          </button>
        </div>
      </div>

      {/* Market pulse */}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--blue)",
          background: "var(--blue-soft)",
          padding: "10px 14px",
          marginBottom: 16,
          borderRadius: 10,
          borderLeft: "2px solid var(--blue)",
          lineHeight: 1.6,
        }}
      >
        ⟶ {market_pulse}
      </div>

      {/* Signal rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {signals.map((s, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "120px 36px 1fr",
              alignItems: "start",
              gap: 12,
              padding: "10px 0",
              borderBottom:
                i < signals.length - 1 ? "1px solid var(--hairline)" : "none",
            }}
          >
            <SfTag color={s.color}>{s.label}</SfTag>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: s.color === "muted" ? "var(--text-3)" : `var(--sf-${s.color})`,
                alignSelf: "center",
                fontWeight: 600,
              }}
            >
              {s.delta}
            </span>
            <span style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
              {s.text}
            </span>
          </div>
        ))}
      </div>
    </SfCard>
  );
}
