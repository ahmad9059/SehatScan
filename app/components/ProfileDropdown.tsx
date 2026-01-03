"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  UserIcon,
  ArrowRightOnRectangleIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";

interface ProfileDropdownProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    avatar?: string | null;
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

  const avatarUrl = user?.avatar || user?.image || null;
  const fallbackInitial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "U";

  const menuItems = [
    {
      icon: UserIcon,
      label: "Profile",
      description: "Manage your account",
      href: "/dashboard/profile",
    },
    {
      icon: ChatBubbleLeftRightIcon,
      label: "AI Assistant",
      description: "Chat with health AI",
      href: "/dashboard/chatbot",
    },
    {
      icon: ClockIcon,
      label: "History",
      description: "View past analyses",
      href: "/dashboard/history",
    },
    {
      icon: CameraIcon,
      label: "Scan Face",
      description: "Analyze facial health",
      href: "/dashboard/scan-face",
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
        className="flex items-center gap-3 p-2 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] transition-all duration-300 hover:scale-105 hover:shadow-[var(--shadow-soft)]"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] font-semibold text-sm shadow-lg group-hover:scale-110 transition-transform duration-300 overflow-hidden">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={user?.name || "User avatar"}
              className="h-full w-full object-cover"
            />
          ) : (
            fallbackInitial
          )}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition-colors duration-300">
            {user?.name || "User"}
          </p>
          <p className="text-xs text-[var(--color-subtle)]">Online</p>
        </div>
        <svg
          className={`h-4 w-4 text-[var(--color-muted)] group-hover:text-[var(--color-primary)] transition-all duration-300 ${
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
        <div className="absolute right-0 mt-2 w-80 bg-[var(--color-card)] rounded-2xl shadow-xl border border-[var(--color-border)] z-50 animate-fade-in">
          {/* User Info Header */}
          <div className="px-6 py-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] font-semibold text-lg shadow-lg overflow-hidden">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={user?.name || "User avatar"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  fallbackInitial
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-foreground)]">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-[var(--color-subtle)]">
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
                className="w-full px-6 py-3 text-left hover:bg-[var(--color-surface)] transition-colors flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-[var(--color-surface)]">
                  <item.icon className="h-4 w-4 text-[var(--color-muted)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-foreground)]">
                    {item.label}
                  </p>
                  <p className="text-xs text-[var(--color-subtle)]">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t border-[var(--color-border)] py-2">
            <button
              onClick={handleLogout}
              className="w-full px-6 py-3 text-left hover:bg-[color-mix(in srgb, var(--color-danger) 10%, transparent)] transition-colors flex items-center gap-3 text-[var(--color-danger)]"
            >
              <div className="p-2 rounded-lg bg-[color-mix(in srgb, var(--color-danger) 12%, transparent)]">
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
