"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

interface ProfileDropdownProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function ProfileDropdown({ user }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { signOut } = useClerk();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut({ redirectUrl: "/" });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const menuItems = [
    {
      icon: UserIcon,
      label: "Profile",
      description: "Manage your account",
      href: "/dashboard/profile",
    },
    {
      icon: Cog6ToothIcon,
      label: "Settings",
      description: "Preferences and privacy",
      href: "/dashboard/settings",
    },
    {
      icon: BellIcon,
      label: "Notifications",
      description: "Manage notifications",
      href: "/dashboard/notifications",
    },
    {
      icon: ShieldCheckIcon,
      label: "Security",
      description: "Password and security",
      href: "/dashboard/security",
    },
    {
      icon: QuestionMarkCircleIcon,
      label: "Help & Support",
      description: "Get help and support",
      href: "/dashboard/help",
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 hover:scale-105 hover:shadow-lg"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#037BFC] to-indigo-500 text-white font-semibold text-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
          {user?.name
            ? user.name.charAt(0).toUpperCase()
            : user?.email?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#037BFC] dark:group-hover:text-blue-400 transition-colors duration-300">
            {user?.name || "User"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
        </div>
        <svg
          className={`h-4 w-4 text-gray-400 group-hover:text-[#037BFC] dark:group-hover:text-blue-400 transition-all duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl z-50 animate-fade-in">
          {/* User Info Header */}
          <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#037BFC] to-indigo-500 text-white font-semibold text-lg shadow-lg">
                {user?.name
                  ? user.name.charAt(0).toUpperCase()
                  : user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  router.push(item.href);
                  setIsOpen(false);
                }}
                className="w-full px-6 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                  <item.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t border-gray-200/50 dark:border-gray-700/50 py-2">
            <button
              onClick={handleLogout}
              className="w-full px-6 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3 text-red-600 dark:text-red-400"
            >
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Sign out</p>
                <p className="text-xs opacity-75">Sign out of your account</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
