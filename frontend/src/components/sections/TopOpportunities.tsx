import Link from "next/link";
import { fetchOpportunities } from "@/lib/api";
import { SKILLS } from "@/lib/skills-data";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SfTag } from "@/components/ui/sf-tag";
import type { TagColor } from "@/lib/types";

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

const SKILL_SLUG: Record<string, string> = Object.fromEntries(
  SKILLS.map((s) => [s.title, s.slug])
);

export async function TopOpportunities() {
  const opportunities = await fetchOpportunities();
  return (
    <SfCard>
      <SectionLabel icon="🎯">Skills × Targets</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {opportunities.map((op, i) => {
          const slug = SKILL_SLUG[op.title];
          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "28px 1fr 90px 52px",
                gap: 12,
                alignItems: "center",
                padding: "12px 0",
                borderBottom:
                  i < opportunities.length - 1 ? "1px solid var(--hairline)" : "none",
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
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                  {slug ? (
                    <Link
                      href={`/skills/${slug}`}
                      style={{ color: "var(--blue)", textDecoration: "none" }}
                    >
                      {op.title} →
                    </Link>
                  ) : op.title}
                </div>
                {op.why.startsWith("Target:") ? (
                  <div style={{ fontSize: 11, lineHeight: 1.5 }}>
                    <span style={{ color: "var(--text-4)", fontFamily: "var(--font-mono)", fontSize: 10 }}>
                      Target:{" "}
                    </span>
                    <span style={{ color: "var(--text-2)" }}>
                      {op.why.replace("Target: ", "").split(" → ")[0]}
                    </span>
                    {op.why.includes(" → ") && (
                      <>
                        <span style={{ color: "var(--text-4)", fontFamily: "var(--font-mono)", fontSize: 10 }}>
                          {" → "}
                        </span>
                        <span style={{ color: "var(--orange)", fontFamily: "var(--font-mono)", fontSize: 10 }}>
                          {op.why.split(" → ")[1]}
                        </span>
                      </>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.4 }}>{op.why}</div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
                <SfTag color={domainColor(op.domain)}>{op.domain}</SfTag>
                <SfTag color={signalColor(op.signal)}>{op.signal}</SfTag>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    color:
                      op.fit > 85
                        ? "var(--blue)"
                        : op.fit > 75
                        ? "var(--orange)"
                        : "var(--text-2)",
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
      </div>
    </SfCard>
  );
}
