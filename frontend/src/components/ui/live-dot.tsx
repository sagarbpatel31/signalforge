export function LiveDot() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: "var(--sf-green)",
        marginRight: 6,
        animation: "pulse-dot 1.8s ease-in-out infinite",
      }}
    />
  );
}
