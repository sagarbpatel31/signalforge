import Link from "next/link";
import { notFound } from "next/navigation";
import { SKILLS, getSkill } from "@/lib/skills-data";
import { SfTag } from "@/components/ui/sf-tag";
import type { Metadata } from "next";
import type { TagColor } from "@/lib/types";

export function generateStaticParams() {
  return SKILLS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const skill = getSkill(slug);
  return { title: skill ? `SignalForge — ${skill.title}` : "Skill Not Found" };
}

function domainColor(domain: string): TagColor {
  if (domain === "Edge AI") return "cyan";
  if (domain === "Physical AI") return "amber";
  if (domain === "Robotics") return "green";
  if (domain === "Embedded") return "muted";
  return "muted";
}

function typeColor(type: string): TagColor {
  if (type === "course") return "green";
  if (type === "repo") return "cyan";
  if (type === "paper") return "amber";
  return "muted";
}

export default async function SkillPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const skill = getSkill(slug);
  if (!skill) notFound();

  return (
    <div style={{ minHeight: "100vh", background: "var(--sf-bg)", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--sf-text-3)", letterSpacing: "0.08em" }}>
          <Link href="/" style={{ color: "var(--sf-text-3)", textDecoration: "none" }}>DASHBOARD</Link>
          <span>›</span>
          <span>SKILLS × TARGETS</span>
          <span>›</span>
          <span style={{ color: "var(--sf-cyan)" }}>{skill.domain.toUpperCase()}</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <SfTag color={domainColor(skill.domain)}>{skill.domain}</SfTag>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 12px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            {skill.title}
          </h1>
          <p style={{ fontSize: 14, color: "var(--sf-text-2)", lineHeight: 1.7, margin: 0, maxWidth: 680 }}>
            {skill.why}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

          {/* Key Concepts */}
          <div style={{ background: "var(--sf-bg2)", border: "1px solid var(--sf-border)", padding: "20px 22px" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--sf-cyan)", letterSpacing: "0.1em", marginBottom: 14 }}>
              KEY CONCEPTS TO LEARN
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {skill.concepts.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--sf-text-3)", flexShrink: 0, marginTop: 2 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--sf-text-2)", lineHeight: 1.5 }}>{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Target Companies */}
          <div style={{ background: "var(--sf-bg2)", border: "1px solid var(--sf-border)", padding: "20px 22px" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--sf-amber)", letterSpacing: "0.1em", marginBottom: 14 }}>
              TARGET COMPANIES + ROLES
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {skill.targets.map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{t.company}</div>
                    <div style={{ fontSize: 11, color: "var(--sf-text-3)", fontFamily: "var(--font-mono)" }}>{t.role}</div>
                  </div>
                  {t.url && (
                    <a
                      href={t.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 9,
                        padding: "4px 10px",
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
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resources */}
        <div style={{ background: "var(--sf-bg2)", border: "1px solid var(--sf-border)", padding: "20px 22px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--sf-green)", letterSpacing: "0.1em", marginBottom: 14 }}>
            RESOURCES — COURSES · REPOS · PAPERS · TOOLS
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {skill.resources.map((r, i) => (
              <a
                key={i}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: "1px solid var(--sf-border)", background: "var(--sf-bg3)" }}
              >
                <SfTag color={typeColor(r.type)}>{r.type}</SfTag>
                <span style={{ fontSize: 12, color: "var(--sf-text-2)", lineHeight: 1.4 }}>{r.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Footer nav */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--sf-border)" }}>
          <Link href="/" style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--sf-text-3)", textDecoration: "none", letterSpacing: "0.08em" }}>
            ← DASHBOARD
          </Link>
          <div style={{ display: "flex", gap: 12 }}>
            {SKILLS.filter((s) => s.slug !== skill.slug).map((s) => (
              <Link
                key={s.slug}
                href={`/skills/${s.slug}`}
                style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--sf-text-3)", textDecoration: "none", letterSpacing: "0.06em" }}
              >
                {s.domain} →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
