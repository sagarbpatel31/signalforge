"use client";

import { useState } from "react";
import Link from "next/link";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SfTag } from "@/components/ui/sf-tag";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { generateBriefStream } from "@/lib/api";
import type { BriefResponse } from "@/lib/api";

export function TodaysBrief({ initialBrief }: { initialBrief: BriefResponse }) {
  const [brief, setBrief] = useState(initialBrief);
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleRegenerate() {
    setLoading(true);
    setStreamText("");
    setError(null);
    try {
      const result = await generateBriefStream((chunk) => {
        setStreamText((prev) => prev + chunk);
      });
      setBrief(result);
    } catch {
      setError("AI brief generation is unavailable. The current verified brief is still shown.");
    } finally {
      setLoading(false);
      setStreamText("");
    }
  }

  const { market_pulse, signals, timestamp } = brief;
  const briefTone = brief.source_mode === "live" ? "var(--green)" : "var(--orange)";

  return (
    <SfCard glow>
      <div
        className="section-toolbar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <SectionLabel icon="📡">Today&apos;s Brief</SectionLabel>
        <div className="section-toolbar-actions" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
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
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: briefTone,
              letterSpacing: "0.04em",
            }}
            title={brief.source_detail}
          >
            {brief.source_mode === "live" ? "LIVE" : "FALLBACK"}
          </span>
          <button
            onClick={handleRegenerate}
            disabled={loading}
            className={`btn ${loading ? "" : "btn-blue"}`}
            style={{ borderRadius: 8 }}
          >
            {loading ? "STREAMING…" : "⟳ AI BRIEF"}
          </button>
        </div>
      </div>

      {error && <InlineNotice message={error} onRetry={handleRegenerate} />}

      {/* Streaming indicator */}
      {loading && streamText && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--text-3)",
            background: "var(--surface-strong)",
            padding: "10px 14px",
            marginBottom: 16,
            borderRadius: 10,
            borderLeft: "2px solid var(--text-4)",
            lineHeight: 1.6,
            maxHeight: 80,
            overflow: "hidden",
          }}
        >
          {streamText.slice(-300)}
          <span style={{ animation: "pulse-dot 1s ease-in-out infinite", display: "inline-block", marginLeft: 3 }}>▌</span>
        </div>
      )}

      {/* Market pulse */}
      {!loading && (
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
      )}

      {!loading && (
        <div
          style={{
            marginBottom: 14,
            fontSize: 12,
            color: "var(--text-3)",
            lineHeight: 1.5,
          }}
        >
          {brief.source_detail}
        </div>
      )}

      {/* Signal rows */}
      {!loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {signals.map((s, i) => (
            <div
              key={i}
              className="brief-signal-row"
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
      )}
    </SfCard>
  );
}
