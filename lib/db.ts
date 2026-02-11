import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  // Handle connection errors gracefully - disconnect stale connections
  // so the next request gets a fresh connection instead of a corrupted one
  client.$use(async (params, next) => {
    try {
      return await next(params);
    } catch (error: unknown) {
      const prismaError = error as { code?: string; message?: string };
      // P1017 = Server has closed the connection
      // P1001 = Can't reach database server
      if (prismaError.code === "P1017" || prismaError.code === "P1001") {
        // Force disconnect so next query creates a fresh connection
        await client.$disconnect();
      }
      throw error;
    }
  });

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Cache Prisma client in both dev AND production for serverless
// This prevents creating new connections on every request
globalForPrisma.prisma = prisma;
