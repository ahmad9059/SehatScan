"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { requireAuth } from "@/lib/clerk-session";
import { withCache, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";

interface UpdateProfileResult {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface ChangePasswordResult {
  success: boolean;
  error?: string;
}

/**
 * Update user profile information (name)
 */
export async function updateProfile(
  formData: FormData
): Promise<UpdateProfileResult> {
  try {
    const user = await requireAuth(); // This ensures user exists in database
    if (!user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const name = formData.get("name") as string;

    if (!name || name.trim().length === 0) {
      return { success: false, error: "Name is required" };
    }

    if (name.trim().length > 100) {
      return { success: false, error: "Name must be less than 100 characters" };
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name: name.trim() },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    revalidatePath("/dashboard/profile");

    return {
      success: true,
      user: updatedUser,
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error: "Failed to update profile. Please try again.",
    };
  }
}

/**
 * Change user password
 */
export async function changePassword(
  formData: FormData
): Promise<ChangePasswordResult> {
  try {
    const user = await requireAuth(); // This ensures user exists in database
    if (!user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return { success: false, error: "All password fields are required" };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: "New passwords do not match" };
    }

    if (newPassword.length < 6) {
      return {
        success: false,
        error: "New password must be at least 6 characters long",
      };
    }

    // Get user with password
    const userWithPassword = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, password: true },
    });

    if (!userWithPassword) {
      return { success: false, error: "User not found" };
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(
      currentPassword,
      userWithPassword.password
    );

    if (!isCurrentPasswordValid) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Hash new password and update
    const hashedNewPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    return { success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      success: false,
      error: "Failed to change password. Please try again.",
    };
  }
}

/**
 * Get user statistics (total analyses count)
 */
export async function getUserStats() {
  try {
    const user = await requireAuth(); // This ensures user exists in database
    if (!user?.id) {
      return { totalAnalyses: 0 };
    }

    return withCache(
      CACHE_KEYS.stats(user.id),
      async () => {
        const totalAnalyses = await prisma.analysis.count({
          where: { userId: user.id },
        });
        return { totalAnalyses };
      },
      CACHE_TTL.STATS, // 30 minutes
    );
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return { totalAnalyses: 0 };
  }
}
