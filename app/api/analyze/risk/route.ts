import { NextRequest, NextResponse } from "next/server";
import { createGeminiAnalyzer } from "@/lib/gemini";
import { createMockGeminiAnalyzer } from "@/lib/gemini-mock";

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();

    // Validate required fields
    if (!requestData || typeof requestData !== "object") {
      return NextResponse.json(
        { error: "Request body must be a JSON object" },
        { status: 400 }
      );
    }

    const { lab_data, visual_metrics, user_data } = requestData;

    if (!lab_data) {
      return NextResponse.json(
        { error: "Missing required field: lab_data" },
        { status: 400 }
      );
    }

    if (!visual_metrics) {
      return NextResponse.json(
        { error: "Missing required field: visual_metrics" },
        { status: 400 }
      );
    }

    if (!user_data) {
      return NextResponse.json(
        { error: "Missing required field: user_data" },
        { status: 400 }
      );
    }

    try {
      console.log("Starting risk assessment...");
      let analyzer;

      try {
        analyzer = createGeminiAnalyzer();
      } catch (initError) {
        console.warn("Gemini API unavailable, using mock analyzer:", initError);
        analyzer = createMockGeminiAnalyzer();
      }

      const riskAssessment = await analyzer.generateRiskAssessment(
        lab_data,
        visual_metrics,
        user_data
      );

      console.log(
        `Risk assessment completed. Generated ${riskAssessment.length} characters`
      );

      return NextResponse.json({
        risk_assessment: riskAssessment,
      });
    } catch (assessmentError) {
      console.error("Risk assessment failed:", assessmentError);

      // Check if it's a quota error and try mock analyzer
      if (
        assessmentError instanceof Error &&
        assessmentError.message.includes("quota")
      ) {
        try {
          console.log("Quota exceeded, falling back to mock analyzer...");
          const mockAnalyzer = createMockGeminiAnalyzer();
          const riskAssessment = await mockAnalyzer.generateRiskAssessment(
            lab_data,
            visual_metrics,
            user_data
          );

          return NextResponse.json({
            risk_assessment: riskAssessment,
          });
        } catch (mockError) {
          console.error("Mock analysis also failed:", mockError);
        }
      }

      if (assessmentError instanceof Error) {
        if (assessmentError.message.includes("rate limit")) {
          return NextResponse.json(
            {
              error:
                "AI service rate limit exceeded. Please try again in a few moments.",
            },
            { status: 429 }
          );
        }

        return NextResponse.json(
          { error: `AI service error: ${geminiError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: "AI service encountered an unexpected error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Risk assessment error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred during risk assessment" },
      { status: 500 }
    );
  }
}
