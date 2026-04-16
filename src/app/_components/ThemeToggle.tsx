"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Theme = "light" | "dark";
type Wipe = {
  tone: "light" | "dark";
  active: boolean;
  id: number;
};

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") return "dark";

  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [wipe, setWipe] = useState<Wipe | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);
  const wipeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const initial = getPreferredTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
      if (wipeTimeoutRef.current !== null) {
        window.clearTimeout(wipeTimeoutRef.current);
      }
    };
  }, []);

  function startWipe(nextTheme: Theme) {
    const id = Date.now();
    const tone: Wipe["tone"] = nextTheme === "dark" ? "light" : "dark";

    setWipe({ tone, active: false, id });

    window.requestAnimationFrame(() => {
      setWipe((current) =>
        current && current.id === id ? { ...current, active: true } : current
      );
    });

    if (wipeTimeoutRef.current !== null) {
      window.clearTimeout(wipeTimeoutRef.current);
    }

    wipeTimeoutRef.current = window.setTimeout(() => {
      setWipe((current) => (current && current.id === id ? null : current));
      wipeTimeoutRef.current = null;
    }, 620);
  }

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);

    startWipe(next);

    const root = document.documentElement;

    root.classList.add("theme-transition");
    applyTheme(next);
    window.localStorage.setItem("theme", next);

    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
    }

    transitionTimeoutRef.current = window.setTimeout(() => {
      root.classList.remove("theme-transition");
      transitionTimeoutRef.current = null;
    }, 260);
  }

  return (
    <>
      {wipe && (
        <span className="pointer-events-none fixed inset-0 z-50">
          <span
            className={`absolute inset-0 opacity-0 transition-[clip-path,opacity] duration-500 ease-out theme-wipe ${
              wipe.active ? "theme-wipe-active opacity-100" : "opacity-0"
            } ${
              wipe.tone === "light"
                ? "bg-[#f7f8fc]"
                : "bg-[#05070f]"
            }`}
          />
        </span>
      )}

      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl transition hover:bg-white/10"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <>
            <Sun className="h-4 w-4" />
            Light
          </>
        ) : (
          <>
            <Moon className="h-4 w-4" />
            Dark
          </>
        )}
      </button>
    </>
  );
}
