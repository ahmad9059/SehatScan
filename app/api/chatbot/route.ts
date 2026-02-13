import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/clerk-session";
import { generateHealthInsights } from "@/lib/gemini";
import { prisma } from "@/lib/db";
import { withCache, CACHE_TTL } from "@/lib/redis";

// SehatScan Knowledge Base - Project Information for RAG
const SEHATSCAN_KNOWLEDGE_BASE = `
ABOUT SEHATSCAN:
SehatScan is an AI-powered health analytics platform that helps users understand and monitor their health through:

1. MEDICAL REPORT ANALYSIS (Scan Report):
   - Upload blood tests, lab reports, medical documents
   - AI extracts key health metrics (cholesterol, glucose, hemoglobin, etc.)
   - Provides easy-to-understand explanations of results
   - Identifies abnormal values and potential concerns
   - Tracks changes over time when multiple reports are uploaded

2. FACIAL HEALTH ANALYSIS (Scan Face):
   - AI analyzes facial features for health indicators
   - Detects signs of fatigue, stress, dehydration
   - Monitors skin health (redness, yellowness, dark circles)
   - Provides overall health score based on visual indicators
   - Non-invasive health monitoring method

3. RISK ASSESSMENT:
   - Combines data from reports and facial analysis
   - Generates comprehensive health risk profile
   - Identifies potential health concerns early
   - Provides personalized recommendations
   - Helps prioritize areas for health improvement

4. HISTORY & TRENDS:
   - View all past analyses in one place
   - Track health metrics over time
   - Visualize improvements or areas needing attention
   - Compare results between different dates

5. AI HEALTH ASSISTANT (This Chatbot):
   - Ask questions about your health data
   - Get personalized insights based on your analyses
   - Understand medical terminology in simple terms
   - Receive general health guidance and recommendations

IMPORTANT DISCLAIMERS:
- SehatScan provides health insights, NOT medical diagnoses
- Always consult healthcare professionals for medical decisions
- AI analysis is meant to supplement, not replace, medical care
- Results should be verified by qualified healthcare providers
`;

// Enhanced error logging utility
function logError(context: string, error: unknown, additionalData?: object) {
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
  structuredData?: Record<string, unknown>;
  visualMetrics?: Record<string, unknown>[];
  riskAssessment?: string;
  problemsDetected?: Record<string, unknown>[];
  treatments?: Record<string, unknown>[];
}

interface UserProfile {
  name: string | null;
  email: string;
  memberSince: string;
  totalAnalyses: number;
}

function prepareUserProfile(user: {
  id: string;
  name?: string | null;
  email: string;
  createdAt?: Date;
}): UserProfile {
  return {
    name: user.name || null,
    email: user.email,
    memberSince: user.createdAt
      ? new Date(user.createdAt).toLocaleDateString()
      : "Unknown",
    totalAnalyses: 0, // Will be updated with actual count
  };
}

function prepareUserContext(
  userAnalyses: Analysis[],
  userProfile?: UserProfile
): string {
  let context = "";

  // Add user profile information
  if (userProfile) {
    context += "USER PROFILE:\n";
    context += `- Name: ${userProfile.name || "Not provided"}\n`;
    context += `- Member since: ${userProfile.memberSince}\n`;
    context += `- Total analyses: ${userAnalyses.length}\n\n`;
  }

  if (!userAnalyses || userAnalyses.length === 0) {
    context +=
      "HEALTH DATA: No health data available yet. The user hasn't uploaded any reports or analyses.\n";
    context += "SUGGESTION: Encourage the user to:\n";
    context += "- Upload a blood test or lab report in 'Scan Report'\n";
    context += "- Take a facial health analysis in 'Scan Face'\n";
    context += "- Generate a comprehensive Risk Assessment\n\n";
    return context;
  }

  context += "USER'S HEALTH DATA SUMMARY:\n\n";

  // Group analyses by type
  const reportAnalyses = userAnalyses.filter((a) => a.type === "report");
  const faceAnalyses = userAnalyses.filter((a) => a.type === "face");
  const riskAnalyses = userAnalyses.filter((a) => a.type === "risk");

  // Add report analyses with more detail
  if (reportAnalyses.length > 0) {
    context += `📋 MEDICAL REPORTS (${reportAnalyses.length} total):\n`;
    reportAnalyses.forEach((analysis, index) => {
      const date = new Date(analysis.createdAt).toLocaleDateString();
      context += `\n[Report ${index + 1}] Date: ${date}\n`;

      if (analysis.structuredData) {
        const data = analysis.structuredData as Record<string, unknown>;

        // Add metrics if available
        if (data.metrics && Array.isArray(data.metrics)) {
          context += `  Metrics Found (${data.metrics.length}):\n`;
          data.metrics.forEach((metric: Record<string, unknown>) => {
            const status = metric.status || "normal";
            const flag =
              status === "high" ? "⚠️" : status === "low" ? "⬇️" : "✓";
            context += `    ${flag} ${metric.name}: ${metric.value} ${
              metric.unit || ""
            } [${status}]\n`;
            if (metric.normalRange) {
              context += `       Normal range: ${metric.normalRange}\n`;
            }
          });
        }

        // Add summary
        if (data.summary) {
          context += `  Summary: ${data.summary}\n`;
        }

        // Add detected problems
        if (data.concerns && Array.isArray(data.concerns)) {
          context += `  ⚠️ Concerns: ${data.concerns.join(", ")}\n`;
        }
      }

      // Problems detected
      if (
        analysis.problemsDetected &&
        Array.isArray(analysis.problemsDetected)
      ) {
        context += `  🔍 Problems Detected:\n`;
        analysis.problemsDetected.forEach(
          (problem: Record<string, unknown>) => {
            context += `    - ${
              problem.name || problem.description || JSON.stringify(problem)
            }\n`;
          }
        );
      }

      // Treatment recommendations
      if (analysis.treatments && Array.isArray(analysis.treatments)) {
        context += `  💊 Recommended Treatments:\n`;
        analysis.treatments.forEach((treatment: Record<string, unknown>) => {
          context += `    - ${
            treatment.name || treatment.description || JSON.stringify(treatment)
          }\n`;
        });
      }
    });
    context += "\n";
  }

  // Add face analyses with more detail
  if (faceAnalyses.length > 0) {
    context += `📸 FACIAL HEALTH ANALYSES (${faceAnalyses.length} total):\n`;
    faceAnalyses.forEach((analysis, index) => {
      const date = new Date(analysis.createdAt).toLocaleDateString();
      context += `\n[Face Analysis ${index + 1}] Date: ${date}\n`;

      if (analysis.visualMetrics && analysis.visualMetrics.length > 0) {
        const metrics = analysis.visualMetrics[0];
        context += `  Visual Health Indicators:\n`;

        Object.entries(metrics).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            const formattedKey = key
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase());
            context += `    • ${formattedKey}: ${value}\n`;
          }
        });
      }

      if (analysis.structuredData) {
        const data = analysis.structuredData as Record<string, unknown>;
        if (data.observations) {
          context += `  Observations: ${data.observations}\n`;
        }
        if (data.recommendations) {
          context += `  Recommendations: ${data.recommendations}\n`;
        }
      }
    });
    context += "\n";
  }

  // Add risk assessments
  if (riskAnalyses.length > 0) {
    context += `⚠️ RISK ASSESSMENTS (${riskAnalyses.length} total):\n`;
    riskAnalyses.forEach((analysis, index) => {
      const date = new Date(analysis.createdAt).toLocaleDateString();
      context += `\n[Risk Assessment ${index + 1}] Date: ${date}\n`;

      if (analysis.riskAssessment) {
        // Include full risk assessment (truncated if too long)
        const riskText = analysis.riskAssessment;
        if (riskText.length > 1000) {
          context += `  ${riskText.substring(0, 1000)}...\n`;
        } else {
          context += `  ${riskText}\n`;
        }
      }
    });
    context += "\n";
  }

  // Add temporal analysis and trends
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

    context += `📊 TEMPORAL CONTEXT & TRENDS:\n`;
    context += `- Health data spans: ${oldestDate} to ${latestDate}\n`;
    context += `- Most recent analysis: ${sortedAnalyses[0].type} on ${latestDate}\n`;
    context += `- Total analyses: ${userAnalyses.length} (${reportAnalyses.length} reports, ${faceAnalyses.length} facial, ${riskAnalyses.length} risk)\n\n`;
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

    // Fetch user profile from database for RAG
    let userProfile: UserProfile | undefined;
    let dbAnalyses: Analysis[] = [];

    try {
      const cached = await withCache(
        `chatbot_ctx:${user.id}:profile_analyses`,
        async () => {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
              analyses: {
                orderBy: { createdAt: "desc" },
                take: 10,
                select: {
                  id: true,
                  type: true,
                  createdAt: true,
                  structuredData: true,
                  visualMetrics: true,
                  riskAssessment: true,
                  problemsDetected: true,
                  treatments: true,
                },
              },
            },
          });

          if (!dbUser) return null;

          return {
            profile: {
              name: dbUser.name,
              email: dbUser.email,
              memberSince: dbUser.createdAt.toLocaleDateString(),
              totalAnalyses: dbUser.analyses.length,
            },
            analyses: dbUser.analyses.map((a) => ({
              id: a.id,
              type: a.type,
              createdAt: a.createdAt,
              structuredData: a.structuredData as Record<string, unknown> | undefined,
              visualMetrics: a.visualMetrics as Record<string, unknown>[] | undefined,
              riskAssessment: a.riskAssessment || undefined,
              problemsDetected: a.problemsDetected as Record<string, unknown>[] | undefined,
              treatments: a.treatments as Record<string, unknown>[] | undefined,
            })),
          };
        },
        CACHE_TTL.SHORT, // 5 minutes
      );

      if (cached) {
        userProfile = cached.profile;
        dbAnalyses = cached.analyses;
      }
    } catch (dbError) {
      logError("Chatbot - Database fetch failed", dbError);
      // Continue with client-provided data if DB fails
    }

    // Use DB analyses if available, otherwise fall back to client-provided (limited to 10)
    const analysesToUse =
      dbAnalyses.length > 0 ? dbAnalyses : (userAnalyses || []).slice(0, 10);

    // Prepare context for RAG
    const userContext = prepareUserContext(analysesToUse, userProfile);
    const conversationContext = buildConversationContext(
      conversationHistory || []
    );

    // Build the complete prompt with enhanced RAG context
    const systemPrompt = `You are SehatScan's AI Health Assistant - a knowledgeable, empathetic, and personalized health companion. You have access to the user's complete health profile and SehatScan platform knowledge.

=== SEHATSCAN PLATFORM KNOWLEDGE ===
${SEHATSCAN_KNOWLEDGE_BASE}

=== USER CONTEXT ===
${userContext}

=== CONVERSATION HISTORY ===
${conversationContext}

=== CURRENT QUESTION ===
${message}

=== YOUR RESPONSE GUIDELINES ===
1. PERSONALIZATION: Always reference the user's actual data when available. Use their name if known.
2. CONTEXT-AWARE: If discussing metrics, reference their specific values and dates.
3. TRENDS: When they have multiple analyses, identify and explain trends.
4. ACTIONABLE: Provide specific, actionable advice based on their data.
5. EDUCATIONAL: Explain medical terms in simple language.
6. EMPATHETIC: Be supportive and encouraging while being honest.
7. SAFE: Never diagnose. Always recommend professional consultation for concerns.
8. PLATFORM-AWARE: Guide users to relevant SehatScan features when helpful.

If the user hasn't uploaded any health data yet, warmly encourage them to get started with SehatScan's features.

Respond in a conversational, helpful manner. Format with markdown for readability.`;

    // Generate response using Gemini (with automatic fallback to mock)
    let response;
    try {
      response = await generateHealthInsights(systemPrompt);
    } catch (aiError) {
      logError("Chatbot - AI generation failed completely", aiError, {
        userId: user.id,
        messageLength: message.length,
        hasUserData: analysesToUse.length > 0,
      });

      // This should not happen since generateHealthInsights has its own fallback
      // But just in case, provide a final fallback
      const userName = userProfile?.name ? `, ${userProfile.name}` : "";
      const fallbackResponse = `I apologize${userName}, but I'm experiencing technical difficulties right now. 

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
        userName: userProfile?.name || "Unknown",
        messageLength: message.length,
        responseLength: response.length,
        hasUserData: analysesToUse.length > 0,
        analysesCount: analysesToUse.length,
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
