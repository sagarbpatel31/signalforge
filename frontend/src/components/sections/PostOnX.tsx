"use client";

import { useState } from "react";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SfTag } from "@/components/ui/sf-tag";
import { refreshPosts } from "@/lib/api";
import type { Post } from "@/lib/types";

export function PostOnX({ posts: initialPosts }: { posts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);

  async function handleRegenerate() {
    setLoading(true);
    try {
      const fresh = await refreshPosts();
      setPosts(fresh);
      setSelected(0);
    } finally {
      setLoading(false);
    }
  }

  const post = posts[selected];
  const charCount = post.text.length;
  const overLimit = charCount > 280;

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
        <SectionLabel icon="𝕏">What to Post</SectionLabel>
        <div style={{ display: "flex", gap: 4 }}>
          {posts.map((p, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                padding: "3px 10px",
                borderRadius: 999,
                background: selected === i ? "var(--blue-soft)" : "transparent",
                border: `1px solid ${selected === i ? "oklch(0.72 0.16 245 / 0.35)" : "var(--hairline-strong)"}`,
                color: selected === i ? "var(--blue)" : "var(--text-3)",
                cursor: "pointer",
                letterSpacing: "0.04em",
                transition: "all 0.15s",
              }}
            >
              {p.angle}
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: "relative" }}>
        <div
          style={{
            background: "var(--surface-solid)",
            border: "1px solid var(--hairline-strong)",
            borderRadius: 12,
            padding: "14px 16px",
            minHeight: 110,
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            lineHeight: 1.7,
            color: "var(--text-2)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflow: "hidden",
          }}
        >
          {post.text}
        </div>
        {/* Char counter */}
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 12,
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            color: overLimit ? "var(--red)" : "var(--text-4)",
          }}
        >
          {charCount}/280
        </span>
      </div>

      {post.source_ref && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--text-3)",
            marginTop: 6,
            lineHeight: 1.5,
          }}
        >
          ↗ Source: {post.source_ref}
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 12,
        }}
      >
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {post.tags.map((t) => (
            <SfTag key={t} color="muted">#{t}</SfTag>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={handleRegenerate}
            disabled={loading}
            className="btn"
            style={{ borderRadius: 8 }}
          >
            {loading ? "..." : "⟳ AI"}
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(post.text)}
            className="btn"
            style={{ borderRadius: 8 }}
          >
            Copy
          </button>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.text)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-blue"
            style={{ borderRadius: 8, textDecoration: "none" }}
          >
            Post →
          </a>
        </div>
      </div>
    </SfCard>
  );
}
