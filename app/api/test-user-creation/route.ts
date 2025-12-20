import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/clerk-session";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // This will automatically create the user in database if they don't exist
    const user = await requireAuth();

    // Verify user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        _count: {
          select: {
            analyses: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "User creation test successful",
      clerkUser: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      databaseUser: dbUser
        ? {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            analysisCount: dbUser._count.analyses,
            createdAt: dbUser.createdAt,
          }
        : null,
    });
  } catch (error) {
    console.error("User creation test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Test failed",
      },
      { status: 500 }
    );
  }
}
