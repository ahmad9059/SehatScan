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
import { useSimpleLanguage } from "./SimpleLanguageContext";

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
  const { t } = useSimpleLanguage();

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
      labelKey: "nav.profile",
      descriptionKey: "page.profileSubtitle",
      href: "/dashboard/profile",
    },
    {
      icon: ChatBubbleLeftRightIcon,
      labelKey: "nav.chatbot",
      descriptionKey: "page.chatbotSubtitle",
      href: "/dashboard/chatbot",
    },
    {
      icon: ClockIcon,
      labelKey: "nav.history",
      descriptionKey: "page.historySubtitle",
      href: "/dashboard/history",
    },
    {
      icon: CameraIcon,
      labelKey: "nav.scanFace",
      descriptionKey: "page.scanFaceSubtitle",
      href: "/dashboard/scan-face",
    },
    {
      icon: QuestionMarkCircleIcon,
      labelKey: "nav.helpSupport",
      descriptionKey: "page.helpSubtitle",
      href: "/dashboard/help",
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 py-1.5 pl-1.5 pr-3 rounded-full bg-[var(--color-surface)] hover:bg-[var(--color-primary-soft)] border border-[var(--color-border)] hover:border-[var(--color-primary-soft)] transition-all duration-200"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-white font-semibold text-sm overflow-hidden">
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
          <p className="text-sm font-semibold text-[var(--color-foreground)] leading-tight">
            {user?.name || "User"}
          </p>
          <p className="text-xs text-[var(--color-success)] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]"></span>
            {t("common.online")}
          </p>
        </div>
        <svg
          className={`h-4 w-4 text-[var(--color-muted)] transition-transform duration-200 ${
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
                key={item.labelKey}
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
                    {t(item.labelKey)}
                  </p>
                  <p className="text-xs text-[var(--color-subtle)]">
                    {t(item.descriptionKey)}
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
                <p className="text-sm font-medium">{t("nav.logout")}</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
