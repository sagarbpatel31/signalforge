interface SectionLabelProps {
  children: React.ReactNode;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--sf-text-3)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 14,
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 14,
          height: 1,
          background: "var(--sf-border)",
          flexShrink: 0,
        }}
      />
      {children}
    </div>
  );
}
