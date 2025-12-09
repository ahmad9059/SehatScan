import { PrismaClient } from "@prisma/client";

/**
 * Check if database connection is available
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

// Run check if this file is executed directly
if (require.main === module) {
  checkDatabaseConnection().then((connected) => {
    if (connected) {
      console.log("✓ Database connection successful");
      process.exit(0);
    } else {
      console.error("✗ Database connection failed");
      console.error("Please check your DATABASE_URL in .env file");
      console.error("See DATABASE_SETUP.md for setup instructions");
      process.exit(1);
    }
  });
}
