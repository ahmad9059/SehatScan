import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { getUserAnalysesPaginated } from "@/lib/analysis";

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    let user;
    try {
      user = await requireAuth();
    } catch (authError) {
      return NextResponse.json(
        { error: "Authentication required. Please log in again." },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const type = searchParams.get("type") || undefined;

    // Validate parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    if (type && !["face", "report", "risk"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid analysis type" },
        { status: 400 }
      );
    }

    try {
      const result = await getUserAnalysesPaginated(user.id!, {
        page,
        limit,
        type: type as "face" | "report" | "risk" | undefined,
      });

      return NextResponse.json(result);
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to fetch analyses" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Analyses API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
