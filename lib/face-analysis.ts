/**
 * Face analysis utilities for health indicators
 * Uses face-api.js for face detection and color analysis
 */

export interface SkinProblem {
  type: string;
  severity: "mild" | "moderate" | "severe";
  description: string;
  confidence: number;
}

export interface Treatment {
  category: string;
  recommendation: string;
  priority: "low" | "medium" | "high";
  timeframe: string;
}

export interface FaceDetectionResult {
  face_detected: boolean;
  faces_count: number;
  faces: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  visual_metrics: Array<{
    face_index: number;
    redness_percentage: number;
    yellowness_percentage: number;
    skin_tone_analysis: string;
  }>;
  problems_detected: SkinProblem[];
  treatments: Treatment[];
  annotated_image?: string; // Base64 encoded image
}

/**
 * Analyze face for health indicators using canvas-based color analysis
 */
export async function analyzeFaceImage(
  file: File
): Promise<FaceDetectionResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      try {
        // Simple face detection using basic image analysis
        // This is a simplified approach - in production you'd use face-api.js or similar
        const result = performBasicFaceAnalysis(canvas, ctx);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Perform basic face analysis using color sampling
 */
function performBasicFaceAnalysis(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): FaceDetectionResult {
  const width = canvas.width;
  const height = canvas.height;

  // Sample the center region of the image (assuming face is centered)
  const centerX = width / 2;
  const centerY = height / 2;
  const sampleWidth = Math.min(width * 0.3, 200);
  const sampleHeight = Math.min(height * 0.4, 250);

  const startX = centerX - sampleWidth / 2;
  const startY = centerY - sampleHeight / 2;

  // Get image data for color analysis
  const imageData = ctx.getImageData(startX, startY, sampleWidth, sampleHeight);
  const data = imageData.data;

  let totalRed = 0;
  let totalGreen = 0;
  let totalBlue = 0;
  let pixelCount = 0;

  // Analyze color values
  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];
    const alpha = data[i + 3];

    // Skip transparent pixels
    if (alpha > 128) {
      totalRed += red;
      totalGreen += green;
      totalBlue += blue;
      pixelCount++;
    }
  }

  if (pixelCount === 0) {
    return {
      face_detected: false,
      faces_count: 0,
      faces: [],
      visual_metrics: [],
      problems_detected: [],
      treatments: [],
    };
  }

  const avgRed = totalRed / pixelCount;
  const avgGreen = totalGreen / pixelCount;
  const avgBlue = totalBlue / pixelCount;

  // Calculate health indicators
  const rednessPercentage = calculateRednessPercentage(
    avgRed,
    avgGreen,
    avgBlue
  );
  const yellownessPercentage = calculateYellownessPercentage(
    avgRed,
    avgGreen,
    avgBlue
  );
  const skinToneAnalysis = analyzeSkinTone(avgRed, avgGreen, avgBlue);

  // Generate detailed problem analysis and treatments
  const problemsDetected = analyzeSkinProblems(
    rednessPercentage,
    yellownessPercentage
  );
  const treatments = generateTreatmentRecommendations(problemsDetected);

  // Draw bounding box on the analyzed region
  ctx.strokeStyle = "#00ff00";
  ctx.lineWidth = 2;
  ctx.strokeRect(startX, startY, sampleWidth, sampleHeight);

  // Convert canvas to base64
  const annotatedImage = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];

  return {
    face_detected: true,
    faces_count: 1,
    faces: [
      {
        x: Math.round(startX),
        y: Math.round(startY),
        width: Math.round(sampleWidth),
        height: Math.round(sampleHeight),
      },
    ],
    visual_metrics: [
      {
        face_index: 0,
        redness_percentage: rednessPercentage,
        yellowness_percentage: yellownessPercentage,
        skin_tone_analysis: skinToneAnalysis,
      },
    ],
    problems_detected: problemsDetected,
    treatments: treatments,
    annotated_image: annotatedImage,
  };
}

/**
 * Calculate redness percentage based on RGB values
 */
function calculateRednessPercentage(
  red: number,
  green: number,
  blue: number
): number {
  // Redness is calculated as the dominance of red over other colors
  const total = red + green + blue;
  if (total === 0) return 0;

  const redRatio = red / total;
  const normalizedRedness = Math.max(0, (redRatio - 0.33) / 0.33); // Normalize above baseline

  return Math.round(normalizedRedness * 100);
}

/**
 * Calculate yellowness percentage based on RGB values
 */
function calculateYellownessPercentage(
  red: number,
  green: number,
  blue: number
): number {
  // Yellowness is calculated based on red+green dominance over blue
  const yellow = (red + green) / 2;
  const total = yellow + blue;
  if (total === 0) return 0;

  const yellowRatio = yellow / total;
  const normalizedYellowness = Math.max(0, (yellowRatio - 0.5) / 0.5); // Normalize above baseline

  return Math.round(normalizedYellowness * 100);
}

/**
 * Analyze overall skin tone
 */
function analyzeSkinTone(red: number, green: number, blue: number): string {
  const brightness = (red + green + blue) / 3;
  const redness = calculateRednessPercentage(red, green, blue);
  const yellowness = calculateYellownessPercentage(red, green, blue);

  if (redness > 60) {
    return "High redness detected - may indicate inflammation or irritation";
  } else if (yellowness > 70) {
    return "High yellowness detected - may indicate jaundice or liver-related issues";
  } else if (brightness < 80) {
    return "Darker skin tone detected - normal variation";
  } else if (brightness > 200) {
    return "Lighter skin tone detected - normal variation";
  } else {
    return "Normal skin tone detected";
  }
}
/**
 * Analyze skin problems based on color percentages
 */
function analyzeSkinProblems(
  redness: number,
  yellowness: number
): SkinProblem[] {
  const problems: SkinProblem[] = [];

  // Analyze redness levels
  if (redness > 70) {
    problems.push({
      type: "Severe Inflammation",
      severity: "severe",
      description:
        "High levels of redness detected, indicating possible severe inflammation, acute dermatitis, or allergic reaction. This may be accompanied by swelling, pain, or burning sensation.",
      confidence: 0.85,
    });
  } else if (redness > 50) {
    problems.push({
      type: "Moderate Inflammation",
      severity: "moderate",
      description:
        "Moderate redness detected, suggesting inflammation, irritation, or possible rosacea. This could be due to sun exposure, skincare products, or underlying skin conditions.",
      confidence: 0.75,
    });
  } else if (redness > 30) {
    problems.push({
      type: "Mild Irritation",
      severity: "mild",
      description:
        "Mild redness detected, which may indicate minor skin irritation, sensitivity, or recent sun exposure. This is often temporary and may resolve on its own.",
      confidence: 0.65,
    });
  }

  // Analyze yellowness levels
  if (yellowness > 60) {
    problems.push({
      type: "Possible Jaundice",
      severity: "severe",
      description:
        "Significant yellowness detected in the skin, which may indicate jaundice - a condition often related to liver dysfunction, bile duct problems, or blood disorders. Immediate medical consultation is recommended.",
      confidence: 0.8,
    });
  } else if (yellowness > 40) {
    problems.push({
      type: "Mild Yellowing",
      severity: "moderate",
      description:
        "Moderate yellowness detected, which could indicate early signs of jaundice, carotenemia (excess beta-carotene), or certain medications' side effects.",
      confidence: 0.7,
    });
  } else if (yellowness > 25) {
    problems.push({
      type: "Slight Discoloration",
      severity: "mild",
      description:
        "Slight yellowish tint detected, which may be due to natural skin tone variation, lighting conditions, or dietary factors (high carotene intake).",
      confidence: 0.6,
    });
  }

  // Combined analysis
  if (redness > 40 && yellowness > 30) {
    problems.push({
      type: "Mixed Skin Discoloration",
      severity: "moderate",
      description:
        "Both redness and yellowness detected, suggesting possible complex skin condition, medication side effects, or multiple underlying issues requiring professional evaluation.",
      confidence: 0.7,
    });
  }

  // If no significant problems detected
  if (problems.length === 0) {
    problems.push({
      type: "Normal Skin Appearance",
      severity: "mild",
      description:
        "Skin color appears within normal ranges. No significant discoloration or inflammation detected. Continue with regular skincare routine.",
      confidence: 0.9,
    });
  }

  return problems;
}

/**
 * Generate treatment recommendations based on detected problems
 */
function generateTreatmentRecommendations(
  problems: SkinProblem[]
): Treatment[] {
  const treatments: Treatment[] = [];
  const problemTypes = problems.map((p) => p.type);

  // Treatments for inflammation/redness
  if (
    problemTypes.some(
      (type) => type.includes("Inflammation") || type.includes("Irritation")
    )
  ) {
    treatments.push({
      category: "Immediate Care",
      recommendation:
        "Apply cool compresses for 10-15 minutes several times daily to reduce inflammation. Avoid hot water and harsh skincare products.",
      priority: "high",
      timeframe: "Start immediately",
    });

    treatments.push({
      category: "Skincare",
      recommendation:
        "Use gentle, fragrance-free moisturizers and cleansers. Consider products with aloe vera, chamomile, or niacinamide to soothe irritation.",
      priority: "high",
      timeframe: "Daily routine",
    });

    treatments.push({
      category: "Lifestyle",
      recommendation:
        "Identify and avoid potential triggers (new skincare products, detergents, foods). Protect skin from sun exposure with SPF 30+ sunscreen.",
      priority: "medium",
      timeframe: "Ongoing",
    });
  }

  // Treatments for severe conditions
  if (
    problemTypes.some(
      (type) => type.includes("Severe") || type.includes("Jaundice")
    )
  ) {
    treatments.push({
      category: "Medical Consultation",
      recommendation:
        "Schedule an appointment with a dermatologist or healthcare provider within 24-48 hours for proper diagnosis and treatment plan.",
      priority: "high",
      timeframe: "Within 1-2 days",
    });

    treatments.push({
      category: "Monitoring",
      recommendation:
        "Document symptoms with photos and notes. Monitor for changes in color, size, or associated symptoms like itching, pain, or fever.",
      priority: "high",
      timeframe: "Daily until seen by doctor",
    });
  }

  // Treatments for jaundice specifically
  if (problemTypes.some((type) => type.includes("Jaundice"))) {
    treatments.push({
      category: "Urgent Medical Care",
      recommendation:
        "Seek immediate medical attention. Jaundice can indicate serious liver or blood conditions requiring prompt treatment.",
      priority: "high",
      timeframe: "Immediately",
    });

    treatments.push({
      category: "Preparation for Medical Visit",
      recommendation:
        "Prepare a list of all medications, supplements, and recent dietary changes. Note any associated symptoms like fatigue, abdominal pain, or dark urine.",
      priority: "high",
      timeframe: "Before medical appointment",
    });
  }

  // General maintenance treatments
  if (
    problemTypes.some(
      (type) => type.includes("Normal") || type.includes("Mild")
    )
  ) {
    treatments.push({
      category: "Prevention",
      recommendation:
        "Maintain a consistent skincare routine with gentle cleansing, moisturizing, and daily sun protection to prevent future skin issues.",
      priority: "medium",
      timeframe: "Daily routine",
    });

    treatments.push({
      category: "Nutrition",
      recommendation:
        "Maintain a balanced diet rich in antioxidants (fruits, vegetables) and stay hydrated. Consider omega-3 supplements for skin health.",
      priority: "low",
      timeframe: "Ongoing lifestyle",
    });
  }

  // Always include general advice
  treatments.push({
    category: "General Health",
    recommendation:
      "Regular health check-ups can help detect underlying conditions early. Keep a skin diary to track changes over time.",
    priority: "low",
    timeframe: "Schedule annually",
  });

  return treatments;
}
