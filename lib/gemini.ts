/**
 * Gemini AI integration for health data analysis
 * Handles OCR text structuring and risk assessment generation
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

interface HealthMetric {
  name: string;
  value: string;
  unit?: string;
  status?: "normal" | "low" | "high" | "critical";
  reference_range?: string;
}

interface DetectedProblem {
  type: string;
  severity: "mild" | "moderate" | "severe";
  description: string;
  confidence: number;
}

interface Treatment {
  category: string;
  recommendation: string;
  priority: "low" | "medium" | "high";
  timeframe: string;
}

interface StructuredData {
  metrics: HealthMetric[];
  problems_detected?: DetectedProblem[];
  treatments?: Treatment[];
  summary?: string;
}

interface VisualMetrics {
  redness_percentage?: number;
  yellowness_percentage?: number;
  [key: string]: any;
}

interface UserData {
  age?: number;
  gender?: string;
  symptoms?: string[];
  [key: string]: any;
}

export class GeminiAnalyzer {
  private genai: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    if (!key) {
      throw new Error(
        "Gemini API key is required. Set GEMINI_API_KEY environment variable."
      );
    }

    this.genai = new GoogleGenerativeAI(key);
    // Default to gemini-2.5-flash; allow override via GEMINI_MODEL for quota flexibility
    this.model = this.genai.getGenerativeModel({
      model: modelName,
    });
  }

  /**
   * Converts raw OCR text to structured JSON using Gemini
   */
  async structureOcrData(rawText: string): Promise<StructuredData> {
    if (!rawText?.trim()) {
      throw new Error("Raw text cannot be empty");
    }

    const prompt = `You are a medical report analyzer. Analyze this medical report text and provide a comprehensive health analysis.

Medical Report Text:
${rawText}

Provide a complete analysis with:
1. All health metrics found (with status: normal/low/high/critical if determinable)
2. Any health problems or concerns detected
3. Recommended treatments or actions
4. Brief summary of overall health status

Return as valid JSON in this exact format:
{
  "metrics": [
    {"name": "Metric Name", "value": "123", "unit": "mg/dL", "status": "normal", "reference_range": "70-100"}
  ],
  "problems_detected": [
    {"type": "Problem Name", "severity": "mild|moderate|severe", "description": "Detailed description of the issue", "confidence": 0.85}
  ],
  "treatments": [
    {"category": "Category", "recommendation": "Specific recommendation", "priority": "low|medium|high", "timeframe": "When to act"}
  ],
  "summary": "Brief overall health summary based on the report"
}

IMPORTANT:
- Return ONLY valid JSON, no additional text or markdown
- Analyze ALL types of medical reports (blood tests, imaging, checkups, prescriptions, etc.)
- If values are outside normal ranges, mark status accordingly and add to problems_detected
- Provide actionable treatments for any detected problems
- Be thorough but concise in descriptions
- If no problems found, return empty problems_detected array and note "healthy" in summary
- Confidence should be between 0 and 1`;

    try {
      const result = await this.model.generateContent(prompt, {
        generationConfig: {
          temperature: 0.1, // Low temperature for consistent output
        },
      });

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

      // Parse JSON
      let structuredData: StructuredData;
      try {
        structuredData = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(
          `Invalid JSON response: ${parseError}. Response: ${responseText}`
        );
      }

      // Validate structure
      if (!structuredData || typeof structuredData !== "object") {
        throw new Error("Response is not a JSON object");
      }

      if (!structuredData.metrics || !Array.isArray(structuredData.metrics)) {
        throw new Error("Response missing valid metrics array");
      }

      return structuredData;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Gemini API error: ${error.message}`);
      }
      throw new Error("Unknown error occurred during text structuring");
    }
  }

  /**
   * Generates health risk assessment based on combined data
   */
  async generateRiskAssessment(
    labData: any,
    visualMetrics: VisualMetrics,
    userData: UserData
  ): Promise<string> {
    if (!labData) {
      throw new Error("Lab data is required");
    }
    if (!visualMetrics) {
      throw new Error("Visual metrics are required");
    }
    if (!userData) {
      throw new Error("User data is required");
    }

    const prompt = `Based on the following patient data, provide a health risk assessment:

Lab Report Data: ${JSON.stringify(labData, null, 2)}
Facial Analysis: ${JSON.stringify(visualMetrics, null, 2)}
Patient Info: ${JSON.stringify(userData, null, 2)}

Provide a concise health risk assessment highlighting any concerning indicators.
Focus on:
1. Any lab values outside normal ranges
2. Visual indicators (high redness or yellowness percentages)
3. Potential health risks based on the combination of data
4. Recommendations for follow-up or medical consultation

Keep the assessment professional, clear, and actionable.`;

    try {
      const result = await this.model.generateContent(prompt, {
        generationConfig: {
          temperature: 0.3, // Slightly higher temperature for natural text
        },
      });

      const response = await result.response;
      const assessment = response.text().trim();

      if (!assessment) {
        throw new Error("Empty risk assessment received");
      }

      return assessment;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Gemini API error: ${error.message}`);
      }
      throw new Error("Unknown error occurred during risk assessment");
    }
  }

  /**
   * Generates personalized health insights for chatbot conversations
   */
  async generateHealthInsights(prompt: string): Promise<string> {
    if (!prompt?.trim()) {
      throw new Error("Prompt cannot be empty");
    }

    try {
      const result = await this.model.generateContent(prompt, {
        generationConfig: {
          temperature: 0.4, // Balanced temperature for conversational responses
          maxOutputTokens: 1000, // Reasonable response length
        },
      });

      const response = await result.response;
      const insights = response.text().trim();

      if (!insights) {
        throw new Error("Empty insights response received");
      }

      return insights;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Gemini API error: ${error.message}`);
      }
      throw new Error("Unknown error occurred during insights generation");
    }
  }
}

// Utility function to create analyzer instance with fallback
export function createGeminiAnalyzer(): GeminiAnalyzer {
  try {
    return new GeminiAnalyzer();
  } catch (error) {
    console.warn("Failed to initialize Gemini analyzer:", error);
    // Re-throw the error so the calling function can handle fallback
    throw error;
  }
}

// Standalone function for health insights (used by chatbot)
export async function generateHealthInsights(prompt: string): Promise<string> {
  try {
    const analyzer = createGeminiAnalyzer();
    return await analyzer.generateHealthInsights(prompt);
  } catch (error) {
    console.warn("Gemini API failed, falling back to mock:", error);

    // Fall back to mock implementation
    const { createMockGeminiAnalyzer } = await import("./gemini-mock");
    const mockAnalyzer = createMockGeminiAnalyzer();
    return await mockAnalyzer.generateHealthInsights(prompt);
  }
}
