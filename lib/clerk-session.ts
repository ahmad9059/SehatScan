import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Get the current user from Clerk
 * @returns User object or null
 */
export async function getCurrentUser() {
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
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Get the current session from Clerk
 * @returns Session object or null
 */
export async function getSession() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    const user = await getCurrentUser();

    if (!user) {
      return null;
    }

    return {
      user,
    };
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Require authentication - throws error if not authenticated
 * @returns User object
 * @throws Error if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
