import { fetchResearch } from "@/lib/api";
import { readCacheFile } from "@/lib/server-cache";
import type { Paper } from "@/lib/types";
import { ResearchCornerClient } from "./ResearchCornerClient";

export async function ResearchCorner() {
  let papers = await fetchResearch();
  if (!papers.length) {
    const cached = readCacheFile<Record<string, unknown>[]>("papers");
    if (cached?.length) {
      papers = cached.slice(0, 4).map((p) => ({
        title: ((p.title as string) ?? "").slice(0, 120),
        venue: (p.venue as string) ?? "arXiv",
        tags: ((p.tags as string[]) ?? []).slice(0, 3),
        read: false,
        url: (p.url as string) ?? "",
      })) as Paper[];
    }
  }
  return <ResearchCornerClient papers={papers} />;
}
