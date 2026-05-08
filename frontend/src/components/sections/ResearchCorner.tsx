import Link from "next/link";
import { fetchResearch } from "@/lib/api";
import { readCacheFile } from "@/lib/server-cache";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SfTag } from "@/components/ui/sf-tag";
import { BookmarkButton } from "@/components/ui/BookmarkButton";
import type { Paper } from "@/lib/types";

export async function ResearchCorner() {
  let papers = await fetchResearch();
  if (!papers.length) {
    const cached = readCacheFile<Record<string, unknown>[]>("papers");
    if (cached?.length) {
      papers = cached.slice(0, 4).map((p) => ({
        title: ((p.title as string) ?? "").slice(0, 120),
        venue: (p.venue as string) ?? "arXiv",
        tags: ((p.tags as string[]) ?? []).slice(0, 3),
        read: false,
        url: (p.url as string) ?? "",
      })) as Paper[];
    }
  }
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
        <SectionLabel icon="📄">Research Corner</SectionLabel>
        <Link
          href="/research"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--blue)",
            textDecoration: "none",
            letterSpacing: "0.04em",
          }}
        >
          Browse all →
        </Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {papers.map((p, i) => (
          <div
            key={i}
            style={{
              padding: "10px 0",
              borderBottom: i < papers.length - 1 ? "1px solid var(--hairline)" : "none",
              opacity: p.read ? 0.5 : 1,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 500,
                    fontSize: 12,
                    lineHeight: 1.4,
                    marginBottom: 4,
                    color: p.read ? "var(--text-2)" : "var(--text)",
                  }}
                >
                  {p.url ? (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      {p.title}
                    </a>
                  ) : p.title}
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-4)" }}>
                    {p.venue}
                  </span>
                  {p.tags.map((t) => (
                    <SfTag key={t} color="muted">{t}</SfTag>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
                {!p.read && (
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "var(--blue)",
                      flexShrink: 0,
                      marginTop: 4,
                    }}
                  />
                )}
                <BookmarkButton item={{ id: p.url ?? p.title, title: p.title, sub: p.venue, url: p.url, type: "paper" }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </SfCard>
  );
}
