import { SubNav } from "@/components/nav/SubNav";
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
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <SubNav backLabel="Dashboard" />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 60px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 4 }}>
            Startup Radar
          </h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.06em" }}>
            {startups.length} STARTUPS · EDGE AI · ROBOTICS · PHYSICAL AI · EMBEDDED
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {startups.map((s, i) => (
            <div
              key={i}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--hairline)",
                borderRadius: i === 0 ? "12px 12px 4px 4px" : i === startups.length - 1 ? "4px 4px 12px 12px" : 4,
                padding: "16px 18px",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                  {s.website ? (
                    <a
                      href={s.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontWeight: 600, fontSize: 14, color: "var(--blue)", textDecoration: "none" }}
                    >
                      {s.name} ↗
                    </a>
                  ) : (
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</span>
                  )}
                  <SfTag color="muted">{s.stage}</SfTag>
                  <SfTag color="muted">{s.domain}</SfTag>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>
                  {s.note}
                </div>
              </div>
              <SfTag color={signalColor(s.signal)} dot={s.signal === "Hot"}>
                {s.signal}
              </SfTag>
            </div>
          ))}

          {startups.length === 0 && (
            <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
              No startups tracked yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
