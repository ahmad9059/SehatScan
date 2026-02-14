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
import { useSimpleLanguage } from "@/app/components/SimpleLanguageContext";

interface UserStats {
  totalAnalyses: number;
}

function ProfilePageContent() {
  const { user, isLoaded } = useUser();
  const { language } = useSimpleLanguage();
  const isUrdu = language === "ur";
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
      showErrorToast(
        isUrdu
          ? "لاگ آؤٹ میں ناکامی۔ براہ کرم دوبارہ کوشش کریں۔"
          : "Failed to log out. Please try again."
      );
    }
  };

  const formatJoinDate = (dateString: string | Date) => {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString(isUrdu ? "ur-PK" : "en-US", {
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
      showErrorToast(
        isUrdu
          ? "تصویر اپ ڈیٹ کرنے کے لیے سائن ان ہونا ضروری ہے۔"
          : "You need to be signed in to update your photo."
      );
      event.target.value = "";
      return;
    }

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      showErrorToast(
        isUrdu
          ? "براہ کرم PNG، JPG یا WebP تصویر اپ لوڈ کریں۔"
          : "Please upload a PNG, JPG, or WebP image."
      );
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showErrorToast(
        isUrdu ? "تصویر 10MB یا اس سے کم ہونی چاہیے۔" : "Image must be 10MB or smaller."
      );
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

      showSuccessToast(isUrdu ? "پروفائل تصویر اپ ڈیٹ ہو گئی" : "Profile photo updated");
    } catch (error) {
      console.error("Avatar upload error:", error);
      showErrorToast(
        error instanceof Error
          ? error.message
          : isUrdu
            ? "پروفائل تصویر اپ لوڈ کرنے میں ناکامی۔ براہ کرم دوبارہ کوشش کریں۔"
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
        <LogoSpinner message={isUrdu ? "پروفائل لوڈ ہو رہا ہے..." : "Loading profile..."} />
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
              {isUrdu ? "تصدیق درکار" : "Authentication required"}
            </h1>
            <p className={subheading}>
              {isUrdu
                ? "اپنا پروفائل اور ترتیبات دیکھنے کے لیے لاگ ان کریں۔"
                : "Please log in to view your profile and settings."}
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
    : isUrdu
      ? "حال ہی میں فعال"
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
            aria-label={isUrdu ? "پروفائل تصویر اپ لوڈ کریں" : "Upload profile photo"}
          />
          <div className="space-y-3">
            <p className={`${subheading} text-sm`}>
              {isUrdu ? "پروفائل جائزہ" : "Profile overview"}
            </p>
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
                      aria-label={isUrdu ? "پروفائل تصویر تبدیل کریں" : "Change profile photo"}
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
                        {isUploadingAvatar
                          ? isUrdu
                            ? "اپ لوڈ ہو رہا ہے..."
                            : "Uploading..."
                          : isUrdu
                            ? "تصویر تبدیل کریں"
                            : "Change photo"}
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
                            {isUrdu
                              ? isVerified
                                ? "تصدیق شدہ"
                                : "تصدیق زیر التوا"
                              : isVerified
                                ? "Verified"
                                : "Verification pending"}
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
                            {isUrdu ? "رکن از " : "Member since "}
                            {user.createdAt
                              ? formatJoinDate(user.createdAt)
                              : isUrdu
                                ? "نامعلوم"
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
                      {isUrdu ? "پروفائل منظم کریں" : "Manage profile"}
                    </button>
                    <a href="/dashboard/history" className={secondaryButton}>
                      <DocumentTextIcon className="h-4 w-4" />
                      {isUrdu ? "تاریخ دیکھیں" : "View history"}
                    </a>
                    <button onClick={handleLogout} className={primaryButton}>
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                      {isUrdu ? "لاگ آؤٹ" : "Log out"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className={pill}>{isUrdu ? "صارف آئی ڈی" : "User ID"}: {user.id}</span>
                  <span className={pill}>{isUrdu ? "آخری سرگرمی" : "Last active"}: {lastActive}</span>
                  <span className={pill}>{isUrdu ? "پلان: معیاری" : "Plan: Standard"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]/70 p-5">
              <div className="flex items-center justify-between">
                <p className={`${mutedText} text-xs uppercase tracking-wide`}>
                  {isUrdu ? "کل تجزیے" : "Total analyses"}
                </p>
                <ChartBarIcon className="h-5 w-5 text-[var(--color-primary)]" />
              </div>
              <p className="mt-3 text-3xl font-bold text-[var(--color-heading)]">
                {isLoadingStats ? "..." : userStats.totalAnalyses}
              </p>
              <p className={`${subheading} mt-1 text-xs`}>
                {isUrdu ? "اپنی تاریخ ایک جگہ محفوظ رکھیں۔" : "Keep your history in one place."}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]/70 p-5">
              <div className="flex items-center justify-between">
                <p className={`${mutedText} text-xs uppercase tracking-wide`}>
                  {isUrdu ? "ای میل حیثیت" : "Email status"}
                </p>
                <ShieldCheckIcon className="h-5 w-5 text-[var(--color-primary)]" />
              </div>
              <p className="mt-3 text-lg font-semibold text-[var(--color-heading)]">
                {isUrdu
                  ? isVerified
                    ? "تصدیق شدہ"
                    : "تصدیق زیر التوا"
                  : isVerified
                    ? "Verified"
                    : "Pending verification"}
              </p>
              <p className={`${subheading} mt-1 text-xs`}>
                {isUrdu
                  ? "Clerk اور محفوظ سیشنز کے ساتھ محفوظ۔"
                  : "Secured with Clerk and protected sessions."}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]/70 p-5">
              <div className="flex items-center justify-between">
                <p className={`${mutedText} text-xs uppercase tracking-wide`}>
                  {isUrdu ? "اکاؤنٹ حالت" : "Account health"}
                </p>
                <SparklesIcon className="h-5 w-5 text-[var(--color-primary)]" />
              </div>
              <p className="mt-3 text-lg font-semibold text-[var(--color-heading)]">
                {isUrdu ? "معیاری · اچھی حالت" : "Standard · Good standing"}
              </p>
              <p className={`${subheading} mt-1 text-xs`}>
                {isUrdu ? "کوئی زیر التوا مسئلہ نہیں ملا۔" : "No outstanding issues detected."}
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
                      <h3 className={sectionTitle}>
                        {isUrdu ? "سیکیورٹی اور سیشنز" : "Security & sessions"}
                      </h3>
                      <span className={chip}>{lastActive}</span>
                    </div>
                    <p className={`${subheading} mt-1 text-sm`}>
                      {isUrdu
                        ? "جائزہ لیں کہ آپ کیسے سائن اِن کرتے ہیں، آخری بار ایپ کہاں استعمال کی، اور اپنی اسناد محفوظ رکھیں۔"
                        : "Review how you sign in, where you last accessed the app, and keep your credentials protected."}
                    </p>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-[var(--color-heading)]">
                            {isUrdu ? "سائن اِن ای میل" : "Sign-in email"}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${
                              isVerified
                                ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                                : "bg-[var(--color-warning)]/15 text-[var(--color-warning)]"
                            }`}
                          >
                            <ShieldCheckIcon className="h-3.5 w-3.5" />
                            {isUrdu
                              ? isVerified
                                ? "تصدیق شدہ"
                                : "زیر التوا"
                              : isVerified
                                ? "Verified"
                                : "Pending"}
                          </span>
                        </div>
                        <p className={`${mutedText} text-sm mt-1`}>
                          {userEmail}
                        </p>
                      </div>

                      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-[var(--color-heading)]">
                            {isUrdu ? "سیشن کی حیثیت" : "Session status"}
                          </p>
                          <span className={pill}>{isUrdu ? "محفوظ" : "Secure"}</span>
                        </div>
                        <p className={`${mutedText} text-sm mt-1`}>
                          {isUrdu
                            ? `Clerk کے ذریعے سائن اِن · ${lastActive}`
                            : `Signed in via Clerk · ${lastActive}`}
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
                      <h3 className={sectionTitle}>
                        {isUrdu ? "اطلاعات" : "Notifications"}
                      </h3>
                      <span className={chip}>{isUrdu ? "اِن باکس اور ای میل" : "Inbox & email"}</span>
                    </div>
                    <p className={`${subheading} text-sm`}>
                      {isUrdu
                        ? "تجزیہ نتائج، اکاؤنٹ الرٹس، اور سیکیورٹی اپ ڈیٹس کے بارے میں اطلاع کی ترتیبات ایڈجسٹ کریں۔"
                        : "Fine-tune how you hear about analysis results, account alerts, and security updates."}
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        {
                          title: isUrdu ? "تجزیہ خلاصے" : "Analysis summaries",
                          description: isUrdu
                            ? "رپورٹس تیار ہونے پر خلاصہ بھیجیں۔"
                            : "Send a digest when reports are ready.",
                          enabled: true,
                        },
                        {
                          title: isUrdu ? "سیکیورٹی الرٹس" : "Security alerts",
                          description: isUrdu
                            ? "نئے ڈیوائس یا لاگ اِن پر اطلاع دیں۔"
                            : "Notify on new devices or logins.",
                          enabled: true,
                        },
                        {
                          title: isUrdu ? "پروڈکٹ اپ ڈیٹس" : "Product updates",
                          description: isUrdu
                            ? "کبھی کبھار جھلکیاں اور تجاویز۔"
                            : "Occasional highlights and tips.",
                          enabled: false,
                        },
                        {
                          title: isUrdu ? "یاد دہانیاں" : "Reminders",
                          description: isUrdu
                            ? "اپنی تاریخ دیکھنے کے لیے یاد دہانی۔"
                            : "Nudges to review your history.",
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
                            {isUrdu
                              ? item.enabled
                                ? "آن"
                                : "آف"
                              : item.enabled
                                ? "On"
                                : "Off"}
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
                <h3 className={sectionTitle}>
                  {isUrdu ? "اکاؤنٹ اعمال" : "Account actions"}
                </h3>
                <p className={`${subheading} text-sm`}>
                  {isUrdu
                    ? "اسناد منظم کریں، تاریخ صاف رکھیں، یا محفوظ طریقے سے باہر نکلیں۔"
                    : "Manage credentials, keep history tidy, or leave securely."}
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button
                    onClick={() =>
                      window.open("https://accounts.clerk.dev/user", "_blank")
                    }
                    className={`${secondaryButton} w-full sm:w-auto`}
                  >
                    <UserIcon className="h-4 w-4" />
                    {isUrdu ? "Clerk اکاؤنٹ کھولیں" : "Open Clerk account"}
                  </button>
                  <a
                    href="/dashboard/history"
                    className={`${secondaryButton} w-full sm:w-auto`}
                  >
                    <DocumentTextIcon className="h-4 w-4" />
                    {isUrdu ? "محفوظ تجزیے دیکھیں" : "View saved analyses"}
                  </a>
                  <button
                    onClick={handleLogout}
                    className={`${primaryButton} w-full sm:w-auto sm:ml-auto`}
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    {isUrdu ? "ہر جگہ سے لاگ آؤٹ" : "Log out everywhere"}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]/70 px-5 py-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                    <ShieldCheckIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className={sectionTitle}>
                      {isUrdu ? "ڈیٹا اور پرائیویسی" : "Data & privacy"}
                    </h3>
                    <p className={`${subheading} mt-1 text-sm`}>
                      {isUrdu
                        ? "آپ کا پروفائل اور تجزیے محفوظ ہیں۔ ڈیٹا ایکسپورٹ یا حذف کرنے کے لیے رابطہ کریں۔"
                        : "Your profile and analyses are protected. Reach out to export or remove your data."}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
                    <p className="text-sm font-semibold text-[var(--color-heading)]">
                      {isUrdu ? "ڈیٹا ایکسپورٹ" : "Export data"}
                    </p>
                    <p className={`${mutedText} text-sm mt-1`}>
                      {isUrdu
                        ? "ساختہ فارمیٹ میں تجزیے حاصل کرنے کے لیے سپورٹ سے رابطہ کریں۔"
                        : "Contact support to receive analyses in a structured format."}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
                    <p className="text-sm font-semibold text-[var(--color-heading)]">
                      {isUrdu ? "اکاؤنٹ حذف کریں" : "Delete account"}
                    </p>
                    <p className={`${mutedText} text-sm mt-1`}>
                      {isUrdu
                        ? "ہم آپ کے پروفائل اور ڈیٹا کو محفوظ طریقے سے ہٹانے میں رہنمائی کریں گے۔"
                        : "We'll guide you through secure removal of your profile and data."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]/70 px-5 py-5">
                <h3 className={sectionTitle}>
                  {isUrdu ? "مدد چاہیے؟" : "Need assistance?"}
                </h3>
                <p className={`${subheading} text-sm`}>
                  {isUrdu
                    ? "ہماری ٹیم رسائی، بلنگ، یا ڈیٹا درخواستوں میں مدد کر سکتی ہے۔"
                    : "Our team can help with access issues, billing questions, or data requests."}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={pill}>
                    {isUrdu ? "سپورٹ جواب · 24 گھنٹوں سے کم" : "Support response · under 24h"}
                  </span>
                  <span className={pill}>{isUrdu ? "محفوظ ہینڈلنگ" : "Secure handling"}</span>
                </div>
                <a
                  href="mailto:support@sehatscan.app"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-semibold text-[var(--color-heading)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition"
                >
                  <EnvelopeIcon className="h-4 w-4" />
                  {isUrdu ? "ای میل سپورٹ" : "Email support"}
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
