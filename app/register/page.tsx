"use client";

import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { ThemeToggle } from "../components/ThemeToggle";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-[var(--color-primary-soft)] flex items-center justify-center mb-6 border border-[var(--color-border)]">
            <svg
              className="h-6 w-6 text-[var(--color-primary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-heading)]">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-[var(--color-subtle)]">
            Join SehatScan to start your health journey
          </p>
        </div>

        {/* Clerk SignUp Component - No outer wrapper */}
        <div className="w-full max-w-md">
          <SignUp
            routing="hash"
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-[var(--color-primary)] hover:bg-[var(--color-primary-strong)] text-sm normal-case",
                card: "shadow-xl border border-[var(--color-border)] bg-[var(--color-card)]",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton:
                  "bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-surface)]",
                formFieldInput:
                  "bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-foreground)]",
                footerActionLink:
                  "text-[var(--color-primary)] hover:text-[var(--color-primary-strong)]",
                rootBox: "mx-auto",
              },
            }}
            fallbackRedirectUrl="/dashboard"
            signInUrl="/login"
          />
        </div>

        {/* Navigation Links */}
        <div className="text-center space-y-4">
          <p className="text-sm text-[var(--color-subtle)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-strong)] transition-colors"
            >
              Sign in
            </Link>
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-subtle)] hover:text-[var(--color-foreground)] transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to home
          </Link>
        </div>

        {/* Theme Toggle */}
        <div className="flex justify-center">
          <ThemeToggle elevated={false} />
        </div>
      </div>
    </div>
  );
}
