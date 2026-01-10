"use client";

import { useState, useRef, useEffect } from "react";
import { BellIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSimpleLanguage } from "./SimpleLanguageContext";

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  titleKey: string;
  messageKey: string;
  timestamp: Date;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "success",
    titleKey: "notifications.analysisComplete",
    messageKey: "Your facial health analysis has been completed successfully.",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
  },
  {
    id: "2",
    type: "info",
    titleKey: "notifications.newFeature",
    messageKey:
      "Risk assessment tool now includes cardiovascular health metrics.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: "3",
    type: "warning",
    titleKey: "notifications.profileIncomplete",
    messageKey:
      "Please complete your health profile for better analysis accuracy.",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
  },
];

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t, language } = useSimpleLanguage();

  const unreadCount = notifications.filter((n) => !n.read).length;

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return (
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <svg
              className="w-5 h-5 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      case "warning":
        return (
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-500/10 ring-1 ring-amber-500/20">
            <svg
              className="w-5 h-5 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-red-50 dark:bg-red-500/10 ring-1 ring-red-500/20">
            <svg
              className="w-5 h-5 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-500/10 ring-1 ring-blue-500/20">
            <svg
              className="w-5 h-5 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (language === "ur") {
      if (minutes < 60) return `${minutes} منٹ پہلے`;
      if (hours < 24) return `${hours} گھنٹے پہلے`;
      return `${days} دن پہلے`;
    }

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notifications Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative p-2.5 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-primary-soft)] transition-all duration-200"
        title="Notifications"
      >
        <BellIcon className="h-5 w-5 text-[var(--color-muted)] group-hover:text-[var(--color-primary)] transition-colors duration-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-primary)] opacity-50"></span>
            <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-[var(--color-primary)] ring-2 ring-[var(--color-card)]"></span>
          </span>
        )}
      </button>

      {/* Dropdown Menu - Redesigned */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[400px] bg-[var(--color-card)] rounded-2xl shadow-2xl border border-[var(--color-border)] z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-[var(--color-card)] to-[var(--color-surface)]/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[var(--color-heading)]">
                  {t("notifications.title")}
                </h3>
                <p className="text-sm text-[var(--color-muted)] mt-0.5">
                  {unreadCount > 0
                    ? unreadCount === 1
                      ? t("notifications.unreadCount").replace(
                          "{{count}}",
                          String(unreadCount)
                        )
                      : t("notifications.unreadCountPlural").replace(
                          "{{count}}",
                          String(unreadCount)
                        )
                    : t("notifications.allCaughtUp")}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-strong)] font-semibold transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--color-primary)]/10"
                >
                  {t("notifications.markAllRead")}
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length > 0 ? (
              <div>
                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className={`relative px-5 py-4 transition-all duration-200 hover:bg-[var(--color-surface)]/50 group/item ${
                      index !== notifications.length - 1
                        ? "border-b border-[var(--color-border)]/50"
                        : ""
                    }`}
                  >
                    {/* Unread indicator bar */}
                    {!notification.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-primary)] rounded-r-full" />
                    )}

                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className="shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p
                              className={`text-sm font-semibold text-[var(--color-heading)] ${
                                !notification.read ? "" : "opacity-80"
                              }`}
                            >
                              {t(notification.titleKey)}
                            </p>
                            <p className="text-sm text-[var(--color-muted)] mt-1.5 leading-relaxed">
                              {notification.messageKey}
                            </p>
                            <p className="text-xs text-[var(--color-muted)]/70 mt-2 font-medium">
                              {formatTimestamp(notification.timestamp)}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-emerald-500 hover:bg-emerald-500/10 transition-all"
                                title="Mark as read"
                              >
                                <CheckIcon className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                deleteNotification(notification.id)
                              }
                              className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all"
                              title="Dismiss"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-12 text-center">
                <div className="w-14 h-14 rounded-full bg-[var(--color-surface)] flex items-center justify-center mx-auto mb-4">
                  <BellIcon className="h-7 w-7 text-[var(--color-muted)]" />
                </div>
                <p className="text-sm font-medium text-[var(--color-muted)]">
                  {t("notifications.noNotifications")}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-5 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface)]/30">
              <button className="w-full text-center text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-strong)] font-semibold transition-colors py-1.5 rounded-lg hover:bg-[var(--color-primary)]/10">
                {t("notifications.viewAll")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
