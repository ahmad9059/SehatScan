import { NextRequest, NextResponse } from "next/server";
import { analyzeFaceImageServer } from "@/lib/face-analysis-server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type (face analysis only supports images)
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Please upload a JPEG or PNG image file" },
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
      console.log("Starting face analysis...");
      const results = await analyzeFaceImageServer(file);
      console.log(
        `Face analysis completed. Detected ${results.faces_count} faces`
      );

      return NextResponse.json(results);
    } catch (analysisError) {
      console.error("Face analysis failed:", analysisError);
      return NextResponse.json(
        {
          error:
            "Failed to analyze face image. Please ensure the image contains a clear face.",
        },
        { status: 422 }
      );
    }
  } catch (error) {
    console.error("Face analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred during face analysis" },
      { status: 500 }
    );
  }
}
