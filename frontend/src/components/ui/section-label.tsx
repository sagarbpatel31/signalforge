interface SectionLabelProps {
  children: React.ReactNode;
  icon?: string;
}

export function SectionLabel({ children, icon }: SectionLabelProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
      }}
    >
      {icon && (
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            background: "var(--blue-soft)",
            border: "1px solid oklch(0.72 0.16 245 / 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      )}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          color: "var(--text-3)",
        }}
      >
        {children}
      </span>
    </div>
  );
}
