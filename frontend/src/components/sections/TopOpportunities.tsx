import { fetchOpportunities } from "@/lib/api";
import { SKILLS } from "@/lib/skills-data";
import { rankOpportunitiesForProfile } from "@/lib/intelligence";
import { TopOpportunitiesClient } from "./TopOpportunitiesClient";
import type { UserProfile } from "@/lib/types";

const SKILL_SLUG: Record<string, string> = Object.fromEntries(
  SKILLS.map((s) => [s.title, s.slug])
);

export async function TopOpportunities({ profile }: { profile: UserProfile | null }) {
  const opportunities = rankOpportunitiesForProfile(await fetchOpportunities(), profile);
  return <TopOpportunitiesClient opportunities={opportunities} profile={profile} skillSlug={SKILL_SLUG} />;
}
