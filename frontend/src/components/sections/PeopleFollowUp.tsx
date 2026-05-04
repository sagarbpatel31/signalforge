"use client";

import { useState } from "react";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SfTag } from "@/components/ui/sf-tag";
import type { Person, TagColor } from "@/lib/types";

// Pool of real Edge AI / Robotics / Physical AI researchers to follow on X.
// When you tick one as followed, the next from this pool is added to the list.
const FOLLOW_POOL: Person[] = [
  {
    name: "Lerrel Pinto",
    handle: "@lerrelpinto",
    url: "https://x.com/lerrelpinto",
    context: "NYU professor. Dexterous manipulation + robot learning. Follow for hands-on robotics research.",
    urgency: "This week",
    days: 0,
  },
  {
    name: "Pieter Abbeel",
    handle: "@pabbeel",
    url: "https://x.com/pabbeel",
    context: "Berkeley AI Research + Covariant founder. Robot learning pioneer. Must-follow for Physical AI.",
    urgency: "This week",
    days: 0,
  },
  {
    name: "Russ Tedrake",
    handle: "@RussTedrake",
    url: "https://x.com/RussTedrake",
    context: "MIT robotics + Drake framework creator. Deep expertise in planning + manipulation.",
    urgency: "This week",
    days: 0,
  },
  {
    name: "Georgi Gerganov",
    handle: "@ggerganov",
    url: "https://x.com/ggerganov",
    context: "Creator of llama.cpp. Critical follow for edge inference + quantization work.",
    urgency: "This week",
    days: 0,
  },
  {
    name: "Tim Dettmers",
    handle: "@Tim_Dettmers",
    url: "https://x.com/Tim_Dettmers",
    context: "Quantization researcher (bitsandbytes, GPTQ). Core to INT4/INT8 edge inference work.",
    urgency: "This week",
    days: 0,
  },
  {
    name: "Jeremy Howard",
    handle: "@jeremyphoward",
    url: "https://x.com/jeremyphoward",
    context: "fast.ai founder. Practical deep learning + on-device model deployment.",
    urgency: "This week",
    days: 0,
  },
];

function urgencyColor(u: string): TagColor {
  if (u === "Overdue") return "red";
  if (u === "This week") return "amber";
  return "muted";
}

export function PeopleFollowUp({ people: initialPeople }: { people: Person[] }) {
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [followed, setFollowed] = useState<Set<number>>(new Set());
  const [poolIdx, setPoolIdx] = useState(0);
  const [showFollowed, setShowFollowed] = useState(false);

  function markFollowed(idx: number) {
    if (followed.has(idx)) return;
    setFollowed((prev) => new Set(prev).add(idx));
    // Add next from pool if available
    if (poolIdx < FOLLOW_POOL.length) {
      setPeople((prev) => [...prev, FOLLOW_POOL[poolIdx]]);
      setPoolIdx((p) => p + 1);
    }
  }

  const active = people.filter((_, i) => !followed.has(i));
  const done = people.filter((_, i) => followed.has(i));
  const visible = showFollowed ? people : active;

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
        <SectionLabel>People to Follow on X</SectionLabel>
        {done.length > 0 && (
          <button
            onClick={() => setShowFollowed((v) => !v)}
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
            {showFollowed ? "hide followed" : `+${done.length} followed`}
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {visible.map((p) => {
          const origIdx = people.indexOf(p);
          const isFollowed = followed.has(origIdx);
          return (
            <div
              key={origIdx}
              style={{
                padding: "11px 0",
                borderBottom: "1px solid var(--sf-border-subtle)",
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
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {p.url ? (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        color: "var(--sf-cyan)",
                        textDecoration: isFollowed ? "line-through" : "none",
                      }}
                    >
                      {p.name}
                    </a>
                  ) : (
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</span>
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
                  {!isFollowed && (
                    <SfTag color={urgencyColor(p.urgency)}>{p.urgency}</SfTag>
                  )}
                  <button
                    onClick={() => markFollowed(origIdx)}
                    disabled={isFollowed}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      padding: "2px 8px",
                      background: isFollowed ? "var(--sf-green-dim)" : "transparent",
                      border: `1px solid ${isFollowed ? "var(--sf-green)" : "var(--sf-green)"}`,
                      color: isFollowed ? "var(--sf-green)" : "var(--sf-green)",
                      cursor: isFollowed ? "default" : "pointer",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {isFollowed ? "✓ Followed" : "Follow →"}
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
