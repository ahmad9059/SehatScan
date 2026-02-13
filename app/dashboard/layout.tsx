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
import LogoSpinner from "../components/LogoSpinner";
import {
  Bars3Icon,
  XMarkIcon,
  XMarkIcon as XIcon,
} from "@heroicons/react/24/outline";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faCamera,
  faFileLines,
  faTriangleExclamation,
  faClockRotateLeft,
  faUser,
  faHeadset,
  faRightFromBracket,
  faArrowRightFromBracket,
  faMagnifyingGlass,
  faArrowUpRightFromSquare,
  faMessage,
  faQrcode,
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

// Notification Card Component for Sidebar
function NotificationCard() {
  const [isVisible, setIsVisible] = useState(true);
  const { t } = useSimpleLanguage();

  if (!isVisible) return null;

  return (
    <div className="relative p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 p-1 rounded-md text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-card)] transition-colors"
        aria-label="Dismiss notification"
      >
        <XIcon className="h-4 w-4" />
      </button>

      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-green-500/20 text-green-500 mb-3">
        {t("sidebar.new")}
      </span>

      <h4 className="font-semibold text-[var(--color-heading)] text-sm mb-1">
        {t("sidebar.aiHealthInsights")}
      </h4>
      <p className="text-xs text-[var(--color-muted)] mb-3">
        {t("sidebar.aiHealthInsightsDesc")}
      </p>

      <a
        href="/dashboard/chatbot"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-xs font-medium text-[var(--color-foreground)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
      >
        {t("sidebar.tryItOut")}
        <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-3 w-3" />
      </a>
    </div>
  );
}

interface NavigationItem {
  nameKey: string;
  href?: string;
  icon: IconDefinition;
  children?: { nameKey: string; href: string; icon: IconDefinition }[];
  hasDividerAfter?: boolean;
}

const navigationItems: NavigationItem[] = [
  { nameKey: "nav.dashboard", href: "/dashboard", icon: faHouse },
  {
    nameKey: "nav.scan",
    icon: faQrcode,
    children: [
      { nameKey: "nav.scanFace", href: "/dashboard/scan-face", icon: faCamera },
      {
        nameKey: "nav.scanReport",
        href: "/dashboard/scan-report",
        icon: faFileLines,
      },
    ],
  },
  {
    nameKey: "nav.riskAssessment",
    href: "/dashboard/health-check",
    icon: faTriangleExclamation,
  },
  {
    nameKey: "nav.chatbot",
    href: "/dashboard/chatbot",
    icon: faMessage,
  },
  {
    nameKey: "nav.history",
    href: "/dashboard/history",
    icon: faClockRotateLeft,
    hasDividerAfter: true, // Divider after History, before Profile
  },
  { nameKey: "nav.profile", href: "/dashboard/profile", icon: faUser },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  compact: boolean;
  onToggleCompact: () => void;
  onOpenSearch: () => void;
  avatar?: string | null;
  userInitial?: string;
}

function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  compact,
  onToggleCompact,
  onOpenSearch,
  avatar,
  userInitial,
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
              onOpenSearch={() => {
                setSidebarOpen(false);
                onOpenSearch();
              }}
              avatar={avatar}
              userInitial={userInitial}
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
            onOpenSearch={onOpenSearch}
            avatar={avatar}
            userInitial={userInitial}
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
  onOpenSearch?: () => void;
  avatar?: string | null;
  userInitial?: string;
}

function SidebarContent({
  pathname,
  onLogout,
  onClose,
  isMobile = false,
  compact = false,
  onToggleCompact,
  onOpenSearch,
  avatar,
  userInitial,
}: SidebarContentProps) {
  const { t } = useSimpleLanguage();
  const [scanMenuOpen, setScanMenuOpen] = useState(true); // Open by default

  // Auto-expand scan menu if on a scan page
  useEffect(() => {
    if (pathname.includes("/dashboard/scan-")) {
      setScanMenuOpen(true);
    }
  }, [pathname]);

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
            <span className=" font-bold text-xl text-[var(--color-heading)]">
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
              <FontAwesomeIcon
                icon={faArrowRightFromBracket}
                className="h-4 w-4 rotate-180"
              />
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
          <button
            type="button"
            onClick={onOpenSearch}
            className={classNames(
              "flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-200 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] cursor-pointer",
              compact ? "h-12 w-12 justify-center" : "px-3 py-2.5 gap-3 w-full"
            )}
          >
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="h-4 w-4 text-[var(--color-muted)]"
            />
            {!compact && (
              <span className="flex-1 text-left text-sm text-[var(--color-subtle)]">
                {t("nav.search")}
              </span>
            )}
            {!compact && (
              <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-[var(--color-border)] bg-[var(--color-card)] px-1.5 py-0.5 text-xs text-[var(--color-muted)]">
                ⌘ K
              </kbd>
            )}
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="mt-4 flex flex-1 flex-col w-full">
        <ul role="list" className="flex flex-1 flex-col gap-y-4 w-full">
          <li>
            <ul role="list" className="space-y-2 w-full">
              {navigationItems.map((item, index) => {
                const isProfile = item.href === "/dashboard/profile";
                const isActive = item.href ? pathname === item.href : false;
                const hasChildren = item.children && item.children.length > 0;
                const isChildActive =
                  hasChildren && item.children
                    ? item.children.some((child) => pathname === child.href)
                    : false;

                return (
                  <li key={item.nameKey}>
                    {hasChildren ? (
                      // Collapsible menu item
                      <>
                        <button
                          onClick={() => setScanMenuOpen(!scanMenuOpen)}
                          className={classNames(
                            "group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 border border-transparent w-full",
                            compact ? "justify-center" : "gap-3",
                            isChildActive
                              ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                              : "text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-heading)] hover:border-[var(--color-border)]"
                          )}
                        >
                          <span className="flex items-center justify-center w-5">
                            <FontAwesomeIcon
                              icon={item.icon}
                              className={classNames(
                                "h-[18px] w-[18px] shrink-0",
                                isChildActive
                                  ? "text-[var(--color-primary)]"
                                  : "text-[var(--color-muted)] group-hover:text-[var(--color-primary)]"
                              )}
                              aria-hidden="true"
                            />
                          </span>
                          {!compact && (
                            <>
                              <span className="flex-1 text-left">
                                {t("nav.scan")}
                              </span>
                              <FontAwesomeIcon
                                icon={
                                  scanMenuOpen ? faChevronDown : faChevronRight
                                }
                                className="h-3 w-3 text-[var(--color-muted)]"
                              />
                            </>
                          )}
                        </button>
                        {/* Sub-menu items */}
                        {scanMenuOpen && !compact && item.children && (
                          <ul className="mt-1 ml-5 space-y-1 border-l border-[var(--color-border)] pl-3">
                            {item.children.map((child) => {
                              const isSubActive = pathname === child.href;
                              return (
                                <li key={child.nameKey}>
                                  <Link
                                    href={child.href}
                                    onClick={isMobile ? onClose : undefined}
                                    className={classNames(
                                      "group relative flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 w-full",
                                      "gap-3",
                                      isSubActive
                                        ? "bg-[var(--color-primary)] text-white"
                                        : "text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-heading)]"
                                    )}
                                  >
                                    <span className="flex items-center justify-center w-4">
                                      <FontAwesomeIcon
                                        icon={child.icon}
                                        className={classNames(
                                          "h-[14px] w-[14px] shrink-0",
                                          isSubActive
                                            ? "text-white"
                                            : "text-[var(--color-muted)] group-hover:text-[var(--color-primary)]"
                                        )}
                                        aria-hidden="true"
                                      />
                                    </span>
                                    <span>{t(child.nameKey)}</span>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </>
                    ) : (
                      // Regular menu item
                      <Link
                        href={item.href!}
                        onClick={isMobile ? onClose : undefined}
                        className={classNames(
                          "group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 border border-transparent w-full",
                          compact ? "justify-center" : "gap-3",
                          isActive
                            ? "bg-[var(--color-primary)] text-white "
                            : "text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-heading)] hover:border-[var(--color-border)]"
                        )}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {isProfile && avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={avatar}
                            alt="Profile avatar"
                            className={classNames(
                              "h-6 w-6 shrink-0 rounded-full object-cover",
                              isActive ? "ring-2 ring-white/70" : ""
                            )}
                          />
                        ) : (
                          <span className="flex items-center justify-center w-5">
                            <FontAwesomeIcon
                              icon={item.icon}
                              className={classNames(
                                "h-[18px] w-[18px] shrink-0",
                                isActive
                                  ? "text-white"
                                  : "text-[var(--color-muted)] group-hover:text-[var(--color-primary)]"
                              )}
                              aria-hidden="true"
                            />
                          </span>
                        )}
                        {!compact && <span>{t(item.nameKey)}</span>}
                      </Link>
                    )}
                    {/* Divider after items with hasDividerAfter */}
                    {item.hasDividerAfter && !compact && (
                      <div className="my-4 mx-auto w-4/5 border-t border-[var(--color-border)]" />
                    )}
                  </li>
                );
              })}
            </ul>
          </li>

          {/* Notification Card */}
          {!compact && (
            <li className="mt-auto">
              <NotificationCard />
            </li>
          )}

          {/* Support and Logout buttons grouped together */}
          <li className={compact ? "mt-auto space-y-1" : "space-y-1"}>
            <Link
              href="/dashboard/help"
              className={classNames(
                "group flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium border border-transparent transition-all duration-200",
                compact ? "justify-center" : "gap-3",
                "text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-heading)] hover:border-[var(--color-border)]"
              )}
            >
              <span className="flex items-center justify-center w-5">
                <FontAwesomeIcon
                  icon={faHeadset}
                  className="h-[18px] w-[18px] shrink-0 text-[var(--color-muted)] group-hover:text-[var(--color-primary)]"
                  aria-hidden="true"
                />
              </span>
              {!compact && <span>{t("nav.helpSupport")}</span>}
            </Link>
            <button
              onClick={onLogout}
              className={classNames(
                "group flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium border border-transparent transition-all duration-200",
                compact ? "justify-center" : "gap-3",
                "text-[var(--color-muted)] hover:text-[var(--color-danger)] hover:bg-[color-mix(in srgb, var(--color-danger) 8%, transparent)] hover:border-[var(--color-danger)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-danger)] focus:ring-offset-2"
              )}
              aria-label="Sign out of your account"
            >
              <span className="flex items-center justify-center w-5">
                <FontAwesomeIcon
                  icon={faRightFromBracket}
                  className="h-[18px] w-[18px] shrink-0 group-hover:text-[var(--color-danger)] text-[var(--color-muted)]"
                  aria-hidden="true"
                />
              </span>
              {!compact && <span>{t("nav.logout")}</span>}
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
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [compactSidebar, setCompactSidebar] = useState(false);
  const { t } = useSimpleLanguage();

  // Get page title and subtitle based on current route
  const getPageInfo = () => {
    const routes: Record<string, { title: string; subtitle: string }> = {
      "/dashboard": {
        title: t("nav.dashboard"),
        subtitle: t("dashboard.subtitle"),
      },
      "/dashboard/scan-face": {
        title: t("nav.scanFace"),
        subtitle: t("page.scanFaceSubtitle"),
      },
      "/dashboard/scan-report": {
        title: t("nav.scanReport"),
        subtitle: t("page.scanReportSubtitle"),
      },
      "/dashboard/health-check": {
        title: t("nav.riskAssessment"),
        subtitle: t("page.riskAssessmentSubtitle"),
      },
      "/dashboard/risk-assessment": {
        title: t("nav.riskAssessment"),
        subtitle: t("page.riskAssessmentSubtitle"),
      },
      "/dashboard/chatbot": {
        title: t("nav.chatbot"),
        subtitle: t("page.chatbotSubtitle"),
      },
      "/dashboard/history": {
        title: t("nav.history"),
        subtitle: t("page.historySubtitle"),
      },
      "/dashboard/profile": {
        title: t("nav.profile"),
        subtitle: t("page.profileSubtitle"),
      },
      "/dashboard/help": {
        title: t("nav.helpSupport"),
        subtitle: t("page.helpSubtitle"),
      },
    };
    return (
      routes[pathname] || {
        title: t("nav.dashboard"),
        subtitle: t("dashboard.subtitle"),
      }
    );
  };

  const pageInfo = getPageInfo();

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
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center pb-[10%]">
        <LogoSpinner message={t("dashboard.loadingDashboard")} />
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
    avatar:
      (
        (user.unsafeMetadata as Record<string, unknown> | undefined) ||
        (user.publicMetadata as Record<string, unknown> | undefined)
      )?.avatarUrl?.toString() || null,
    image: user.imageUrl || null,
    initial:
      user.firstName?.charAt(0).toUpperCase() ||
      user.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase() ||
      "U",
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-foreground)]">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        compact={compactSidebar}
        onToggleCompact={() => setCompactSidebar((prev) => !prev)}
        onOpenSearch={() => setSearchOpen(true)}
        avatar={userForComponents.avatar || userForComponents.image || null}
        userInitial={userForComponents.initial}
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
        <div className="flex-1 text-lg font-semibold leading-6 text-[var(--color-heading)] ">
          {pageInfo.title}
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
              {/* Left side - Dynamic page title */}
              <div className="flex items-center gap-4">
                <div className="hidden lg:block">
                  <h1 className="text-2xl font-bold text-[var(--color-heading)] ">
                    {pageInfo.title}
                  </h1>
                  <p className="text-sm text-[var(--color-subtle)] mt-1">
                    {pageInfo.subtitle}
                  </p>
                </div>
              </div>

              {/* Right side - Actions and user info */}
              <div className="flex items-center gap-2">
                {/* Notifications */}
                <NotificationsDropdown />

                {/* Search */}
                <button
                  onClick={() => setSearchOpen(true)}
                  className="group relative p-2.5 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-primary-soft)] transition-all duration-200"
                  title="Search (⌘K)"
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

                {/* Divider */}
                <div className="h-8 w-px bg-[var(--color-border)] mx-1" />

                {/* Language Selector */}
                <LanguageSelector />

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Divider */}
                <div className="h-8 w-px bg-[var(--color-border)] mx-1" />

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
