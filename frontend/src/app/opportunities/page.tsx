"use client";

import { useEffect, useState } from "react";
import { SubNav } from "@/components/nav/SubNav";
import { fetchOpportunities } from "@/lib/api";
import { SfTag } from "@/components/ui/sf-tag";
import type { Opportunity } from "@/lib/types";

function signalTagColor(signal: Opportunity["signal"]) {
  if (signal === "HIGH") return "green" as const;
  if (signal === "MEDIUM") return "amber" as const;
  return "muted" as const;
}

function fitBarColor(fit: number): string {
  if (fit > 85) return "var(--green)";
  if (fit > 70) return "var(--amber)";
  return "var(--text-4)";
}

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchOpportunities().then((data) => {
      // Sort by fit descending (they may already be sorted, but enforce it)
      const sorted = [...data].sort((a, b) => b.fit - a.fit);
      setOpportunities(sorted);
      setLoaded(true);
    });
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <SubNav backLabel="Dashboard" />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 60px" }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              marginBottom: 4,
            }}
          >
            Top Opportunities
            {loaded && (
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 400,
                  color: "var(--text-3)",
                  marginLeft: 10,
                }}
              >
                {opportunities.length}
              </span>
            )}
          </h1>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-3)",
              letterSpacing: "0.06em",
            }}
          >
            HIGH-FIT MATCHES · RANKED BY SIGNAL
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {opportunities.map((opp, i) => (
            <div
              key={opp.rank}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--hairline)",
                borderRadius:
                  i === 0
                    ? "12px 12px 4px 4px"
                    : i === opportunities.length - 1
                    ? "4px 4px 12px 12px"
                    : 4,
                padding: "18px 20px",
                display: "grid",
                gridTemplateColumns: "40px 1fr auto",
                gap: 16,
                alignItems: "start",
              }}
            >
              {/* Rank badge */}
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--text-4)",
                  letterSpacing: "-0.04em",
                  paddingTop: 2,
                }}
              >
                {opp.rank}
              </div>

              {/* Main content */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{opp.title}</span>
                  <SfTag color="muted">{opp.domain}</SfTag>
                  <SfTag color={signalTagColor(opp.signal)} dot={opp.signal === "HIGH"}>
                    {opp.signal}
                  </SfTag>
                </div>

                {/* Fit bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 999,
                      background: "var(--hairline-strong)",
                      overflow: "hidden",
                      maxWidth: 160,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 999,
                        background: fitBarColor(opp.fit),
                        width: `${opp.fit}%`,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: fitBarColor(opp.fit),
                      fontWeight: 600,
                    }}
                  >
                    {opp.fit}% fit
                  </span>
                </div>

                {/* Why text */}
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text-2)",
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  {opp.why}
                </p>
              </div>

              {/* Explore button */}
              <div style={{ paddingTop: 2 }}>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(opp.title + " jobs")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-blue"
                  style={{ borderRadius: 8, whiteSpace: "nowrap" }}
                >
                  Explore →
                </a>
              </div>
            </div>
          ))}

          {loaded && opportunities.length === 0 && (
            <div
              style={{
                padding: "48px 0",
                textAlign: "center",
                color: "var(--text-3)",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
              }}
            >
              No opportunities found.
            </div>
          )}

          {!loaded && (
            <div
              style={{
                padding: "48px 0",
                textAlign: "center",
                color: "var(--text-4)",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
              }}
            >
              Loading…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
