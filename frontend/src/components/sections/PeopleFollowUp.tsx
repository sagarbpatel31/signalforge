"use client";

import { useState } from "react";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SfTag } from "@/components/ui/sf-tag";
import type { Person, TagColor } from "@/lib/types";

function urgencyColor(u: string): TagColor {
  if (u === "Overdue") return "red";
  if (u === "This week") return "amber";
  return "muted";
}

export function PeopleFollowUp({ people }: { people: Person[] }) {
  const [done, setDone] = useState<Set<number>>(new Set());
  const [showDone, setShowDone] = useState(false);

  const active = people.filter((_, i) => !done.has(i));
  const completed = people.filter((_, i) => done.has(i));
  const visible = showDone ? people : active;

  return (
    <SfCard>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <SectionLabel>People To Follow Up</SectionLabel>
        {completed.length > 0 && (
          <button
            onClick={() => setShowDone((v) => !v)}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--sf-text-3)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              letterSpacing: "0.04em",
            }}
          >
            {showDone ? "hide done" : `+${completed.length} done`}
          </button>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {visible.map((p, visIdx) => {
          const origIdx = people.indexOf(p);
          const isDone = done.has(origIdx);
          return (
            <div
              key={origIdx}
              style={{
                padding: "11px 0",
                borderBottom:
                  visIdx < visible.length - 1
                    ? "1px solid var(--sf-border-subtle)"
                    : "none",
                opacity: isDone ? 0.4 : 1,
                transition: "opacity 0.2s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 3,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {p.url ? (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        color: "inherit",
                        textDecoration: isDone ? "line-through" : "none",
                      }}
                    >
                      {p.name}
                    </a>
                  ) : (
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        textDecoration: isDone ? "line-through" : "none",
                      }}
                    >
                      {p.name}
                    </span>
                  )}
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "var(--sf-text-3)",
                    }}
                  >
                    {p.handle}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "var(--sf-text-3)",
                    }}
                  >
                    {p.days}d ago
                  </span>
                  {!isDone && (
                    <SfTag color={urgencyColor(p.urgency)}>{p.urgency}</SfTag>
                  )}
                  <button
                    onClick={() =>
                      setDone((prev) => {
                        const next = new Set(prev);
                        if (isDone) next.delete(origIdx);
                        else next.add(origIdx);
                        return next;
                      })
                    }
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      padding: "2px 7px",
                      background: isDone ? "transparent" : "transparent",
                      border: `1px solid ${isDone ? "var(--sf-border)" : "var(--sf-green)"}`,
                      color: isDone ? "var(--sf-text-3)" : "var(--sf-green)",
                      cursor: "pointer",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {isDone ? "undo" : "✓"}
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--sf-text-2)", lineHeight: 1.4 }}>
                {p.context}
              </div>
            </div>
          );
        })}
      </div>
    </SfCard>
  );
}
