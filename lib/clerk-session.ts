import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

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
      createdAt: user.createdAt
        ? new Date(user.createdAt).toISOString()
        : new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Ensure user exists in database (create if not exists)
 * @param clerkUser - Clerk user object
 * @returns Database user object
 */
export async function ensureUserInDatabase(clerkUser: any) {
  try {
    // First, check if user already exists by Clerk ID
    let dbUser = await prisma.user.findUnique({
      where: { id: clerkUser.id },
    });

    if (dbUser) {
      return dbUser;
    }

    // If not found by ID, check if there's an existing user with the same email
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: clerkUser.email },
    });

    if (existingUserByEmail) {
      // For migration: if there's an existing user with same email but different ID,
      // we'll use the existing user instead of creating a new one
      console.log(
        `Using existing user for migration: ${clerkUser.email} (existing ID: ${existingUserByEmail.id})`
      );
      return existingUserByEmail;
    } else {
      // Create new user
      dbUser = await prisma.user.create({
        data: {
          id: clerkUser.id,
          email: clerkUser.email,
          name: clerkUser.name,
          password: "", // Empty password since Clerk handles auth
        },
      });
      console.log(`Created new user in database: ${clerkUser.id}`);
    }

    return dbUser;
  } catch (error) {
    console.error("Error ensuring user in database:", error);

    // If it's still a unique constraint error, try to find the user by email
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: clerkUser.email },
        });
        if (existingUser) {
          console.log(`Using existing user for ${clerkUser.email}`);
          return existingUser;
        }
      } catch (findError) {
        console.error("Error finding existing user:", findError);
      }
    }

    throw error;
  }
}

/**
 * Get the current session from Clerk and ensure user exists in database
 * @returns Session object or null
 */
export async function getSession() {
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
}

/**
 * Require authentication - throws error if not authenticated
 * Also ensures user exists in database
 * @returns User object
 * @throws Error if not authenticated
 */
export async function requireAuth() {
  const clerkUser = await getCurrentUser();
  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  // Ensure user exists in database
  await ensureUserInDatabase(clerkUser);

  return clerkUser;
}
