"use client";

import { Fragment, useState } from "react";

interface DashboardFrameProps {
  feedLabel: string;
  feedDetail: string;
  tone: "live" | "stale";
  hero: React.ReactNode;
  daily: React.ReactNode;
  statBar: React.ReactNode;
  brief: React.ReactNode;
  opportunities: React.ReactNode;
  radarRow: React.ReactNode;
  actionRow: React.ReactNode;
  weekly: React.ReactNode;
  footer: React.ReactNode;
}

const STORAGE_KEY = "sf-focus-mode";

export function DashboardFrame({
  feedLabel,
  feedDetail,
  tone,
  hero,
  daily,
  statBar,
  brief,
  opportunities,
  radarRow,
  actionRow,
  weekly,
  footer,
}: DashboardFrameProps) {
  const [focusMode, setFocusMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  });

  function toggleFocusMode() {
    setFocusMode((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <>
      <div
        className="fade-up fade-up-1"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          padding: "14px 16px",
          marginBottom: 20,
          borderRadius: 14,
          border: "1px solid var(--hairline)",
          background: "var(--surface)",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: tone === "live" ? "var(--green)" : "var(--orange)",
              marginBottom: 5,
            }}
          >
            {feedLabel}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>
            {feedDetail}
          </div>
        </div>

        <button
          onClick={toggleFocusMode}
          className={`btn ${focusMode ? "btn-blue" : ""}`}
          style={{ borderRadius: 8, flexShrink: 0 }}
        >
          {focusMode ? "Daily Focus On" : "Daily Focus"}
        </button>
      </div>

      <Fragment key="hero">{hero}</Fragment>
      <Fragment key="daily">{daily}</Fragment>
      {!focusMode && (
        <>
          <Fragment key="stats">{statBar}</Fragment>
          <Fragment key="brief">{brief}</Fragment>
          <Fragment key="opportunities">{opportunities}</Fragment>
          <Fragment key="radar">{radarRow}</Fragment>
          <Fragment key="actions">{actionRow}</Fragment>
          <Fragment key="weekly">{weekly}</Fragment>
        </>
      )}
      <Fragment key="footer">{footer}</Fragment>
    </>
  );
}
