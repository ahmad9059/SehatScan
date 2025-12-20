import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/clerk-session";
import { generateHealthInsights } from "@/lib/gemini";

// Enhanced error logging utility
function logError(context: string, error: unknown, additionalData?: any) {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error(`[${timestamp}] ${context}:`, {
    error: errorMessage,
    stack,
    additionalData,
  });
}

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface Analysis {
  id: string;
  type: string;
  createdAt: Date | string;
  structuredData?: any;
  visualMetrics?: any;
  riskAssessment?: string;
}

function prepareUserContext(userAnalyses: Analysis[]): string {
  if (!userAnalyses || userAnalyses.length === 0) {
    return "No health data available for this user.";
  }

  let context = "User's Health Data Summary:\n\n";

  // Group analyses by type
  const reportAnalyses = userAnalyses.filter((a) => a.type === "report");
  const faceAnalyses = userAnalyses.filter((a) => a.type === "face");
  const riskAnalyses = userAnalyses.filter((a) => a.type === "risk");

  // Add report analyses
  if (reportAnalyses.length > 0) {
    context += `Medical Reports (${reportAnalyses.length}):\n`;
    reportAnalyses.forEach((analysis, index) => {
      const date = new Date(analysis.createdAt).toLocaleDateString();
      context += `- Report ${index + 1} (${date}):\n`;

      if (analysis.structuredData?.metrics) {
        context += `  Health Metrics: ${analysis.structuredData.metrics.length} metrics detected\n`;
        analysis.structuredData.metrics.slice(0, 5).forEach((metric: any) => {
          context += `    • ${metric.name}: ${metric.value} ${
            metric.unit || ""
          } (${metric.status || "normal"})\n`;
        });
      }

      if (analysis.structuredData?.summary) {
        context += `  Summary: ${analysis.structuredData.summary}\n`;
      }
      context += "\n";
    });
  }

  // Add face analyses
  if (faceAnalyses.length > 0) {
    context += `Facial Health Analyses (${faceAnalyses.length}):\n`;
    faceAnalyses.forEach((analysis, index) => {
      const date = new Date(analysis.createdAt).toLocaleDateString();
      context += `- Face Analysis ${index + 1} (${date}):\n`;

      if (analysis.visualMetrics && analysis.visualMetrics.length > 0) {
        const metrics = analysis.visualMetrics[0];
        context += `  Visual Health Indicators:\n`;
        if (metrics.redness_percentage !== undefined) {
          context += `    • Redness: ${metrics.redness_percentage}%\n`;
        }
        if (metrics.yellowness_percentage !== undefined) {
          context += `    • Yellowness: ${metrics.yellowness_percentage}%\n`;
        }
        if (metrics.dark_circles_severity !== undefined) {
          context += `    • Dark Circles: ${metrics.dark_circles_severity}\n`;
        }
        if (metrics.overall_health_score !== undefined) {
          context += `    • Overall Health Score: ${metrics.overall_health_score}/100\n`;
        }
      }
      context += "\n";
    });
  }

  // Add risk assessments
  if (riskAnalyses.length > 0) {
    context += `Risk Assessments (${riskAnalyses.length}):\n`;
    riskAnalyses.forEach((analysis, index) => {
      const date = new Date(analysis.createdAt).toLocaleDateString();
      context += `- Risk Assessment ${index + 1} (${date}):\n`;

      if (analysis.riskAssessment) {
        // Extract key points from risk assessment
        const riskText = analysis.riskAssessment;
        const lines = riskText.split("\n").filter((line) => line.trim());
        const keyPoints = lines.slice(0, 3).join(" ");
        context += `  Key Findings: ${keyPoints}\n`;
      }
      context += "\n";
    });
  }

  // Add temporal analysis
  if (userAnalyses.length > 1) {
    const sortedAnalyses = [...userAnalyses].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const latestDate = new Date(
      sortedAnalyses[0].createdAt
    ).toLocaleDateString();
    const oldestDate = new Date(
      sortedAnalyses[sortedAnalyses.length - 1].createdAt
    ).toLocaleDateString();

    context += `Temporal Context:\n`;
    context += `- Data spans from ${oldestDate} to ${latestDate}\n`;
    context += `- Most recent analysis: ${sortedAnalyses[0].type} on ${latestDate}\n\n`;
  }

  return context;
}

function buildConversationContext(messages: Message[]): string {
  if (!messages || messages.length === 0) {
    return "";
  }

  let context = "Recent Conversation:\n";
  messages.forEach((msg) => {
    const role = msg.role === "user" ? "User" : "Assistant";
    context += `${role}: ${msg.content}\n`;
  });

  return context + "\n";
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Authenticate user
    let user;
    try {
      user = await requireAuth();
    } catch (authError) {
      logError("Chatbot - Authentication failed", authError);
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required. Please log in again.",
          errorType: "auth",
        },
        { status: 401 }
      );
    }

    // Parse request body
    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      logError("Chatbot - Request parsing failed", parseError);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format",
          errorType: "validation",
        },
        { status: 400 }
      );
    }

    const { message, userAnalyses, conversationHistory } = requestData;

    // Validate input
    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Message is required",
          errorType: "validation",
        },
        { status: 400 }
      );
    }

    // Prepare context for RAG
    const userContext = prepareUserContext(userAnalyses || []);
    const conversationContext = buildConversationContext(
      conversationHistory || []
    );

    // Build the complete prompt
    const systemPrompt = `You are a knowledgeable and empathetic AI health assistant. Your role is to help users understand their health data, provide insights, and answer questions about their medical reports and health analyses.

IMPORTANT GUIDELINES:
1. Always provide helpful, accurate, and evidence-based information
2. Be empathetic and supportive in your responses
3. Never provide specific medical diagnoses or treatment recommendations
4. Always recommend consulting healthcare professionals for medical concerns
5. Use the user's actual health data to provide personalized insights
6. Explain medical terms in simple, understandable language
7. Focus on trends, patterns, and general health insights
8. Be encouraging while being realistic about health concerns

AVAILABLE USER DATA:
${userContext}

${conversationContext}

Current User Question: ${message}

Please provide a helpful, personalized response based on the user's health data. If you don't have relevant data to answer their question, explain what information would be helpful and suggest they upload relevant health reports or analyses.`;

    // Generate response using Gemini (with automatic fallback to mock)
    let response;
    try {
      response = await generateHealthInsights(systemPrompt);
    } catch (aiError) {
      logError("Chatbot - AI generation failed completely", aiError, {
        userId: user.id,
        messageLength: message.length,
        hasUserData: (userAnalyses || []).length > 0,
      });

      // This should not happen since generateHealthInsights has its own fallback
      // But just in case, provide a final fallback
      const fallbackResponse = `I apologize, but I'm experiencing technical difficulties right now. 

However, I can still help you! Based on your question about "${message.slice(
        0,
        50
      )}${message.length > 50 ? "..." : ""}", here are some suggestions:

**If you're new to SehatScan:**
- Start by uploading a recent blood test or lab report
- Take a clear, well-lit photo of your face for health analysis
- Visit the Risk Assessment section to combine multiple analyses

**For ongoing health monitoring:**
- Check your History section to see trends over time
- Upload new reports to track changes in your health metrics
- Use the dashboard to get an overview of your health data

**Remember:** Always consult with healthcare professionals for medical advice and treatment decisions.

Please try your question again - I should be working better now!`;

      return NextResponse.json({
        success: true,
        response: fallbackResponse,
        fallback: true,
      });
    }

    // Validate response
    if (!response || typeof response !== "string") {
      logError("Chatbot - Invalid AI response", response);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid response from AI service",
          errorType: "service",
        },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    console.log(
      `[${new Date().toISOString()}] Chatbot response generated successfully in ${duration}ms`,
      {
        userId: user.id,
        messageLength: message.length,
        responseLength: response.length,
        hasUserData: (userAnalyses || []).length > 0,
        conversationLength: (conversationHistory || []).length,
      }
    );

    return NextResponse.json({
      success: true,
      response: response.trim(),
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logError("Chatbot - Unexpected error", error, { duration });

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred. Please try again.",
        errorType: "unexpected",
      },
      { status: 500 }
    );
  }
}
