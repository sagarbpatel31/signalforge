"use client";

import { useState, useEffect } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("sf-theme");
    if (stored === "light") {
      setDark(false);
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("sf-theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      style={{
        width: 52,
        height: 26,
        borderRadius: 999,
        background: dark ? "var(--blue-soft)" : "var(--hairline-strong)",
        border: "1px solid var(--hairline-strong)",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: dark ? "calc(100% - 22px)" : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: dark ? "var(--blue)" : "var(--text-3)",
          transition: "left 0.2s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
        }}
      >
        {dark ? "◑" : "○"}
      </span>
    </button>
  );
}
