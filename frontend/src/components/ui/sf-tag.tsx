import type { TagColor } from "@/lib/types";

const colorMap: Record<TagColor, { bg: string; text: string }> = {
  cyan:  { bg: "var(--blue-soft)",   text: "var(--blue)"   },
  amber: { bg: "var(--orange-soft)", text: "var(--orange)" },
  green: { bg: "var(--green-soft)",  text: "var(--green)"  },
  red:   { bg: "var(--red-soft)",    text: "var(--red)"    },
  muted: { bg: "var(--hairline)",    text: "var(--text-3)" },
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
      className="pill"
      style={{ background: c.bg, color: c.text }}
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
