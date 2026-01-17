import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { cache } from "react";
import { withCache, CACHE_KEYS, CACHE_TTL, deleteCache } from "@/lib/redis";

/**
 * Get the current user from Clerk
 * Cached per request to prevent duplicate Clerk API calls
 * @returns User object or null
 */
export const getCurrentUser = cache(async () => {
  try {
    const user = await currentUser();

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || "",
      name:
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.firstName || user.username || "User",
      createdAt: user.createdAt
        ? new Date(user.createdAt).toISOString()
        : new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
});

/**
 * Ensure user exists in database (create if not exists)
 * Uses upsert for single-query efficiency
 * Cached in Redis for 1 hour to avoid repeated DB calls
 * @param clerkUser - Clerk user object
 * @returns Database user object
 */
export const ensureUserInDatabase = cache(
  async (clerkUser: { id: string; email: string; name: string }) => {
    // Use Redis cache to avoid DB call on every request
    return withCache(
      CACHE_KEYS.dbUser(clerkUser.id),
      async () => {
        try {
          // Use upsert for single-query efficiency instead of find + create
          const dbUser = await prisma.user.upsert({
            where: { id: clerkUser.id },
            update: {}, // No update needed, just ensure exists
            create: {
              id: clerkUser.id,
              email: clerkUser.email,
              name: clerkUser.name,
              password: "", // Empty password since Clerk handles auth
            },
          });

          return dbUser;
        } catch (error) {
          console.error("Error ensuring user in database:", error);

          // If unique constraint error (email exists with different ID), find by email
          if (
            error instanceof Error &&
            error.message.includes("Unique constraint")
          ) {
            const existingUser = await prisma.user.findUnique({
              where: { email: clerkUser.email },
            });
            if (existingUser) {
              return existingUser;
            }
          }

          throw error;
        }
      },
      CACHE_TTL.USER,
    );
  },
);

/**
 * Get the current session from Clerk and ensure user exists in database
 * Cached per request
 * @returns Session object or null
 */
export const getSession = cache(async () => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    const clerkUser = await getCurrentUser();

    if (!clerkUser) {
      return null;
    }

    // Ensure user exists in database
    await ensureUserInDatabase(clerkUser);

    return {
      user: clerkUser,
    };
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
});

/**
 * Require authentication - throws error if not authenticated
 * Also ensures user exists in database
 * Cached per request to prevent duplicate calls
 * @returns User object
 * @throws Error if not authenticated
 */
export const requireAuth = cache(async () => {
  const clerkUser = await getCurrentUser();
  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  // Ensure user exists in database
  await ensureUserInDatabase(clerkUser);

  return clerkUser;
});
