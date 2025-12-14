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
      <div className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Authentication Required
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Please log in to access your profile
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8 animate-fade-in-up">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
            Profile & Settings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account information and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* User Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#037BFC] text-white text-2xl font-bold">
                {session.user.name
                  ? session.user.name.charAt(0).toUpperCase()
                  : session.user.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white font-poppins">
                  {session.user.name || "User"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {session.user.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                {isEditingName ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-3">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#037BFC] bg-white dark:bg-gray-800 sm:text-sm"
                      placeholder="Enter your full name"
                      required
                      maxLength={100}
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="flex items-center gap-1 rounded-md bg-[#037BFC] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#0260c9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#037BFC] focus:ring-offset-2"
                      >
                        {isUpdatingProfile ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <CheckIcon className="h-4 w-4" />
                        )}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingName(false);
                          setName(session.user?.name || "");
                        }}
                        className="flex items-center gap-1 rounded-md bg-gray-100 dark:bg-gray-700 px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <XMarkIcon className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 dark:text-white">
                      {session.user.name || "Not set"}
                    </span>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-[#037BFC] hover:text-[#0260c9] text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#037BFC] focus:ring-offset-2 rounded"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Email Field (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-md px-3.5 py-2 text-sm">
                  {session.user.email}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Email cannot be changed
                </p>
              </div>

              {/* Join Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Member Since
                </label>
                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    {session.user.createdAt
                      ? formatJoinDate(session.user.createdAt)
                      : "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Statistics Card */}
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <ChartBarIcon className="h-6 w-6 text-[#037BFC]" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-poppins">
                Account Statistics
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-[#037BFC] mb-1">
                  {isLoadingStats ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    userStats.totalAnalyses
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Analyses
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-[#037BFC] mb-1">
                  {session.user.createdAt
                    ? Math.floor(
                        (Date.now() -
                          new Date(session.user.createdAt).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    : 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Days Active
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  Active
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Account Status
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings Card */}
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <KeyIcon className="h-6 w-6 text-[#037BFC]" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-poppins">
                Security Settings
              </h3>
            </div>

            {!isChangingPassword ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    Password
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Last changed: Unknown
                  </p>
                </div>
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="rounded-md bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#037BFC] focus:ring-offset-2"
                >
                  Change Password
                </button>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#037BFC] bg-white dark:bg-gray-800 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#037BFC] bg-white dark:bg-gray-800 sm:text-sm"
                    minLength={6}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#037BFC] bg-white dark:bg-gray-800 sm:text-sm"
                    minLength={6}
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="flex items-center gap-2 rounded-md bg-[#037BFC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0260c9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#037BFC] focus:ring-offset-2"
                  >
                    {isUpdatingPassword ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <CheckIcon className="h-4 w-4" />
                    )}
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    className="flex items-center gap-2 rounded-md bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Logout Section */}
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-poppins">
                  Sign Out
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Sign out of your account on this device
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Sign Out
              </button>
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
