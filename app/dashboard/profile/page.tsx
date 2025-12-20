"use client";

import { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { getUserStats } from "@/app/actions/profile";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import {
  UserIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowRightOnRectangleIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  ClockIcon,
  SparklesIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

interface UserStats {
  totalAnalyses: number;
}

function ProfilePageContent() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [userStats, setUserStats] = useState<UserStats>({ totalAnalyses: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

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

  const handleLogout = async () => {
    try {
      await signOut({ redirectUrl: "/" });
    } catch (error) {
      console.error("Logout error:", error);
      showErrorToast("Failed to log out. Please try again.");
    }
  };

  const formatJoinDate = (dateString: string | Date) => {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 px-4 py-10 sm:px-6 lg:px-8 flex items-center justify-center animate-fade-in-up">
        <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-12 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-gray-100 dark:border-gray-700/50 overflow-hidden max-w-md w-full">
          <div className="relative z-10 text-center">
            <div className="p-4 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-2xl mx-auto w-fit mb-6">
              <UserIcon className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-poppins mb-3">
              Authentication Required
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Please log in to access your profile
            </p>
          </div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 px-4 py-10 sm:px-6 lg:px-8 animate-fade-in-up">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 mb-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                <UserIcon className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  Profile & Settings
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                  Manage your account information and preferences
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* User Information Card */}
          <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-6 mb-8">
                <div className="group/avatar relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 text-white text-3xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:rotate-3 overflow-hidden">
                    <div className="relative z-10">{userInitial}</div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <SparklesIcon className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-poppins group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                    {userName}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <EnvelopeIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                      {userEmail}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <ClockIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Member since{" "}
                      {user.createdAt
                        ? formatJoinDate(user.createdAt)
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Management */}
                <div className="group/field relative bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
                        <UserIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Profile Management
                      </label>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Manage your profile information and settings through
                      Clerk's secure interface.
                    </p>
                    <button
                      onClick={() =>
                        window.open("https://accounts.clerk.dev/user", "_blank")
                      }
                      className="group/btn relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-xl transition-all duration-300 text-sm font-semibold transform hover:scale-105 hover:rotate-1 border border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600"
                    >
                      <div className="relative z-10 flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        Manage Profile
                      </div>
                    </button>
                  </div>
                </div>

                {/* Email Verification Status */}
                <div className="group/field relative bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-lg">
                        <EnvelopeIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Email Status
                      </label>
                    </div>
                    <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {userEmail}
                    </div>
                    <div className="flex items-center gap-1">
                      <ShieldCheckIcon className="h-3 w-3 text-emerald-500" />
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        {user.emailAddresses[0]?.verification?.status ===
                        "verified"
                          ? "Verified & Protected"
                          : "Verification Pending"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Statistics Card */}
          <div
            className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                  <ChartBarIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-poppins group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                    Account Statistics
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                    Your health journey overview
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group/stat relative bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-emerald-100 dark:border-emerald-800/50 overflow-hidden">
                  <div className="relative z-10 text-center">
                    <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-xl mx-auto w-fit mb-4 group-hover/stat:scale-110 transition-transform duration-300">
                      <DocumentTextIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2 group-hover/stat:scale-110 transition-transform duration-300">
                      {isLoadingStats ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        userStats.totalAnalyses
                      )}
                    </div>
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover/stat:text-emerald-600 dark:group-hover/stat:text-emerald-400 transition-colors duration-300">
                      Total Analyses
                    </div>
                    <div className="w-full bg-emerald-200/60 dark:bg-emerald-700/60 rounded-full h-2 mt-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-1000 group-hover/stat:from-emerald-600 group-hover/stat:to-green-600"
                        style={{
                          width: `${Math.min(
                            (userStats.totalAnalyses / 50) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="group/stat relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-blue-100 dark:border-blue-800/50 overflow-hidden">
                  <div className="relative z-10 text-center">
                    <div className="p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl mx-auto w-fit mb-4 group-hover/stat:scale-110 transition-transform duration-300">
                      <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2 group-hover/stat:scale-110 transition-transform duration-300">
                      {user.createdAt
                        ? Math.floor(
                            (Date.now() - new Date(user.createdAt).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )
                        : 0}
                    </div>
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover/stat:text-blue-600 dark:group-hover/stat:text-blue-400 transition-colors duration-300">
                      Days Active
                    </div>
                    <div className="w-full bg-blue-200/60 dark:bg-blue-700/60 rounded-full h-2 mt-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-1000 group-hover/stat:from-blue-600 group-hover/stat:to-indigo-600"
                        style={{
                          width: `${Math.min(
                            ((user.createdAt
                              ? Math.floor(
                                  (Date.now() -
                                    new Date(user.createdAt).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )
                              : 0) /
                              365) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="group/stat relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-purple-100 dark:border-purple-800/50 overflow-hidden">
                  <div className="relative z-10 text-center">
                    <div className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl mx-auto w-fit mb-4 group-hover/stat:scale-110 transition-transform duration-300">
                      <ShieldCheckIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2 group-hover/stat:scale-110 transition-transform duration-300">
                      Active
                    </div>
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover/stat:text-purple-600 dark:group-hover/stat:text-purple-400 transition-colors duration-300">
                      Account Status
                    </div>
                    <div className="w-full bg-purple-200/60 dark:bg-purple-700/60 rounded-full h-2 mt-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000 group-hover/stat:from-purple-600 group-hover/stat:to-pink-600 w-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logout Section */}
          <div
            className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                    <ArrowRightOnRectangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-poppins group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                      Sign Out
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                      Sign out of your account on this device
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="group/btn relative bg-gradient-to-br from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 text-base font-semibold transform hover:scale-105 hover:rotate-1 shadow-lg hover:shadow-xl overflow-hidden"
                >
                  <div className="relative z-10 flex items-center gap-2">
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    Sign Out
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
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
