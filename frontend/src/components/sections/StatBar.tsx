import { fetchStats } from "@/lib/api";

// Deterministic pseudo-sparkline points for each stat (visual decoration)
const SPARKLINES = [
  [2, 5, 3, 7, 4, 8, 6, 9, 7, 10],
  [8, 6, 7, 5, 8, 9, 7, 10, 8, 9],
  [3, 5, 4, 6, 5, 8, 7, 9, 8, 10],
  [6, 4, 7, 5, 8, 6, 9, 7, 10, 8],
  [5, 7, 6, 8, 5, 9, 7, 8, 9, 7],
];

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const W = 52, H = 22;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return `${x},${y}`;
  });
  const polyline = pts.join(" ");
  // Close polygon for gradient fill
  const fill = `${polyline} ${W},${H} 0,${H}`;
  return (
    <svg width={W} height={H} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fill} fill={`url(#sg-${color})`} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export async function StatBar() {
  const stats = await fetchStats();
  return (
    <div
      className="card"
      style={{
        padding: 0,
        marginBottom: 24,
        display: "grid",
        gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
        overflow: "hidden",
      }}
    >
      {stats.map((s, i) => {
        const sparkColor = s.up === true ? "var(--green)" : s.up === false ? "var(--red)" : "var(--blue)";
        const sparkData = SPARKLINES[i % SPARKLINES.length];
        return (
          <div
            key={i}
            style={{
              padding: "16px 20px",
              borderRight: i < stats.length - 1 ? "1px solid var(--hairline)" : "none",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                color: "var(--text-4)",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
              }}
            >
              {s.label}
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 24,
                    letterSpacing: "-0.04em",
                    color: "var(--text)",
                    lineHeight: 1.1,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    marginTop: 3,
                    color:
                      s.up === true
                        ? "var(--green)"
                        : s.up === false
                        ? "var(--red)"
                        : "var(--text-3)",
                  }}
                >
                  {s.up === true ? "↑ " : s.up === false ? "↓ " : ""}
                  {s.delta}
                </div>
              </div>
              <Sparkline data={sparkData} color={sparkColor} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
