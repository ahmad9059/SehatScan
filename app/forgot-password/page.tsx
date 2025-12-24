"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { ThemeToggle } from "../components/ThemeToggle";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-heading)]">
            Forgot Password
          </h2>
          <p className="mt-2 text-sm text-[var(--color-subtle)]">
            {isSubmitted
              ? "Check your email for reset instructions"
              : "Enter your email address and we'll send you a link to reset your password"}
          </p>
        </div>

        {/* Form */}
        <div className="bg-[var(--color-card)] rounded-2xl shadow-xl p-8 border border-[var(--color-border)]">
          {isSubmitted ? (
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-[color-mix(in srgb, var(--color-success) 12%, transparent)] flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-[var(--color-success)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-heading)]">
                Email Sent!
              </h3>
              <p className="text-sm text-[var(--color-subtle)]">
                If an account with <strong>{email}</strong> exists, we've sent
                password reset instructions to your email.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-strong)] transition-colors"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[var(--color-foreground)] mb-2"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-[var(--color-border)] px-4 py-3 text-[var(--color-foreground)] shadow-sm placeholder:text-[var(--color-subtle)] focus:ring-2 focus:ring-inset focus:ring-[var(--color-primary)] bg-[var(--color-card)] transition-all"
                  placeholder="Enter your email address"
                />
                {error && (
                  <p className="mt-2 text-sm text-[var(--color-danger)]">
                    {error}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-strong)] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Sending...
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </button>

              {/* Back to Login */}
              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-subtle)] hover:text-[var(--color-foreground)] transition-colors"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Theme Toggle */}
        <div className="flex justify-center">
          <ThemeToggle elevated={false} />
        </div>
      </div>
    </div>
  );
}
