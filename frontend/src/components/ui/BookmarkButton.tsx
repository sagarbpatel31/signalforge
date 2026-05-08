"use client";

import { useBookmarks } from "@/lib/useBookmarks";
import type { BookmarkItem } from "@/lib/useBookmarks";

export function BookmarkButton({ item }: { item: BookmarkItem }) {
  const { toggle, isBookmarked } = useBookmarks();
  const saved = isBookmarked(item.id);

  return (
    <button
      onClick={(e) => { e.stopPropagation(); toggle(item); }}
      title={saved ? "Remove bookmark" : "Save bookmark"}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: "2px 4px",
        fontSize: 13,
        lineHeight: 1,
        transition: "opacity 0.15s",
        opacity: saved ? 1 : 0.3,
        flexShrink: 0,
      }}
    >
      {saved ? "🔖" : "📌"}
    </button>
  );
}
