"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={
        "relative inline-flex h-9 w-[72px] items-center rounded-full border transition " +
        "border-slate-200 bg-white shadow-sm hover:shadow-[0_0_18px_rgba(37,99,235,0.18)] " +
        "dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
      }
    >
      <span className="absolute left-2 text-slate-500 dark:text-slate-400">
        <Sun className="h-4 w-4" />
      </span>
      <span className="absolute right-2 text-slate-500 dark:text-slate-400">
        <Moon className="h-4 w-4" />
      </span>
      <span
        className={
          "inline-flex h-7 w-7 translate-x-1 items-center justify-center rounded-full " +
          "bg-white text-slate-700 shadow transition-transform " +
          "dark:bg-[#0A0A0B] dark:text-slate-200 " +
          (isDark ? " translate-x-[36px]" : " translate-x-1")
        }
      />
    </button>
  );
}
