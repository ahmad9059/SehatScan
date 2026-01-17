import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Reduce logging overhead - only errors in dev, nothing blocking
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// Cache Prisma client in both dev AND production for serverless
// This prevents creating new connections on every request
globalForPrisma.prisma = prisma;
