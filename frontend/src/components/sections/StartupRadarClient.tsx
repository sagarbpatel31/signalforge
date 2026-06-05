"use client";

import Link from "next/link";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";
import { BookmarkButton } from "@/components/ui/BookmarkButton";
import { SfTag } from "@/components/ui/sf-tag";
import { WorkbenchActions } from "@/components/ui/WorkbenchActions";
import { CuratedMeta } from "@/components/ui/CuratedMeta";
import { useWorkbench } from "@/lib/useWorkbench";
import type { Startup, TagColor } from "@/lib/types";

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
          }}
        />
      ))}
    </div>
  );
}

export function StartupRadarClient({ startups }: { startups: Startup[] }) {
  const { isDismissed } = useWorkbench();
  const visible = startups.filter((startup) => !isDismissed(`startup:${startup.website ?? startup.name}`)).slice(0, 4);

  return (
    <SfCard>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <SectionLabel icon="🚀">Startup Radar</SectionLabel>
        <Link href="/startups" style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--blue)", textDecoration: "none", letterSpacing: "0.04em" }}>
          View all →
        </Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {visible.map((s, i) => {
          const sc = signalColor(s.signal);
          const heatColor = sc === "green" ? "var(--green)" : sc === "amber" ? "var(--orange)" : "var(--text-4)";
          const itemId = `startup:${s.website ?? s.name}`;
          return (
            <div key={itemId} style={{ padding: "12px 0", borderBottom: i < visible.length - 1 ? "1px solid var(--hairline)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {s.website ? (
                    <a href={s.website} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", textDecoration: "none" }}>
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
              <div style={{ display: "grid", gap: 8, marginBottom: 10 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                    Sourced Fact
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.45 }}>
                    {s.sourced_fact ?? s.note}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                    Editorial Take
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.45 }}>
                    {s.editorial_take ?? s.note}
                  </div>
                </div>
                <CuratedMeta lastVerified={s.last_verified} sources={s.sources} />
              </div>
              <WorkbenchActions
                dismissId={itemId}
                task={{
                  id: itemId,
                  priority: s.signal === "Hot" ? "P0" : s.signal === "Watch" ? "P1" : "P2",
                  task: `Research startup: ${s.name}`,
                  domain: s.domain,
                  time: "30m",
                  description: `${s.stage} · ${s.signal}\nFact: ${s.sourced_fact ?? s.note}\nTake: ${s.editorial_take ?? s.note}`,
                }}
              />
            </div>
          );
        })}
      </div>
    </SfCard>
  );
}
