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
      lowerPrompt.includes("risk assessments (") &&
      !lowerPrompt.includes("risk assessments (0");
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
⚖️ **Risk Assessment** - Comprehensive health risk evaluation combining multiple data sources
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
        // Extract metrics from context
        const metricsSection = prompt.match(
          /Metrics Found[\s\S]*?(?=\n\n|\n📸|\n⚠️|$)/i
        );
        const summaryMatch = prompt.match(/Summary:\s*([^\n]+)/i);
        const concernsMatch = prompt.match(/⚠️ Concerns:\s*([^\n]+)/i);

        response = `${greeting}Based on your uploaded health reports, here's what I found:\n\n`;

        if (metricsSection) {
          response += `**📊 Your Health Metrics:**\n${metricsSection[0]}\n\n`;
        }

        if (summaryMatch) {
          response += `**📋 Summary:** ${summaryMatch[1]}\n\n`;
        }

        if (concernsMatch) {
          response += `**⚠️ Areas to Watch:** ${concernsMatch[1]}\n\n`;
        }

        response += `**💡 Recommendations:**
- Continue monitoring your health regularly
- Discuss any abnormal values with your healthcare provider
- Consider follow-up tests for any concerning metrics
- Maintain a healthy lifestyle with balanced nutrition and exercise

Would you like me to explain any specific metric in more detail?`;
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
          /Risk Assessment \d+[\s\S]*?(?=\n\n📊|$)/i
        );
        response = `${greeting}Here's a summary of your health risk assessment:\n\n`;

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
        response = `${greeting}You haven't generated a risk assessment yet.

**To get a comprehensive risk assessment:**
1. First, upload at least one health report
2. Optionally, complete a facial health scan
3. Go to **Risk Assessment** in the dashboard
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
${hasRiskData ? "✓ You have risk assessments" : "○ No risk assessments yet"}

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
3. **Risk Assessment** - Get a comprehensive health evaluation

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
