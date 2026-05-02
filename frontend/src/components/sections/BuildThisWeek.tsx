"use client";

import { useState } from "react";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SfTag } from "@/components/ui/sf-tag";
import type { TagColor, Task } from "@/lib/types";

function priorityColor(p: string): TagColor {
  if (p === "P0") return "red";
  if (p === "P1") return "amber";
  return "muted";
}

export function BuildThisWeek({ tasks }: { tasks: Task[] }) {
  const [done, setDone] = useState<Record<number, boolean>>({});

  const toggle = (id: number) =>
    setDone((prev) => ({ ...prev, [id]: !prev[id] }));

  const doneCount = Object.values(done).filter(Boolean).length;

  return (
    <SfCard>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <SectionLabel>Build This Week</SectionLabel>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--sf-text-3)",
          }}
        >
          {doneCount}/{tasks.length} done
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {tasks.map((t, i) => (
          <div
            key={t.id}
            onClick={() => toggle(t.id)}
            style={{
              display: "grid",
              gridTemplateColumns: "18px 36px 1fr 50px",
              gap: 10,
              alignItems: "center",
              padding: "10px 0",
              cursor: "pointer",
              borderBottom:
                i < tasks.length - 1 ? "1px solid var(--sf-border-subtle)" : "none",
              opacity: done[t.id] ? 0.4 : 1,
              transition: "opacity 0.2s",
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                border: `1px solid ${done[t.id] ? "var(--sf-green)" : "var(--sf-border)"}`,
                background: done[t.id] ? "var(--sf-green-dim)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {done[t.id] && (
                <span style={{ color: "var(--sf-green)", fontSize: 9, lineHeight: 1 }}>
                  ✓
                </span>
              )}
            </div>
            <SfTag color={priorityColor(t.priority)}>{t.priority}</SfTag>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                textDecoration: done[t.id] ? "line-through" : "none",
                color: done[t.id] ? "var(--sf-text-3)" : "var(--sf-text)",
              }}
            >
              {t.task}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--sf-text-3)",
                textAlign: "right",
              }}
            >
              {t.time}
            </span>
          </div>
        ))}
      </div>
    </SfCard>
  );
}
