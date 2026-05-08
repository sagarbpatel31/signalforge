import { SubNav } from "@/components/nav/SubNav";
import { fetchAllCareer, fetchProfile } from "@/lib/api";
import { SfTag } from "@/components/ui/sf-tag";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "SignalForge — Career Radar" };

export default async function CareerPage() {
  const [roles, profile] = await Promise.all([fetchAllCareer(), fetchProfile()]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <SubNav backLabel="Dashboard" />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px 60px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 4 }}>
              Career Radar
            </h1>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.06em" }}>
              {roles.length} ROLES · FILTERED FOR{" "}
              {profile?.domains.map((d) => d.toUpperCase()).join(", ") ?? "YOUR PROFILE"}
            </p>
          </div>
          <SfTag color="cyan" dot>LIVE</SfTag>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {roles.map((role, i) => (
            <div
              key={i}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--hairline)",
                borderRadius: i === 0 ? "12px 12px 4px 4px" : i === roles.length - 1 ? "4px 4px 12px 12px" : 4,
                padding: "14px 18px",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{role.company}</span>
                  <span style={{ color: "var(--text-4)", fontSize: 12 }}>·</span>
                  <span style={{ fontSize: 13, color: "var(--text-2)" }}>{role.role}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-3)" }}>
                    {role.type}
                  </span>
                  <SfTag color={role.color}>{role.signal}</SfTag>
                </div>
              </div>
              {role.url ? (
                <a
                  href={role.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-blue"
                  style={{ borderRadius: 8, whiteSpace: "nowrap" }}
                >
                  Apply →
                </a>
              ) : null}
            </div>
          ))}

          {roles.length === 0 && (
            <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
              No roles cached yet — trigger ingestion from dashboard.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
