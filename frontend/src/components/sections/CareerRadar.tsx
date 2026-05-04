import Link from "next/link";
import { fetchCareer } from "@/lib/api";
import { readCacheFile } from "@/lib/server-cache";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SfTag } from "@/components/ui/sf-tag";
import type { Role, TagColor } from "@/lib/types";

const COLOR_MAP: Record<string, TagColor> = {
  robotics: "cyan", "edge-ai": "cyan", "physical-ai": "cyan",
  llm: "amber", agentic: "green", embedded: "amber", generative: "amber",
};

function jobsToRoles(jobs: Record<string, unknown>[]): Role[] {
  return jobs.slice(0, 12).map((j) => {
    const tags = (j.tags as string[]) ?? [];
    const color: TagColor = tags.map((t) => COLOR_MAP[t]).find(Boolean) ?? "muted";
    const loc = ((j.location as string) ?? "Remote").slice(0, 28);
    return {
      company: (j.company as string) ?? "",
      role: (j.title as string) ?? "",
      type: `${(j.job_type as string) ?? "Full-time"} · ${loc}`,
      signal: `LIVE · ${(j.source as string) ?? ""}`,
      color,
    };
  });
}

export async function CareerRadar() {
  let roles = await fetchCareer();
  if (!roles.length) {
    const cached = readCacheFile<Record<string, unknown>[]>("jobs");
    if (cached?.length) roles = jobsToRoles(cached);
  }
  return (
    <SfCard>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <SectionLabel>Career Radar</SectionLabel>
        <Link href="/career" style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--sf-cyan)", textDecoration: "none", letterSpacing: "0.04em" }}>
          View all →
        </Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {roles.map((r, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom:
                i < roles.length - 1 ? "1px solid var(--sf-border-subtle)" : "none",
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noopener noreferrer"
                    style={{ color: "var(--sf-cyan)", textDecoration: "none", fontWeight: 600 }}>
                    {r.company}
                  </a>
                ) : r.company}{" "}
                <span style={{ color: "var(--sf-text-2)", fontWeight: 400 }}>
                  · {r.role}
                </span>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--sf-text-3)",
                }}
              >
                {r.type}
              </div>
            </div>
            <SfTag color={r.color}>{r.signal}</SfTag>
          </div>
        ))}
      </div>
    </SfCard>
  );
}
