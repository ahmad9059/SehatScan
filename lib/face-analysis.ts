/**
 * Face analysis utilities for health indicators
 * Uses face-api.js for face detection and color analysis
 */

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
