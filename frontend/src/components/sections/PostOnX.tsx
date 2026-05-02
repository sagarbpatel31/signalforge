"use client";

import { useState } from "react";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SfTag } from "@/components/ui/sf-tag";
import type { Post } from "@/lib/types";

export function PostOnX({ posts }: { posts: Post[] }) {
  const [selected, setSelected] = useState(0);

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
        <SectionLabel>What to Post on X Today</SectionLabel>
        <div style={{ display: "flex", gap: 4 }}>
          {posts.map((p, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                padding: "3px 8px",
                background: selected === i ? "var(--sf-cyan-dim)" : "transparent",
                border: `1px solid ${selected === i ? "var(--sf-cyan)" : "var(--sf-border)"}`,
                color: selected === i ? "var(--sf-cyan)" : "var(--sf-text-3)",
                cursor: "pointer",
                letterSpacing: "0.04em",
              }}
            >
              {p.angle}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          background: "var(--sf-bg3)",
          border: "1px solid var(--sf-border)",
          padding: "14px 16px",
          minHeight: 110,
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          lineHeight: 1.7,
          color: "var(--sf-text-2)",
          whiteSpace: "pre-wrap",
        }}
      >
        {posts[selected].text}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        <div style={{ display: "flex", gap: 4 }}>
          {posts[selected].tags.map((t) => (
            <SfTag key={t} color="muted">
              #{t}
            </SfTag>
          ))}
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(posts[selected].text)}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.06em",
            padding: "5px 12px",
            background: "var(--sf-cyan-dim)",
            border: "1px solid var(--sf-cyan)",
            color: "var(--sf-cyan)",
            cursor: "pointer",
          }}
        >
          Copy Draft
        </button>
      </div>
    </SfCard>
  );
}
