"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ErrorBoundary from "../components/ErrorBoundary";
import { showErrorToast } from "@/lib/toast";
import { ThemeToggle } from "../components/ThemeToggle";
import { SearchModal } from "../components/SearchModal";
import { ProfileDropdown } from "../components/ProfileDropdown";
import { LanguageSelector } from "../components/LanguageSelector";
import { NotificationsDropdown } from "../components/NotificationsDropdown";
import { useSimpleLanguage } from "../components/SimpleLanguageContext";
import {
  HomeIcon,
  DocumentTextIcon,
  CameraIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftStartOnRectangleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

interface NavigationItem {
  nameKey: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const navigationItems: NavigationItem[] = [
  { nameKey: "nav.dashboard", href: "/dashboard", icon: HomeIcon },
  {
    nameKey: "nav.scanReport",
    href: "/dashboard/scan-report",
    icon: DocumentTextIcon,
  },
  { nameKey: "nav.scanFace", href: "/dashboard/scan-face", icon: CameraIcon },
  {
    nameKey: "nav.riskAssessment",
    href: "/dashboard/risk-assessment",
    icon: ExclamationTriangleIcon,
  },
  {
    nameKey: "nav.chatbot",
    href: "/dashboard/chatbot",
    icon: ChatBubbleLeftRightIcon,
  },
  { nameKey: "nav.history", href: "/dashboard/history", icon: ClockIcon },
  { nameKey: "nav.profile", href: "/dashboard/profile", icon: UserIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  compact: boolean;
  onToggleCompact: () => void;
}

function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  compact,
  onToggleCompact,
}: SidebarProps) {
  const pathname = usePathname();
  const { t } = useSimpleLanguage();
  const { signOut } = useClerk();

  const handleLogout = async () => {
    try {
      await signOut({ redirectUrl: "/" });
    } catch (error) {
      console.error("Logout error:", error);
      showErrorToast("Failed to log out. Please try again.");
    }
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-gray-900/80 transition-opacity"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-[var(--color-card)] border-r border-[var(--color-border)] transform transition-transform animate-slide-in-left ">
            <SidebarContent
              pathname={pathname}
              onLogout={handleLogout}
              onClose={() => setSidebarOpen(false)}
              isMobile={true}
              compact={false}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div
        className={classNames(
          "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300 lg:overflow-hidden",
          compact ? "lg:w-16" : "lg:w-72"
        )}
      >
        <div
          className={classNames(
            "flex grow flex-col gap-y-5 overflow-y-auto bg-[var(--color-card)] border-r border-[var(--color-border)] pb-4 transition-all duration-300",
            compact ? "items-center px-2" : "px-4"
          )}
        >
          <SidebarContent
            pathname={pathname}
            onLogout={handleLogout}
            isMobile={false}
            compact={compact}
            onToggleCompact={onToggleCompact}
          />
        </div>
      </div>
    </>
  );
}

interface SidebarContentProps {
  pathname: string;
  onLogout: () => void;
  onClose?: () => void;
  isMobile?: boolean;
  compact?: boolean;
  onToggleCompact?: () => void;
}

function SidebarContent({
  pathname,
  onLogout,
  onClose,
  isMobile = false,
  compact = false,
  onToggleCompact,
}: SidebarContentProps) {
  const { t } = useSimpleLanguage();

  const handleLogoClick = (e: React.MouseEvent) => {
    if (compact && !isMobile && onToggleCompact) {
      e.preventDefault();
      onToggleCompact();
    }
  };

  return (
    <>
      {/* Header */}
      <div
        className={classNames(
          "flex h-16 shrink-0 items-center w-full",
          compact ? "justify-center" : "gap-2"
        )}
      >
        <Link
          href="/dashboard"
          className={classNames(
            "flex items-center gap-x-3 rounded-xl transition-colors duration-200 hover:bg-[var(--color-surface)]",
            compact ? "justify-center px-0 py-0 w-12 h-12" : "px-2 py-1"
          )}
          onClick={handleLogoClick}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
            <img src="/logo.svg" alt="SehatScan Logo" className="h-6 w-6" />
          </div>
          {!compact && (
            <span className="font-poppins font-bold text-xl text-[var(--color-heading)]">
              SehatScan
            </span>
          )}
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {!isMobile && !compact && (
            <button
              type="button"
              onClick={onToggleCompact}
              className="hidden lg:inline-flex flex-none items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
              aria-label="Collapse sidebar"
            >
              <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />
            </button>
          )}
          {isMobile && (
            <button
              type="button"
              className="lg:hidden p-2 text-[var(--color-muted)]"
              onClick={onClose}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      {/* Sidebar search */}
      {!isMobile && (
        <div
          className={classNames("w-full", compact ? "flex justify-center" : "")}
        >
          <div
            className={classNames(
              "flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-200",
              compact ? "h-12 w-12 justify-center" : "px-3 py-2.5 gap-3 w-full"
            )}
          >
            <MagnifyingGlassIcon className="h-5 w-5 text-[var(--color-muted)]" />
            {!compact && (
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-transparent text-sm text-[var(--color-heading)] placeholder:text-[var(--color-subtle)] focus:outline-none"
              />
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="mt-4 flex flex-1 flex-col w-full">
        <ul role="list" className="flex flex-1 flex-col gap-y-6 w-full">
          <li>
            <ul role="list" className="space-y-2 w-full">
              {navigationItems.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <li
                    key={item.nameKey}
                    className="animate-slide-in-left"
                    style={{ animationDelay: `${index * 0.08}s` }}
                  >
                    <Link
                      href={item.href}
                      onClick={isMobile ? onClose : undefined}
                      className={classNames(
                        "group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold leading-6 transition-all duration-200 border border-transparent w-full",
                        compact ? "justify-center" : "gap-3",
                        isActive
                          ? "bg-[var(--color-primary)] text-white "
                          : "text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-heading)] hover:border-[var(--color-border)]"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <item.icon
                        className={classNames(
                          "h-5 w-5 shrink-0 transition-colors duration-200",
                          isActive
                            ? "text-white"
                            : "text-[var(--color-muted)] group-hover:text-[var(--color-primary)]"
                        )}
                        aria-hidden="true"
                      />
                      {!compact && (
                        <span className="group-hover:translate-x-1 transition-transform duration-150">
                          {t(item.nameKey)}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>

          {/* Logout button at bottom */}
          <li className="mt-auto pt-2">
            <button
              onClick={onLogout}
              className={classNames(
                "group flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-semibold leading-6 border border-transparent transition-all duration-200",
                compact ? "justify-center" : "gap-3",
                "text-[var(--color-muted)] hover:text-[var(--color-danger)] hover:bg-[color-mix(in srgb, var(--color-danger) 8%, transparent)] hover:border-[var(--color-danger)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-danger)] focus:ring-offset-2"
              )}
              aria-label="Sign out of your account"
            >
              <ArrowRightOnRectangleIcon
                className="h-5 w-5 shrink-0 transition-colors duration-200 group-hover:text-[var(--color-danger)] text-[var(--color-muted)]"
                aria-hidden="true"
              />
              {!compact && (
                <span className="group-hover:translate-x-1 transition-transform duration-150">
                  Logout
                </span>
              )}
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [compactSidebar, setCompactSidebar] = useState(false);
  const { t } = useSimpleLanguage();

  useEffect(() => {
    if (!isLoaded) return; // Still loading

    if (!user) {
      router.push("/login");
      return;
    }
  }, [user, isLoaded, router]);

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#037BFC]"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  // Convert Clerk user to expected format
  const userForComponents = {
    name:
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.firstName || user.username || "User",
    email: user.emailAddresses[0]?.emailAddress || "",
    image: user.imageUrl || null,
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-foreground)]">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        compact={compactSidebar}
        onToggleCompact={() => setCompactSidebar((prev) => !prev)}
      />

      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 backdrop-blur-md bg-[var(--color-card)]/90 px-4 py-4  sm:px-6 lg:hidden border-b border-[var(--color-border)]">
        <button
          type="button"
          className="p-2 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all duration-200 hover:-translate-y-[1px] text-[var(--color-foreground)] lg:hidden focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation menu"
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="flex-1 text-lg font-semibold leading-6 text-[var(--color-heading)] font-poppins">
          {t("dashboard.title")}
        </div>

        {/* Mobile user avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white font-semibold text-sm ">
          {userForComponents?.name
            ? userForComponents.name.charAt(0).toUpperCase()
            : userForComponents?.email?.charAt(0).toUpperCase() || "U"}
        </div>
      </div>

      {/* Main content */}
      <main
        className={classNames(
          "transition-[padding] duration-300",
          compactSidebar ? "lg:pl-16" : "lg:pl-72"
        )}
      >
        {/* Top Navbar */}
        <div className="sticky top-0 z-30 backdrop-blur-md bg-[var(--color-card)]/95 border-b border-[var(--color-border)]">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              {/* Left side - Page title and breadcrumb */}
              <div className="flex items-center gap-4">
                <div className="hidden lg:block">
                  <h1 className="text-2xl font-bold text-[var(--color-heading)] font-poppins">
                    {t("dashboard.title")}
                  </h1>
                  <p className="text-sm text-[var(--color-subtle)] mt-1">
                    {t("dashboard.subtitle")}
                  </p>
                </div>
              </div>

              {/* Right side - Actions and user info */}
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <NotificationsDropdown />

                {/* Search */}
                <button
                  onClick={() => setSearchOpen(true)}
                  className="group relative p-2 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all duration-200 hover:-translate-y-[1px]"
                >
                  <svg
                    className="h-5 w-5 text-[var(--color-muted)] group-hover:text-[var(--color-primary)] transition-colors duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>

                {/* Language Selector */}
                <LanguageSelector />

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Profile Dropdown */}
                <ProfileDropdown user={userForComponents || {}} />
              </div>
            </div>
          </div>
        </div>

        <ErrorBoundary>
          <div className="animate-fade-in-up">{children}</div>
        </ErrorBoundary>
      </main>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
