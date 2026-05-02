interface SfCardProps {
  children: React.ReactNode;
  glow?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function SfCard({ children, glow, style, className }: SfCardProps) {
  return (
    <div
      className={className}
      style={{
        background: "var(--sf-bg2)",
        border: "1px solid var(--sf-border)",
        padding: "18px 20px",
        boxShadow: glow
          ? "0 0 0 1px var(--sf-cyan-dim), 0 4px 24px var(--sf-cyan-glow)"
          : "none",
        transition: "border-color 0.2s",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
