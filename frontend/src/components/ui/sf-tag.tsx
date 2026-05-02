import type { TagColor } from "@/lib/types";

const colorMap: Record<TagColor, { bg: string; text: string; border: string }> = {
  cyan:  { bg: "var(--sf-cyan-dim)",  text: "var(--sf-cyan)",  border: "oklch(0.72 0.14 198 / 0.3)" },
  amber: { bg: "var(--sf-amber-dim)", text: "var(--sf-amber)", border: "oklch(0.78 0.14 65 / 0.3)" },
  green: { bg: "var(--sf-green-dim)", text: "var(--sf-green)", border: "oklch(0.72 0.14 150 / 0.3)" },
  red:   { bg: "var(--sf-red-dim)",   text: "var(--sf-red)",   border: "oklch(0.65 0.14 25 / 0.3)" },
  muted: { bg: "var(--sf-bg3)",       text: "var(--sf-text-2)", border: "var(--sf-border)" },
};

interface SfTagProps {
  children: React.ReactNode;
  color?: TagColor;
  dot?: boolean;
}

export function SfTag({ children, color = "cyan", dot = false }: SfTagProps) {
  const c = colorMap[color];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        padding: "2px 7px",
        border: `1px solid ${c.border}`,
        background: c.bg,
        color: c.text,
        whiteSpace: "nowrap",
      }}
    >
      {dot && (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: c.text,
            animation: "pulse-dot 2s ease-in-out infinite",
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
}
