"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  updateProfile,
  changePassword,
  getUserStats,
} from "@/app/actions/profile";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import {
  UserIcon,
  KeyIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowRightOnRectangleIcon,
  CheckIcon,
  XMarkIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  ClockIcon,
  SparklesIcon,
  PencilIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

interface UserStats {
  totalAnalyses: number;
}

function ProfilePageContent() {
  const { data: session, update } = useSession();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({ totalAnalyses: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getUserStats();
        setUserStats(stats);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    if (session?.user) {
      fetchStats();
    }
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showErrorToast("Name cannot be empty");
      return;
    }

    setIsUpdatingProfile(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());

      const result = await updateProfile(formData);

      if (result.success) {
        showSuccessToast("Profile updated successfully");
        setIsEditingName(false);

        // Update the session with new user data
        if (result.user) {
          await update({
            ...session,
            user: {
              ...session?.user,
              name: result.user.name,
            },
          });
        }
      } else {
        showErrorToast(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showErrorToast("Failed to update profile. Please try again.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showErrorToast("All password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      showErrorToast("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      showErrorToast("New password must be at least 6 characters long");
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const formData = new FormData();
      formData.append("currentPassword", currentPassword);
      formData.append("newPassword", newPassword);
      formData.append("confirmPassword", confirmPassword);

      const result = await changePassword(formData);

      if (result.success) {
        showSuccessToast("Password changed successfully");
        setIsChangingPassword(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showErrorToast(result.error || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      showErrorToast("Failed to change password. Please try again.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Logout error:", error);
      showErrorToast("Failed to log out. Please try again.");
    }
  };

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 px-4 py-10 sm:px-6 lg:px-8 flex items-center justify-center animate-fade-in-up">
        <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-12 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-gray-100 dark:border-gray-700/50 overflow-hidden max-w-md w-full">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-rose-500/5"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-400/20 to-rose-500/20 rounded-full blur-xl -translate-y-12 translate-x-12 group-hover:scale-125 transition-transform duration-500"></div>

          <div className="relative z-10 text-center">
            <div className="p-4 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-2xl mx-auto w-fit mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
              <UserIcon className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-poppins mb-3 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
              Authentication Required
            </h1>
            <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
              Please log in to access your profile
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 px-4 py-10 sm:px-6 lg:px-8 animate-fade-in-up">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 mb-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-300/10 to-blue-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

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
                    {/* Avatar Background Animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 translate-x-[-100%] group-hover/avatar:translate-x-[100%] transition-transform duration-700"></div>
                    <div className="relative z-10">
                      {session.user.name
                        ? session.user.name.charAt(0).toUpperCase()
                        : session.user.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <SparklesIcon className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-poppins group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                    {session.user.name || "User"}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <EnvelopeIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                      {session.user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <ClockIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Member since{" "}
                      {session.user.createdAt
                        ? formatJoinDate(session.user.createdAt)
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Name Field */}
                <div className="group/field relative bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-6 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300 border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600 overflow-hidden">
                  {/* Field Background Animation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover/field:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
                        <PencilIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover/field:text-purple-600 dark:group-hover/field:text-purple-400 transition-colors duration-300">
                        Full Name
                      </label>
                    </div>
                    {isEditingName ? (
                      <form
                        onSubmit={handleUpdateProfile}
                        className="space-y-4"
                      >
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="block w-full rounded-xl border-0 px-4 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-500 bg-white dark:bg-gray-800 text-base transition-all duration-300"
                          placeholder="Enter your full name"
                          required
                          maxLength={100}
                        />
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={isUpdatingProfile}
                            className="group/btn relative bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 text-sm font-semibold transform hover:scale-105 hover:rotate-1 disabled:transform-none shadow-lg hover:shadow-xl overflow-hidden"
                          >
                            {/* Button Background Animation */}
                            {!isUpdatingProfile && (
                              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                            )}
                            <div className="relative z-10 flex items-center gap-2">
                              {isUpdatingProfile ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <CheckIcon className="h-4 w-4" />
                              )}
                              Save
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingName(false);
                              setName(session.user?.name || "");
                            }}
                            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 text-sm font-semibold transform hover:scale-105"
                          >
                            <XMarkIcon className="h-4 w-4" />
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium text-gray-900 dark:text-white group-hover/field:text-purple-600 dark:group-hover/field:text-purple-400 transition-colors duration-300">
                          {session.user.name || "Not set"}
                        </span>
                        <button
                          onClick={() => setIsEditingName(true)}
                          className="group/edit relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 text-purple-600 dark:text-purple-400 px-3 py-2 rounded-xl transition-all duration-300 text-sm font-semibold transform hover:scale-105 hover:rotate-1 border border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600 overflow-hidden"
                        >
                          {/* Edit Button Background Animation */}
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 translate-x-[-100%] group-hover/edit:translate-x-[100%] transition-transform duration-500"></div>
                          <div className="relative z-10 flex items-center gap-1">
                            <PencilIcon className="h-4 w-4" />
                            Edit
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email Field (Read-only) */}
                <div className="group/field relative bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 overflow-hidden">
                  {/* Field Background Animation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-green-500/5"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-lg">
                        <EnvelopeIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Email Address
                      </label>
                    </div>
                    <div className="text-lg font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700">
                      {session.user.email}
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <ShieldCheckIcon className="h-3 w-3 text-emerald-500" />
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        Verified & Protected
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
            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-green-500/5"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-green-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-300/10 to-emerald-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

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
                  {/* Stat Background Animation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-green-400/10 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>

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
                  {/* Stat Background Animation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10 text-center">
                    <div className="p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl mx-auto w-fit mb-4 group-hover/stat:scale-110 transition-transform duration-300">
                      <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2 group-hover/stat:scale-110 transition-transform duration-300">
                      {session.user.createdAt
                        ? Math.floor(
                            (Date.now() -
                              new Date(session.user.createdAt).getTime()) /
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
                            ((session.user.createdAt
                              ? Math.floor(
                                  (Date.now() -
                                    new Date(
                                      session.user.createdAt
                                    ).getTime()) /
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
                  {/* Stat Background Animation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>

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

          {/* Security Settings Card */}
          <div
            className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden"
            style={{ animationDelay: "0.2s" }}
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-300/10 to-amber-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                  <KeyIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-poppins group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300">
                    Security Settings
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                    Manage your password and security
                  </p>
                </div>
              </div>

              {!isChangingPassword ? (
                <div className="group/security relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-amber-100 dark:border-amber-800/50 overflow-hidden">
                  {/* Security Background Animation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-orange-400/10 opacity-0 group-hover/security:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl group-hover/security:scale-110 transition-transform duration-300">
                        <ShieldCheckIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-gray-900 dark:text-white group-hover/security:text-amber-600 dark:group-hover/security:text-amber-400 transition-colors duration-300">
                          Password Protection
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Keep your account secure with a strong password
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="group/btn relative bg-gradient-to-br from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 text-amber-600 dark:text-amber-400 px-5 py-3 rounded-xl transition-all duration-300 text-sm font-semibold transform hover:scale-105 hover:rotate-1 border border-amber-200 dark:border-amber-700 hover:border-amber-300 dark:hover:border-amber-600 overflow-hidden"
                    >
                      {/* Button Background Animation */}
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-orange-400/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500"></div>
                      <div className="relative z-10 flex items-center gap-2">
                        <KeyIcon className="h-4 w-4" />
                        Change Password
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="group/input relative bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-6 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300 border border-gray-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-600 overflow-hidden">
                    {/* Input Background Animation */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 opacity-0 group-hover/input:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative z-10">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 group-hover/input:text-amber-600 dark:group-hover/input:text-amber-400 transition-colors duration-300">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="block w-full rounded-xl border-0 px-4 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-500 bg-white dark:bg-gray-800 text-base transition-all duration-300"
                        placeholder="Enter your current password"
                        required
                      />
                    </div>
                  </div>

                  <div className="group/input relative bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-6 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300 border border-gray-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-600 overflow-hidden">
                    {/* Input Background Animation */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 opacity-0 group-hover/input:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative z-10">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 group-hover/input:text-amber-600 dark:group-hover/input:text-amber-400 transition-colors duration-300">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full rounded-xl border-0 px-4 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-500 bg-white dark:bg-gray-800 text-base transition-all duration-300"
                        placeholder="Enter your new password"
                        minLength={6}
                        required
                      />
                    </div>
                  </div>

                  <div className="group/input relative bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-6 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300 border border-gray-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-600 overflow-hidden">
                    {/* Input Background Animation */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 opacity-0 group-hover/input:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative z-10">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 group-hover/input:text-amber-600 dark:group-hover/input:text-amber-400 transition-colors duration-300">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full rounded-xl border-0 px-4 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-500 bg-white dark:bg-gray-800 text-base transition-all duration-300"
                        placeholder="Confirm your new password"
                        minLength={6}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="group/btn relative bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 text-base font-semibold transform hover:scale-105 hover:rotate-1 disabled:transform-none shadow-lg hover:shadow-xl overflow-hidden"
                    >
                      {/* Button Background Animation */}
                      {!isUpdatingPassword && (
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                      )}
                      <div className="relative z-10 flex items-center gap-2">
                        {isUpdatingPassword ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <CheckIcon className="h-5 w-5" />
                        )}
                        Update Password
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 text-base font-semibold transform hover:scale-105"
                    >
                      <XMarkIcon className="h-5 w-5" />
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Logout Section */}
          <div
            className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden"
            style={{ animationDelay: "0.3s" }}
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-rose-500/5"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/20 to-rose-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-red-300/10 to-red-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

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
                  {/* Button Background Animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-rose-400/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
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
