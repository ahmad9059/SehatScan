import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateProfile, changePassword, getUserStats } from "./profile";

// Mock the dependencies
vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    analysis: {
      count: vi.fn(),
    },
  },
}));

vi.mock("@/lib/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/clerk-session";
import { hashPassword, verifyPassword } from "@/lib/auth";

describe("Profile Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateProfile", () => {
    it("should update user profile successfully", async () => {
      const mockUser = {
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        createdAt: new Date().toISOString(),
      };
      const updatedUser = {
        id: "user-123",
        name: "Jane Doe",
        email: "john@example.com",
      };

      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(prisma.user.update).mockResolvedValue(updatedUser as any);

      const formData = new FormData();
      formData.append("name", "Jane Doe");

      const result = await updateProfile(formData);

      expect(result.success).toBe(true);
      expect(result.user?.name).toBe("Jane Doe");
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: { name: "Jane Doe" },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
    });

    it("should fail when user is not authenticated", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null);

      const formData = new FormData();
      formData.append("name", "Jane Doe");

      const result = await updateProfile(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Authentication required");
    });

    it("should fail when name is empty", async () => {
      const mockUser = {
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        createdAt: new Date().toISOString(),
      };
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

      const formData = new FormData();
      formData.append("name", "");

      const result = await updateProfile(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Name is required");
    });

    it("should fail when name is too long", async () => {
      const mockUser = {
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        createdAt: new Date().toISOString(),
      };
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

      const formData = new FormData();
      formData.append("name", "a".repeat(101)); // 101 characters

      const result = await updateProfile(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Name must be less than 100 characters");
    });
  });

  describe("changePassword", () => {
    it("should change password successfully", async () => {
      const mockUser = {
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        createdAt: new Date().toISOString(),
      };
      const mockUserWithPassword = {
        id: "user-123",
        password: "hashedOldPassword",
      };

      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        mockUserWithPassword as any
      );
      vi.mocked(verifyPassword).mockResolvedValue(true);
      vi.mocked(hashPassword).mockResolvedValue("hashedNewPassword");
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);

      const formData = new FormData();
      formData.append("currentPassword", "oldPassword");
      formData.append("newPassword", "newPassword123");
      formData.append("confirmPassword", "newPassword123");

      const result = await changePassword(formData);

      expect(result.success).toBe(true);
      expect(verifyPassword).toHaveBeenCalledWith(
        "oldPassword",
        "hashedOldPassword"
      );
      expect(hashPassword).toHaveBeenCalledWith("newPassword123");
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: { password: "hashedNewPassword" },
      });
    });

    it("should fail when user is not authenticated", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null);

      const formData = new FormData();
      formData.append("currentPassword", "oldPassword");
      formData.append("newPassword", "newPassword123");
      formData.append("confirmPassword", "newPassword123");

      const result = await changePassword(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Authentication required");
    });

    it("should fail when passwords don't match", async () => {
      const mockUser = {
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        createdAt: new Date().toISOString(),
      };
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

      const formData = new FormData();
      formData.append("currentPassword", "oldPassword");
      formData.append("newPassword", "newPassword123");
      formData.append("confirmPassword", "differentPassword");

      const result = await changePassword(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("New passwords do not match");
    });

    it("should fail when new password is too short", async () => {
      const mockUser = {
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        createdAt: new Date().toISOString(),
      };
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

      const formData = new FormData();
      formData.append("currentPassword", "oldPassword");
      formData.append("newPassword", "123");
      formData.append("confirmPassword", "123");

      const result = await changePassword(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "New password must be at least 6 characters long"
      );
    });

    it("should fail when current password is incorrect", async () => {
      const mockUser = {
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        createdAt: new Date().toISOString(),
      };
      const mockUserWithPassword = {
        id: "user-123",
        password: "hashedOldPassword",
      };

      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        mockUserWithPassword as any
      );
      vi.mocked(verifyPassword).mockResolvedValue(false);

      const formData = new FormData();
      formData.append("currentPassword", "wrongPassword");
      formData.append("newPassword", "newPassword123");
      formData.append("confirmPassword", "newPassword123");

      const result = await changePassword(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Current password is incorrect");
    });
  });

  describe("getUserStats", () => {
    it("should return user statistics", async () => {
      const mockUser = {
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        createdAt: new Date().toISOString(),
      };
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(prisma.analysis.count).mockResolvedValue(5);

      const result = await getUserStats();

      expect(result.totalAnalyses).toBe(5);
      expect(prisma.analysis.count).toHaveBeenCalledWith({
        where: { userId: "user-123" },
      });
    });

    it("should return zero when user is not authenticated", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null);

      const result = await getUserStats();

      expect(result.totalAnalyses).toBe(0);
    });

    it("should handle database errors gracefully", async () => {
      const mockUser = {
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        createdAt: new Date().toISOString(),
      };
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(prisma.analysis.count).mockRejectedValue(
        new Error("Database error")
      );

      const result = await getUserStats();

      expect(result.totalAnalyses).toBe(0);
    });
  });
});
