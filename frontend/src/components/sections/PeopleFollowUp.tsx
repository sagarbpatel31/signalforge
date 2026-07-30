"use client";

import { useState, useEffect } from "react";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SfTag } from "@/components/ui/sf-tag";
import type { Person, TagColor } from "@/lib/types";
import { PEOPLE_POOL } from "@/lib/people-pool";

const BATCH_SIZE = 6; // show 6 people at a time
const ROTATION_DAYS = 2; // rotate every 2 days
const LS_KEY = "sf-followed-people"; // localStorage key

// Gradient presets for avatars
const GRADS = [
  "linear-gradient(135deg, var(--blue-soft), var(--purple-soft))",
  "linear-gradient(135deg, var(--green-soft), var(--blue-soft))",
  "linear-gradient(135deg, var(--orange-soft), var(--pink-soft))",
  "linear-gradient(135deg, var(--purple-soft), var(--pink-soft))",
];

function urgencyColor(u: string): TagColor {
  if (u === "Overdue") return "red";
  if (u === "This week") return "amber";
  return "muted";
}

function avatarInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Day-of-year (1-366) */
function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
}

/** Pick BATCH_SIZE people from pool, rotating every ROTATION_DAYS, skipping followed handles */
function pickBatch(followedHandles: Set<string>): Person[] {
  const available = PEOPLE_POOL.filter((p) => !followedHandles.has(p.handle));
  if (available.length === 0) return [];
  const period = Math.floor(dayOfYear() / ROTATION_DAYS);
  const start = (period * BATCH_SIZE) % available.length;
  const batch: Person[] = [];
  for (let i = 0; i < BATCH_SIZE && batch.length < Math.min(BATCH_SIZE, available.length); i++) {
    batch.push(available[(start + i) % available.length]);
  }
  return batch;
}

export function PeopleFollowUp() {
  const [followedHandles, setFollowedHandles] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem(LS_KEY);
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });

  const [showFollowed, setShowFollowed] = useState(false);

  // Persist to localStorage whenever followedHandles changes
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(Array.from(followedHandles)));
    } catch {
      // storage unavailable
    }
  }, [followedHandles]);

  function markFollowed(handle: string) {
    setFollowedHandles((prev) => {
      const next = new Set(prev);
      next.add(handle);
      return next;
    });
  }

  // Current batch and followed list
  const batch = pickBatch(followedHandles);
  const followedPeople = PEOPLE_POOL.filter((p) => followedHandles.has(p.handle));

  const visible = showFollowed ? [...batch, ...followedPeople] : batch;

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
        <SectionLabel icon="👥">People to Follow</SectionLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {followedHandles.size > 0 && (
            <button
              onClick={() => setShowFollowed((v) => !v)}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--text-3)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.04em",
              }}
            >
              {showFollowed ? "hide followed" : `+${followedHandles.size} followed`}
            </button>
          )}
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-4)",
              letterSpacing: "0.04em",
            }}
          >
            rotates every 2d
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {visible.map((p, idx) => {
          const isFollowed = followedHandles.has(p.handle);
          return (
            <div
              key={p.handle}
              style={{
                padding: "11px 0",
                borderBottom:
                  idx < visible.length - 1 ? "1px solid var(--hairline)" : "none",
                opacity: isFollowed ? 0.4 : 1,
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
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* Gradient avatar */}
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: GRADS[idx % GRADS.length],
                      border: "1px solid var(--hairline-strong)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--blue)",
                      flexShrink: 0,
                    }}
                  >
                    {avatarInitials(p.name)}
                  </div>
                  <div>
                    {p.url ? (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontWeight: 600,
                          fontSize: 13,
                          color: "var(--text)",
                          textDecoration: isFollowed ? "line-through" : "none",
                          display: "block",
                        }}
                      >
                        {p.name}
                      </a>
                    ) : (
                      <span
                        style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}
                      >
                        {p.name}
                      </span>
                    )}
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--blue)",
                      }}
                    >
                      {p.handle}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {!isFollowed && (
                    <SfTag color={urgencyColor(p.urgency)}>{p.urgency}</SfTag>
                  )}
                  <button
                    onClick={() => !isFollowed && markFollowed(p.handle)}
                    disabled={isFollowed}
                    className="btn btn-blue"
                    style={{
                      padding: "3px 10px",
                      fontSize: 10,
                      borderRadius: 999,
                      background: isFollowed
                        ? "var(--green-soft)"
                        : "var(--blue-soft)",
                      border: isFollowed
                        ? "1px solid oklch(0.78 0.15 155 / 0.3)"
                        : "1px solid oklch(0.72 0.16 245 / 0.35)",
                      color: isFollowed ? "var(--green)" : "var(--blue)",
                      cursor: isFollowed ? "default" : "pointer",
                    }}
                  >
                    {isFollowed ? "✓ Followed" : "Follow →"}
                  </button>
                </div>
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-2)",
                  lineHeight: 1.4,
                  paddingLeft: 44,
                }}
              >
                {p.context}
              </div>
            </div>
          );
        })}

        {batch.length === 0 && followedHandles.size > 0 && !showFollowed && (
          <div
            style={{
              padding: "20px 0",
              textAlign: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--text-4)",
            }}
          >
            You&apos;ve followed everyone in the current batch.
            <br />
            New suggestions rotate in 2 days.
          </div>
        )}
      </div>
    </SfCard>
  );
}
