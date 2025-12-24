"use client";

import { useState, useRef, useEffect } from "react";
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "Analysis Complete",
    message: "Your facial health analysis has been completed successfully.",
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    read: false,
  },
  {
    id: "2",
    type: "info",
    title: "New Feature Available",
    message: "Risk assessment tool now includes cardiovascular health metrics.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
  },
  {
    id: "3",
    type: "warning",
    title: "Profile Incomplete",
    message:
      "Please complete your health profile for better analysis accuracy.",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
  },
  {
    id: "4",
    type: "info",
    title: "Weekly Report Ready",
    message: "Your weekly health summary is now available for download.",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    read: true,
  },
];

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "warning":
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <XMarkIcon className="h-5 w-5 text-red-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notifications Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative p-2 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all duration-150 hover:-translate-y-[1px]"
      >
        <BellIcon className="h-5 w-5 text-[var(--color-muted)] group-hover:text-[var(--color-primary)] transition-colors duration-150" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 h-5 w-5 bg-[var(--color-danger)] rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-semibold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-[var(--color-card)] rounded-xl shadow-[var(--shadow-soft)] border border-[var(--color-border)] z-50 animate-fade-in">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--color-heading)]">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-strong)] font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-[var(--color-subtle)] mt-1">
                You have {unreadCount} unread notification
                {unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="py-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-6 py-4 hover:bg-[var(--color-surface)] transition-colors border-l-4 ${
                      notification.read
                        ? "border-transparent"
                        : "border-[var(--color-primary)] bg-[color-mix(in srgb, var(--color-primary) 10%, transparent)]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-[var(--color-heading)]">
                              {notification.title}
                            </p>
                            <p className="text-sm text-[var(--color-foreground)] mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-[var(--color-subtle)] mt-2">
                              {formatTimestamp(notification.timestamp)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 rounded-lg hover:bg-[var(--color-surface)] transition-colors"
                                title="Mark as read"
                              >
                                <CheckIcon className="h-4 w-4 text-[var(--color-muted)]" />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                deleteNotification(notification.id)
                              }
                              className="p-1 rounded-lg hover:bg-[var(--color-surface)] transition-colors"
                              title="Delete notification"
                            >
                              <XMarkIcon className="h-4 w-4 text-[var(--color-muted)]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center">
                <BellIcon className="h-12 w-12 text-[var(--color-muted)] mx-auto mb-4" />
                <p className="text-[var(--color-subtle)]">
                  No notifications yet
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-6 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
              <button className="w-full text-center text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-strong)] font-medium">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
