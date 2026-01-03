"use client";

import Link from "next/link";
import { SignIn, useUser } from "@clerk/nextjs";
import { ThemeToggle } from "../components/ThemeToggle";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      router.push("/dashboard");
    }
  }, [isLoaded, user, router]);

  // Show loading state while checking auth or redirecting
  if (!isLoaded || user) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center px-4 py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {user ? "Redirecting to dashboard..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto h-12 w-12 rounded-full bg-[var(--color-primary-soft)] flex items-center justify-center mb-6 border border-[var(--color-border)]">
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Sign in to your account to continue
        </p>
      </div>

      {/* Clerk SignIn Component - No outer wrapper */}
      <div className="w-full max-w-md">
        <SignIn
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
          signUpUrl="/register"
        />
      </div>

      {/* Navigation Links */}
      <div className="text-center space-y-4 mt-8">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Sign up
          </Link>
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
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
      <div className="flex justify-center mt-6">
        <ThemeToggle elevated={false} />
      </div>
    </div>
  );
}
