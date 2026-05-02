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
        <SectionLabel>Today&apos;s Brief</SectionLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/news" style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--sf-text-3)", textDecoration: "none", letterSpacing: "0.04em" }}>
            View Feed →
          </Link>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--sf-text-3)",
            }}
          >
            {timestamp}
          </span>
          <button
            onClick={handleRegenerate}
            disabled={loading}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              padding: "4px 10px",
              background: loading ? "var(--sf-bg3)" : "var(--sf-cyan-dim)",
              border: `1px solid ${loading ? "var(--sf-border)" : "var(--sf-cyan)"}`,
              color: loading ? "var(--sf-text-3)" : "var(--sf-cyan)",
              cursor: loading ? "wait" : "pointer",
              letterSpacing: "0.06em",
              transition: "all 0.15s",
            }}
          >
            {loading ? "GENERATING..." : "⟳ AI BRIEF"}
          </button>
        </div>
      </div>

      {/* Market pulse highlight */}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--sf-cyan)",
          background: "var(--sf-cyan-dim)",
          padding: "10px 14px",
          marginBottom: 16,
          borderLeft: "2px solid var(--sf-cyan)",
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
                i < signals.length - 1 ? "1px solid var(--sf-border-subtle)" : "none",
            }}
          >
            <SfTag color={s.color}>{s.label}</SfTag>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color:
                  s.color === "muted" ? "var(--sf-text-3)" : `var(--sf-${s.color})`,
                alignSelf: "center",
              }}
            >
              {s.delta}
            </span>
            <span
              style={{
                fontSize: 13,
                color: "var(--sf-text-2)",
                lineHeight: 1.5,
              }}
            >
              {s.text}
            </span>
          </div>
        ))}
      </div>
    </SfCard>
  );
}
