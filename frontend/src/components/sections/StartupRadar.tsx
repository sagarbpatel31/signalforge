import Link from "next/link";
import { fetchStartups } from "@/lib/api";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SfTag } from "@/components/ui/sf-tag";
import { BookmarkButton } from "@/components/ui/BookmarkButton";
import type { TagColor } from "@/lib/types";

function signalColor(s: string): TagColor {
  if (s === "Hot") return "green";
  if (s === "Watch") return "amber";
  return "muted";
}

function signalHeat(s: string): number {
  if (s === "Hot") return 9;
  if (s === "Watch") return 6;
  return 3;
}

function HeatMeter({ level, color }: { level: number; color: string }) {
  const bars = 10;
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          style={{
            width: 3,
            height: 6 + (i % 3) * 3,
            borderRadius: 1,
            background: i < level ? color : "var(--hairline-strong)",
            transition: "background 0.2s",
          }}
        />
      ))}
    </div>
  );
}

export async function StartupRadar() {
  const startups = await fetchStartups();
  const visible = startups.slice(0, 4);
  return (
    <SfCard>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <SectionLabel icon="🚀">Startup Radar</SectionLabel>
        <Link
          href="/startups"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--blue)",
            textDecoration: "none",
            letterSpacing: "0.04em",
          }}
        >
          View all →
        </Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {visible.map((s, i) => {
          const sc = signalColor(s.signal);
          const heatColor =
            sc === "green" ? "var(--green)" : sc === "amber" ? "var(--orange)" : "var(--text-4)";
          return (
            <div
              key={i}
              style={{
                padding: "12px 0",
                borderBottom:
                  i < visible.length - 1 ? "1px solid var(--hairline)" : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {s.website ? (
                    <a
                      href={s.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        color: "var(--text)",
                        textDecoration: "none",
                      }}
                    >
                      {s.name} ↗
                    </a>
                  ) : (
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</span>
                  )}
                  <SfTag color="muted">{s.stage}</SfTag>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <HeatMeter level={signalHeat(s.signal)} color={heatColor} />
                  <BookmarkButton item={{ id: s.website ?? s.name, title: s.name, sub: s.stage, url: s.website, type: "startup" }} />
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.4 }}>
                {s.note}
              </div>
            </div>
          );
        })}
      </div>
    </SfCard>
  );
}
