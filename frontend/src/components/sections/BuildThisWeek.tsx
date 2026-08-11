"use client";

import { useState } from "react";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SfTag } from "@/components/ui/sf-tag";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { generateTasks } from "@/lib/api";
import { useWorkbench } from "@/lib/useWorkbench";
import type { TagColor, Task } from "@/lib/types";

function priorityColor(p: string): TagColor {
  if (p === "P0") return "red";
  if (p === "P1") return "amber";
  return "muted";
}

export function BuildThisWeek({
  tasks: initialTasks,
  dateKey,
}: {
  tasks: Task[];
  dateKey: string;
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [regen, setRegen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { state, removeTask, toggleCompletedTask } = useWorkbench();

  const mergedTasks = [...state.customTasks, ...tasks];
  const customIds = new Set(state.customTasks.map((task) => task.id));
  const completedTaskIds = new Set(
    state.dailyProgress.date === dateKey
      ? state.dailyProgress.completedTaskIds
      : []
  );

  function toggleDone(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    toggleCompletedTask(dateKey, id);
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleRegen() {
    setRegen(true);
    setError(null);
    try {
      const fresh = await generateTasks();
      setTasks(fresh);
      setExpanded(new Set());
    } catch {
      setError("AI task generation is unavailable. Existing tasks remain available.");
    } finally {
      setRegen(false);
    }
  }

  const doneCount = mergedTasks.filter((task) => completedTaskIds.has(String(task.id))).length;
  const pct = mergedTasks.length ? Math.round((doneCount / mergedTasks.length) * 100) : 0;

  return (
    <SfCard>
      <div
        className="section-toolbar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
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
            {doneCount}/{mergedTasks.length}
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

      {error && <InlineNotice message={error} onRetry={handleRegen} />}

      {/* Progress bar */}
      <div className="progress-bar" style={{ marginBottom: 14 }}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {mergedTasks.map((t, i) => {
          const taskId = String(t.id);
          const isExpanded = expanded.has(taskId);
          const hasDesc = Boolean(t.description);
          const isCustom = customIds.has(t.id);
          return (
            <div
              key={taskId}
              style={{
                borderBottom:
                  i < mergedTasks.length - 1 ? "1px solid var(--hairline)" : "none",
              }}
            >
              {/* Row */}
              <div
                className="task-row"
                onClick={() => hasDesc && toggleExpand(taskId)}
                style={{
                  display: "grid",
                  gridTemplateColumns: isCustom ? "22px 40px 1fr 58px 20px 44px" : "22px 40px 1fr 20px 44px",
                  gap: 8,
                  alignItems: "center",
                  padding: "10px 0",
                  cursor: hasDesc ? "pointer" : "default",
                  opacity: completedTaskIds.has(taskId) ? 0.45 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  aria-label={`${completedTaskIds.has(taskId) ? "Mark incomplete" : "Mark complete"}: ${t.task}`}
                  aria-pressed={completedTaskIds.has(taskId)}
                  onClick={(e) => toggleDone(e, taskId)}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 6,
                    border: `1.5px solid ${completedTaskIds.has(taskId) ? "var(--green)" : "var(--hairline-strong)"}`,
                    background: completedTaskIds.has(taskId) ? "var(--green-soft)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.15s",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {completedTaskIds.has(taskId) && (
                    <span style={{ color: "var(--green)", fontSize: 9, lineHeight: 1 }}>✓</span>
                  )}
                </button>

                <SfTag color={priorityColor(t.priority)}>{t.priority}</SfTag>

                <span
                  className="task-title"
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    textDecoration: completedTaskIds.has(taskId) ? "line-through" : "none",
                    color: completedTaskIds.has(taskId) ? "var(--text-4)" : "var(--text)",
                    lineHeight: 1.35,
                  }}
                >
                  {t.task}
                </span>

                {isCustom && (
                  <button
                    className="task-clear"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTask(t.id);
                    }}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--hairline)",
                      borderRadius: 6,
                      color: "var(--text-4)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      padding: "3px 6px",
                      cursor: "pointer",
                    }}
                  >
                    clear
                  </button>
                )}

                {/* Expand chevron */}
                {hasDesc ? (
                  <span
                    className="task-chevron"
                    style={{
                      color: "var(--text-4)",
                      fontSize: 10,
                      transition: "transform 0.15s",
                      transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                      display: "inline-block",
                      textAlign: "center",
                    }}
                  >
                    ▶
                  </span>
                ) : (
                  <span className="task-chevron" />
                )}

                <span
                  className="task-time"
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

              {/* Expandable description panel */}
              {isExpanded && t.description && (
                <div
                  style={{
                margin: "0 0 10px 30px",
                padding: "10px 14px",
                    background: "var(--surface-2, oklch(0.18 0.01 240 / 0.6))",
                    borderRadius: 8,
                    borderLeft: "2px solid var(--blue)",
                  }}
                >
                  <pre
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--text-2)",
                      lineHeight: 1.65,
                      whiteSpace: "pre-wrap",
                      margin: 0,
                    }}
                  >
                    {t.description}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SfCard>
  );
}
