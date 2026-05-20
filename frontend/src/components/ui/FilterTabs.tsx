"use client";

export interface FilterTab {
  key: string;
  label: string;
  /** Tags that count as a match for this filter */
  tags: string[];
}

interface FilterTabsProps {
  tabs: FilterTab[];
  active: string;
  counts?: Record<string, number>;
  onChange: (key: string) => void;
}

export function FilterTabs({ tabs, active, counts, onChange }: FilterTabsProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        flexWrap: "wrap",
        marginBottom: 20,
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        const count = counts?.[tab.key];
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.08em",
              padding: "5px 12px",
              background: isActive ? "var(--blue-soft)" : "transparent",
              border: `1px solid ${isActive ? "var(--blue)" : "var(--hairline)"}`,
              color: isActive ? "var(--blue)" : "var(--text-3)",
              cursor: "pointer",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              gap: 6,
              borderRadius: 4,
            }}
          >
            {tab.label.toUpperCase()}
            {count !== undefined && (
              <span
                style={{
                  fontSize: 9,
                  background: isActive ? "var(--blue)" : "var(--surface)",
                  color: isActive ? "var(--bg)" : "var(--text-4)",
                  borderRadius: 3,
                  padding: "1px 5px",
                  fontWeight: 600,
                }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Returns true if any of the item's tags match the filter's tag list */
export function matchesFilter(itemTags: string[], filterTags: string[]): boolean {
  if (filterTags.length === 0) return true;
  const lower = itemTags.map((t) => t.toLowerCase());
  return filterTags.some((ft) => lower.includes(ft));
}
