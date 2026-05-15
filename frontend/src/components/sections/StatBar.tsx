"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchStats } from "@/lib/api";
import type { Stat } from "@/lib/types";

// Deterministic pseudo-sparkline points (visual decoration)
const SPARKLINES = [
  [2, 5, 3, 7, 4, 8, 6, 9, 7, 10],
  [8, 6, 7, 5, 8, 9, 7, 10, 8, 9],
  [3, 5, 4, 6, 5, 8, 7, 9, 8, 10],
  [6, 4, 7, 5, 8, 6, 9, 7, 10, 8],
  [5, 7, 6, 8, 5, 9, 7, 8, 9, 7],
];

// Route mapping for each stat label
const STAT_ROUTES: Record<string, string> = {
  "Signals Tracked": "/news",
  "Opportunities": "/opportunities",
  "Startups Flagged": "/startups",
  "Hiring Signals": "/career",
  "Research Papers": "/research",
};

// Placeholder stats shown while loading — match shape of real data
const SKELETON: Stat[] = [
  { label: "Signals Tracked",  value: "—",  delta: "loading…", up: null },
  { label: "Opportunities",    value: "—",  delta: "loading…", up: null },
  { label: "Startups Flagged", value: "—",  delta: "loading…", up: null },
  { label: "Hiring Signals",   value: "—",  delta: "loading…", up: null },
  { label: "Research Papers",  value: "—",  delta: "loading…", up: null },
];

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const W = 52, H = 22;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return `${x},${y}`;
  });
  const polyline = pts.join(" ");
  const fill = `${polyline} ${W},${H} 0,${H}`;
  return (
    <svg width={W} height={H} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fill} fill={`url(#sg-${color})`} />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StatBar() {
  const [stats, setStats] = useState<Stat[]>(SKELETON);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchStats().then((data) => {
      if (data && data.length > 0) setStats(data);
      setLoaded(true);
    });
  }, []);

  return (
    <div
      className="card"
      style={{
        padding: 0,
        marginBottom: 24,
        display: "grid",
        gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
        overflow: "hidden",
      }}
    >
      {stats.map((s, i) => {
        const sparkColor =
          s.up === true
            ? "var(--green)"
            : s.up === false
            ? "var(--red)"
            : "var(--blue)";
        const sparkData = SPARKLINES[i % SPARKLINES.length];
        const isLoading = !loaded;
        const href = STAT_ROUTES[s.label] ?? "/";

        return (
          <Link
            key={i}
            href={href}
            style={{
              textDecoration: "none",
              color: "inherit",
              display: "block",
              borderRight:
                i < stats.length - 1 ? "1px solid var(--hairline)" : "none",
              transition: "background 0.15s, opacity 0.3s",
              opacity: isLoading ? 0.5 : 1,
            }}
            className="stat-bar-cell"
          >
            <div
              style={{
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    color: "var(--text-4)",
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                  }}
                >
                  {s.label}
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 8,
                    color: "var(--text-4)",
                  }}
                >
                  →
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 24,
                      letterSpacing: "-0.04em",
                      color: "var(--text)",
                      lineHeight: 1.1,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      marginTop: 3,
                      color:
                        s.up === true
                          ? "var(--green)"
                          : s.up === false
                          ? "var(--red)"
                          : "var(--text-3)",
                    }}
                  >
                    {s.delta}
                  </div>
                </div>
                <Sparkline data={sparkData} color={sparkColor} />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
