"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: "page" | "analysis" | "feature";
  href: string;
}

const searchData: SearchResult[] = [
  {
    id: "1",
    title: "Dashboard",
    description: "Main dashboard with analytics overview",
    type: "page",
    href: "/dashboard",
  },
  {
    id: "2",
    title: "Scan Report",
    description: "Upload and analyze medical reports",
    type: "page",
    href: "/dashboard/scan-report",
  },
  {
    id: "3",
    title: "Scan Face",
    description: "Facial health analysis using AI",
    type: "page",
    href: "/dashboard/scan-face",
  },
  {
    id: "4",
    title: "Health Check",
    description: "Dermatology-focused health check",
    type: "page",
    href: "/dashboard/health-check",
  },
  {
    id: "5",
    title: "History",
    description: "View all your previous analyses",
    type: "page",
    href: "/dashboard/history",
  },
  {
    id: "6",
    title: "Profile",
    description: "Manage your account settings",
    type: "page",
    href: "/dashboard/profile",
  },
];

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim()) {
      const filtered = searchData.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setSelectedIndex(0);
    } else {
      setResults(searchData);
      setSelectedIndex(0);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const handleSelect = (result: SearchResult) => {
    router.push(result.href);
    onClose();
    setQuery("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-start justify-center p-4 text-center sm:p-0">
        <div
          className="fixed inset-0 bg-black/30 transition-opacity"
          onClick={onClose}
        />

        <div className="relative transform overflow-hidden rounded-xl bg-[var(--color-card)] text-left shadow-[var(--shadow-strong)] transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-[var(--color-border)]">
          {/* Search Input */}
          <div className="flex items-center px-6 py-4 border-b border-[var(--color-border)]">
            <MagnifyingGlassIcon className="h-5 w-5 text-[var(--color-muted)] mr-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search pages, features, and more..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-[var(--color-foreground)] placeholder-[var(--color-subtle)] text-lg"
            />
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[var(--color-surface)] transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-[var(--color-muted)]" />
            </button>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                  className={`w-full px-6 py-3 text-left hover:bg-[var(--color-surface)] transition-colors ${
                    index === selectedIndex
                      ? "bg-[var(--color-primary-soft)]"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--color-heading)]">
                        {result.title}
                      </h3>
                      <p className="text-xs text-[var(--color-subtle)] mt-1">
                        {result.description}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-surface)] text-[var(--color-muted)] capitalize">
                      {result.type}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-[var(--color-subtle)]">
                No results found for "{query}"
              </p>
            </div>
          )}
        </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="flex items-center justify-between text-xs text-[var(--color-subtle)]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded text-xs">
                    ↑↓
                  </kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded text-xs">
                    ↵
                  </kbd>
                  Select
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded text-xs">
                  Esc
                </kbd>
                Close
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
