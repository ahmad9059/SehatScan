import { NextRequest, NextResponse } from "next/server";
import { createGeminiAnalyzer } from "@/lib/gemini";
import { createMockGeminiAnalyzer } from "@/lib/gemini-mock";
import {
  extractTextFromImage,
  fileToCanvas,
  preprocessImageForOCR,
} from "@/lib/ocr";

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

    let rawText = "";

    try {
      // Handle PDF files differently
      if (file.type === "application/pdf") {
        // For PDF files, we'll need to convert to image first
        // This is a simplified approach - in production you'd use pdf2pic or similar
        return NextResponse.json(
          {
            error:
              "PDF processing not yet implemented. Please upload an image file.",
          },
          { status: 400 }
        );
      }

      // Process image files with OCR
      console.log("Starting OCR processing...");

      // Convert file to canvas and preprocess
      const canvas = await fileToCanvas(file);
      const preprocessedCanvas = preprocessImageForOCR(canvas);

      // Convert canvas back to blob for OCR
      const blob = await new Promise<Blob>((resolve) => {
        preprocessedCanvas.toBlob(
          (blob) => {
            resolve(blob!);
          },
          "image/jpeg",
          0.8
        );
      });

      // Extract text using OCR
      const ocrResult = await extractTextFromImage(blob);
      rawText = ocrResult.text;

      console.log(
        `OCR completed. Extracted ${rawText.length} characters with ${ocrResult.confidence}% confidence`
      );
    } catch (ocrError) {
      console.error("OCR processing failed:", ocrError);
      return NextResponse.json(
        {
          error:
            "Failed to extract text from image. Please ensure the image is clear and readable.",
        },
        { status: 422 }
      );
    }

    // Structure data using Gemini if we have text
    let structuredData = null;

    if (rawText && rawText.trim()) {
      try {
        console.log("Starting Gemini data structuring...");
        let analyzer;

        try {
          analyzer = createGeminiAnalyzer();
        } catch (initError) {
          console.warn(
            "Gemini API unavailable, using mock analyzer:",
            initError
          );
          analyzer = createMockGeminiAnalyzer();
        }

        structuredData = await analyzer.structureOcrData(rawText);
        console.log("Data structuring completed successfully");
      } catch (geminiError) {
        console.error("Data structuring failed:", geminiError);

        // Check if it's a quota error and try mock analyzer
        if (
          geminiError instanceof Error &&
          geminiError.message.includes("quota")
        ) {
          try {
            console.log("Quota exceeded, falling back to mock analyzer...");
            const mockAnalyzer = createMockGeminiAnalyzer();
            structuredData = await mockAnalyzer.structureOcrData(rawText);
            console.log("Mock analysis completed successfully");
          } catch (mockError) {
            console.error("Mock analysis also failed:", mockError);
            return NextResponse.json({
              raw_text: rawText,
              structured_data: null,
              warning:
                "Text extracted but AI structuring failed. Raw text is available.",
            });
          }
        } else {
          // Return OCR results even if Gemini fails
          return NextResponse.json({
            raw_text: rawText,
            structured_data: null,
            warning:
              "Text extracted but AI structuring failed. Raw text is available.",
          });
        }
      }
    } else {
      console.warn("No text extracted from image");
    }

    return NextResponse.json({
      raw_text: rawText,
      structured_data: structuredData,
    });
  } catch (error) {
    console.error("Report analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred during report analysis" },
      { status: 500 }
    );
  }
}
