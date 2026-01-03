"use client";

import { useEffect, useRef, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { getUserStats } from "@/app/actions/profile";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import LogoSpinner from "@/app/components/LogoSpinner";
import {
  UserIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowRightOnRectangleIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  SparklesIcon,
  DocumentTextIcon,
  LockClosedIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";
import { getSupabaseClient } from "@/lib/supabase-browser";
import {
  chip,
  contentWidth,
  fullWidthSection,
  heading,
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarBucket =
    process.env.NEXT_PUBLIC_SUPABASE_AVATAR_BUCKET || "sehatscan";

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

  useEffect(() => {
    if (user) {
      const meta =
        (user.unsafeMetadata as Record<string, unknown> | undefined) ||
        (user.publicMetadata as Record<string, unknown> | undefined) ||
        {};
      const storedAvatar = meta.avatarUrl as string | undefined;
      setAvatarUrl(storedAvatar || user.imageUrl || null);
    }
  }, [user]);

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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!user?.id) {
      showErrorToast("You need to be signed in to update your photo.");
      event.target.value = "";
      return;
    }

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      showErrorToast("Please upload a PNG, JPG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showErrorToast("Image must be 10MB or smaller.");
      event.target.value = "";
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const supabase = getSupabaseClient();
      const extension = file.name.split(".").pop() || "png";
      const filePath = `${user?.id}/${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(avatarBucket)
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from(avatarBucket)
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;
      setAvatarUrl(publicUrl);

      const existingMetadata =
        (user?.unsafeMetadata as Record<string, unknown>) || {};
      await user?.update({
        unsafeMetadata: { ...existingMetadata, avatarUrl: publicUrl },
      });

      showSuccessToast("Profile photo updated");
    } catch (error) {
      console.error("Avatar upload error:", error);
      showErrorToast(
        error instanceof Error
          ? error.message
          : "Failed to upload profile photo. Please try again."
      );
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = "";
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pb-[10%]">
        <LogoSpinner message="Loading profile..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={pageContainer}>
        <div className={contentWidth}>
          <section className={`${fullWidthSection} space-y-4 text-center`}>
            <UserIcon className="mx-auto h-10 w-10 text-[var(--color-muted)]" />
            <h1 className="text-2xl font-bold text-[var(--color-heading)]">
              Authentication required
            </h1>
            <p className={subheading}>
              Please log in to view your profile and settings.
            </p>
          </section>
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
  const isVerified =
    user.emailAddresses[0]?.verification?.status === "verified";
  const lastActive = user.lastSignInAt
    ? formatJoinDate(user.lastSignInAt)
    : "Recently active";

  return (
    <div className={pageContainer}>
      <div className={contentWidth}>
        <section className={`${fullWidthSection} space-y-8`}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleAvatarFileChange}
            aria-label="Upload profile photo"
          />
          <div className="space-y-3">
            <p className={`${subheading} text-sm`}>Profile overview</p>
            <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/80 px-6 py-6 ">
              <div
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 24px 24px, var(--hero-grid-dot) 1px, transparent 0)",
                  backgroundSize: "60px 60px",
                }}
              />
              <div className="relative flex flex-col gap-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xl font-bold shadow-[var(--shadow-soft)] overflow-hidden transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
                      aria-label="Change profile photo"
                    >
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarUrl}
                          alt={`${userName} avatar`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        userInitial
                      )}
                      <span className="absolute inset-0 bg-black/40 text-[var(--color-on-primary)] text-[11px] font-semibold opacity-0 transition-opacity flex items-center justify-center group-hover:opacity-100">
                        {isUploadingAvatar ? "Uploading..." : "Change photo"}
                      </span>
                      {isUploadingAvatar && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <LoadingSpinner size="sm" />
                        </span>
                      )}
                    </button>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className={heading}>{userName}</h1>
                        <span className={chip}>
                          <ShieldCheckIcon
                            className={`h-4 w-4 ${
                              isVerified
                                ? "text-[var(--color-primary)]"
                                : "text-[var(--color-muted)]"
                            }`}
                          />
                          <span
                            className={
                              isVerified
                                ? "text-[var(--color-primary)]"
                                : "text-[var(--color-foreground)]"
                            }
                          >
                            {isVerified ? "Verified" : "Verification pending"}
                          </span>
                        </span>
                      </div>
                      <div className="mt-2 flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-2">
                          <EnvelopeIcon className="h-4 w-4 text-[var(--color-subtle)]" />
                          <p className={mutedText}>{userEmail}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-[var(--color-subtle)]" />
                          <p className={mutedText}>
                            Member since{" "}
                            {user.createdAt
                              ? formatJoinDate(user.createdAt)
                              : "Unknown"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
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

                <div className="flex flex-wrap gap-2">
                  <span className={pill}>User ID: {user.id}</span>
                  <span className={pill}>Last active: {lastActive}</span>
                  <span className={pill}>Plan: Standard</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]/70 p-5">
              <div className="flex items-center justify-between">
                <p className={`${mutedText} text-xs uppercase tracking-wide`}>
                  Total analyses
                </p>
                <ChartBarIcon className="h-5 w-5 text-[var(--color-primary)]" />
              </div>
              <p className="mt-3 text-3xl font-bold text-[var(--color-heading)]">
                {isLoadingStats ? "..." : userStats.totalAnalyses}
              </p>
              <p className={`${subheading} mt-1 text-xs`}>
                Keep your history in one place.
              </p>
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]/70 p-5">
              <div className="flex items-center justify-between">
                <p className={`${mutedText} text-xs uppercase tracking-wide`}>
                  Email status
                </p>
                <ShieldCheckIcon className="h-5 w-5 text-[var(--color-primary)]" />
              </div>
              <p className="mt-3 text-lg font-semibold text-[var(--color-heading)]">
                {isVerified ? "Verified" : "Pending verification"}
              </p>
              <p className={`${subheading} mt-1 text-xs`}>
                Secured with Clerk and protected sessions.
              </p>
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]/70 p-5">
              <div className="flex items-center justify-between">
                <p className={`${mutedText} text-xs uppercase tracking-wide`}>
                  Account health
                </p>
                <SparklesIcon className="h-5 w-5 text-[var(--color-primary)]" />
              </div>
              <p className="mt-3 text-lg font-semibold text-[var(--color-heading)]">
                Standard · Good standing
              </p>
              <p className={`${subheading} mt-1 text-xs`}>
                No outstanding issues detected.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
            <div className="space-y-5">
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]/70 px-5 py-5">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                    <LockClosedIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className={sectionTitle}>Security & sessions</h3>
                      <span className={chip}>{lastActive}</span>
                    </div>
                    <p className={`${subheading} mt-1 text-sm`}>
                      Review how you sign in, where you last accessed the app,
                      and keep your credentials protected.
                    </p>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-[var(--color-heading)]">
                            Sign-in email
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${
                              isVerified
                                ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                                : "bg-[var(--color-warning)]/15 text-[var(--color-warning)]"
                            }`}
                          >
                            <ShieldCheckIcon className="h-3.5 w-3.5" />
                            {isVerified ? "Verified" : "Pending"}
                          </span>
                        </div>
                        <p className={`${mutedText} text-sm mt-1`}>
                          {userEmail}
                        </p>
                      </div>

                      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-[var(--color-heading)]">
                            Session status
                          </p>
                          <span className={pill}>Secure</span>
                        </div>
                        <p className={`${mutedText} text-sm mt-1`}>
                          Signed in via Clerk · {lastActive}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]/70 px-5 py-5">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                    <BellAlertIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className={sectionTitle}>Notifications</h3>
                      <span className={chip}>Inbox & email</span>
                    </div>
                    <p className={`${subheading} text-sm`}>
                      Fine-tune how you hear about analysis results, account
                      alerts, and security updates.
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        {
                          title: "Analysis summaries",
                          description: "Send a digest when reports are ready.",
                          enabled: true,
                        },
                        {
                          title: "Security alerts",
                          description: "Notify on new devices or logins.",
                          enabled: true,
                        },
                        {
                          title: "Product updates",
                          description: "Occasional highlights and tips.",
                          enabled: false,
                        },
                        {
                          title: "Reminders",
                          description: "Nudges to review your history.",
                          enabled: true,
                        },
                      ].map((item) => (
                        <div
                          key={item.title}
                          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 flex items-start justify-between gap-3"
                        >
                          <div>
                            <p className="text-sm font-semibold text-[var(--color-heading)]">
                              {item.title}
                            </p>
                            <p className={`${mutedText} text-xs mt-1`}>
                              {item.description}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                              item.enabled
                                ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                                : "bg-[var(--color-surface)] text-[var(--color-subtle)] border border-[var(--color-border)]"
                            }`}
                          >
                            {item.enabled ? "On" : "Off"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]/70 px-5 py-5">
                <h3 className={sectionTitle}>Account actions</h3>
                <p className={`${subheading} text-sm`}>
                  Manage credentials, keep history tidy, or leave securely.
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button
                    onClick={() =>
                      window.open("https://accounts.clerk.dev/user", "_blank")
                    }
                    className={`${secondaryButton} w-full sm:w-auto`}
                  >
                    <UserIcon className="h-4 w-4" />
                    Open Clerk account
                  </button>
                  <a
                    href="/dashboard/history"
                    className={`${secondaryButton} w-full sm:w-auto`}
                  >
                    <DocumentTextIcon className="h-4 w-4" />
                    View saved analyses
                  </a>
                  <button
                    onClick={handleLogout}
                    className={`${primaryButton} w-full sm:w-auto sm:ml-auto`}
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    Log out everywhere
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]/70 px-5 py-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                    <ShieldCheckIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className={sectionTitle}>Data & privacy</h3>
                    <p className={`${subheading} mt-1 text-sm`}>
                      Your profile and analyses are protected. Reach out to
                      export or remove your data.
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
                    <p className="text-sm font-semibold text-[var(--color-heading)]">
                      Export data
                    </p>
                    <p className={`${mutedText} text-sm mt-1`}>
                      Contact support to receive analyses in a structured
                      format.
                    </p>
                  </div>
                  <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
                    <p className="text-sm font-semibold text-[var(--color-heading)]">
                      Delete account
                    </p>
                    <p className={`${mutedText} text-sm mt-1`}>
                      We'll guide you through secure removal of your profile and
                      data.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]/70 px-5 py-5">
                <h3 className={sectionTitle}>Need assistance?</h3>
                <p className={`${subheading} text-sm`}>
                  Our team can help with access issues, billing questions, or
                  data requests.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={pill}>Support response · under 24h</span>
                  <span className={pill}>Secure handling</span>
                </div>
                <a
                  href="mailto:support@sehatscan.app"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-semibold text-[var(--color-heading)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition"
                >
                  <EnvelopeIcon className="h-4 w-4" />
                  Email support
                </a>
              </div>
            </div>
          </div>
        </section>
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
