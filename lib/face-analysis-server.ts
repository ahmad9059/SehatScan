/**
 * Server-side face analysis utilities for health indicators
 * Uses Gemini Vision API for accurate skin condition detection
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export interface SkinProblem {
  type: string;
  severity: "mild" | "moderate" | "severe";
  description: string;
  confidence: number;
  location?: string; // Area of face where problem is detected
}

export interface Treatment {
  category: string;
  recommendation: string;
  priority: "low" | "medium" | "high";
  timeframe: string;
  for_condition?: string; // Which detected condition this treatment addresses
}

export interface FaceBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string; // Optional label for the detected area
}

export interface FaceDetectionResult {
  face_detected: boolean;
  faces_count: number;
  faces: FaceBoundingBox[];
  problem_areas?: FaceBoundingBox[]; // Specific areas with detected problems
  image_width?: number;
  image_height?: number;
  source_image_url?: string;
  source_image_key?: string;
  source_image_name?: string;
  source_image_size?: number;
  visual_metrics: Array<{
    face_index: number;
    redness_percentage: number;
    yellowness_percentage: number;
    skin_tone_analysis: string;
    overall_skin_health?: string;
  }>;
  problems_detected: SkinProblem[];
  treatments: Treatment[];
  annotated_image?: string; // Base64 encoded image
}

interface GeminiAnalysisResult {
  face_detected: boolean;
  faces_count: number;
  face_bounds: {
    x_percent: number;
    y_percent: number;
    width_percent: number;
    height_percent: number;
  };
  skin_analysis: {
    overall_health: string;
    redness_level: number;
    yellowness_level: number;
    skin_tone: string;
  };
  detected_conditions: Array<{
    condition: string;
    severity: "mild" | "moderate" | "severe";
    confidence: number;
    description: string;
    location: string;
    area_bounds?: {
      x_percent: number;
      y_percent: number;
      width_percent: number;
      height_percent: number;
    };
  }>;
  recommended_treatments: Array<{
    category: string;
    recommendation: string;
    priority: "low" | "medium" | "high";
    timeframe: string;
    for_condition?: string;
  }>;
}

/**
 * Analyze face image using Gemini Vision API
 */
async function analyzeWithGemini(
  base64Image: string,
  mimeType: string
): Promise<GeminiAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const genai = new GoogleGenerativeAI(apiKey);
  const model = genai.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  });

  const prompt = `You are an expert dermatology AI assistant analyzing a facial image for skin health indicators. Analyze this image carefully and provide accurate detection of any skin conditions visible.

IMPORTANT: Analyze the ACTUAL image provided. Do not make up conditions that are not visible. Be accurate and honest about what you can see.

Analyze the image and return a JSON response with this exact structure:
{
  "face_detected": true/false,
  "faces_count": number,
  "face_bounds": {
    "x_percent": number (0-100, left edge of face as percentage of image width),
    "y_percent": number (0-100, top edge of face as percentage of image height),
    "width_percent": number (0-100, face width as percentage of image width),
    "height_percent": number (0-100, face height as percentage of image height)
  },
  "skin_analysis": {
    "overall_health": "healthy/fair/concerning/needs_attention",
    "redness_level": number (0-100, actual observed redness),
    "yellowness_level": number (0-100, actual observed yellowness/jaundice signs),
    "skin_tone": "Description of observed skin tone and texture"
  },
  "detected_conditions": [
    {
      "condition": "Name of skin condition (e.g., Acne, Rosacea, Dry Skin, Dark Circles, Hyperpigmentation, Wrinkles, Eczema, Psoriasis, Moles, Sunspots, Oily Skin, Blackheads, Whiteheads, Fine Lines, Age Spots, Melasma, etc.)",
      "severity": "mild/moderate/severe",
      "confidence": number (0-1, your confidence in this detection),
      "description": "Detailed description of what you observe including visual characteristics",
      "location": "Where on the face (e.g., forehead, cheeks, nose, chin, under eyes, T-zone, jawline, temples, nasolabial folds)",
      "area_bounds": {
        "x_percent": number (0-100),
        "y_percent": number (0-100),
        "width_percent": number (0-100),
        "height_percent": number (0-100)
      }
    }
  ],
  "recommended_treatments": [
    {
      "category": "Category",
      "recommendation": "Detailed specific recommendation",
      "priority": "low/medium/high",
      "timeframe": "When to implement",
      "for_condition": "Which detected condition this treatment addresses"
    }
  ]
}

TREATMENT RECOMMENDATION GUIDELINES - VERY IMPORTANT:
For each detected condition, provide SPECIFIC, EVIDENCE-BASED treatments. Here are examples:

FOR ACNE:
- Skincare: "Use a gentle cleanser with salicylic acid (2%) morning and night. Apply benzoyl peroxide (2.5-5%) spot treatment on active breakouts."
- Products: "Look for non-comedogenic moisturizers. Consider products with niacinamide to reduce inflammation and oil production."
- Lifestyle: "Avoid touching your face. Change pillowcases weekly. Reduce dairy and high-glycemic foods."
- Medical: "For persistent acne, consult a dermatologist about retinoids (tretinoin) or oral medications."

FOR ROSACEA:
- Skincare: "Use fragrance-free, gentle cleansers. Apply azelaic acid (15-20%) to reduce redness."
- Triggers: "Avoid hot drinks, spicy foods, alcohol, and extreme temperatures that can trigger flare-ups."
- Medical: "Consider prescription metronidazole gel or ivermectin cream. Laser therapy may help persistent redness."

FOR DRY SKIN:
- Skincare: "Apply hyaluronic acid serum on damp skin, followed by a ceramide-rich moisturizer. Use a humidifier."
- Products: "Look for moisturizers with glycerin, squalane, and shea butter. Avoid alcohol-based toners."
- Lifestyle: "Take lukewarm (not hot) showers. Drink adequate water. Use gentle, fragrance-free products."

FOR DARK CIRCLES:
- Skincare: "Apply eye cream with vitamin C, retinol, or caffeine. Use cold compresses to reduce puffiness."
- Lifestyle: "Ensure 7-9 hours of quality sleep. Elevate head while sleeping. Reduce salt intake."
- Medical: "Persistent dark circles may benefit from dermal fillers or laser treatment. Consult a dermatologist."

FOR HYPERPIGMENTATION:
- Skincare: "Use vitamin C serum (10-20%) in the morning. Apply products with niacinamide, arbutin, or kojic acid."
- Sun Protection: "Apply SPF 30+ sunscreen daily and reapply every 2 hours. Sun exposure worsens dark spots."
- Medical: "Consider chemical peels, microdermabrasion, or prescription hydroquinone for stubborn spots."

FOR WRINKLES/FINE LINES:
- Skincare: "Start with retinol (0.25-0.5%) at night, gradually increasing strength. Use peptide serums."
- Hydration: "Apply hyaluronic acid and moisturizer to plump skin. Consider facial oils at night."
- Medical: "Botox, dermal fillers, or microneedling can address deeper wrinkles. Consult a dermatologist."

FOR OILY SKIN:
- Skincare: "Use oil-free, gel-based cleanser. Apply niacinamide serum to regulate sebum production."
- Products: "Use lightweight, non-comedogenic moisturizers. Clay masks 1-2x weekly to absorb excess oil."
- Lifestyle: "Blot excess oil with blotting papers rather than washing frequently, which can increase oil production."

GENERAL GUIDELINES:
- If no face is detected, set face_detected to false and return minimal data
- Only report conditions you can actually see in the image - do NOT fabricate conditions
- Be specific about locations and provide accurate bounding boxes for problem areas
- Provide realistic confidence scores based on image clarity and visibility
- If skin appears healthy, say so - provide maintenance recommendations instead
- Consider lighting conditions when assessing colors
- Each treatment MUST be specific and actionable with product recommendations or specific ingredients
- Include at least 3-5 treatments for each detected condition
- Treatments should cover: immediate care, daily routine, products/ingredients, lifestyle changes, and when to see a doctor

Return ONLY valid JSON, no additional text or markdown.`;

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Image,
        },
      },
      prompt,
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

    const analysisResult: GeminiAnalysisResult = JSON.parse(responseText);
    return analysisResult;
  } catch (error) {
    console.error("Gemini analysis error:", error);
    throw new Error(
      `Gemini Vision API error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Server-side face analysis using Gemini Vision API
 * Provides accurate skin condition detection from facial images
 */
export async function analyzeFaceImageServer(
  file: File
): Promise<FaceDetectionResult> {
  try {
    // Convert file to buffer for processing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    // Get image dimensions for scaling
    const { width: imgWidth, height: imgHeight } = getImageDimensions(buffer);

    // Analyze with Gemini Vision API
    const geminiResult = await analyzeWithGemini(base64Image, mimeType);

    // Convert Gemini results to our interface format
    const faces: FaceBoundingBox[] = [];
    const problemAreas: FaceBoundingBox[] = [];

    if (geminiResult.face_detected && geminiResult.face_bounds) {
      const fb = geminiResult.face_bounds;
      faces.push({
        x: Math.round((fb.x_percent / 100) * imgWidth),
        y: Math.round((fb.y_percent / 100) * imgHeight),
        width: Math.round((fb.width_percent / 100) * imgWidth),
        height: Math.round((fb.height_percent / 100) * imgHeight),
        label: "Face",
      });
    }

    // Add problem area bounding boxes
    for (const condition of geminiResult.detected_conditions || []) {
      if (condition.area_bounds) {
        const ab = condition.area_bounds;
        problemAreas.push({
          x: Math.round((ab.x_percent / 100) * imgWidth),
          y: Math.round((ab.y_percent / 100) * imgHeight),
          width: Math.round((ab.width_percent / 100) * imgWidth),
          height: Math.round((ab.height_percent / 100) * imgHeight),
          label: condition.condition,
        });
      }
    }

    // Convert detected conditions to our SkinProblem format
    const problemsDetected: SkinProblem[] = (
      geminiResult.detected_conditions || []
    ).map((condition) => ({
      type: condition.condition,
      severity: condition.severity,
      description: condition.description,
      confidence: condition.confidence,
      location: condition.location,
    }));

    // Convert treatments
    const treatments: Treatment[] = (
      geminiResult.recommended_treatments || []
    ).map((treatment) => ({
      category: treatment.category,
      recommendation: treatment.recommendation,
      priority: treatment.priority,
      timeframe: treatment.timeframe,
      for_condition: treatment.for_condition,
    }));

    // If no problems detected, add a healthy skin message
    if (problemsDetected.length === 0 && geminiResult.face_detected) {
      problemsDetected.push({
        type: "Healthy Skin",
        severity: "mild",
        description:
          "No significant skin concerns detected. Your skin appears healthy with normal coloration and texture.",
        confidence: 0.9,
        location: "Overall face",
      });

      treatments.push({
        category: "Maintenance",
        recommendation:
          "Continue your current skincare routine. Use SPF 30+ sunscreen daily, moisturize regularly, and stay hydrated.",
        priority: "low",
        timeframe: "Ongoing daily routine",
      });
    }

    const skinAnalysis = geminiResult.skin_analysis || {
      overall_health: "unknown",
      redness_level: 0,
      yellowness_level: 0,
      skin_tone: "Unable to analyze",
    };

    const result: FaceDetectionResult = {
      face_detected: geminiResult.face_detected,
      faces_count: geminiResult.faces_count || (geminiResult.face_detected ? 1 : 0),
      faces,
      problem_areas: problemAreas,
      image_width: imgWidth,
      image_height: imgHeight,
      visual_metrics: [
        {
          face_index: 0,
          redness_percentage: Math.round(skinAnalysis.redness_level),
          yellowness_percentage: Math.round(skinAnalysis.yellowness_level),
          skin_tone_analysis: skinAnalysis.skin_tone,
          overall_skin_health: skinAnalysis.overall_health,
        },
      ],
      problems_detected: problemsDetected,
      treatments,
      annotated_image: dataUrl,
    };

    return result;
  } catch (error) {
    // If Gemini fails, fall back to basic analysis
    console.error("Gemini analysis failed, using fallback:", error);
    return fallbackAnalysis(file);
  }
}

/**
 * Fallback analysis when Gemini API is unavailable
 */
async function fallbackAnalysis(file: File): Promise<FaceDetectionResult> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const dataUrl = `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`;
  const { width: imgWidth, height: imgHeight } = getImageDimensions(buffer);

  // Create centered face box as fallback
  const boxWidth = Math.max(180, Math.round(imgWidth * 0.45));
  const boxHeight = Math.max(180, Math.round(imgHeight * 0.5));
  const boxX = Math.max(0, Math.round((imgWidth - boxWidth) / 2));
  const boxY = Math.max(0, Math.round((imgHeight - boxHeight) / 2.5));

  return {
    face_detected: true,
    faces_count: 1,
    faces: [{ x: boxX, y: boxY, width: boxWidth, height: boxHeight }],
    image_width: imgWidth,
    image_height: imgHeight,
    visual_metrics: [
      {
        face_index: 0,
        redness_percentage: 0,
        yellowness_percentage: 0,
        skin_tone_analysis:
          "Unable to analyze - AI service temporarily unavailable. Please try again.",
      },
    ],
    problems_detected: [
      {
        type: "Analysis Unavailable",
        severity: "mild",
        description:
          "The AI analysis service is temporarily unavailable. Please try again in a moment for accurate skin condition detection.",
        confidence: 1,
      },
    ],
    treatments: [
      {
        category: "Retry",
        recommendation:
          "Please try uploading your image again for accurate analysis.",
        priority: "medium",
        timeframe: "Now",
      },
    ],
    annotated_image: dataUrl,
  };
}

function getImageDimensions(buffer: Buffer): { width: number; height: number } {
  // PNG: width/height stored at bytes 16-23 (big-endian)
  if (
    buffer
      .slice(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  // JPEG: scan for SOF0/2 marker to read dimensions
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length) {
      const marker = buffer[offset];
      const markerNext = buffer[offset + 1];
      if (marker !== 0xff) break;
      // SOF0 (0xC0) or SOF2 (0xC2)
      if (markerNext === 0xc0 || markerNext === 0xc2) {
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        return { width, height };
      }
      const blockLength = buffer.readUInt16BE(offset + 2);
      offset += 2 + blockLength;
    }
  }

  // Fallback dimensions if parsing fails
  return { width: 800, height: 600 };
}
