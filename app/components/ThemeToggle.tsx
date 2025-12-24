"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface ThemeToggleProps {
  className?: string;
  elevated?: boolean;
}

export function ThemeToggle({ className, elevated = true }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const nextTheme = isDark ? "light" : "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      aria-pressed={isDark}
      onClick={() => setTheme(nextTheme)}
      className={`inline-flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-[13px] font-semibold text-[var(--color-foreground)] transition-all duration-200 hover:-translate-y-[1px] hover:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 ${className ?? ""}`}
      style={elevated ? { boxShadow: "var(--shadow-soft)" } : undefined}
    >
      <span className="relative flex h-6 w-11 items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors">
        <span
          className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-[var(--color-primary)] transition-transform duration-200 ${
            isDark ? "translate-x-5" : ""
          }`}
        />
      </span>
      <span className="flex items-center gap-1 text-[var(--color-muted)]">
        {isDark ? (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path
              d="M20.354 15.354A9 9 0 018.646 3.646 9 9 0 1012 21a8.96 8.96 0 008.354-5.646z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364l-1.414-1.414M7.05 7.05L5.636 5.636m12.728 0L16.95 7.05M7.05 16.95 5.636 18.364M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        <span className="text-[var(--color-foreground)]">
          {mounted ? (isDark ? "Dark" : "Light") : "Theme"}
        </span>
      </span>
    </button>
  );
}
