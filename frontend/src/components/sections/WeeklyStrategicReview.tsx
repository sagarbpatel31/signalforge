import { fetchWeekly } from "@/lib/api";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SfDivider } from "@/components/ui/sf-divider";

export async function WeeklyStrategicReview() {
  const { wins: weeklyWins, gaps: weeklyGaps, conviction_bets: convictionBets, next_week_focus: nextWeekFocus } = await fetchWeekly();
  return (
    <SfCard>
      <SectionLabel>Weekly Strategic Review</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
        {/* Wins */}
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--sf-green)",
              letterSpacing: "0.08em",
              marginBottom: 10,
            }}
          >
            WINS THIS WEEK
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {weeklyWins.map((w, i) => (
              <div key={i} style={{ display: "flex", gap: 8 }}>
                <span
                  style={{
                    color: "var(--sf-green)",
                    fontSize: 12,
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  ✓
                </span>
                <span
                  style={{ fontSize: 12, color: "var(--sf-text-2)", lineHeight: 1.5 }}
                >
                  {w}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Gaps */}
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--sf-red)",
              letterSpacing: "0.08em",
              marginBottom: 10,
            }}
          >
            GAPS / MISSES
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {weeklyGaps.map((g, i) => (
              <div key={i} style={{ display: "flex", gap: 8 }}>
                <span
                  style={{
                    color: "var(--sf-red)",
                    fontSize: 12,
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  ✕
                </span>
                <span
                  style={{ fontSize: 12, color: "var(--sf-text-2)", lineHeight: 1.5 }}
                >
                  {g}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Conviction bets */}
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--sf-amber)",
              letterSpacing: "0.08em",
              marginBottom: 10,
            }}
          >
            CONVICTION BETS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {convictionBets.map((b, i) => (
              <div key={i}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 12, color: "var(--sf-text-2)" }}>
                    {b.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--sf-amber)",
                    }}
                  >
                    {b.conviction}%
                  </span>
                </div>
                <div
                  style={{
                    height: 2,
                    background: "var(--sf-border)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      height: "100%",
                      width: `${b.conviction}%`,
                      background:
                        b.conviction > 80 ? "var(--sf-cyan)" : "var(--sf-amber)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SfDivider style={{ margin: "16px 0" }} />

      <div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--sf-text-3)",
            letterSpacing: "0.08em",
            marginBottom: 8,
          }}
        >
          NEXT WEEK FOCUS
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--sf-cyan)",
            background: "var(--sf-cyan-dim)",
            padding: "10px 14px",
            borderLeft: "2px solid var(--sf-cyan)",
          }}
        >
          {nextWeekFocus}
        </div>
      </div>
    </SfCard>
  );
}
