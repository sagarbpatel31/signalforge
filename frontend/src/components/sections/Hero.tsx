import { SfTag } from "@/components/ui/sf-tag";
import type { BriefResponse } from "@/lib/api";

interface HeroProps {
  userName?: string;
  brief?: BriefResponse;
  greeting?: string;
}

export function Hero({ userName, brief, greeting = "Good morning," }: HeroProps) {
  const first = userName?.split(" ")[0] ?? "Engineer";
  const signals = brief?.signals?.slice(0, 3) ?? [];

  return (
    <div
      className="hero-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 24,
        marginBottom: 28,
        alignItems: "start",
      }}
    >
      {/* Left: headline */}
      <div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--text-3)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span className="pulse-dot" style={{ width: 6, height: 6 }} />
          Live Intelligence Feed
        </div>
        <h1
          style={{
            fontSize: "clamp(32px, 4vw, 52px)",
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              background: "linear-gradient(135deg, var(--text) 30%, var(--blue) 70%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {greeting}
          </span>
          <br />
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              background: "linear-gradient(135deg, var(--blue) 0%, var(--purple) 60%, var(--pink) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {first}.
          </span>
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6, maxWidth: 440 }}>
          {brief?.market_pulse ?? "Your signal intelligence is loading…"}
        </p>
      </div>

      {/* Right: signal card */}
      {signals.length > 0 && (
        <div
          className="card"
          style={{ minWidth: 260, padding: "16px 18px" }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "var(--text-4)",
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Top Signals
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {signals.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <SfTag color={s.color === "muted" ? "muted" : s.color === "green" ? "green" : s.color === "amber" ? "amber" : "cyan"}>
                  {s.label}
                </SfTag>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--blue)",
                    fontWeight: 600,
                  }}
                >
                  {s.delta}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
