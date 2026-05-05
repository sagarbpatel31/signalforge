import { fetchWeekly } from "@/lib/api";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";

export async function WeeklyStrategicReview() {
  const {
    wins: weeklyWins,
    gaps: weeklyGaps,
    conviction_bets: convictionBets,
    next_week_focus: nextWeekFocus,
  } = await fetchWeekly();

  return (
    <SfCard>
      <SectionLabel icon="📊">Weekly Strategic Review</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
        {/* Wins */}
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--green)",
              letterSpacing: "0.08em",
              marginBottom: 10,
            }}
          >
            WINS THIS WEEK
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {weeklyWins.map((w, i) => (
              <div key={i} style={{ display: "flex", gap: 8 }}>
                <span style={{ color: "var(--green)", fontSize: 12, flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{w}</span>
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
              color: "var(--red)",
              letterSpacing: "0.08em",
              marginBottom: 10,
            }}
          >
            GAPS / MISSES
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {weeklyGaps.map((g, i) => (
              <div key={i} style={{ display: "flex", gap: 8 }}>
                <span style={{ color: "var(--red)", fontSize: 12, flexShrink: 0, marginTop: 1 }}>✕</span>
                <span style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{g}</span>
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
              color: "var(--orange)",
              letterSpacing: "0.08em",
              marginBottom: 10,
            }}
          >
            CONVICTION BETS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {convictionBets.map((b, i) => {
              const barColor =
                i === 0
                  ? "linear-gradient(90deg, var(--blue), var(--purple))"
                  : i === 1
                  ? "linear-gradient(90deg, var(--green), var(--blue))"
                  : "linear-gradient(90deg, var(--orange), var(--pink))";
              return (
                <div key={i}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 5,
                    }}
                  >
                    <span style={{ fontSize: 12, color: "var(--text-2)" }}>{b.label}</span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--orange)",
                        fontWeight: 600,
                      }}
                    >
                      {b.conviction}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      style={{
                        height: "100%",
                        width: `${b.conviction}%`,
                        borderRadius: 999,
                        background: barColor,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Next week focus — Instrument Serif italic block */}
      <div
        style={{
          marginTop: 20,
          padding: "14px 18px",
          borderRadius: 12,
          background:
            "linear-gradient(135deg, var(--blue-soft) 0%, var(--purple-soft) 50%, var(--pink-soft) 100%)",
          border: "1px solid oklch(0.72 0.16 245 / 0.2)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            color: "var(--text-3)",
            letterSpacing: "0.10em",
            marginBottom: 6,
          }}
        >
          NEXT WEEK FOCUS
        </div>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 16,
            color: "var(--text)",
            lineHeight: 1.5,
          }}
        >
          {nextWeekFocus}
        </div>
      </div>
    </SfCard>
  );
}
