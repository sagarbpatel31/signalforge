"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveProfile } from "@/lib/api";
import { DOMAINS, EXPERIENCE_LEVELS, GOALS } from "@/lib/types";
import type { UserProfile } from "@/lib/types";

const STEPS = ["Identity", "Domains", "Experience & Goal", "Projects"] as const;

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--sf-bg2)",
  border: "1px solid var(--sf-border)",
  color: "var(--sf-text)",
  fontFamily: "var(--font-sans)",
  fontSize: 14,
  padding: "10px 14px",
  outline: "none",
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

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 32 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 20 : 6,
            height: 6,
            background: i === current ? "var(--sf-cyan)" : i < current ? "var(--sf-border)" : "var(--sf-bg3)",
            border: "1px solid var(--sf-border)",
            transition: "all 0.2s",
          }}
        />
      ))}
    </div>
  );
}

function DomainChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        padding: "6px 12px",
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
  label, selected, onClick,
}: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "10px 14px",
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

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<UserProfile>({
    name: "",
    handle: "",
    domains: [],
    experience: "",
    goal: "",
    current_projects: "",
  });

  const set = <K extends keyof UserProfile>(key: K, val: UserProfile[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const toggleDomain = (d: string) =>
    set("domains", form.domains.includes(d) ? form.domains.filter((x) => x !== d) : [...form.domains, d]);

  const canAdvance = () => {
    if (step === 0) return form.name.trim().length > 0;
    if (step === 1) return form.domains.length > 0;
    if (step === 2) return form.experience !== "" && form.goal !== "";
    return true;
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await saveProfile(form);
      router.push("/");
    } catch {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 480,
        background: "var(--sf-bg2)",
        border: "1px solid var(--sf-border)",
        padding: "32px 28px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--sf-text-3)",
          letterSpacing: "0.10em",
          marginBottom: 6,
        }}
      >
        STEP {step + 1} OF {STEPS.length}
      </div>
      <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>{STEPS[step]}</div>
      <div style={{ fontSize: 13, color: "var(--sf-text-2)", marginBottom: 24 }}>
        {step === 0 && "How should SignalForge address you?"}
        {step === 1 && "Pick your focus areas. SignalForge filters everything through these."}
        {step === 2 && "This shapes how your daily brief and career radar are scored."}
        {step === 3 && "What are you currently working on? (optional)"}
      </div>

      <StepDots current={step} total={STEPS.length} />

      {/* Step 0: Identity */}
      {step === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Your name</label>
            <input
              autoFocus
              style={inputStyle}
              placeholder="e.g. Sagar"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>X / Twitter handle (optional)</label>
            <input
              style={inputStyle}
              placeholder="@handle"
              value={form.handle}
              onChange={(e) => set("handle", e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Step 1: Domains */}
      {step === 1 && (
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
      )}

      {/* Step 2: Experience + Goal */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={labelStyle}>Experience level</label>
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
          <div>
            <label style={labelStyle}>Primary goal right now</label>
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
        </div>
      )}

      {/* Step 3: Projects */}
      {step === 3 && (
        <div>
          <label style={labelStyle}>Current projects / what you&apos;re building</label>
          <textarea
            autoFocus
            style={{
              ...inputStyle,
              minHeight: 120,
              resize: "vertical",
              lineHeight: 1.6,
            }}
            placeholder="e.g. Edge inference SDK for industrial cameras, ROS2–LLM middleware bridge..."
            value={form.current_projects}
            onChange={(e) => set("current_projects", e.target.value)}
          />
        </div>
      )}

      {/* Nav buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 28,
          gap: 12,
        }}
      >
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              padding: "8px 16px",
              background: "transparent",
              border: "1px solid var(--sf-border)",
              color: "var(--sf-text-3)",
              cursor: "pointer",
              letterSpacing: "0.06em",
            }}
          >
            ← Back
          </button>
        ) : (
          <div />
        )}

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance()}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              padding: "8px 20px",
              background: canAdvance() ? "var(--sf-cyan-dim)" : "var(--sf-bg3)",
              border: `1px solid ${canAdvance() ? "var(--sf-cyan)" : "var(--sf-border)"}`,
              color: canAdvance() ? "var(--sf-cyan)" : "var(--sf-text-3)",
              cursor: canAdvance() ? "pointer" : "not-allowed",
              letterSpacing: "0.06em",
            }}
          >
            Continue →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              padding: "8px 20px",
              background: "var(--sf-cyan-dim)",
              border: "1px solid var(--sf-cyan)",
              color: "var(--sf-cyan)",
              cursor: saving ? "wait" : "pointer",
              letterSpacing: "0.06em",
            }}
          >
            {saving ? "Saving..." : "Launch Terminal →"}
          </button>
        )}
      </div>
    </div>
  );
}
