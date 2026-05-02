import type { Metadata } from "next";
import { OnboardingForm } from "./OnboardingForm";

export const metadata: Metadata = { title: "SignalForge — Setup" };

export default function OnboardingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--sf-bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 12 }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="1" y="1" width="20" height="20" stroke="var(--sf-cyan)" strokeWidth="1.5" />
            <path d="M5 11 L9 7 L13 13 L17 9" stroke="var(--sf-cyan)" strokeWidth="1.5" strokeLinecap="square" />
            <circle cx="17" cy="9" r="2" fill="var(--sf-cyan)" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>SignalForge</span>
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--sf-text-3)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Intelligence Terminal Setup
        </div>
      </div>

      <OnboardingForm />
    </div>
  );
}
