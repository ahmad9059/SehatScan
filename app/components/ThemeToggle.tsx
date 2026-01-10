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

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-full ${
          className ?? ""
        }`}
        style={{ width: 52, height: 28 }}
      />
    );
  }

  const isDark = resolvedTheme === "dark";
  const nextTheme = isDark ? "light" : "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      aria-pressed={isDark}
      onClick={() => setTheme(nextTheme)}
      className={`relative inline-flex items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 ${
        className ?? ""
      }`}
      style={{
        width: 52,
        height: 28,
        boxShadow: elevated ? "0 4px 10px rgba(0,0,0,0.12)" : undefined,
      }}
    >
      <span className="sr-only">Toggle theme</span>

      {/* Track */}
      <span
        className="absolute inset-0 rounded-full transition-colors duration-300"
        style={{
          backgroundColor: isDark ? "#183153" : "#73C0FC",
          border: `1px solid ${isDark ? "#12243f" : "#6ab7f4"}`,
          boxShadow: isDark ? undefined : "inset 0 1px 2px rgba(0,0,0,0.18)",
        }}
        aria-hidden="true"
      />

      {/* Sun Icon */}
      <span
        className="absolute animate-spin-slow"
        style={{ top: 4, left: 30, width: 18, height: 18, zIndex: 1 }}
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="18"
          height="18"
        >
          <g fill="#ffd43b">
            <circle r="5" cy="12" cx="12" />
            <path d="m21 13h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm-17 0h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm13.66-5.66a1 1 0 0 1 -.66-.29 1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1 -.75.29zm-12.02 12.02a1 1 0 0 1 -.71-.29 1 1 0 0 1 0-1.41l.71-.66a1 1 0 0 1 1.41 1.41l-.71.71a1 1 0 0 1 -.7.24zm6.36-14.36a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm0 17a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm-5.66-14.66a1 1 0 0 1 -.7-.29l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.29zm12.02 12.02a1 1 0 0 1 -.7-.29l-.66-.71a1 1 0 0 1 1.36-1.36l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.24z" />
          </g>
        </svg>
      </span>

      {/* Moon Icon */}
      <span
        className="absolute animate-tilt"
        style={{
          top: 4,
          left: 4,
          width: 18,
          height: 18,
          zIndex: 1,
        }}
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 384 512"
          width="18"
          height="18"
          fill="#73C0FC"
        >
          <path d="m223.5 32c-123.5 0-223.5 100.3-223.5 224s100 224 223.5 224c60.6 0 115.5-24.2 155.8-63.4 5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6-96.9 0-175.5-78.8-175.5-176 0-65.8 36-123.1 89.3-153.3 6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z" />
        </svg>
      </span>

      {/* Thumb */}
      <span
        className="absolute rounded-full transition-transform duration-300"
        style={{
          width: 22,
          height: 22,
          top: 3,
          left: 3,
          zIndex: 2,
          backgroundColor: "#e8e8e8",
          boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
          transform: isDark ? "translateX(24px)" : "translateX(0)",
        }}
        aria-hidden="true"
      />
    </button>
  );
}
