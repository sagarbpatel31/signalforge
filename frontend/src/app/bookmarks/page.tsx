"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";
import type { BookmarkItem } from "@/lib/useBookmarks";

interface Bookmarks {
  papers:   BookmarkItem[];
  startups: BookmarkItem[];
  roles:    BookmarkItem[];
}

function empty(): Bookmarks { return { papers: [], startups: [], roles: [] }; }

function readBookmarks(): Bookmarks {
  try {
    const raw = localStorage.getItem("sf-bookmarks");
    return raw ? JSON.parse(raw) : empty();
  } catch { return empty(); }
}

function removeBookmark(type: keyof Bookmarks, id: string, current: Bookmarks): Bookmarks {
  const updated = { ...current, [type]: current[type].filter((b) => b.id !== id) };
  try { localStorage.setItem("sf-bookmarks", JSON.stringify(updated)); } catch {}
  return updated;
}

function ItemRow({
  item,
  type,
  onRemove,
}: {
  item: BookmarkItem;
  type: keyof Bookmarks;
  onRemove: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "1px solid var(--hairline)",
        gap: 12,
      }}
    >
      <div style={{ minWidth: 0 }}>
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontWeight: 600,
              fontSize: 13,
              color: "var(--text)",
              textDecoration: "none",
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.title} ↗
          </a>
        ) : (
          <span style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</span>
        )}
        {item.sub && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-4)" }}>
            {item.sub}
          </span>
        )}
      </div>
      <button
        onClick={onRemove}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--text-4)",
          flexShrink: 0,
          padding: "2px 6px",
        }}
      >
        remove
      </button>
    </div>
  );
}

const SECTIONS: { key: keyof Bookmarks; icon: string; label: string }[] = [
  { key: "papers",   icon: "📄", label: "Research Papers" },
  { key: "startups", icon: "🚀", label: "Startups" },
  { key: "roles",    icon: "💼", label: "Career Roles" },
];

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmarks>(empty());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setBookmarks(readBookmarks());
    setMounted(true);
  }, []);

  const total = bookmarks.papers.length + bookmarks.startups.length + bookmarks.roles.length;

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "32px 28px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Back nav */}
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--text-3)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 24,
          }}
        >
          ← Back to Dashboard
        </Link>

        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            marginBottom: 6,
          }}
        >
          Bookmarks
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 28 }}>
          {total} saved item{total !== 1 ? "s" : ""}
        </p>

        {total === 0 ? (
          <SfCard>
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-4)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📌</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>No bookmarks yet.</div>
              <div style={{ fontSize: 13, marginTop: 8 }}>
                Use the 📌 icon on papers, startups, or roles to save them here.
              </div>
            </div>
          </SfCard>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {SECTIONS.map(({ key, icon, label }) => {
              const items = bookmarks[key];
              if (!items.length) return null;
              return (
                <SfCard key={key}>
                  <SectionLabel icon={icon}>{label}</SectionLabel>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {items.map((item) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        type={key}
                        onRemove={() =>
                          setBookmarks((prev) => removeBookmark(key, item.id, prev))
                        }
                      />
                    ))}
                  </div>
                </SfCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
