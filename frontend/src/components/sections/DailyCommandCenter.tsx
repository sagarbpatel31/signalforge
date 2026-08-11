"use client";

import { useState } from "react";

import { SectionLabel } from "@/components/ui/section-label";
import { SfCard } from "@/components/ui/sf-card";
import { SfTag } from "@/components/ui/sf-tag";
import { emptyDailyProgress, signalProgressId } from "@/lib/daily";
import type { Post, Signal, TagColor, Task } from "@/lib/types";
import { useWorkbench } from "@/lib/useWorkbench";

function priorityColor(priority: string): TagColor {
  if (priority === "P0") return "red";
  if (priority === "P1") return "amber";
  return "muted";
}

function uniqueTasks(tasks: Task[]): Task[] {
  const seen = new Set<string>();
  return tasks.filter((task) => {
    const id = String(task.id);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function DailyCommandCenter({
  dateKey,
  dateLabel,
  signals,
  tasks,
  posts,
}: {
  dateKey: string;
  dateLabel: string;
  signals: Signal[];
  tasks: Task[];
  posts: Post[];
}) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const {
    state,
    toggleReviewedSignal,
    toggleCompletedTask,
    setPostDone,
    resetDailyProgress,
  } = useWorkbench();

  const progress = state.dailyProgress.date === dateKey
    ? state.dailyProgress
    : emptyDailyProgress(dateKey);
  const dailySignals = signals.slice(0, 3);
  const dailyTasks = uniqueTasks([...state.customTasks, ...tasks]).slice(0, 3);
  const dailyPost = posts[0];
  const signalIds = dailySignals.map(signalProgressId);
  const taskIds = dailyTasks.map((task) => String(task.id));
  const completedSignals = signalIds.filter((id) => progress.reviewedSignalIds.includes(id)).length;
  const completedTasks = taskIds.filter((id) => progress.completedTaskIds.includes(id)).length;
  const totalSteps = dailySignals.length + dailyTasks.length + (dailyPost ? 1 : 0);
  const completedSteps = completedSignals + completedTasks + (dailyPost && progress.postDone ? 1 : 0);
  const completion = totalSteps ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const tweetHref = dailyPost
    ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(dailyPost.text)}`
    : "https://twitter.com/compose/post";

  async function copyPost() {
    if (!dailyPost) return;
    try {
      await navigator.clipboard.writeText(dailyPost.text);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1400);
    } catch {
      setCopyState("error");
    }
  }

  return (
    <SfCard glow className="daily-command-card">
      <div className="daily-command-header">
        <div>
          <SectionLabel icon="◎">Daily 3 · 3 · 1</SectionLabel>
          <p>Review three signals. Finish three actions. Publish one useful idea.</p>
        </div>
        <div className="daily-command-status">
          <span>{dateLabel}</span>
          <strong>{completedSteps}/{totalSteps || 7}</strong>
          <small>{completion === 100 ? "Loop complete" : "Daily progress"}</small>
        </div>
      </div>

      <div className="daily-progress-track" aria-label={`${completion}% complete`}>
        <span style={{ width: `${completion}%` }} />
      </div>

      <div className="daily-command-grid">
        <section className="daily-lane" aria-labelledby="daily-signals-title">
          <div className="daily-lane-heading">
            <span>01</span>
            <h2 id="daily-signals-title">Signals</h2>
            <small>{completedSignals}/3 reviewed</small>
          </div>
          <div className="daily-item-stack">
            {dailySignals.map((signal, index) => {
              const id = signalIds[index];
              const checked = progress.reviewedSignalIds.includes(id);
              return (
                <button
                  type="button"
                  className={`daily-check-row ${checked ? "is-complete" : ""}`}
                  aria-pressed={checked}
                  key={id}
                  onClick={() => toggleReviewedSignal(dateKey, id)}
                >
                  <span className="daily-checkbox" aria-hidden="true">{checked ? "✓" : index + 1}</span>
                  <span className="daily-item-copy">
                    <span className="daily-item-meta">
                      <SfTag color={signal.color}>{signal.label}</SfTag>
                      <small>{signal.delta}</small>
                    </span>
                    <span>{signal.text}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="daily-lane" aria-labelledby="daily-actions-title">
          <div className="daily-lane-heading">
            <span>02</span>
            <h2 id="daily-actions-title">Actions</h2>
            <small>{completedTasks}/3 finished</small>
          </div>
          <div className="daily-item-stack">
            {dailyTasks.map((task, index) => {
              const id = taskIds[index];
              const checked = progress.completedTaskIds.includes(id);
              return (
                <button
                  type="button"
                  className={`daily-check-row ${checked ? "is-complete" : ""}`}
                  aria-pressed={checked}
                  key={id}
                  onClick={() => toggleCompletedTask(dateKey, id)}
                >
                  <span className="daily-checkbox" aria-hidden="true">{checked ? "✓" : index + 1}</span>
                  <span className="daily-item-copy">
                    <span className="daily-item-meta">
                      <SfTag color={priorityColor(task.priority)}>{task.priority}</SfTag>
                      <small>{task.time}</small>
                    </span>
                    <span>{task.task}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="daily-lane daily-post-lane" aria-labelledby="daily-post-title">
          <div className="daily-lane-heading">
            <span>03</span>
            <h2 id="daily-post-title">One Post</h2>
            <small>{progress.postDone ? "published" : "ready"}</small>
          </div>
          {dailyPost ? (
            <div className={`daily-post ${progress.postDone ? "is-complete" : ""}`}>
              <div className="daily-item-meta">
                <SfTag color={progress.postDone ? "green" : "cyan"}>
                  {progress.postDone ? "POSTED" : dailyPost.angle}
                </SfTag>
                <small>{dailyPost.text.length}/280</small>
              </div>
              <blockquote>{dailyPost.text}</blockquote>
              {dailyPost.source_ref ? <p>Source signal: {dailyPost.source_ref}</p> : null}
              <div className="daily-post-actions">
                <button type="button" className="btn" onClick={copyPost}>
                  {copyState === "copied" ? "Copied" : copyState === "error" ? "Copy blocked" : "Copy"}
                </button>
                <a className="btn btn-blue" href={tweetHref} target="_blank" rel="noopener noreferrer">
                  Open in X
                </a>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setPostDone(dateKey, !progress.postDone)}
                >
                  {progress.postDone ? "Undo posted" : "Mark posted"}
                </button>
              </div>
            </div>
          ) : (
            <p className="daily-empty">No post draft is available yet.</p>
          )}
        </section>
      </div>

      {completedSteps > 0 ? (
        <button
          type="button"
          className="daily-reset"
          onClick={() => resetDailyProgress(dateKey)}
        >
          Reset today
        </button>
      ) : null}
    </SfCard>
  );
}
