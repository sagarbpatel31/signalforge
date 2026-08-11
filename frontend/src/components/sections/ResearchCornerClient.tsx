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
import type { Paper } from "@/lib/types";

export function ResearchCornerClient({ papers }: { papers: Paper[] }) {
  const { isDismissed } = useWorkbench();
  const visible = currentCuratedItems(papers, "paper")
    .filter((paper) => !isDismissed(`paper:${paper.url ?? paper.title}`));

  return (
    <SfCard>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <SectionLabel icon="📄">Research Corner</SectionLabel>
        <Link href="/research" style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--blue)", textDecoration: "none", letterSpacing: "0.04em" }}>
          Browse all →
        </Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {visible.map((p, i) => {
          const itemId = `paper:${p.url ?? p.title}`;
          return (
            <div key={itemId} style={{ padding: "10px 0", borderBottom: i < visible.length - 1 ? "1px solid var(--hairline)" : "none", opacity: p.read ? 0.5 : 1 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 12, lineHeight: 1.4, marginBottom: 4, color: p.read ? "var(--text-2)" : "var(--text)" }}>
                    {p.url ? (
                      <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                        {p.title}
                      </a>
                    ) : p.title}
                  </div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-4)" }}>
                      {p.venue}
                    </span>
                    {p.tags.map((t) => (
                      <SfTag key={t} color="muted">{t}</SfTag>
                    ))}
                  </div>
                  <CuratedMeta kind="paper" lastVerified={p.last_verified} sources={p.sources} />
                  <WorkbenchActions
                    dismissId={itemId}
                    task={{
                      id: itemId,
                      priority: p.read ? "P2" : "P1",
                      task: `Read paper: ${p.title}`,
                      domain: "Research",
                      time: "25m",
                      description: `${p.venue}\nTags: ${p.tags.join(", ")}\n${p.url ?? ""}`.trim(),
                    }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
                  {!p.read && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--blue)", flexShrink: 0, marginTop: 4 }} />}
                  <BookmarkButton item={{ id: p.url ?? p.title, title: p.title, sub: p.venue, url: p.url, type: "paper" }} />
                </div>
              </div>
            </div>
          );
        })}
        {visible.length === 0 && (
          <div style={{ padding: "16px 0", fontSize: 12, color: "var(--text-3)", lineHeight: 1.5 }}>
            No papers are inside the current review window. Browse the research archive for older references.
          </div>
        )}
      </div>
    </SfCard>
  );
}
