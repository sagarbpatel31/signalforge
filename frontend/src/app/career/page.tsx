import Link from "next/link";
import { fetchAllCareer, fetchProfile } from "@/lib/api";
import { SfTag } from "@/components/ui/sf-tag";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "SignalForge — Career Radar" };

export default async function CareerPage() {
  const [roles, profile] = await Promise.all([fetchAllCareer(), fetchProfile()]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--sf-bg)", padding: "32px 24px 60px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <div style={{ marginBottom: 6 }}>
              <Link href="/" style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--sf-text-3)", letterSpacing: "0.08em", textDecoration: "none" }}>
                ← DASHBOARD
              </Link>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
              Career Radar
            </h1>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--sf-text-3)", margin: "4px 0 0", letterSpacing: "0.06em" }}>
              {roles.length} ROLES · FILTERED FOR{" "}
              {profile?.domains.map(d => d.toUpperCase()).join(", ") ?? "YOUR PROFILE"}
            </p>
          </div>
          <SfTag color="cyan" dot>LIVE</SfTag>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {roles.map((role, i) => (
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
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{role.company}</span>
                  <span style={{ color: "var(--sf-text-3)", fontSize: 12 }}>·</span>
                  <span style={{ fontSize: 13, color: "var(--sf-text-2)" }}>{role.role}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--sf-text-3)" }}>
                    {role.type}
                  </span>
                  <SfTag color={role.color}>{role.signal}</SfTag>
                </div>
              </div>
              {role.url ? (
                <a
                  href={role.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    padding: "6px 14px",
                    background: "var(--sf-cyan-dim)",
                    border: "1px solid var(--sf-cyan)",
                    color: "var(--sf-cyan)",
                    textDecoration: "none",
                    letterSpacing: "0.06em",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  Apply →
                </a>
              ) : null}
            </div>
          ))}

          {roles.length === 0 && (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--sf-text-3)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
              No roles cached yet — trigger ingestion from dashboard.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
