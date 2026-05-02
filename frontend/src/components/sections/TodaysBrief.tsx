import { fetchBrief } from "@/lib/api";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SfTag } from "@/components/ui/sf-tag";

export async function TodaysBrief() {
  const { market_pulse, signals, timestamp } = await fetchBrief();
  return (
    <SfCard glow>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <SectionLabel>Today&apos;s Brief</SectionLabel>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--sf-text-3)",
          }}
        >
          {timestamp}
        </span>
      </div>

      {/* Market pulse highlight */}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--sf-cyan)",
          background: "var(--sf-cyan-dim)",
          padding: "10px 14px",
          marginBottom: 16,
          borderLeft: "2px solid var(--sf-cyan)",
        }}
      >
        ⟶ {market_pulse}
      </div>

      {/* Signal rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {signals.map((s, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "120px 36px 1fr",
              alignItems: "start",
              gap: 12,
              padding: "10px 0",
              borderBottom:
                i < signals.length - 1 ? "1px solid var(--sf-border-subtle)" : "none",
            }}
          >
            <SfTag color={s.color}>{s.label}</SfTag>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color:
                  s.color === "muted" ? "var(--sf-text-3)" : `var(--sf-${s.color})`,
                alignSelf: "center",
              }}
            >
              {s.delta}
            </span>
            <span
              style={{
                fontSize: 13,
                color: "var(--sf-text-2)",
                lineHeight: 1.5,
              }}
            >
              {s.text}
            </span>
          </div>
        ))}
      </div>
    </SfCard>
  );
}
