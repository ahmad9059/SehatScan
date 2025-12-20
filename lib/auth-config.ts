import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUserByEmail, verifyPassword } from "./auth";

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await getUserByEmail(credentials.email as string);

          if (!user) {
            return null;
          }

          const isValid = await verifyPassword(
            credentials.password as string,
            user.password
          );

          if (!isValid) {
            return null;
          }

          // Return user without password
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        // Convert Date to string for JWT
        token.createdAt =
          user.createdAt instanceof Date
            ? user.createdAt.toISOString()
            : user.createdAt;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string | null;
        session.user.createdAt = token.createdAt as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true, // Important for Vercel deployment
  debug: process.env.NODE_ENV === "development",
};
