"use client";

import { useCallback, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

// The pre-hydration script in layout.tsx applies the stored theme before paint,
// so reading the live attribute here keeps the toggle in sync without a flash.
function isDark(): boolean {
  return document.documentElement.getAttribute("data-theme") !== "light";
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, () => true);

  const toggle = useCallback(() => {
    const next = isDark() ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("sf-theme", next);
    } catch {}
    listeners.forEach((l) => l());
  }, []);

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
