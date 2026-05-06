"use client";

import { useState } from "react";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SfTag } from "@/components/ui/sf-tag";
import type { Person, TagColor } from "@/lib/types";

const FOLLOW_POOL: Person[] = [
  {
    name: "Lerrel Pinto",
    handle: "@lerrelpinto",
    url: "https://x.com/lerrelpinto",
    context: "NYU. Dexterous manipulation + robot learning. ACT paper author.",
    urgency: "This week",
    days: 0,
  },
  {
    name: "Pieter Abbeel",
    handle: "@pabbeel",
    url: "https://x.com/pabbeel",
    context: "Berkeley AI Research + Covariant founder. Robot learning pioneer.",
    urgency: "This week",
    days: 0,
  },
  {
    name: "Russ Tedrake",
    handle: "@RussTedrake",
    url: "https://x.com/RussTedrake",
    context: "MIT + Drake framework. Planning + manipulation. Must-follow for robotics.",
    urgency: "This week",
    days: 0,
  },
  {
    name: "Georgi Gerganov",
    handle: "@ggerganov",
    url: "https://x.com/ggerganov",
    context: "Creator of llama.cpp. Core follow for edge inference + on-device LLMs.",
    urgency: "This week",
    days: 0,
  },
  {
    name: "Tim Dettmers",
    handle: "@Tim_Dettmers",
    url: "https://x.com/Tim_Dettmers",
    context: "Quantization researcher (bitsandbytes, GPTQ). INT4/INT8 authority.",
    urgency: "This week",
    days: 0,
  },
  {
    name: "Jeremy Howard",
    handle: "@jeremyphoward",
    url: "https://x.com/jeremyphoward",
    context: "fast.ai founder. Practical deep learning + on-device deployment.",
    urgency: "This week",
    days: 0,
  },
  {
    name: "Sergey Levine",
    handle: "@svlevine",
    url: "https://x.com/svlevine",
    context: "Berkeley. Offline RL (IQL, CQL) + robot learning at scale. RT-2 co-author.",
    urgency: "This week",
    days: 0,
  },
  {
    name: "Chelsea Finn",
    handle: "@chelseabfinn",
    url: "https://x.com/chelseabfinn",
    context: "Stanford. MAML inventor. Meta-learning + few-shot robot policy research.",
    urgency: "This week",
    days: 0,
  },
  {
    name: "Yann LeCun",
    handle: "@ylecun",
    url: "https://x.com/ylecun",
    context: "Meta Chief AI Scientist. Self-supervised learning + world models for robotics.",
    urgency: "This week",
    days: 0,
  },
  {
    name: "Fei-Fei Li",
    handle: "@drfeifei",
    url: "https://x.com/drfeifei",
    context: "Stanford HAI. ImageNet + spatial intelligence. World Labs founder.",
    urgency: "This week",
    days: 0,
  },
  {
    name: "Deepak Pathak",
    handle: "@pathak2206",
    url: "https://x.com/pathak2206",
    context: "CMU. Curiosity-driven exploration + world models. Generalist robot policies.",
    urgency: "This week",
    days: 0,
  },
  {
    name: "Raquel Urtasun",
    handle: "@rurtasun",
    url: "https://x.com/rurtasun",
    context: "Waabi CEO + Toronto professor. AV perception + neural map learning.",
    urgency: "This week",
    days: 0,
  },
  {
    name: "Ken Goldberg",
    handle: "@ken_goldberg",
    url: "https://x.com/ken_goldberg",
    context: "Berkeley. Robot grasping + automation. Cloud robotics + AI for industry.",
    urgency: "This week",
    days: 0,
  },
  {
    name: "Matei Zaharia",
    handle: "@matei_zaharia",
    url: "https://x.com/matei_zaharia",
    context: "Databricks CTO + Stanford. MLflow, Spark, LLM infra. Key for ML systems.",
    urgency: "This week",
    days: 0,
  },
  {
    name: "Sasha Rush",
    handle: "@srush_nlp",
    url: "https://x.com/srush_nlp",
    context: "Cornell + HuggingFace. Annotated Transformer author. Edge-friendly LLM arch.",
    urgency: "This week",
    days: 0,
  },
  {
    name: "Chris Lattner",
    handle: "@clattner_llvm",
    url: "https://x.com/clattner_llvm",
    context: "LLVM + Swift creator, Modular CEO. MLIR + Mojo for AI compiler toolchains.",
    urgency: "This week",
    days: 0,
  },
  {
    name: "Clem Delangue",
    handle: "@ClementDelangue",
    url: "https://x.com/ClementDelangue",
    context: "HuggingFace CEO. Open-source models + on-device deployment ecosystem.",
    urgency: "This week",
    days: 0,
  },
  {
    name: "Jim Keller",
    handle: "@jimkxa",
    url: "https://x.com/jimkxa",
    context: "Tenstorrent CEO. Legendary chip architect (AMD K8, Apple A4, Tesla FSD). RISC-V AI.",
    urgency: "This week",
    days: 0,
  },
];

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
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export function PeopleFollowUp({ people: initialPeople }: { people: Person[] }) {
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [followed, setFollowed] = useState<Set<number>>(new Set());
  const [poolIdx, setPoolIdx] = useState(0);
  const [showFollowed, setShowFollowed] = useState(false);

  function markFollowed(idx: number) {
    if (followed.has(idx)) return;
    setFollowed((prev) => new Set(prev).add(idx));
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
        <SectionLabel icon="👥">People to Follow</SectionLabel>
        {done.length > 0 && (
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
                borderBottom: "1px solid var(--hairline)",
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
                      background: GRADS[origIdx % GRADS.length],
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
                      <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{p.name}</span>
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
                    onClick={() => markFollowed(origIdx)}
                    disabled={isFollowed}
                    className="btn btn-blue"
                    style={{
                      padding: "3px 10px",
                      fontSize: 10,
                      borderRadius: 999,
                      background: isFollowed ? "var(--green-soft)" : "var(--blue-soft)",
                      border: isFollowed ? "1px solid oklch(0.78 0.15 155 / 0.3)" : "1px solid oklch(0.72 0.16 245 / 0.35)",
                      color: isFollowed ? "var(--green)" : "var(--blue)",
                      cursor: isFollowed ? "default" : "pointer",
                    }}
                  >
                    {isFollowed ? "✓ Followed" : "Follow →"}
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.4, paddingLeft: 44 }}>
                {p.context}
              </div>
            </div>
          );
        })}
      </div>
    </SfCard>
  );
}
