import Link from "next/link";
import { fetchStartups } from "@/lib/api";
import { SfTag } from "@/components/ui/sf-tag";
import type { Metadata } from "next";
import type { TagColor } from "@/lib/types";

export const metadata: Metadata = { title: "SignalForge — Startup Radar" };

function signalColor(s: string): TagColor {
  if (s === "Hot") return "green";
  if (s === "Watch") return "amber";
  return "muted";
}

export default async function StartupsPage() {
  const startups = await fetchStartups();

  return (
    <div style={{ minHeight: "100vh", background: "var(--sf-bg)", padding: "32px 24px 60px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        <div style={{ marginBottom: 32 }}>
          <div style={{ marginBottom: 6 }}>
            <Link href="/" style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--sf-text-3)", letterSpacing: "0.08em", textDecoration: "none" }}>
              ← DASHBOARD
            </Link>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
            Startup Radar
          </h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--sf-text-3)", margin: "4px 0 0", letterSpacing: "0.06em" }}>
            {startups.length} STARTUPS · EDGE AI · ROBOTICS · PHYSICAL AI · EMBEDDED
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {startups.map((s, i) => (
            <div
              key={i}
              style={{
                background: "var(--sf-bg2)",
                border: "1px solid var(--sf-border)",
                padding: "16px 18px",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</span>
                  <SfTag color="muted">{s.stage}</SfTag>
                  <SfTag color="muted">{s.domain}</SfTag>
                </div>
                <div style={{ fontSize: 12, color: "var(--sf-text-2)", lineHeight: 1.5 }}>
                  {s.note}
                </div>
              </div>
              <SfTag color={signalColor(s.signal)} dot={s.signal === "Hot"}>
                {s.signal}
              </SfTag>
            </div>
          ))}

          {startups.length === 0 && (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--sf-text-3)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
              No startups tracked yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
