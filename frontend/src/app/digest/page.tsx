"use client";

import { useState, useEffect } from "react";
import { SubNav } from "@/components/nav/SubNav";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface DigestSection {
  title: string;
  items: string[];
}

interface Digest {
  headline: string;
  sections: DigestSection[];
  action_item: string;
  generated_at?: string;
}

async function fetchDigest(): Promise<Digest | null> {
  try {
    // Try cached digest first (from KV), fall back to generating
    const res = await fetch(`${API_BASE}/api/generate/digest`, {
      method: "POST",
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json() as Promise<Digest>;
  } catch {
    return null;
  }
}

export default function DigestPage() {
  const [digest, setDigest] = useState<Digest | null>(null);
  const [loading, setLoading] = useState(true);
  const [regen, setRegen] = useState(false);

  useEffect(() => {
    // Try to get cached digest from API
    fetch(`${API_BASE}/api/feeds/digest`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.headline) {
          setDigest(d as Digest);
          setLoading(false);
        } else {
          // No cache — generate now
          fetchDigest().then((d) => { setDigest(d); setLoading(false); });
        }
      })
      .catch(() => {
        fetchDigest().then((d) => { setDigest(d); setLoading(false); });
      });
  }, []);

  async function handleRegen() {
    setRegen(true);
    const d = await fetchDigest();
    if (d) setDigest(d);
    setRegen(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <SubNav backLabel="Dashboard" />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 60px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 4 }}>
              Intelligence Digest
            </h1>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.06em" }}>
              {digest?.generated_at
                ? `GENERATED ${new Date(digest.generated_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).toUpperCase()}`
                : "PERSONALIZED · NEWS + RESEARCH + JOBS"}
            </p>
          </div>
          <button
            onClick={handleRegen}
            disabled={regen || loading}
            className={`btn ${regen || loading ? "" : "btn-blue"}`}
            style={{ borderRadius: 8 }}
          >
            {regen ? "GENERATING…" : "⟳ REGENERATE"}
          </button>
        </div>

        {loading ? (
          <SfCard>
            <div style={{ padding: "24px 0", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-3)" }}>
                Generating digest from live signals…
              </div>
              <div style={{ marginTop: 12, height: 3, background: "var(--hairline)", borderRadius: 999, overflow: "hidden" }}>
                <div className="shimmer" style={{ height: "100%", width: "100%" }} />
              </div>
            </div>
          </SfCard>
        ) : !digest ? (
          <SfCard>
            <div style={{ padding: "24px 0", textAlign: "center", color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
              Could not generate digest — check ANTHROPIC_API_KEY env var.
            </div>
          </SfCard>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Headline */}
            <SfCard glow>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  color: "var(--blue)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                Today&apos;s Signal
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  lineHeight: 1.4,
                  color: "var(--text)",
                  letterSpacing: "-0.02em",
                }}
              >
                {digest.headline}
              </div>
            </SfCard>

            {/* Sections */}
            {digest.sections.map((sec, si) => (
              <SfCard key={si}>
                <SectionLabel>{sec.title}</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                  {sec.items.map((item, ii) => (
                    <div key={ii} style={{ display: "flex", gap: 10 }}>
                      <span style={{ color: "var(--blue)", fontFamily: "var(--font-mono)", fontSize: 11, flexShrink: 0, marginTop: 1 }}>›</span>
                      <span style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.55 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </SfCard>
            ))}

            {/* Action item */}
            <div
              style={{
                background: "var(--green-soft)",
                border: "1px solid oklch(0.78 0.15 155 / 0.25)",
                borderRadius: 16,
                padding: "16px 20px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  color: "var(--green)",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Action Item Today
              </div>
              <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 500, lineHeight: 1.5 }}>
                → {digest.action_item}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
