"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useUser } from "@clerk/nextjs";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoaded } = useUser();

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav
        aria-label="Global"
        className="flex items-center justify-between p-6 lg:px-8 text-[var(--color-foreground)]"
      >
        <div className="flex lg:flex-1">
          <Link
            href="/"
            className="-m-1.5 p-1.5 flex items-center space-x-3 group"
          >
            <img src="/logo.svg" alt="SehatScan" className="h-10 w-auto" />
            <span className="text-2xl font-bold text-[var(--color-foreground)]">
              Sehat<span className="text-[#037BFC]">Scan</span>
            </span>
          </Link>
        </div>

        {/* Mobile buttons */}
        <div className="flex lg:hidden items-center gap-x-2">
          <ThemeToggle elevated={false} className="px-2 py-1 text-xs" />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-200"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:gap-x-12 text-[var(--color-foreground)]">
          <Link
            href="#features"
            className="text-sm/6 font-semibold hover:text-[var(--color-primary)]"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm/6 font-semibold hover:text-[var(--color-primary)]"
          >
            How It Works
          </Link>
          <Link
            href="#integrations"
            className="text-sm/6 font-semibold hover:text-[var(--color-primary)]"
          >
            Integrations
          </Link>
          <Link
            href="/docs"
            className="text-sm/6 font-semibold hover:text-[var(--color-primary)]"
          >
            Docs
          </Link>
          <Link
            href="#about"
            className="text-sm/6 font-semibold hover:text-[var(--color-primary)]"
          >
            About
          </Link>
        </div>

        {/* Desktop CTA + Theme Toggle */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-x-4">
          <ThemeToggle />
          {!isLoaded ? (
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ) : user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm/6 font-semibold text-[var(--color-foreground)] hover:text-[var(--color-primary)]"
            >
              <img
                src={user.imageUrl}
                alt={user.fullName || "Profile"}
                className="h-9 w-9 rounded-full object-cover  "
              />
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm/6 font-semibold text-[var(--color-foreground)] hover:text-[var(--color-primary)]"
            >
              Log in <span aria-hidden="true">&rarr;</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-gray-900 p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 dark:sm:ring-white/10">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <img src="/logo.svg" alt="SehatScan" className="h-10 w-auto" />
                <span className="text-2xl font-bold text-[var(--color-foreground)]">
                  Sehat<span className="text-[#037BFC]">Scan</span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-200"
              >
                <span className="sr-only">Close menu</span>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10 dark:divide-white/10">
                <div className="space-y-2 py-6">
                  <Link
                    href="#features"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-[var(--color-foreground)] hover:bg-gray-50 dark:hover:bg-white/5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Features
                  </Link>
                  <Link
                    href="#how-it-works"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-[var(--color-foreground)] hover:bg-gray-50 dark:hover:bg-white/5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    How It Works
                  </Link>
                  <Link
                    href="#integrations"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-[var(--color-foreground)] hover:bg-gray-50 dark:hover:bg-white/5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Integrations
                  </Link>
                  <Link
                    href="/docs"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-[var(--color-foreground)] hover:bg-gray-50 dark:hover:bg-white/5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Docs
                  </Link>
                  <Link
                    href="#about"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-[var(--color-foreground)] hover:bg-gray-50 dark:hover:bg-white/5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                </div>
                <div className="py-6">
                  {!isLoaded ? (
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                    </div>
                  ) : user ? (
                    <Link
                      href="/dashboard"
                      className="-mx-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-base/7 font-semibold text-[var(--color-foreground)] hover:bg-gray-50 dark:hover:bg-white/5"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <img
                        src={user.imageUrl}
                        alt={user.fullName || "Profile"}
                        className="h-8 w-8 rounded-full object-cover border-2 border-[var(--color-primary)]"
                      />
                      <span>Dashboard</span>
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-[var(--color-foreground)] hover:bg-gray-50 dark:hover:bg-white/5"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
