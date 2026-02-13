/**
 * Mock Gemini AI integration for testing when API quota is exceeded
 * This provides the same interface as the real Gemini analyzer but returns mock data
 */

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

    // Generate problems and treatments based on detected metrics
    const problems_detected: DetectedProblem[] = [];
    const treatments: Treatment[] = [];

    // Check for abnormal values and generate problems/treatments
    metrics.forEach((metric) => {
      const value = parseFloat(metric.value.replace(/[^0-9.]/g, ""));

      if (metric.name === "Hemoglobin" && value < 12) {
        problems_detected.push({
          type: "Low Hemoglobin",
          severity: value < 10 ? "severe" : "moderate",
          description: `Hemoglobin level of ${metric.value} is below normal range. This may indicate anemia or blood loss.`,
          confidence: 0.85,
        });
        treatments.push({
          category: "Medical Consultation",
          recommendation:
            "Consult with a healthcare provider for further evaluation and possible iron supplementation.",
          priority: "high",
          timeframe: "Within 1 week",
        });
      }

      if (metric.name === "Total Cholesterol" && value > 200) {
        problems_detected.push({
          type: "Elevated Cholesterol",
          severity: value > 240 ? "severe" : "moderate",
          description: `Total cholesterol of ${metric.value} is above recommended levels, increasing cardiovascular risk.`,
          confidence: 0.8,
        });
        treatments.push({
          category: "Lifestyle Changes",
          recommendation:
            "Adopt a heart-healthy diet low in saturated fats, increase physical activity, and consider medication if levels remain high.",
          priority: "medium",
          timeframe: "Ongoing",
        });
      }

      if (metric.name === "Glucose" || metric.name === "Blood Sugar") {
        if (value > 126) {
          problems_detected.push({
            type: "Elevated Blood Sugar",
            severity: value > 200 ? "severe" : "moderate",
            description: `Fasting glucose of ${metric.value} may indicate diabetes or prediabetes.`,
            confidence: 0.85,
          });
          treatments.push({
            category: "Medical Follow-up",
            recommendation:
              "Schedule an HbA1c test and consult with an endocrinologist for diabetes management.",
            priority: "high",
            timeframe: "Within 1-2 weeks",
          });
        }
      }
    });

    // Generate summary
    let summary = "Report analysis completed. ";
    if (problems_detected.length === 0) {
      summary +=
        "All detected values appear within normal ranges. Continue regular health monitoring.";
    } else {
      summary += `${problems_detected.length} potential health concern(s) identified. Please review recommendations and consult healthcare provider.`;
    }

    return { metrics, problems_detected, treatments, summary };
  }

  /**
   * Mock health insights generation for chatbot
   */
  async generateHealthInsights(prompt: string): Promise<string> {
    if (!prompt?.trim()) {
      throw new Error("Prompt cannot be empty");
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Extract the user's actual question from the prompt
    const questionMatch = prompt.match(
      /=== CURRENT QUESTION ===\s*\n([^\n]+)/i
    );
    const userQuestion = questionMatch
      ? questionMatch[1].toLowerCase().trim()
      : prompt.toLowerCase();

    // Full prompt for context extraction
    const lowerPrompt = prompt.toLowerCase();

    // Check if user has health data in the context
    const hasNoData =
      lowerPrompt.includes("no health data available") ||
      lowerPrompt.includes("hasn't uploaded any reports");
    const hasReportData =
      lowerPrompt.includes("medical reports (") &&
      !lowerPrompt.includes("medical reports (0");
    const hasFaceData =
      lowerPrompt.includes("facial health analyses (") &&
      !lowerPrompt.includes("facial health analyses (0");
    const hasRiskData =
      lowerPrompt.includes("health checks (") &&
      !lowerPrompt.includes("health checks (0");
    const hasAnyData = hasReportData || hasFaceData || hasRiskData;

    // Extract user name if available
    const nameMatch = prompt.match(/Name:\s*([^\n]+)/i);
    const userName =
      nameMatch && nameMatch[1] !== "Not provided" ? nameMatch[1].trim() : null;
    const greeting = userName ? `${userName}, ` : "";

    let response = "";

    // Check for SehatScan-related questions FIRST (highest priority)
    if (
      userQuestion.includes("what is sehat") ||
      userQuestion.includes("what's sehat") ||
      userQuestion.includes("sehatscan") ||
      userQuestion.includes("sehat scan") ||
      userQuestion.includes("about this app") ||
      userQuestion.includes("about this platform")
    ) {
      response = `${greeting}**SehatScan AI** is your intelligent health companion! 🤖✨

**What is SehatScan?**
SehatScan is an AI-powered health analysis platform that helps you understand your medical data through advanced technology.

**Key Features:**
📋 **Report Analysis** - Upload lab reports, and I'll extract and explain your health metrics
📸 **Facial Health Analysis** - AI-powered visual health assessment from photos
⚖️ **Health Check** - Dermatology-focused evaluation combining multiple data sources
💬 **AI Health Assistant** - That's me! I provide personalized insights based on your data
📊 **Health Tracking** - Monitor your health trends over time

**How It Works:**
1. **Upload** your medical reports or photos
2. **AI Analysis** processes your data using advanced algorithms
3. **Get Insights** receive easy-to-understand explanations
4. **Track Progress** monitor your health journey over time

**Why SehatScan?**
- Makes complex medical data understandable
- Provides personalized health insights
- Helps you stay informed about your health
- Supports better communication with healthcare providers

**Important:** SehatScan provides educational insights, not medical diagnoses. Always consult healthcare professionals for medical decisions.

Ready to start your health journey? Upload your first report or photo!`;
    }
    // Handle report-related queries
    else if (
      userQuestion.includes("latest report") ||
      userQuestion.includes("health report") ||
      userQuestion.includes("my report") ||
      userQuestion.includes("explain my") ||
      userQuestion.includes("my results") ||
      userQuestion.includes("lab results") ||
      userQuestion.includes("blood test")
    ) {
      if (hasReportData) {
        response = `${greeting}Based on your uploaded health reports, here's what I found:\n\n`;

        // Extract individual metrics with better formatting
        const metricsMatches = prompt.matchAll(
          /([✓⚠️⬇️])\s*([^:]+):\s*([^\[]+)\[([^\]]+)\]/g
        );
        const metrics = [...metricsMatches];

        if (metrics.length > 0) {
          response += `**📊 Your Health Metrics:**\n\n`;
          response += `| Metric | Value | Status |\n`;
          response += `|--------|-------|--------|\n`;

          for (const match of metrics) {
            const icon =
              match[1] === "✓" ? "✅" : match[1] === "⬇️" ? "🔽" : "⚠️";
            const name = match[2].trim();
            const value = match[3].trim();
            const status = match[4].trim();
            response += `| ${name} | ${value} | ${icon} ${status} |\n`;
          }
          response += `\n`;
        }

        // Extract problems detected
        const problemsMatch = prompt.match(
          /Problems Detected:[\s\S]*?(?=💊|Recommended|$)/i
        );
        if (problemsMatch) {
          const problems = problemsMatch[0]
            .replace(/Problems Detected:\s*-?\s*/i, "")
            .trim();
          if (problems && problems.length > 0) {
            response += `**🔍 Issues Found:**\n- ${problems}\n\n`;
          }
        }

        // Extract treatments
        const treatmentsMatch = prompt.match(
          /Recommended Treatments:[\s\S]*?(?=\n\n|\n📸|\n⚠️|Summary|$)/i
        );
        if (treatmentsMatch) {
          const treatments = treatmentsMatch[0]
            .replace(/Recommended Treatments:\s*-?\s*/i, "")
            .trim();
          if (treatments && treatments.length > 0) {
            response += `**💊 Recommended Actions:**\n- ${treatments}\n\n`;
          }
        }

        response += `**💡 General Recommendations:**\n`;
        response += `- Continue monitoring your health regularly\n`;
        response += `- Discuss any abnormal values with your healthcare provider\n`;
        response += `- Consider follow-up tests for any concerning metrics\n`;
        response += `- Maintain a healthy lifestyle with balanced nutrition and exercise\n\n`;
        response += `Would you like me to explain any specific metric in more detail?`;
      } else {
        response = `${greeting}I don't see any health reports in your account yet.

**To get personalized report analysis:**
1. Go to **Scan Report** in the dashboard
2. Upload a clear photo of your lab report (blood test, urine test, etc.)
3. Our AI will extract and analyze your health metrics
4. Come back here and I'll explain everything in detail!

Would you like me to guide you through uploading your first report?`;
      }
    } else if (
      userQuestion.includes("face") ||
      userQuestion.includes("facial") ||
      userQuestion.includes("skin") ||
      userQuestion.includes("appearance")
    ) {
      if (hasFaceData) {
        response = `${greeting}Based on your facial health analysis:\n\n`;

        // Try to extract facial metrics
        const visualSection = prompt.match(
          /Visual Health Indicators:[\s\S]*?(?=\n\n|\n⚠️|$)/i
        );
        if (visualSection) {
          response += `**📸 Your Visual Health Indicators:**\n${visualSection[0]}\n\n`;
        }

        response += `**💡 General Guidance:**
- Facial analysis can indicate signs of stress, fatigue, or dehydration
- Skin color changes may reflect underlying health conditions
- Regular analysis helps track changes over time

Would you like more details about any specific indicator?`;
      } else {
        response = `${greeting}You haven't done a facial health analysis yet.

**To get facial health insights:**
1. Go to **Scan Face** in the dashboard
2. Take a clear, well-lit photo of your face
3. Our AI will analyze visual health indicators
4. Get insights about hydration, stress, and skin health

Ready to try it?`;
      }
    } else if (
      userQuestion.includes("risk") ||
      userQuestion.includes("assessment")
    ) {
      if (hasRiskData) {
        const riskSection = prompt.match(
          /Health Check \d+[\s\S]*?(?=\n\n📊|$)/i
        );
        response = `${greeting}Here's a summary of your latest health check:\n\n`;

        if (riskSection) {
          response += riskSection[0] + "\n\n";
        }

        response += `**💡 Next Steps:**
- Review high-risk areas with your healthcare provider
- Focus on lifestyle changes for modifiable risk factors
- Schedule recommended screenings
- Continue regular health monitoring

Would you like me to explain any risk factor in detail?`;
      } else {
        response = `${greeting}You haven't generated a health check yet.

**To run a health check:**
1. First, upload at least one health report
2. Optionally, complete a facial health scan
3. Go to **Health Check** in the dashboard
4. Get a combined analysis of all your health data

Would you like to start by uploading a health report?`;
      }
    } else if (
      userQuestion.includes("trend") ||
      userQuestion.includes("history") ||
      userQuestion.includes("progress") ||
      userQuestion.includes("over time") ||
      userQuestion.includes("compare")
    ) {
      if (hasAnyData) {
        const temporalSection = prompt.match(
          /TEMPORAL CONTEXT[\s\S]*?(?=\n\n===|$)/i
        );
        response = `${greeting}Let me analyze your health trends:\n\n`;

        if (temporalSection) {
          response +=
            temporalSection[0].replace(
              "TEMPORAL CONTEXT & TRENDS:",
              "**📊 Your Health Timeline:**"
            ) + "\n\n";
        }

        response += `**💡 To better track trends:**
- Upload reports regularly (monthly or quarterly)
- Compare same types of tests over time
- Note any lifestyle changes between tests
- Look for patterns in improving or declining metrics

Would you like to focus on any specific metric or time period?`;
      } else {
        response = `${greeting}I need more data to show you trends.

Upload multiple health reports over time, and I'll be able to:
- Show how your metrics change
- Identify improving or declining trends
- Highlight patterns in your health data
- Compare results across different dates

Start by uploading your first report in **Scan Report**!`;
      }
    } else if (
      userQuestion.includes("what should i upload") ||
      userQuestion.includes("upload first")
    ) {
      response = `${greeting}Great question! To get the most out of SehatScan AI, I recommend starting with:

**1. Medical Lab Reports** 📋
- Blood test results (CBC, lipid panel, glucose, etc.)
- Urine analysis reports
- Any recent diagnostic test results
- These help me analyze your health metrics and trends

**2. Clear Facial Photos** 📸
- Well-lit, front-facing photos
- No makeup or filters for accurate analysis
- These help assess visual health indicators

**3. Recent Health Reports** 🏥
- Doctor's visit summaries
- Prescription information
- Any health monitoring data

Once you upload these, I can provide personalized insights about your health patterns, explain your test results in simple terms, and help you understand what your data means for your overall wellness.

Would you like me to guide you through uploading your first report?`;
    } else if (
      userQuestion.includes("health") &&
      userQuestion.includes("mental")
    ) {
      response = `Health, especially mental health, is a comprehensive state of well-being that goes beyond just the absence of disease.

**Physical Health** 💪
- Proper functioning of body systems
- Good nutrition, exercise, and sleep
- Regular medical check-ups
- Managing chronic conditions

**Mental Health** 🧠
- Emotional well-being and stability
- Ability to cope with stress and challenges
- Positive relationships and social connections
- Sense of purpose and life satisfaction

**The Connection** 🔗
Mental and physical health are deeply interconnected:
- Physical illness can affect mood and mental state
- Stress and mental health issues can manifest as physical symptoms
- Good mental health supports better physical health outcomes

**SehatScan AI helps by:**
- Analyzing your physical health data for patterns
- Identifying potential stress indicators in lab results
- Providing insights that support overall wellness
- Encouraging professional healthcare consultation when needed

Remember: While I can help you understand your health data, always consult healthcare professionals for mental health concerns or treatment.`;
    } else if (
      userQuestion.includes("help") ||
      userQuestion.includes("what can you")
    ) {
      response = `${greeting}I'm your AI Health Assistant! Here's how I can help you: 🤖💙

**📊 Data Analysis & Insights**
- Explain your lab report results in simple terms
- Identify patterns and trends in your health data
- Compare your metrics over time
- Highlight important changes or concerns

**🔍 Health Education**
- Explain medical terms and concepts
- Provide context for your test results
- Share general health information
- Answer questions about health monitoring

**💡 Personalized Guidance**
- Suggest what health data to upload next
- Recommend when to consult healthcare providers
- Help you prepare questions for doctor visits
- Guide you through using SehatScan features

**📈 Progress Tracking**
- Show how your health metrics change over time
- Identify positive trends in your data
- Point out areas that may need attention
- Celebrate your health improvements

**🚨 Important Reminders**
- I provide insights, not medical diagnoses
- Always consult healthcare professionals for medical concerns
- My analysis is based on the data you provide
- I encourage professional medical care when appropriate

**Ready to get started?** Try asking me:
- "Explain my latest blood test results"
- "What trends do you see in my health data?"
- "What should I discuss with my doctor?"
- "How can I improve my health metrics?"`;
    } else {
      // Context-aware fallback response
      if (hasAnyData) {
        response = `${greeting}I'm here to help with your health questions!

**📊 Your Health Data Summary:**
${
  hasReportData
    ? "✓ You have medical reports uploaded"
    : "○ No medical reports yet"
}
${hasFaceData ? "✓ You have facial health analyses" : "○ No facial scans yet"}
${hasRiskData ? "✓ You have health checks" : "○ No health checks yet"}

**💬 Try asking me about:**
- Your latest health report results
- Trends in your health metrics
- What your facial analysis means
- Specific health concerns or questions

What would you like to know about your health data?`;
      } else {
        response = `${greeting}Welcome to SehatScan AI! I'm your intelligent health assistant. 🤖✨

I notice you haven't uploaded any health data yet. To give you personalized insights, I need to analyze your health information.

**🚀 Get Started:**
1. **Scan Report** - Upload a blood test or lab report
2. **Scan Face** - Take a photo for visual health analysis
3. **Health Check** - Get a dermatologist-focused evaluation

**💡 Once you have data, I can:**
- Explain your test results in simple terms
- Track health trends over time
- Identify areas that need attention
- Answer questions about your metrics

Would you like me to guide you through uploading your first health report?`;
      }
    }

    return response;
  }

  /**
   * Mock dermatology health check generation
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

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const concerns: { level: "high" | "moderate" | "low"; description: string }[] = [];
    const strengths: string[] = [];
    const reportedSymptoms = Array.isArray(userData.symptoms)
      ? userData.symptoms
      : userData.symptoms
        ? [String(userData.symptoms)]
        : [];

    let assessment = "# Dermatology Health Check Report\n\n";
    assessment += "## Executive Summary\n\n";
    assessment += `This dermatologist-focused assessment is based on ${visualMetrics ? "skin photo analysis" : ""}${visualMetrics && labData ? " and " : ""}${labData ? "report data" : ""} for a ${userData.age || "unknown age"}-year-old ${userData.gender || "individual"}. `;
    assessment += "The findings below focus only on skin-related risk, with clear follow-up guidance.\n\n";

    assessment += "## Key Dermatology Findings\n\n";

    if (visualMetrics) {
      assessment += "### Skin Photo Analysis\n\n";

      if (visualMetrics.redness_percentage !== undefined) {
        assessment += `- **Facial Redness**: ${visualMetrics.redness_percentage}%`;
        if (visualMetrics.redness_percentage >= 65) {
          assessment += " - Elevated\n";
          concerns.push({
            level: "moderate",
            description:
              "Pronounced facial redness may indicate active irritation or inflammatory skin activity.",
          });
        } else if (visualMetrics.redness_percentage >= 35) {
          assessment += " - Mild elevation\n";
          concerns.push({
            level: "low",
            description:
              "Mild redness is present and may reflect sensitivity or temporary irritation.",
          });
        } else {
          assessment += " - Within expected range\n";
          strengths.push("Redness level is within a low-risk range");
        }
      }

      if (visualMetrics.yellowness_percentage !== undefined) {
        assessment += `- **Facial Yellowness**: ${visualMetrics.yellowness_percentage}%`;
        if (visualMetrics.yellowness_percentage >= 70) {
          assessment += " - Concerning\n";
          concerns.push({
            level: "high",
            description:
              "Marked yellowness should be reviewed urgently by a clinician to rule out jaundice-related causes.",
          });
        } else if (visualMetrics.yellowness_percentage >= 40) {
          assessment += " - Mild elevation\n";
          concerns.push({
            level: "low",
            description:
              "Mild yellow undertone is present; confirm under consistent lighting and monitor trend.",
          });
        } else {
          assessment += " - Within expected range\n";
          strengths.push("Skin tone balance appears stable");
        }
      }

      assessment += "\n";
    }

    if (labData) {
      assessment += "### Dermatology-Relevant Report Findings\n\n";
      const reportMetrics = Array.isArray(labData.metrics) ? labData.metrics : [];
      let matchedDermMetric = false;

      for (const metric of reportMetrics) {
        const name = String(metric?.name || "").trim();
        if (!name) {
          continue;
        }

        const lowerName = name.toLowerCase();
        const valueText = String(metric?.value || "").trim();
        const unit = metric?.unit ? ` ${metric.unit}` : "";
        const numericValue = Number.parseFloat(valueText.replace(/,/g, ""));
        const hasNumeric = Number.isFinite(numericValue);

        if (
          lowerName.includes("crp") ||
          lowerName.includes("esr") ||
          lowerName.includes("ige") ||
          lowerName.includes("eosin")
        ) {
          matchedDermMetric = true;
          assessment += `- **${name}**: ${valueText}${unit} (inflammation/allergy marker potentially relevant to skin)\n`;
          if (hasNumeric && numericValue > 0) {
            concerns.push({
              level: "low",
              description:
                `${name} may support inflammatory or allergic skin activity when correlated with symptoms.`,
            });
          }
          continue;
        }

        if (lowerName.includes("bilirubin")) {
          matchedDermMetric = true;
          assessment += `- **${name}**: ${valueText}${unit} (color-change marker relevant to yellowing concerns)\n`;
          if (hasNumeric && numericValue > 1.2) {
            concerns.push({
              level: "high",
              description:
                "Elevated bilirubin with visible yellowness warrants prompt clinical evaluation.",
            });
          }
          continue;
        }

        if (
          lowerName.includes("hba1c") ||
          lowerName.includes("glucose") ||
          lowerName.includes("vitamin d") ||
          lowerName.includes("ferritin") ||
          lowerName.includes("zinc") ||
          lowerName.includes("thyroid") ||
          lowerName.includes("tsh")
        ) {
          matchedDermMetric = true;
          assessment += `- **${name}**: ${valueText}${unit} (may influence skin healing, barrier, or flare tendency)\n`;
        }
      }

      if (!matchedDermMetric) {
        assessment +=
          "- No clearly dermatology-relevant report markers were identified from the provided report data.\n";
      }
      assessment += "\n";
    }

    if (reportedSymptoms.length > 0) {
      assessment += `- **Reported skin symptoms**: ${reportedSymptoms.join(", ")}\n\n`;
      if (
        reportedSymptoms.some((s) =>
          /itch|rash|burn|stinging|redness|peel/i.test(s)
        )
      ) {
        concerns.push({
          level: "moderate",
          description:
            "Reported active skin symptoms suggest ongoing irritation that should be clinically reviewed if persistent.",
        });
      }
    }

    assessment += "## Dermatology Risk Stratification\n\n";

    const highConcerns = concerns.filter((c) => c.level === "high");
    const moderateConcerns = concerns.filter((c) => c.level === "moderate");
    const lowConcerns = concerns.filter((c) => c.level === "low");

    assessment += "### Immediate Concerns (High Priority)\n\n";
    if (highConcerns.length > 0) {
      for (const concern of highConcerns) {
        assessment += `- ${concern.description}\n`;
      }
    } else {
      assessment += "No immediate dermatology concerns identified.\n";
    }
    assessment += "\n";

    assessment += "### Moderate Concerns (Monitor)\n\n";
    if (moderateConcerns.length > 0) {
      for (const concern of moderateConcerns) {
        assessment += `- ${concern.description}\n`;
      }
    } else {
      assessment += "No moderate dermatology concerns identified.\n";
    }
    assessment += "\n";

    assessment += "### Low-Level Observations\n\n";
    if (lowConcerns.length > 0) {
      for (const concern of lowConcerns) {
        assessment += `- ${concern.description}\n`;
      }
    } else {
      assessment += "No minor dermatology observations to note.\n";
    }
    assessment += "\n";

    assessment += "## Personalized Dermatology Plan\n\n";
    assessment += "### Daily Skin Care Actions\n\n";
    assessment += "- Use a gentle, fragrance-free cleanser and moisturizer twice daily\n";
    assessment += "- Apply broad-spectrum SPF 30+ every morning and reapply when outdoors\n";
    assessment += "- Avoid harsh exfoliants or frequent product switching during active irritation\n";
    if (reportedSymptoms.length > 0) {
      assessment += `- Track symptom triggers and flare patterns: ${reportedSymptoms.join(", ")}\n`;
    }
    assessment += "\n";

    assessment += "### Targeted Treatment Considerations\n\n";
    if (reportedSymptoms.some((s) => /acne|oily|breakout/i.test(s))) {
      assessment += "- Consider acne-focused actives (e.g., salicylic acid, adapalene) with gradual introduction\n";
    }
    if (reportedSymptoms.some((s) => /dry|flaky|itch|peel/i.test(s))) {
      assessment += "- Prioritize barrier repair with ceramides, petrolatum, and reduced irritant exposure\n";
    }
    if (reportedSymptoms.some((s) => /redness|burn|stinging|rash/i.test(s))) {
      assessment += "- Use anti-inflammatory, low-irritation products and pause known triggers until symptoms settle\n";
    }
    if (reportedSymptoms.length === 0) {
      assessment += "- No specific symptom-targeted treatment needed; continue maintenance skin care\n";
    }
    assessment += "\n";

    assessment += "### Follow-up Actions\n\n";
    if (highConcerns.length > 0) {
      assessment += "- **Urgent**: Arrange prompt clinical review (same week) for high-priority skin findings\n";
    } else if (moderateConcerns.length > 0) {
      assessment += "- Book a routine dermatologist follow-up within 2-6 weeks\n";
    } else {
      assessment += "- Continue monitoring skin changes and review with dermatology if new symptoms appear\n";
    }
    assessment += "- Bring photos and symptom timeline to improve clinical evaluation accuracy\n\n";

    assessment += "### Preventive Skin Measures\n\n";
    assessment += "- Maintain consistent sun protection and avoid prolonged UV exposure\n";
    assessment += "- Patch-test new skincare products before full-face use\n";
    assessment += "- Maintain sleep, hydration, and stress control to reduce flare frequency\n\n";

    assessment += "## Skin Risk Overview\n\n";
    const riskLevel =
      highConcerns.length > 0
        ? "High"
        : moderateConcerns.length > 0
          ? "Moderate"
          : lowConcerns.length > 0
            ? "Low"
            : "Low";

    assessment += `- **Overall Risk Level**: ${riskLevel}\n`;
    assessment += "- **Areas of Strength**: ";
    if (strengths.length > 0) {
      assessment += strengths.slice(0, 3).join(", ") + "\n";
    } else {
      assessment += "No major adverse skin indicators were detected from available data\n";
    }

    const improvements = concerns.slice(0, 3).map((c) => c.description);
    assessment += "- **Areas for Improvement**: ";
    if (improvements.length > 0) {
      assessment += improvements.join(", ") + "\n";
    } else {
      assessment += "Continue current skin-maintenance practices\n";
    }
    assessment += "\n";

    assessment += "---\n\n";
    assessment += "**Important Notes:**\n";
    assessment += "- This assessment is AI-generated and for informational purposes only\n";
    assessment += "- Always consult a qualified dermatologist for diagnosis and treatment\n";
    assessment += "- Skin findings can vary with lighting, image quality, and timing\n\n";
    assessment += "*Note: This assessment was generated using mock analysis due to API limitations. For accurate AI-powered analysis, ensure Gemini API quota is available.*";

    return assessment;
  }
}

// Utility function to create mock analyzer instance
export function createMockGeminiAnalyzer(): MockGeminiAnalyzer {
  return new MockGeminiAnalyzer();
}
