import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createMockGeminiAnalyzer } from "@/lib/gemini-mock";

/**
 * Generate mock analysis when Gemini API is unavailable
 */
async function generateMockReportAnalysis(file: File): Promise<{
  raw_text: string;
  structured_data: any;
}> {
  const mockAnalyzer = createMockGeminiAnalyzer();

  // Generate a mock raw text based on file info
  const mockRawText = `Medical Report Analysis
File: ${file.name}
Date: ${new Date().toLocaleDateString()}

Note: This is a simulated analysis. The AI service is temporarily unavailable.
Please try again later for actual report analysis.`;

  // Use the mock analyzer to generate structured data
  const structuredData = await mockAnalyzer.structureOcrData(mockRawText);

  // Add a note about the mock analysis
  structuredData.summary =
    "⚠️ AI service temporarily unavailable. This is a demo analysis. Please try again later for actual medical report analysis.";

  return {
    raw_text: mockRawText,
    structured_data: structuredData,
  };
}

/**
 * Analyze medical report image directly using Gemini Vision API
 * This provides accurate OCR and analysis in one step
 */
async function analyzeReportWithGeminiVision(file: File): Promise<{
  raw_text: string;
  structured_data: any;
}> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const genai = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const model = genai.getGenerativeModel({ model: modelName });

  // Convert file to base64
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  const mimeType = file.type || "image/jpeg";

  const prompt = `You are analyzing a medical report image. First extract ALL text from the image, then analyze it.

TASK 1 - TEXT EXTRACTION:
Extract every piece of text visible in the image exactly as written.

TASK 2 - HEALTH ANALYSIS:
Analyze the extracted text and provide:
1. All health metrics found with their status (normal/low/high/critical)
2. Any health problems or concerns detected  
3. Recommended treatments or actions
4. Brief summary of findings

Return as valid JSON in this exact format:
{
  "raw_text": "Full extracted text from the image...",
  "structured_data": {
    "metrics": [
      {"name": "Metric Name", "value": "123", "unit": "mg/dL", "status": "normal", "reference_range": "70-100"}
    ],
    "problems_detected": [
      {"type": "Problem Name", "severity": "mild|moderate|severe", "description": "Detailed description", "confidence": 0.85}
    ],
    "treatments": [
      {"category": "Category", "recommendation": "Specific recommendation", "priority": "low|medium|high", "timeframe": "When to act"}
    ],
    "summary": "Brief overall health summary"
  }
}

IMPORTANT RULES:
- Return ONLY valid JSON, no markdown or extra text
- Extract ALL text from the image for raw_text field
- Analyze ANY type of medical document (lab tests, prescriptions, imaging reports, checkups, etc.)
- If values are outside normal ranges, add them to problems_detected
- Provide actionable treatments for detected problems
- If no problems found, return empty problems_detected array
- Confidence should be between 0 and 1
- Be thorough and accurate`;

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
      { text: prompt },
    ]);

    const response = await result.response;
    let responseText = response.text().trim();

    // Clean up response (remove markdown code blocks if present)
    if (responseText.startsWith("```json")) {
      responseText = responseText.slice(7);
    }
    if (responseText.startsWith("```")) {
      responseText = responseText.slice(3);
    }
    if (responseText.endsWith("```")) {
      responseText = responseText.slice(0, -3);
    }
    responseText = responseText.trim();

    const parsed = JSON.parse(responseText);

    return {
      raw_text: parsed.raw_text || "",
      structured_data: parsed.structured_data || {
        metrics: [],
        problems_detected: [],
        treatments: [],
        summary: "",
      },
    };
  } catch (error) {
    console.error("Gemini Vision analysis failed:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Please upload a JPEG, PNG, or PDF file" },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    try {
      // Handle PDF files
      if (file.type === "application/pdf") {
        return NextResponse.json(
          {
            error:
              "PDF processing not yet implemented. Please upload an image file (JPEG or PNG).",
          },
          { status: 400 }
        );
      }

      // Use Gemini Vision API to analyze the image directly
      console.log("Starting Gemini Vision analysis...");
      const result = await analyzeReportWithGeminiVision(file);
      console.log("Gemini Vision analysis completed successfully");

      return NextResponse.json(result);
    } catch (analysisError) {
      console.error("Report analysis failed:", analysisError);

      // Check if it's a quota/rate limit error - fall back to mock
      const errorMessage =
        analysisError instanceof Error
          ? analysisError.message
          : "Analysis failed";

      if (
        errorMessage.includes("429") ||
        errorMessage.includes("quota") ||
        errorMessage.includes("Too Many Requests") ||
        errorMessage.includes("rate")
      ) {
        console.log("Gemini quota exceeded, falling back to mock analysis...");
        try {
          const mockResult = await generateMockReportAnalysis(file);
          return NextResponse.json({
            ...mockResult,
            warning:
              "AI service temporarily unavailable. Showing demo analysis.",
          });
        } catch (mockError) {
          console.error("Mock analysis also failed:", mockError);
        }
      }

      if (errorMessage.includes("GEMINI_API_KEY")) {
        return NextResponse.json(
          { error: "AI service not configured. Please contact support." },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          error:
            "Failed to analyze the report. Please ensure the image is clear and contains readable medical information.",
        },
        { status: 422 }
      );
    }
  } catch (error) {
    console.error("Report analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred during report analysis" },
      { status: 500 }
    );
  }
}
