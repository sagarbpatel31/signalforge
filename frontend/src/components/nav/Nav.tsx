import { LiveDot } from "@/components/ui/live-dot";
import { SfTag } from "@/components/ui/sf-tag";

interface NavProps {
  date: string;
}

export function Nav({ date }: NavProps) {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "oklch(0.09 0.01 250 / 0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--sf-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        height: 52,
      }}
    >
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="1" y="1" width="20" height="20" stroke="var(--sf-cyan)" strokeWidth="1.5" />
            <path d="M5 11 L9 7 L13 13 L17 9" stroke="var(--sf-cyan)" strokeWidth="1.5" strokeLinecap="square" />
            <circle cx="17" cy="9" r="2" fill="var(--sf-cyan)" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em", color: "var(--sf-text)" }}>
            SignalForge
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--sf-text-3)",
            borderLeft: "1px solid var(--sf-border)",
            paddingLeft: 16,
            letterSpacing: "0.04em",
          }}
        >
          INTELLIGENCE TERMINAL
        </span>
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--sf-text-3)" }}>
          <LiveDot />
          {date}
        </span>
        <SfTag color="cyan" dot>
          LIVE
        </SfTag>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "var(--sf-cyan-dim)",
            border: "1px solid var(--sf-cyan)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--sf-cyan)",
          }}
        >
          SF
        </div>
      </div>
    </nav>
  );
}
