import { fetchCareer } from "@/lib/api";
import { readCacheFile } from "@/lib/server-cache";
import { CareerRadarClient } from "./CareerRadarClient";
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

export async function CareerRadar({ userKey }: { userKey?: string }) {
  let roles = await fetchCareer(userKey);
  if (!roles.length) {
    const cached = readCacheFile<Record<string, unknown>[]>("jobs");
    if (cached?.length) roles = jobsToRoles(cached);
  }
  return <CareerRadarClient roles={roles} />;
}
