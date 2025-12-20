import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth-config";

const handler = NextAuth({
  ...authConfig,
  // Ensure proper URL configuration for Vercel
  ...(process.env.NEXTAUTH_URL && {
    url: process.env.NEXTAUTH_URL,
  }),
});

export const { GET, POST } = handler;
