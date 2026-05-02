import { fetchResearch } from "@/lib/api";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SfTag } from "@/components/ui/sf-tag";

export async function ResearchCorner() {
  const papers = await fetchResearch();
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
        <SectionLabel>Research Corner</SectionLabel>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--sf-cyan)",
            cursor: "pointer",
          }}
        >
          Browse all →
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {papers.map((p, i) => (
          <div
            key={i}
            style={{
              padding: "10px 0",
              borderBottom:
                i < papers.length - 1 ? "1px solid var(--sf-border-subtle)" : "none",
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
                    color: p.read ? "var(--sf-text-2)" : "var(--sf-text)",
                  }}
                >
                  {p.title}
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "var(--sf-text-3)",
                    }}
                  >
                    {p.venue}
                  </span>
                  {p.tags.map((t) => (
                    <SfTag key={t} color="muted">
                      {t}
                    </SfTag>
                  ))}
                </div>
              </div>
              {!p.read && (
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--sf-cyan)",
                    flexShrink: 0,
                    marginTop: 4,
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </SfCard>
  );
}
