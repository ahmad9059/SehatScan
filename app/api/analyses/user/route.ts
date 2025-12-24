import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserAnalyses } from "@/lib/analysis";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const typeParam = searchParams.get("type");
    const type =
      typeParam === "face" || typeParam === "report" || typeParam === "risk"
        ? typeParam
        : undefined;

    const analyses = await getUserAnalyses(userId, type);

    return NextResponse.json({
      success: true,
      analyses,
    });
  } catch (error) {
    console.error("Error fetching user analyses:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analyses" },
      { status: 500 }
    );
  }
}
