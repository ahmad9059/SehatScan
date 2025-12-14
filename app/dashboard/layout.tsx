"use client";

import { useSession, signOut } from "next-auth/react";
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
import { useTheme } from "next-themes";
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
} from "@heroicons/react/24/outline";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const navigation: NavigationItem[] = [
  { name: "Dashboard Home", href: "/dashboard", icon: HomeIcon },
  {
    name: "Scan Report",
    href: "/dashboard/scan-report",
    icon: DocumentTextIcon,
  },
  { name: "Scan Face", href: "/dashboard/scan-face", icon: CameraIcon },
  {
    name: "Risk Assessment",
    href: "/dashboard/risk-assessment",
    icon: ExclamationTriangleIcon,
  },
  { name: "History", href: "/dashboard/history", icon: ClockIcon },
  { name: "Profile", href: "/dashboard/profile", icon: UserIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  user: any;
}

function Sidebar({ sidebarOpen, setSidebarOpen, user }: SidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/" });
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
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 transform transition-transform animate-slide-in-left shadow-2xl">
            <SidebarContent
              pathname={pathname}
              user={user}
              onLogout={handleLogout}
              onClose={() => setSidebarOpen(false)}
              isMobile={true}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 px-6 pb-4 shadow-xl">
          <SidebarContent
            pathname={pathname}
            user={user}
            onLogout={handleLogout}
            isMobile={false}
          />
        </div>
      </div>
    </>
  );
}

interface SidebarContentProps {
  pathname: string;
  user: any;
  onLogout: () => void;
  onClose?: () => void;
  isMobile?: boolean;
}

function SidebarContent({
  pathname,
  user,
  onLogout,
  onClose,
  isMobile = false,
}: SidebarContentProps) {
  return (
    <>
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-x-3">
          <div className="flex h-8 w-8 items-center justify-center">
            <img
              src="/logo.svg"
              alt="SehatScan Logo"
              className="h-8 w-8 rounded-lg"
            />
          </div>
          <span className="font-poppins font-bold text-xl text-gray-900 dark:text-white">
            SehatScan
          </span>
        </Link>
        {isMobile && (
          <button
            type="button"
            className="lg:hidden p-2 text-gray-700 dark:text-gray-300"
            onClick={onClose}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700/50 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#037BFC]/5 via-transparent to-indigo-500/5"></div>
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#037BFC]/20 to-indigo-500/20 rounded-full blur-xl -translate-y-8 translate-x-8 group-hover:scale-125 transition-transform duration-500"></div>

        <div className="relative z-10 flex items-center gap-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#037BFC] to-indigo-500 text-white font-semibold shadow-lg group-hover:scale-110 transition-transform duration-300">
            {user?.name
              ? user.name.charAt(0).toUpperCase()
              : user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-[#037BFC] dark:group-hover:text-blue-400 transition-colors duration-300">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <li
                    key={item.name}
                    className="animate-slide-in-left"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Link
                      href={item.href}
                      onClick={isMobile ? onClose : undefined}
                      className={classNames(
                        isActive
                          ? "bg-gradient-to-r from-[#037BFC]/10 to-indigo-500/10 text-[#037BFC] dark:text-blue-400 border-r-2 border-[#037BFC]"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100/50 hover:to-slate-100/50 dark:hover:from-gray-700/50 dark:hover:to-gray-600/50 hover:text-[#037BFC] dark:hover:text-blue-400",
                        "group flex gap-x-3 rounded-2xl p-3 text-sm font-semibold leading-6 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#037BFC] focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 hover:shadow-md hover:scale-105 backdrop-blur-sm border border-transparent hover:border-gray-200/50 dark:hover:border-gray-600/50"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <div
                        className={classNames(
                          isActive
                            ? "bg-[#037BFC]/10 text-[#037BFC] dark:text-blue-400"
                            : "bg-gray-100/50 dark:bg-gray-700/50 text-gray-400 group-hover:bg-[#037BFC]/10 group-hover:text-[#037BFC] dark:group-hover:text-blue-400",
                          "p-2 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                        )}
                      >
                        <item.icon
                          className="h-5 w-5 shrink-0 transition-colors duration-300"
                          aria-hidden="true"
                        />
                      </div>
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {item.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>

          {/* Logout button at bottom */}
          <li className="mt-auto">
            <button
              onClick={onLogout}
              className="group flex w-full gap-x-3 rounded-2xl p-3 text-sm font-semibold leading-6 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50/50 hover:to-pink-50/50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 hover:shadow-md hover:scale-105 backdrop-blur-sm border border-transparent hover:border-red-200/50 dark:hover:border-red-600/50"
              aria-label="Sign out of your account"
            >
              <div className="p-2 rounded-xl bg-gray-100/50 dark:bg-gray-700/50 group-hover:bg-red-100/50 dark:group-hover:bg-red-900/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <ArrowRightOnRectangleIcon
                  className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300"
                  aria-hidden="true"
                />
              </div>
              <span className="group-hover:translate-x-1 transition-transform duration-300">
                Logout
              </span>
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push("/login");
      return;
    }
  }, [session, status, router]);

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
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#037BFC]"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={session.user}
      />

      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 px-4 py-4 shadow-sm sm:px-6 lg:hidden border-b border-gray-200/50 dark:border-gray-700/50">
        <button
          type="button"
          className="p-2 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 hover:scale-105 hover:shadow-lg text-gray-700 dark:text-gray-300 lg:hidden focus:outline-none focus:ring-2 focus:ring-[#037BFC] focus:ring-offset-2"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation menu"
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="flex-1 text-lg font-semibold leading-6 text-gray-900 dark:text-white font-poppins">
          Dashboard
        </div>

        {/* Mobile user avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#037BFC] to-indigo-500 text-white font-semibold text-sm shadow-lg">
          {session?.user?.name
            ? session.user.name.charAt(0).toUpperCase()
            : session?.user?.email?.charAt(0).toUpperCase() || "U"}
        </div>
      </div>

      {/* Main content */}
      <main className="lg:pl-72">
        {/* Top Navbar */}
        <div className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              {/* Left side - Page title and breadcrumb */}
              <div className="flex items-center gap-4">
                <div className="hidden lg:block">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-poppins">
                    Dashboard
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Welcome to your health analytics platform
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
                  className="group relative p-2 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <svg
                    className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-[#037BFC] dark:group-hover:text-blue-400 transition-colors duration-300"
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
                <ProfileDropdown user={session?.user || {}} />
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
