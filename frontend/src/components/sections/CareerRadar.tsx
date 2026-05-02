import Link from "next/link";
import { fetchCareer } from "@/lib/api";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SfTag } from "@/components/ui/sf-tag";

export async function CareerRadar() {
  const roles = await fetchCareer();
  return (
    <SfCard>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <SectionLabel>Career Radar</SectionLabel>
        <Link href="/career" style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--sf-cyan)", textDecoration: "none", letterSpacing: "0.04em" }}>
          View all →
        </Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {roles.map((r, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom:
                i < roles.length - 1 ? "1px solid var(--sf-border-subtle)" : "none",
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
                {r.company}{" "}
                <span style={{ color: "var(--sf-text-2)", fontWeight: 400 }}>
                  · {r.role}
                </span>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--sf-text-3)",
                }}
              >
                {r.type}
              </div>
            </div>
            <SfTag color={r.color}>{r.signal}</SfTag>
          </div>
        ))}
      </div>
    </SfCard>
  );
}
