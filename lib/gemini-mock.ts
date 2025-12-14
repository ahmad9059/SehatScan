/**
 * Mock Gemini AI integration for testing when API quota is exceeded
 * This provides the same interface as the real Gemini analyzer but returns mock data
 */

interface HealthMetric {
  name: string;
  value: string;
  unit?: string;
}

interface StructuredData {
  metrics: HealthMetric[];
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

export class MockGeminiAnalyzer {
  constructor(apiKey?: string) {
    console.log("🔄 Using Mock Gemini Analyzer (API quota exceeded)");
  }

  /**
   * Mock OCR data structuring - extracts common health metrics from text
   */
  async structureOcrData(rawText: string): Promise<StructuredData> {
    if (!rawText?.trim()) {
      throw new Error("Raw text cannot be empty");
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simple regex-based extraction for common health metrics
    const metrics: HealthMetric[] = [];

    // Common health metric patterns
    const patterns = [
      {
        regex: /hemoglobin[:\s]+([0-9.]+)\s*(g\/dl|g\/dL|gm\/dl)/i,
        name: "Hemoglobin",
        unit: "g/dL",
      },
      {
        regex: /hb[:\s]+([0-9.]+)\s*(g\/dl|g\/dL|gm\/dl)/i,
        name: "Hemoglobin",
        unit: "g/dL",
      },
      {
        regex:
          /white blood cells?[:\s]+([0-9,]+)\s*(cells?\/μl|\/μl|cells\/ul)/i,
        name: "White Blood Cells",
        unit: "cells/μL",
      },
      {
        regex: /wbc[:\s]+([0-9,]+)\s*(cells?\/μl|\/μl|cells\/ul)/i,
        name: "White Blood Cells",
        unit: "cells/μL",
      },
      {
        regex: /cholesterol[:\s]+([0-9.]+)\s*(mg\/dl|mg\/dL)/i,
        name: "Total Cholesterol",
        unit: "mg/dL",
      },
      {
        regex: /blood sugar[:\s]+([0-9.]+)\s*(mg\/dl|mg\/dL)/i,
        name: "Blood Sugar",
        unit: "mg/dL",
      },
      {
        regex: /glucose[:\s]+([0-9.]+)\s*(mg\/dl|mg\/dL)/i,
        name: "Glucose",
        unit: "mg/dL",
      },
      {
        regex: /blood pressure[:\s]+([0-9]+\/[0-9]+)\s*(mmhg|mm hg)?/i,
        name: "Blood Pressure",
        unit: "mmHg",
      },
      {
        regex: /bp[:\s]+([0-9]+\/[0-9]+)\s*(mmhg|mm hg)?/i,
        name: "Blood Pressure",
        unit: "mmHg",
      },
      {
        regex: /heart rate[:\s]+([0-9]+)\s*(bpm|beats\/min)?/i,
        name: "Heart Rate",
        unit: "bpm",
      },
      {
        regex: /pulse[:\s]+([0-9]+)\s*(bpm|beats\/min)?/i,
        name: "Heart Rate",
        unit: "bpm",
      },
      {
        regex: /temperature[:\s]+([0-9.]+)\s*(°f|°c|f|c)/i,
        name: "Temperature",
        unit: "°F",
      },
      {
        regex: /weight[:\s]+([0-9.]+)\s*(kg|lbs|pounds)/i,
        name: "Weight",
        unit: "kg",
      },
      {
        regex: /height[:\s]+([0-9.]+)\s*(cm|ft|feet|inches)/i,
        name: "Height",
        unit: "cm",
      },
    ];

    patterns.forEach((pattern) => {
      const match = rawText.match(pattern.regex);
      if (match) {
        metrics.push({
          name: pattern.name,
          value: match[1].replace(/,/g, ""), // Remove commas from numbers
          unit: pattern.unit,
        });
      }
    });

    // If no metrics found, return a message
    if (metrics.length === 0) {
      metrics.push({
        name: "Analysis Status",
        value: "No standard health metrics detected in the provided text",
        unit: undefined,
      });
    }

    return { metrics };
  }

  /**
   * Mock risk assessment generation
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

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate a basic risk assessment based on available data
    let assessment = "## Health Risk Assessment\n\n";

    // Analyze lab data
    if (labData.metrics && Array.isArray(labData.metrics)) {
      assessment += "### Laboratory Results Analysis:\n";

      labData.metrics.forEach((metric: any) => {
        if (metric.name && metric.value) {
          assessment += `- **${metric.name}**: ${metric.value}${
            metric.unit ? ` ${metric.unit}` : ""
          }\n`;

          // Add basic interpretation for common metrics
          if (metric.name.toLowerCase().includes("hemoglobin")) {
            const value = parseFloat(metric.value);
            if (value < 12) {
              assessment += "  - ⚠️ Below normal range - may indicate anemia\n";
            } else if (value > 16) {
              assessment +=
                "  - ⚠️ Above normal range - may indicate dehydration or other conditions\n";
            } else {
              assessment += "  - ✅ Within normal range\n";
            }
          }

          if (metric.name.toLowerCase().includes("cholesterol")) {
            const value = parseFloat(metric.value);
            if (value > 200) {
              assessment +=
                "  - ⚠️ Elevated - consider dietary modifications\n";
            } else {
              assessment += "  - ✅ Within recommended range\n";
            }
          }
        }
      });
      assessment += "\n";
    }

    // Analyze visual metrics
    if (visualMetrics) {
      assessment += "### Visual Health Indicators:\n";

      if (visualMetrics.redness_percentage !== undefined) {
        assessment += `- **Facial Redness**: ${visualMetrics.redness_percentage}%\n`;
        if (visualMetrics.redness_percentage > 60) {
          assessment +=
            "  - ⚠️ High redness detected - may indicate inflammation or irritation\n";
        } else {
          assessment += "  - ✅ Normal redness levels\n";
        }
      }

      if (visualMetrics.yellowness_percentage !== undefined) {
        assessment += `- **Facial Yellowness**: ${visualMetrics.yellowness_percentage}%\n`;
        if (visualMetrics.yellowness_percentage > 70) {
          assessment +=
            "  - ⚠️ High yellowness detected - may indicate jaundice, consult a healthcare provider\n";
        } else {
          assessment += "  - ✅ Normal skin tone\n";
        }
      }
      assessment += "\n";
    }

    // User information
    if (userData) {
      assessment += "### Patient Information Considered:\n";
      if (userData.age) {
        assessment += `- **Age**: ${userData.age} years\n`;
      }
      if (userData.gender) {
        assessment += `- **Gender**: ${userData.gender}\n`;
      }
      if (userData.symptoms && Array.isArray(userData.symptoms)) {
        assessment += `- **Reported Symptoms**: ${userData.symptoms.join(
          ", "
        )}\n`;
      }
      assessment += "\n";
    }

    // General recommendations
    assessment += "### Recommendations:\n";
    assessment +=
      "- 📋 **Follow-up**: Schedule a consultation with your healthcare provider to discuss these results\n";
    assessment +=
      "- 🏥 **Professional Review**: This analysis is for informational purposes only and should not replace professional medical advice\n";
    assessment +=
      "- 📊 **Monitoring**: Keep track of your health metrics over time for better health management\n";
    assessment +=
      "- 🥗 **Lifestyle**: Maintain a balanced diet, regular exercise, and adequate sleep\n\n";

    assessment += "---\n";
    assessment +=
      "*Note: This assessment was generated using mock analysis due to API limitations. For accurate AI-powered analysis, please ensure your Gemini API key has sufficient quota.*";

    return assessment;
  }
}

// Utility function to create mock analyzer instance
export function createMockGeminiAnalyzer(): MockGeminiAnalyzer {
  return new MockGeminiAnalyzer();
}
