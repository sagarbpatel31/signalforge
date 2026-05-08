"use client";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SearchModal } from "@/components/ui/SearchModal";
import { useState, useEffect } from "react";

interface NavProps {
  date: string;
  userName?: string;
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join("");
}

export function Nav({ date, userName }: NavProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape") setSearchOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <nav
        className="nav-blur"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          height: 56,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <rect x="2" y="2" width="20" height="20" rx="5" fill="var(--blue-soft)" stroke="oklch(0.72 0.16 245 / 0.4)" strokeWidth="1" />
            <path d="M6 12 L9.5 8 L13 14 L16 10.5" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="16" cy="10.5" r="2" fill="var(--blue)" />
          </svg>
          <span
            style={{
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: "-0.03em",
              background: "linear-gradient(135deg, var(--text) 40%, var(--blue))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            SignalForge
          </span>
          <span
            className="hide-mobile"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "var(--text-4)",
              borderLeft: "1px solid var(--hairline-strong)",
              paddingLeft: 12,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Intelligence Terminal
          </span>
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* ⌘K search button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="btn"
            style={{ gap: 8, borderRadius: 8 }}
            title="Search (⌘K)"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="hide-mobile">⌘K</span>
          </button>

          <span
            className="hide-mobile"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-3)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span className="pulse-dot" style={{ width: 6, height: 6 }} />
            {date}
          </span>

          <ThemeToggle />

          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--blue-soft), var(--purple-soft))",
              border: "1px solid oklch(0.72 0.16 245 / 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--blue)",
            }}
          >
            {userName ? initials(userName) : "SF"}
          </div>
        </div>
      </nav>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </>
  );
}
