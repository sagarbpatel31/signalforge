"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { SearchModal } from "@/components/ui/SearchModal";

interface SubNavProps {
  back?: string;
  backLabel?: string;
}

export function SubNav({ back = "/", backLabel = "Dashboard" }: SubNavProps) {
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
          height: 52,
        }}
      >
        {/* Left: logo + back */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="20" height="20" rx="5" fill="var(--blue-soft)" stroke="oklch(0.72 0.16 245 / 0.4)" strokeWidth="1" />
              <path d="M6 12 L9.5 8 L13 14 L16 10.5" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="16" cy="10.5" r="2" fill="var(--blue)" />
            </svg>
            <span
              style={{
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: "-0.03em",
                background: "linear-gradient(135deg, var(--text) 40%, var(--blue))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              SignalForge
            </span>
          </Link>

          <span style={{ color: "var(--hairline-strong)", fontSize: 14 }}>/</span>

          <Link
            href={back}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--text-3)",
              textDecoration: "none",
              letterSpacing: "0.04em",
            }}
          >
            ← {backLabel}
          </Link>
        </div>

        {/* Right: search + bookmarks */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link
            href="/bookmarks"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-3)",
              textDecoration: "none",
              padding: "5px 10px",
              borderRadius: 7,
              border: "1px solid var(--hairline)",
              letterSpacing: "0.04em",
            }}
          >
            🔖
          </Link>
          <button
            onClick={() => setSearchOpen(true)}
            className="btn"
            style={{ gap: 6, borderRadius: 7, padding: "4px 10px" }}
            title="Search (⌘K)"
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 9 }}>⌘K</span>
          </button>
        </div>
      </nav>
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </>
  );
}
