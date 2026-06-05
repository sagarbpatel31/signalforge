"use client";

import type { Task } from "@/lib/types";
import { useWorkbench } from "@/lib/useWorkbench";

interface WorkbenchActionsProps {
  dismissId: string;
  task: Task;
}

export function WorkbenchActions({ dismissId, task }: WorkbenchActionsProps) {
  const { dismiss, addTask, hasTask } = useWorkbench();
  const queued = hasTask(task.id);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
      <button
        onClick={(event) => {
          event.stopPropagation();
          addTask(task);
        }}
        className={`btn ${queued ? "" : "btn-blue"}`}
        style={{ padding: "3px 8px", fontSize: 9, borderRadius: 6 }}
        title={queued ? "Already added to this week" : "Add to Build This Week"}
      >
        {queued ? "Queued" : "Add to week"}
      </button>
      <button
        onClick={(event) => {
          event.stopPropagation();
          dismiss(dismissId);
        }}
        style={{
          background: "transparent",
          border: "1px solid var(--hairline)",
          color: "var(--text-4)",
          borderRadius: 6,
          padding: "3px 8px",
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          cursor: "pointer",
        }}
        title="Dismiss from dashboard"
      >
        Dismiss
      </button>
    </div>
  );
}
