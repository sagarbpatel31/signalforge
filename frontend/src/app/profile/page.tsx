"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchProfile, saveProfile } from "@/lib/api";
import { deriveUserKey, setActiveUserKey } from "@/lib/identity";
import { DOMAINS, EXPERIENCE_LEVELS, GOALS } from "@/lib/types";
import type { UserProfile } from "@/lib/types";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--sf-bg2)",
  border: "1px solid var(--sf-border)",
  color: "var(--sf-text)",
  fontFamily: "var(--font-sans)",
  fontSize: 14,
  padding: "10px 14px",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color: "var(--sf-text-3)",
  marginBottom: 8,
  display: "block",
};

function DomainChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        padding: "6px 14px",
        background: selected ? "var(--sf-cyan-dim)" : "var(--sf-bg2)",
        border: `1px solid ${selected ? "var(--sf-cyan)" : "var(--sf-border)"}`,
        color: selected ? "var(--sf-cyan)" : "var(--sf-text-2)",
        cursor: "pointer",
        letterSpacing: "0.04em",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}

function RadioOption({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "9px 14px",
        background: selected ? "var(--sf-cyan-dim)" : "var(--sf-bg2)",
        border: `1px solid ${selected ? "var(--sf-cyan)" : "var(--sf-border)"}`,
        color: selected ? "var(--sf-cyan)" : "var(--sf-text-2)",
        fontSize: 13,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 10,
        transition: "all 0.15s",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          border: `1px solid ${selected ? "var(--sf-cyan)" : "var(--sf-border)"}`,
          background: selected ? "var(--sf-cyan)" : "transparent",
          flexShrink: 0,
        }}
      />
      {label}
    </button>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--sf-cyan)",
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: "var(--sf-text-3)" }}>{sub}</div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState<UserProfile>({
    name: "",
    handle: "",
    domains: [],
    experience: "",
    goal: "",
    current_projects: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchProfile().then((p) => {
      if (p) setForm(p);
      setLoading(false);
    });
  }, []);

  const set = <K extends keyof UserProfile>(key: K, val: UserProfile[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    setSaved(false);
  };

  const toggleDomain = (d: string) => {
    set(
      "domains",
      form.domains.includes(d)
        ? form.domains.filter((x) => x !== d)
        : [...form.domains, d]
    );
  };

  const handleSave = async () => {
    if (!form.name.trim() || form.domains.length === 0) return;
    setSaving(true);
    try {
      const userKey = deriveUserKey(form);
      await saveProfile(form, userKey);
      setActiveUserKey(userKey);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndReturn = async () => {
    if (!form.name.trim() || form.domains.length === 0) return;
    setSaving(true);
    try {
      const userKey = deriveUserKey(form);
      await saveProfile(form, userKey);
      setActiveUserKey(userKey);
      router.push("/");
    } catch {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--sf-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--sf-text-3)",
          letterSpacing: "0.1em",
        }}
      >
        LOADING PROFILE…
      </div>
    );
  }

  const canSave = form.name.trim().length > 0 && form.domains.length > 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--sf-bg)",
        padding: "40px 24px 80px",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 32,
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--sf-text-3)",
            letterSpacing: "0.08em",
          }}
        >
          <Link href="/" style={{ color: "var(--sf-text-3)", textDecoration: "none" }}>
            DASHBOARD
          </Link>
          <span>›</span>
          <span style={{ color: "var(--sf-cyan)" }}>PROFILE SETTINGS</span>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 36 }}>
          <h1
            style={{
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: "-0.03em",
              margin: 0,
              marginBottom: 6,
            }}
          >
            Profile Settings
          </h1>
          <p style={{ fontSize: 13, color: "var(--sf-text-2)", margin: 0 }}>
            SignalForge uses this to personalize your brief, career radar, and post drafts.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

          {/* ── Identity ───────────────────────────────────────────── */}
          <div
            style={{
              background: "var(--sf-bg2)",
              border: "1px solid var(--sf-border)",
              padding: "24px",
            }}
          >
            <SectionHeader title="Identity" />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Name *</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. Sagar"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>X / Twitter handle</label>
                <input
                  style={inputStyle}
                  placeholder="@handle"
                  value={form.handle}
                  onChange={(e) => set("handle", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ── Domains ────────────────────────────────────────────── */}
          <div
            style={{
              background: "var(--sf-bg2)",
              border: "1px solid var(--sf-border)",
              padding: "24px",
            }}
          >
            <SectionHeader
              title="Focus Domains *"
              sub="SignalForge filters signals, jobs, and posts through these."
            />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {DOMAINS.map((d) => (
                <DomainChip
                  key={d}
                  label={d}
                  selected={form.domains.includes(d)}
                  onClick={() => toggleDomain(d)}
                />
              ))}
            </div>
            {form.domains.length > 0 && (
              <div
                style={{
                  marginTop: 12,
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--sf-cyan)",
                  letterSpacing: "0.06em",
                }}
              >
                {form.domains.length} selected
              </div>
            )}
          </div>

          {/* ── Experience ─────────────────────────────────────────── */}
          <div
            style={{
              background: "var(--sf-bg2)",
              border: "1px solid var(--sf-border)",
              padding: "24px",
            }}
          >
            <SectionHeader
              title="Experience Level"
              sub="Shapes how your career radar and brief are scored."
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {EXPERIENCE_LEVELS.map((e) => (
                <RadioOption
                  key={e}
                  label={e}
                  selected={form.experience === e}
                  onClick={() => set("experience", e)}
                />
              ))}
            </div>
          </div>

          {/* ── Goal ───────────────────────────────────────────────── */}
          <div
            style={{
              background: "var(--sf-bg2)",
              border: "1px solid var(--sf-border)",
              padding: "24px",
            }}
          >
            <SectionHeader title="Primary Goal" sub="What are you optimizing for right now?" />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {GOALS.map((g) => (
                <RadioOption
                  key={g}
                  label={g}
                  selected={form.goal === g}
                  onClick={() => set("goal", g)}
                />
              ))}
            </div>
          </div>

          {/* ── Projects ───────────────────────────────────────────── */}
          <div
            style={{
              background: "var(--sf-bg2)",
              border: "1px solid var(--sf-border)",
              padding: "24px",
            }}
          >
            <SectionHeader
              title="Current Projects"
              sub="What are you building? Used to ground AI-generated tasks and posts."
            />
            <textarea
              style={{
                ...inputStyle,
                minHeight: 100,
                resize: "vertical",
                lineHeight: 1.6,
              }}
              placeholder="e.g. Edge inference SDK for industrial cameras, ROS2–LLM middleware bridge..."
              value={form.current_projects}
              onChange={(e) => set("current_projects", e.target.value)}
            />
          </div>

          {/* ── Save buttons ───────────────────────────────────────── */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              type="button"
              onClick={handleSaveAndReturn}
              disabled={saving || !canSave}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                padding: "10px 24px",
                background: canSave ? "var(--sf-cyan)" : "var(--sf-bg3)",
                border: "none",
                color: canSave ? "var(--sf-bg)" : "var(--sf-text-4)",
                cursor: canSave ? "pointer" : "not-allowed",
                letterSpacing: "0.08em",
                fontWeight: 600,
                transition: "all 0.15s",
              }}
            >
              {saving ? "SAVING…" : "SAVE & RETURN"}
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !canSave}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                padding: "10px 24px",
                background: "transparent",
                border: `1px solid ${canSave ? "var(--sf-border)" : "var(--sf-bg3)"}`,
                color: canSave ? "var(--sf-text-2)" : "var(--sf-text-4)",
                cursor: canSave ? "pointer" : "not-allowed",
                letterSpacing: "0.08em",
                transition: "all 0.15s",
              }}
            >
              {saving ? "…" : "SAVE"}
            </button>

            {saved && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--green)",
                  letterSpacing: "0.08em",
                }}
              >
                ✓ SAVED
              </span>
            )}

            {!canSave && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--sf-text-4)",
                  letterSpacing: "0.06em",
                }}
              >
                {!form.name.trim() ? "Name required" : "Select at least one domain"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
