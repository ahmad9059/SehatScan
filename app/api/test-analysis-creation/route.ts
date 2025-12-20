import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/clerk-session";
import { saveAnalysis } from "@/lib/analysis";

export async function POST() {
  try {
    // This will automatically create/find the user in database
    const user = await requireAuth();

    // Test creating a sample analysis
    const testAnalysisData = {
      userId: user.id,
      type: "face" as const, // Use valid analysis type
      rawData: {
        test: true,
        message: "This is a test analysis to verify database integration",
        timestamp: new Date().toISOString(),
      },
      visualMetrics: {
        test_metric: 100,
      },
    };

    const result = await saveAnalysis(testAnalysisData);

    return NextResponse.json({
      success: true,
      message: "Analysis creation test successful!",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      analysis: result.analysis
        ? {
            id: result.analysis.id,
            type: result.analysis.type,
            createdAt: result.analysis.createdAt,
          }
        : null,
      result,
    });
  } catch (error) {
    console.error("Analysis creation test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Test failed",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
