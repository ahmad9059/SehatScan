import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth-config";

// Create NextAuth instance with explicit configuration for Vercel
const { handlers } = NextAuth({
  ...authConfig,
  // Explicit configuration for Vercel deployment
  basePath: "/api/auth",
  ...(process.env.NEXTAUTH_URL && {
    url: process.env.NEXTAUTH_URL,
  }),
});

export const { GET, POST } = handlers;
