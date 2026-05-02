import { fetchPeople } from "@/lib/api";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SfTag } from "@/components/ui/sf-tag";
import type { TagColor } from "@/lib/types";

function urgencyColor(u: string): TagColor {
  if (u === "Overdue") return "red";
  if (u === "This week") return "amber";
  return "muted";
}

export async function PeopleFollowUp() {
  const people = await fetchPeople();
  return (
    <SfCard>
      <SectionLabel>People To Follow Up</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {people.map((p, i) => (
          <div
            key={i}
            style={{
              padding: "11px 0",
              borderBottom:
                i < people.length - 1 ? "1px solid var(--sf-border-subtle)" : "none",
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
                <span style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</span>
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
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--sf-text-3)",
                  }}
                >
                  {p.days}d ago
                </span>
                <SfTag color={urgencyColor(p.urgency)}>{p.urgency}</SfTag>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--sf-text-2)", lineHeight: 1.4 }}>
              {p.context}
            </div>
          </div>
        ))}
      </div>
    </SfCard>
  );
}
