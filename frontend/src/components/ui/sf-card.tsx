interface SfCardProps {
  children: React.ReactNode;
  glow?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function SfCard({ children, glow, style, className }: SfCardProps) {
  return (
    <div
      className={`card ${className ?? ""}`}
      style={{
        ...(glow && {
          boxShadow:
            "0 1px 0 oklch(1 0 0 / 0.06) inset, 0 8px 32px oklch(0 0 0 / 0.45), 0 0 0 1px oklch(0.72 0.16 245 / 0.2)",
        }),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
