export function Footer() {
  return (
    <footer
      style={{
        marginTop: 40,
        paddingTop: 24,
        paddingBottom: 32,
        borderTop: "1px solid var(--hairline)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="pulse-dot" />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--text-3)",
          }}
        >
          All systems operational
        </span>
      </div>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--text-4)",
          letterSpacing: "0.06em",
        }}
      >
        SignalForge v3 · Edge AI + Robotics
      </span>
    </footer>
  );
}
