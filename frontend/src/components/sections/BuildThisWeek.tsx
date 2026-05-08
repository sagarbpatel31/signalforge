"use client";

import { useState } from "react";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SfTag } from "@/components/ui/sf-tag";
import { generateTasks } from "@/lib/api";
import type { TagColor, Task } from "@/lib/types";

function priorityColor(p: string): TagColor {
  if (p === "P0") return "red";
  if (p === "P1") return "amber";
  return "muted";
}

export function BuildThisWeek({ tasks: initialTasks }: { tasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [done, setDone] = useState<Record<number, boolean>>({});
  const [regen, setRegen] = useState(false);

  const toggle = (id: number) =>
    setDone((prev) => ({ ...prev, [id]: !prev[id] }));

  async function handleRegen() {
    setRegen(true);
    try {
      const fresh = await generateTasks();
      setTasks(fresh);
      setDone({});
    } catch {
      // keep existing
    } finally {
      setRegen(false);
    }
  }

  const doneCount = Object.values(done).filter(Boolean).length;
  const pct = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

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
        <SectionLabel icon="🔨">Build This Week</SectionLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: pct === 100 ? "var(--green)" : "var(--text-3)",
            }}
          >
            {doneCount}/{tasks.length}
          </span>
          <button
            onClick={handleRegen}
            disabled={regen}
            className={`btn ${regen ? "" : "btn-blue"}`}
            style={{ padding: "3px 9px", fontSize: 9, borderRadius: 6 }}
          >
            {regen ? "…" : "⟳ AI"}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar" style={{ marginBottom: 14 }}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {tasks.map((t, i) => (
          <div
            key={t.id}
            onClick={() => toggle(t.id)}
            style={{
              display: "grid",
              gridTemplateColumns: "22px 40px 1fr 44px",
              gap: 10,
              alignItems: "center",
              padding: "10px 0",
              cursor: "pointer",
              borderBottom:
                i < tasks.length - 1 ? "1px solid var(--hairline)" : "none",
              opacity: done[t.id] ? 0.4 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {/* Rounded checkbox */}
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 6,
                border: `1.5px solid ${done[t.id] ? "var(--green)" : "var(--hairline-strong)"}`,
                background: done[t.id] ? "var(--green-soft)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.15s",
              }}
            >
              {done[t.id] && (
                <span style={{ color: "var(--green)", fontSize: 9, lineHeight: 1 }}>✓</span>
              )}
            </div>
            <SfTag color={priorityColor(t.priority)}>{t.priority}</SfTag>
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                textDecoration: done[t.id] ? "line-through" : "none",
                color: done[t.id] ? "var(--text-4)" : "var(--text)",
              }}
            >
              {t.task}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--text-4)",
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
