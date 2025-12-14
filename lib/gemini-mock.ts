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

    // Extract key information from the prompt to provide relevant responses
    const lowerPrompt = prompt.toLowerCase();

    let response = "";

    // Check what the user is asking about
    if (
      lowerPrompt.includes("what should i upload") ||
      lowerPrompt.includes("upload first")
    ) {
      response = `Great question! To get the most out of SehatScan AI, I recommend starting with:

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
      lowerPrompt.includes("health") &&
      lowerPrompt.includes("mental")
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
      lowerPrompt.includes("sehat scan") ||
      lowerPrompt.includes("sehatscan")
    ) {
      response = `**SehatScan AI** is your intelligent health companion! 🤖✨

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
    } else if (
      lowerPrompt.includes("help") ||
      lowerPrompt.includes("what can you")
    ) {
      response = `I'm your AI Health Assistant! Here's how I can help you: 🤖💙

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
      // Generic helpful response
      response = `I'd be happy to help you with your health-related questions! 

Based on your query, here are some ways I can assist:

**🔍 If you have health data uploaded:**
- I can analyze your lab results and explain what they mean
- Identify trends and patterns in your health metrics
- Provide insights about your facial health analysis
- Explain your risk assessment results

**📚 If you're looking for general health information:**
- I can explain medical terms and concepts
- Provide educational content about health monitoring
- Guide you on what health data to track
- Share tips for better health management

**🚀 To get more personalized insights:**
- Upload your medical reports for detailed analysis
- Take a clear photo for facial health assessment
- Ask specific questions about your health data
- Use the suggested questions to get started

**💡 Try asking me:**
- "What insights can you provide from my latest health report?"
- "How are my health metrics trending over time?"
- "What should I be concerned about in my recent analyses?"

What specific aspect of your health would you like to explore today?`;
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
