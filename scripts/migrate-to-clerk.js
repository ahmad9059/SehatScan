/**
 * Migration script to help transition from NextAuth to Clerk
 * This script can help clean up old user data if needed
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Starting Clerk migration...");

  try {
    // Check current users in database
    const existingUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        _count: {
          select: {
            analyses: true,
          },
        },
      },
    });

    console.log(`📊 Found ${existingUsers.length} existing users in database:`);
    existingUsers.forEach((user) => {
      console.log(
        `  - ${user.email} (${user.id}) - ${user._count.analyses} analyses`
      );
    });

    // Note: We don't automatically delete old users since they might have analyses
    // The new system will create Clerk users as needed when they log in

    console.log("\n✅ Migration analysis complete!");
    console.log("\n📝 Next steps:");
    console.log(
      "1. Users will be automatically created in the database when they first log in with Clerk"
    );
    console.log(
      "2. Old NextAuth users will remain in the database but won't be used"
    );
    console.log(
      "3. If you want to clean up old users, you can do so manually after confirming all data is migrated"
    );
  } catch (error) {
    console.error("❌ Migration error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
