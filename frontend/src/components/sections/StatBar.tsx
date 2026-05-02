import { fetchStats } from "@/lib/api";

export async function StatBar() {
  const stats = await fetchStats();
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        border: "1px solid var(--sf-border)",
        background: "var(--sf-bg2)",
        marginBottom: 20,
      }}
    >
      {stats.map((s, i) => (
        <div
          key={i}
          style={{
            padding: "14px 18px",
            borderRight: i < stats.length - 1 ? "1px solid var(--sf-border)" : "none",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--sf-text-3)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {s.label}
          </div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: "-0.03em",
              color: "var(--sf-text)",
            }}
          >
            {s.value}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              marginTop: 2,
              color:
                s.up === true
                  ? "var(--sf-green)"
                  : s.up === false
                  ? "var(--sf-red)"
                  : "var(--sf-text-3)",
            }}
          >
            {s.up === true ? "↑ " : s.up === false ? "↓ " : ""}
            {s.delta}
          </div>
        </div>
      ))}
    </div>
  );
}
