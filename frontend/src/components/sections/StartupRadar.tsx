import Link from "next/link";
import { fetchStartups } from "@/lib/api";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SfTag } from "@/components/ui/sf-tag";
import type { TagColor } from "@/lib/types";

function signalColor(s: string): TagColor {
  if (s === "Hot") return "green";
  if (s === "Watch") return "amber";
  return "muted";
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
        <SectionLabel>Startup Radar</SectionLabel>
        <Link
          href="/startups"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--sf-text-3)",
            textDecoration: "none",
            letterSpacing: "0.04em",
          }}
        >
          View all →
        </Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {visible.map((s, i) => (
          <div
            key={i}
            style={{
              padding: "11px 0",
              borderBottom:
                i < visible.length - 1 ? "1px solid var(--sf-border-subtle)" : "none",
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
                <span style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</span>
                <SfTag color="muted">{s.stage}</SfTag>
              </div>
              <SfTag color={signalColor(s.signal)} dot={s.signal === "Hot"}>
                {s.signal}
              </SfTag>
            </div>
            <div style={{ fontSize: 12, color: "var(--sf-text-2)", lineHeight: 1.4 }}>
              {s.note}
            </div>
          </div>
        ))}
      </div>
    </SfCard>
  );
}
