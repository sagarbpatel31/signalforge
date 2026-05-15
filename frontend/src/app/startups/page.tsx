"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SubNav } from "@/components/nav/SubNav";
import { fetchStartups, fetchFlaggedStartups, triggerIngest } from "@/lib/api";
import { SfTag } from "@/components/ui/sf-tag";
import type { Startup, FlaggedCompany, TagColor } from "@/lib/types";

function signalColor(s: string): TagColor {
  if (s === "Hot") return "green";
  if (s === "Watch") return "amber";
  return "muted";
}

export default function StartupsPage() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [flagged, setFlagged] = useState<FlaggedCompany[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [ingestDone, setIngestDone] = useState(false);

  useEffect(() => {
    Promise.all([fetchStartups(), fetchFlaggedStartups()]).then(
      ([curatedData, flaggedData]) => {
        setStartups(curatedData);
        // Filter out fallback-shaped items (job_count 0 from fallback means cache empty)
        const liveItems = flaggedData.filter((f) => f.job_count > 0);
        setFlagged(liveItems);
        setLoaded(true);
      }
    );
  }, []);

  async function handleIngest() {
    setIngesting(true);
    try {
      await triggerIngest();
      const flaggedData = await fetchFlaggedStartups();
      const liveItems = flaggedData.filter((f) => f.job_count > 0);
      setFlagged(liveItems);
      setIngestDone(true);
    } finally {
      setIngesting(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <SubNav backLabel="Dashboard" />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 60px" }}>
        {/* ── Actively Hiring Section ─────────────────────────────── */}
        <div style={{ marginBottom: 36 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  marginBottom: 3,
                }}
              >
                Actively Hiring
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--text-3)",
                  letterSpacing: "0.06em",
                }}
              >
                DERIVED FROM LIVE JOBS CACHE
              </p>
            </div>
            <SfTag color="cyan" dot>
              LIVE
            </SfTag>
          </div>

          {loaded && flagged.length === 0 && (
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--hairline)",
                borderRadius: 12,
                padding: "28px 20px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--text-3)",
                  marginBottom: 14,
                }}
              >
                No hiring data cached yet.
              </p>
              <button
                onClick={handleIngest}
                disabled={ingesting || ingestDone}
                className="btn btn-blue"
                style={{ borderRadius: 8 }}
              >
                {ingesting
                  ? "Fetching…"
                  : ingestDone
                  ? "Done — reload to see"
                  : "Fetch Live Jobs →"}
              </button>
            </div>
          )}

          {flagged.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {flagged.map((company, i) => (
                <div
                  key={company.name}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--hairline)",
                    borderRadius:
                      i === 0
                        ? "12px 12px 4px 4px"
                        : i === flagged.length - 1
                        ? "4px 4px 12px 12px"
                        : 4,
                    padding: "14px 18px",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 5,
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 14 }}>
                        {company.name}
                      </span>
                      {company.is_new && (
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            color: "var(--green)",
                            background: "var(--green-soft)",
                            padding: "1px 6px",
                            borderRadius: 4,
                          }}
                        >
                          NEW
                        </span>
                      )}
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          color: "var(--text-3)",
                          background: "var(--hairline)",
                          padding: "1px 7px",
                          borderRadius: 4,
                        }}
                      >
                        {company.job_count} role{company.job_count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        flexWrap: "wrap",
                      }}
                    >
                      {company.tags.map((tag) => (
                        <SfTag key={tag} color="muted">
                          {tag}
                        </SfTag>
                      ))}
                      {company.source && (
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 9,
                            color: "var(--text-4)",
                            letterSpacing: "0.06em",
                          }}
                        >
                          via {company.source}
                        </span>
                      )}
                    </div>
                    {company.roles_preview.length > 0 && (
                      <div
                        style={{
                          marginTop: 5,
                          fontSize: 11,
                          color: "var(--text-3)",
                          fontStyle: "italic",
                        }}
                      >
                        {company.roles_preview.join(" · ")}
                      </div>
                    )}
                  </div>
                  <Link
                    href="/career"
                    className="btn"
                    style={{ borderRadius: 8, whiteSpace: "nowrap", textDecoration: "none" }}
                  >
                    View Roles →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Radar List Section ───────────────────────────────────── */}
        <div>
          <div style={{ marginBottom: 14 }}>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                marginBottom: 3,
              }}
            >
              Radar List
            </h2>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--text-3)",
                letterSpacing: "0.06em",
              }}
            >
              {startups.length} STARTUPS · EDGE AI · ROBOTICS · PHYSICAL AI · EMBEDDED
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {startups.map((s, i) => (
              <div
                key={i}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--hairline)",
                  borderRadius:
                    i === 0
                      ? "12px 12px 4px 4px"
                      : i === startups.length - 1
                      ? "4px 4px 12px 12px"
                      : 4,
                  padding: "16px 18px",
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  alignItems: "center",
                  gap: 16,
                }}
              >
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
                    {s.website ? (
                      <a
                        href={s.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          color: "var(--blue)",
                          textDecoration: "none",
                        }}
                      >
                        {s.name} ↗
                      </a>
                    ) : (
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</span>
                    )}
                    <SfTag color="muted">{s.stage}</SfTag>
                    <SfTag color="muted">{s.domain}</SfTag>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>
                    {s.note}
                  </div>
                </div>
                <SfTag color={signalColor(s.signal)} dot={s.signal === "Hot"}>
                  {s.signal}
                </SfTag>
              </div>
            ))}

            {startups.length === 0 && (
              <div
                style={{
                  padding: "48px 0",
                  textAlign: "center",
                  color: "var(--text-3)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                }}
              >
                No startups tracked yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
