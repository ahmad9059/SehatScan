"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ErrorBoundary from "../components/ErrorBoundary";
import { showErrorToast } from "@/lib/toast";
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
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform animate-slide-in-left">
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
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 px-6 pb-4">
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
      <div className="flex items-center gap-x-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 px-3 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#037BFC] text-white font-semibold">
          {user?.name
            ? user.name.charAt(0).toUpperCase()
            : user?.email?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {user?.name || "User"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {user?.email}
          </p>
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
                          ? "bg-[#037BFC]/10 text-[#037BFC] dark:bg-[#037BFC]/20"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[#037BFC]",
                        "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 transition-all focus:outline-none focus:ring-2 focus:ring-[#037BFC] focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <item.icon
                        className={classNames(
                          isActive
                            ? "text-[#037BFC]"
                            : "text-gray-400 group-hover:text-[#037BFC]",
                          "h-6 w-6 shrink-0 transition-colors"
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
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
              className="group flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800"
              aria-label="Sign out of your account"
            >
              <ArrowRightOnRectangleIcon
                className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors"
                aria-hidden="true"
              />
              Logout
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

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push("/login");
      return;
    }
  }, [session, status, router]);

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
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white dark:bg-gray-800 px-4 py-4 shadow-sm sm:px-6 lg:hidden border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#037BFC] focus:ring-offset-2"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation menu"
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 text-gray-900 dark:text-white font-poppins">
          Dashboard
        </div>
      </div>

      {/* Main content */}
      <main className="lg:pl-72">
        <ErrorBoundary>
          <div className="animate-fade-in-up">{children}</div>
        </ErrorBoundary>
      </main>
    </div>
  );
}
