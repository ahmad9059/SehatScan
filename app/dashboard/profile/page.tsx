"use client";

import { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { getUserStats } from "@/app/actions/profile";
import { showErrorToast } from "@/lib/toast";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import {
  UserIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowRightOnRectangleIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  SparklesIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import {
  card,
  chip,
  contentWidth,
  heading,
  interactiveCard,
  mutedText,
  pageContainer,
  pill,
  primaryButton,
  secondaryButton,
  sectionTitle,
  subheading,
} from "@/app/components/dashboardStyles";

interface UserStats {
  totalAnalyses: number;
}

function ProfilePageContent() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [userStats, setUserStats] = useState<UserStats>({ totalAnalyses: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      try {
        const stats = await getUserStats();
        setUserStats(stats);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    if (user?.id) {
      fetchStats();
    }
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      await signOut({ redirectUrl: "/" });
    } catch (error) {
      console.error("Logout error:", error);
      showErrorToast("Failed to log out. Please try again.");
    }
  };

  const formatJoinDate = (dateString: string | Date) => {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isLoaded) {
    return (
      <div className={pageContainer}>
        <div className={`${contentWidth} flex justify-center`}>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={pageContainer}>
        <div className={`${contentWidth} max-w-xl`}>
          <div className={`${card} p-6 text-center`}>
            <UserIcon className="mx-auto h-10 w-10 text-[var(--color-muted)]" />
            <h1 className="mt-4 text-2xl font-bold text-[var(--color-heading)]">
              Authentication required
            </h1>
            <p className={`${subheading} mt-2`}>
              Please log in to view your profile and settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const userName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.username || "User";

  const userEmail = user.emailAddresses[0]?.emailAddress || "";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className={pageContainer}>
      <div className={`${contentWidth} space-y-6`}>
        <div className={`${card} p-6 lg:p-7`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                <UserIcon className="h-7 w-7" />
              </div>
              <div>
                <h1 className={heading}>Profile & Settings</h1>
                <p className={`${subheading} mt-2 text-sm sm:text-base`}>
                  Keep your account aligned with the dashboard look and feel.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={pill}>Clerk secured</span>
                  <span className={pill}>Single dashboard style</span>
                </div>
              </div>
            </div>
            <span className={chip}>
              <ShieldCheckIcon className="h-4 w-4" />
              {user.emailAddresses[0]?.verification?.status === "verified"
                ? "Email verified"
                : "Verification pending"}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className={`${interactiveCard} lg:col-span-2 p-6 lg:p-7`}>
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] text-2xl font-bold shadow-[var(--shadow-soft)]">
                {userInitial}
              </div>
              <div className="flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className={sectionTitle}>{userName}</h2>
                    <div className="mt-1 flex items-center gap-2">
                      <EnvelopeIcon className="h-4 w-4 text-[var(--color-subtle)]" />
                      <p className={`${mutedText} text-sm`}>{userEmail}</p>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-[var(--color-subtle)]" />
                      <p className={`${mutedText} text-sm`}>
                        Member since{" "}
                        {user.createdAt
                          ? formatJoinDate(user.createdAt)
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                  <span className={chip}>User ID: {user.id}</span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                    <p className={`${mutedText} text-xs`}>Total analyses</p>
                    <div className="mt-2 flex items-center gap-2">
                      <ChartBarIcon className="h-5 w-5 text-[var(--color-primary)]" />
                      <span className="text-xl font-bold text-[var(--color-heading)]">
                        {isLoadingStats ? "..." : userStats.totalAnalyses}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                    <p className={`${mutedText} text-xs`}>Email status</p>
                    <div className="mt-2 flex items-center gap-2">
                      <ShieldCheckIcon className="h-5 w-5 text-[var(--color-primary)]" />
                      <span className="text-sm font-semibold text-[var(--color-heading)]">
                        {user.emailAddresses[0]?.verification?.status ===
                        "verified"
                          ? "Verified"
                          : "Pending"}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                    <p className={`${mutedText} text-xs`}>Account type</p>
                    <div className="mt-2 flex items-center gap-2">
                      <SparklesIcon className="h-5 w-5 text-[var(--color-primary)]" />
                      <span className="text-sm font-semibold text-[var(--color-heading)]">
                        Standard
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`${card} p-6 lg:p-7 space-y-4`}>
            <h3 className={sectionTitle}>Account actions</h3>
            <p className={`${subheading} text-sm`}>
              Manage your profile, view saved analyses, or sign out securely.
            </p>
            <div className="space-y-3">
              <button
                onClick={() =>
                  window.open("https://accounts.clerk.dev/user", "_blank")
                }
                className={secondaryButton}
              >
                <UserIcon className="h-4 w-4" />
                Manage profile
              </button>
              <a href="/dashboard/history" className={secondaryButton}>
                <DocumentTextIcon className="h-4 w-4" />
                View history
              </a>
              <button onClick={handleLogout} className={primaryButton}>
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Log out
              </button>
            </div>
          </div>
        </div>

        <div className={`${interactiveCard} p-6 lg:p-7`}>
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
              <ShieldCheckIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className={sectionTitle}>Data protection</h3>
              <p className={`${subheading} mt-1 text-sm`}>
                Your profile and analyses are secured. Reach out if you want to
                export or delete your data.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <p className="text-sm font-semibold text-[var(--color-heading)]">
                Export data
              </p>
              <p className={`${mutedText} mt-1 text-sm`}>
                Contact support to export your analyses in a structured format.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <p className="text-sm font-semibold text-[var(--color-heading)]">
                Delete account
              </p>
              <p className={`${mutedText} mt-1 text-sm`}>
                We will guide you through secure removal of your profile and
                data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ErrorBoundary>
      <ProfilePageContent />
    </ErrorBoundary>
  );
}
