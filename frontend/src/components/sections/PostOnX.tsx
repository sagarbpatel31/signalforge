"use client";

import { useState } from "react";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SfTag } from "@/components/ui/sf-tag";
import { generatePosts } from "@/lib/api";
import type { Post } from "@/lib/types";

export function PostOnX({ posts: initialPosts }: { posts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);

  async function handleRegenerate() {
    setLoading(true);
    try {
      const fresh = await generatePosts();
      setPosts(fresh);
      setSelected(0);
    } finally {
      setLoading(false);
    }
  }

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
        <SectionLabel>What to Post</SectionLabel>
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
          wordBreak: "break-word",
          overflow: "hidden",
        }}
      >
        {posts[selected].text}
      </div>

      {posts[selected].source_ref && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--sf-text-3)",
            marginTop: 6,
            lineHeight: 1.5,
          }}
        >
          ↗ Source: {posts[selected].source_ref}
        </div>
      )}

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
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={handleRegenerate}
            disabled={loading}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.06em",
              padding: "5px 12px",
              background: loading ? "var(--sf-bg3)" : "transparent",
              border: `1px solid ${loading ? "var(--sf-border)" : "var(--sf-border)"}`,
              color: loading ? "var(--sf-text-3)" : "var(--sf-text-2)",
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "..." : "⟳ AI"}
          </button>
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
      </div>
    </SfCard>
  );
}
