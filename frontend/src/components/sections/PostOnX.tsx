"use client";

import { useMemo, useState } from "react";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SfTag } from "@/components/ui/sf-tag";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { refreshPosts } from "@/lib/api";
import type { Post } from "@/lib/types";

function trimToLimit(text: string, limit = 280): string {
  const compact = text.replace(/\n{3,}/g, "\n\n").replace(/[ \t]+/g, " ").trim();
  if (compact.length <= limit) return compact;
  const candidate = compact.slice(0, limit).trim();
  const lastSpace = candidate.lastIndexOf(" ");
  const shortened = lastSpace > 0 ? candidate.slice(0, lastSpace).trim() : candidate;
  return `${shortened.replace(/[.,:;!?-]+$/, "")}…`;
}

function addPunchierHook(angle: string, text: string): string {
  const hookMap: Record<string, string> = {
    Take: "Worth paying attention:",
    Thread: "Short thread:",
    Contrarian: "Hot take:",
    "Job Hunt": "Career signal:",
    Research: "Research signal:",
    "Founder Signal": "Market signal:",
  };

  const hook = hookMap[angle] ?? "Signal:";
  const cleaned = text.trim();
  if (cleaned.toLowerCase().startsWith(hook.toLowerCase())) return cleaned;
  return `${hook}\n\n${cleaned}`;
}

function meterColor(count: number): string {
  if (count > 280) return "var(--red)";
  if (count > 260) return "var(--orange)";
  return "var(--blue)";
}

export function PostOnX({ posts: initialPosts }: { posts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [selected, setSelected] = useState(0);
  const [drafts, setDrafts] = useState(initialPosts.map((post) => post.text));
  const [loading, setLoading] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [error, setError] = useState<string | null>(null);

  const post = posts[selected];
  const draft = drafts[selected] ?? post.text;
  const charCount = draft.length;
  const overLimit = charCount > 280;
  const readyLabel = overLimit ? "Needs trim" : "Ready to post";
  const tweetHref = useMemo(
    () => `https://twitter.com/intent/tweet?text=${encodeURIComponent(draft)}`,
    [draft]
  );

  function updateDraft(next: string) {
    setDrafts((current) => current.map((value, index) => (index === selected ? next : value)));
    setCopyState("idle");
  }

  async function handleRegenerate() {
    setLoading(true);
    setError(null);
    try {
      const fresh = await refreshPosts();
      setPosts(fresh);
      setDrafts(fresh.map((item) => item.text));
      setSelected(0);
      setCopyState("idle");
    } catch {
      setError("Fresh post ideas could not be generated. Your current draft is unchanged.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    setError(null);
    try {
      await navigator.clipboard.writeText(draft);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1400);
    } catch {
      setError("Clipboard access was blocked. Select the draft text and copy it manually.");
    }
  }

  return (
    <SfCard>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <SectionLabel icon="𝕏">What to Post</SectionLabel>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {posts.map((item, index) => (
            <button
              key={`${item.angle}-${index}`}
              onClick={() => setSelected(index)}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                padding: "3px 10px",
                borderRadius: 999,
                background: selected === index ? "var(--blue-soft)" : "transparent",
                border: `1px solid ${selected === index ? "oklch(0.72 0.16 245 / 0.35)" : "var(--hairline-strong)"}`,
                color: selected === index ? "var(--blue)" : "var(--text-3)",
                cursor: "pointer",
                letterSpacing: "0.04em",
              }}
            >
              {item.angle}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <InlineNotice
          message={error}
          onRetry={error.startsWith("Clipboard") ? handleCopy : handleRegenerate}
        />
      )}

      <div style={{ marginBottom: 10 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <SfTag color={overLimit ? "red" : "green"}>{readyLabel}</SfTag>
            <SfTag color="muted">{post.angle}</SfTag>
          </div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: overLimit ? "var(--red)" : "var(--text-4)",
            }}
          >
            {charCount}/280
          </span>
        </div>

        <div
          style={{
            height: 5,
            borderRadius: 999,
            background: "var(--hairline-strong)",
            overflow: "hidden",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: `${Math.min(100, (charCount / 280) * 100)}%`,
              height: "100%",
              borderRadius: 999,
              background: meterColor(charCount),
              transition: "width 0.15s ease",
            }}
          />
        </div>

        <textarea
          value={draft}
          onChange={(event) => updateDraft(event.target.value)}
          spellCheck={false}
          style={{
            width: "100%",
            minHeight: 172,
            resize: "vertical",
            background: "var(--surface-solid)",
            border: "1px solid var(--hairline-strong)",
            borderRadius: 12,
            padding: "14px 16px",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            lineHeight: 1.7,
            color: "var(--text-2)",
            outline: "none",
          }}
        />
      </div>

      {post.source_ref && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--text-3)",
            marginTop: 2,
            marginBottom: 10,
            lineHeight: 1.5,
          }}
        >
          Source signal: {post.source_ref}
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {post.tags.map((tag) => (
            <SfTag key={tag} color="muted">#{tag}</SfTag>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button
            onClick={() => updateDraft(addPunchierHook(post.angle, draft))}
            className="btn"
            style={{ borderRadius: 8 }}
          >
            Punchier hook
          </button>
          <button
            onClick={() => updateDraft(trimToLimit(draft))}
            className="btn"
            style={{ borderRadius: 8 }}
          >
            Trim to 280
          </button>
          <button
            onClick={() => updateDraft(post.text)}
            className="btn"
            style={{ borderRadius: 8 }}
          >
            Reset draft
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--text-4)",
          }}
        >
          Edit the draft, copy it, or open it directly in X intent.
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button
            onClick={handleRegenerate}
            disabled={loading}
            className="btn"
            style={{ borderRadius: 8 }}
          >
            {loading ? "Refreshing..." : "Refresh ideas"}
          </button>
          <button
            onClick={handleCopy}
            className="btn"
            style={{ borderRadius: 8 }}
          >
            {copyState === "copied" ? "Copied" : "Copy draft"}
          </button>
          <a
            href={tweetHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-blue"
            style={{ borderRadius: 8, textDecoration: "none" }}
          >
            Open in X →
          </a>
        </div>
      </div>
    </SfCard>
  );
}
