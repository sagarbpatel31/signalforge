interface SfDividerProps {
  style?: React.CSSProperties;
}

export function SfDivider({ style }: SfDividerProps) {
  return (
    <div style={{ height: 1, background: "var(--sf-border-subtle)", ...style }} />
  );
}
