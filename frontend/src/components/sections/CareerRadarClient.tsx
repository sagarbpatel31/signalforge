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
import type { Role } from "@/lib/types";

export function CareerRadarClient({ roles }: { roles: Role[] }) {
  const { isDismissed } = useWorkbench();
  const visible = currentCuratedItems(roles, "role")
    .filter((role) => !isDismissed(`role:${role.url ?? `${role.company}-${role.role}`}`))
    .slice(0, 4);

  return (
    <SfCard>
      <div className="section-toolbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <SectionLabel icon="💼">Career Radar</SectionLabel>
        <Link href="/career" style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--blue)", textDecoration: "none", letterSpacing: "0.04em" }}>
          View all →
        </Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {visible.map((r, i) => {
          const itemId = `role:${r.url ?? `${r.company}-${r.role}`}`;
          return (
            <div key={itemId} style={{ padding: "10px 0", borderBottom: i < visible.length - 1 ? "1px solid var(--hairline)" : "none" }}>
              <div className="radar-item-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
                    {r.url ? (
                      <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--blue)", textDecoration: "none", fontWeight: 600 }}>
                        {r.company} ↗
                      </a>
                    ) : r.company}{" "}
                    <span style={{ color: "var(--text-2)", fontWeight: 400 }}>· {r.role}</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-4)", marginBottom: 8 }}>
                    {r.type}
                  </div>
                  <CuratedMeta kind="role" lastVerified={r.last_verified} sources={r.sources} />
                  <WorkbenchActions
                    dismissId={itemId}
                    task={{
                      id: itemId,
                      priority: r.color === "red" ? "P0" : r.color === "green" ? "P1" : "P2",
                      task: `Follow up on role: ${r.company} · ${r.role}`,
                      domain: "Career",
                      time: "20m",
                      description: `${r.signal}\n${r.type}\n${r.url ?? ""}`.trim(),
                    }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <SfTag color={r.color}>{r.signal}</SfTag>
                  <BookmarkButton item={{ id: r.url ?? `${r.company}-${r.role}`, title: `${r.company} · ${r.role}`, sub: r.type ?? "", url: r.url, type: "role" }} />
                </div>
              </div>
            </div>
          );
        })}
        {visible.length === 0 && (
          <div style={{ padding: "16px 0", fontSize: 12, color: "var(--text-3)", lineHeight: 1.5 }}>
            No roles are currently verified. Live ingestion will repopulate this preview; older listings remain in the career archive.
          </div>
        )}
      </div>
    </SfCard>
  );
}
