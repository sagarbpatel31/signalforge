"use client";

import Link from "next/link";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SfTag } from "@/components/ui/sf-tag";
import { BookmarkButton } from "@/components/ui/BookmarkButton";
import { WorkbenchActions } from "@/components/ui/WorkbenchActions";
import { CuratedMeta } from "@/components/ui/CuratedMeta";
import { useWorkbench } from "@/lib/useWorkbench";
import { currentCuratedItems } from "@/lib/curated";
import type { RankedOpportunity } from "@/lib/intelligence";
import type { TagColor, UserProfile } from "@/lib/types";

function domainColor(domain: string): TagColor {
  if (domain === "Edge AI") return "cyan";
  if (domain === "Physical AI") return "amber";
  if (domain === "Robotics") return "green";
  return "muted";
}

function signalColor(signal: string): TagColor {
  if (signal === "HIGH") return "green";
  if (signal === "MEDIUM") return "amber";
  return "muted";
}

export function TopOpportunitiesClient({
  opportunities,
  profile,
  skillSlug,
}: {
  opportunities: RankedOpportunity[];
  profile: UserProfile | null;
  skillSlug: Record<string, string>;
}) {
  const { isDismissed } = useWorkbench();
  const visible = currentCuratedItems(opportunities, "opportunity")
    .filter((item) => !isDismissed(`opportunity:${item.title}`));

  return (
    <SfCard>
      <SectionLabel icon="🎯">
        {profile ? "Skills × Targets For You" : "Skills × Targets"}
      </SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {visible.map((op, i) => {
          const slug = skillSlug[op.title];
          return (
            <div
              key={op.title}
              style={{
                display: "grid",
                gridTemplateColumns: "28px 1fr 132px 52px",
                gap: 12,
                alignItems: "center",
                padding: "12px 0",
                borderBottom: i < visible.length - 1 ? "1px solid var(--hairline)" : "none",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--text-4)",
                  fontWeight: 600,
                }}
              >
                {op.rank}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {slug ? (
                      <Link href={`/skills/${slug}`} style={{ color: "var(--blue)", textDecoration: "none" }}>
                        {op.title} →
                      </Link>
                    ) : op.title}
                  </div>
                  <BookmarkButton
                    item={{
                      id: `opportunity:${op.title}`,
                      title: op.title,
                      sub: `${op.domain} · fit ${op.fit}`,
                      type: "opportunity",
                    }}
                  />
                </div>
                <div style={{ display: "grid", gap: 8, marginBottom: 2 }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                      Sourced Fact
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.45 }}>
                      {op.sourced_fact ?? op.why}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                      Editorial Take
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.45 }}>
                      {op.editorial_take ?? op.why}
                    </div>
                  </div>
                </div>
                <CuratedMeta kind="opportunity" lastVerified={op.last_verified} sources={op.sources} />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                  {op.matchReasons.map((reason) => (
                    <span
                      key={reason}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 9,
                        color: "var(--text-3)",
                        padding: "3px 7px",
                        borderRadius: 999,
                        border: "1px solid var(--hairline)",
                        background: "var(--surface-strong)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
                <SfTag color={domainColor(op.domain)}>{op.domain}</SfTag>
                <SfTag color={signalColor(op.signal)}>{op.signal}</SfTag>
                <WorkbenchActions
                  dismissId={`opportunity:${op.title}`}
                  task={{
                    id: `opportunity:${op.title}`,
                    priority: op.signal === "HIGH" ? "P0" : op.signal === "MEDIUM" ? "P1" : "P2",
                    task: `Investigate: ${op.title}`,
                    domain: op.domain,
                    time: "45m",
                    description: `${op.why}\n\nWhy it matches:\n- ${op.matchReasons.join("\n- ")}`,
                  }}
                />
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    color: op.fit > 85 ? "var(--blue)" : op.fit > 75 ? "var(--orange)" : "var(--text-2)",
                  }}
                >
                  {op.fit}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    color: "var(--text-4)",
                    letterSpacing: "0.08em",
                  }}
                >
                  FIT
                </div>
              </div>
            </div>
          );
        })}
        {visible.length === 0 && (
          <div style={{ padding: "12px 0", fontSize: 12, color: "var(--text-3)" }}>
            No current opportunities remain in this view. Open the full opportunity archive to review stale or dismissed signals.
          </div>
        )}
      </div>
    </SfCard>
  );
}
