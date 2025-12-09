import NextAuth from "next-auth";
import { authConfig } from "./auth-config";

const { auth } = NextAuth(authConfig);

/**
 * Get the current session on the server side
 * @returns Session object or null
 */
export async function getSession() {
  return await auth();
}

/**
 * Get the current user from the session
 * @returns User object or null
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
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
