/**
 * Gemini AI integration for health data analysis
 * Handles OCR text structuring and health check generation
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
   * Generates dermatology-focused health check based on combined data
   */
  async generateRiskAssessment(
    labData: any,
    visualMetrics: VisualMetrics | null,
    userData: UserData
  ): Promise<string> {
    // At least one data source is required
    if (!labData && !visualMetrics) {
      throw new Error(
        "At least one data source (lab data or visual metrics) is required"
      );
    }
    if (!userData) {
      throw new Error("User data is required");
    }

    // Build dynamic data sections based on available data
    let dataSection = "";

    if (labData) {
      dataSection += `## Lab Report Data\n${JSON.stringify(labData, null, 2)}\n\n`;
    }

    if (visualMetrics) {
      dataSection += `## Facial/Skin Analysis\n${JSON.stringify(visualMetrics, null, 2)}\n\n`;
    }

    dataSection += `## Patient Information\n${JSON.stringify(userData, null, 2)}`;

    // Build skin-specific symptoms context
    const symptomsContext =
      userData.symptoms && userData.symptoms.length > 0
        ? `The patient reports the following skin-related symptoms: ${Array.isArray(userData.symptoms) ? userData.symptoms.join(", ") : userData.symptoms}`
        : "No specific skin symptoms reported.";

    const medicalHistoryContext = userData.medicalHistory
      ? `Medical History: ${userData.medicalHistory}`
      : "";

    const medicationsContext = userData.currentMedications
      ? `Current Medications: ${userData.currentMedications}`
      : "";

    const prompt = `You are an expert dermatology AI assistant providing a dermatologist-focused skin health check. Analyze the following data and generate a detailed dermatology report.

${dataSection}

${symptomsContext}
${medicalHistoryContext}
${medicationsContext}

Generate a comprehensive dermatology health check in **Markdown format** with the following sections:

# Dermatology Health Check Report

## Executive Summary
Provide a brief 2-3 sentence overview of the patient's current skin risk profile.

## Key Dermatology Findings
${labData ? "### Dermatology-Relevant Report Findings\n- Include only report findings that are relevant to skin, hair, or nails\n- Ignore non-dermatology findings unless they directly affect skin interpretation\n- If no dermatology-relevant findings are present, explicitly state that" : ""}
${visualMetrics ? "### Skin Photo Analysis\n- Summarize skin indicators from visual metrics\n- Note concerning markers (e.g., redness, yellowness, irritation patterns)\n- Assess overall skin condition confidence and limitations" : ""}

## Dermatology Risk Stratification

### Immediate Concerns (High Priority)
List skin findings that require prompt dermatologist evaluation. If none, state "No immediate dermatology concerns identified."

### Moderate Concerns (Monitor)
List skin findings that should be monitored or addressed soon.

### Low-Level Observations
List minor skin observations and maintenance opportunities.

## Personalized Dermatology Plan

### Daily Skin Care Actions
Provide specific, actionable skin-care steps (cleanser, moisturizer, SPF, barrier support, trigger avoidance).

### Targeted Treatment Considerations
Recommend evidence-based topical/oral ingredient categories when appropriate, with cautionary notes.

### Follow-up Actions
- Recommend when to consult a dermatologist (urgent vs routine)
- Suggest dermatology-relevant follow-up tests only when justified by available data
- Provide timeline for follow-up

### Preventive Skin Measures
Provide prevention tips focused on skin health, irritation control, and long-term skin barrier maintenance.

## Skin Risk Overview
Provide a simple skin risk interpretation:
- **Overall Risk Level**: Low / Moderate / Elevated / High
- **Areas of Strength**: List 2-3 positive skin indicators
- **Areas for Improvement**: List 2-3 actionable skin-focused improvement areas

---

**Important Notes:**
- This assessment is AI-generated and for informational purposes only
- Always consult a qualified dermatologist for diagnosis and treatment decisions
- Individual skin needs may vary

GUIDELINES:
- Keep the scope strictly dermatology-related (skin/hair/nails)
- Do not provide broad non-dermatology health risk conclusions
- Be explicit when data is insufficient for a dermatology conclusion
- Use clear, patient-friendly language
- Provide specific, actionable recommendations
- Consider the patient's age (${userData.age || "unknown"}) and gender (${userData.gender || "unknown"}) only when relevant to skin risk
- If symptoms are reported, correlate them with visual/report findings in dermatology context`;

    try {
      const result = await this.model.generateContent(prompt, {
        generationConfig: {
          temperature: 0.3, // Balanced temperature for accurate but natural text
          maxOutputTokens: 4000, // Allow for comprehensive assessment
        },
      });

      const response = await result.response;
      const assessment = response.text().trim();

      if (!assessment) {
        throw new Error("Empty health check received");
      }

      return assessment;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Gemini API error: ${error.message}`);
      }
      throw new Error("Unknown error occurred during health check");
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
          maxOutputTokens: 2048, // Allow longer health discussion responses
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

// --- Streaming chatbot support ---
// Singleton model for chatbot streaming. Uses GEMINI_CHATBOT_MODEL if set,
// otherwise falls back to the same GEMINI_MODEL used elsewhere.
let _chatbotModel: ReturnType<GoogleGenerativeAI["getGenerativeModel"]> | null =
  null;

function getChatbotModel() {
  if (_chatbotModel) return _chatbotModel;
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "Gemini API key is required. Set GEMINI_API_KEY environment variable.",
    );
  }
  const genai = new GoogleGenerativeAI(key);
  const modelName =
    process.env.GEMINI_CHATBOT_MODEL ||
    process.env.GEMINI_MODEL ||
    "gemini-2.5-flash";
  _chatbotModel = genai.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 2048,
    },
  });
  return _chatbotModel;
}

/**
 * Stream health insights token-by-token for the chatbot.
 * Uses a faster non-thinking model (gemini-2.0-flash) for low latency.
 */
export async function* streamHealthInsights(
  prompt: string,
): AsyncGenerator<string> {
  if (!prompt?.trim()) {
    throw new Error("Prompt cannot be empty");
  }
  const model = getChatbotModel();
  const result = await model.generateContentStream(prompt);
  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}
