import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/clerk-session";
import { streamHealthInsights } from "@/lib/gemini";
import { getCompactHealthSummary } from "@/lib/health-summary";

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

function buildConversationContext(messages: Message[]): string {
  if (!messages || messages.length === 0) {
    return "";
  }

  // Limit to last 6 messages to keep prompt compact
  const recent = messages.slice(-6);

  let context = "Recent Conversation:\n";
  recent.forEach((msg) => {
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
        { status: 401 },
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
        { status: 400 },
      );
    }

    const { message, conversationHistory } = requestData;

    // Validate input
    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Message is required",
          errorType: "validation",
        },
        { status: 400 },
      );
    }

    // Get compact health summary (considers ALL analyses, cached in Redis)
    let healthSummary = "";
    try {
      healthSummary = await getCompactHealthSummary(user.id);
    } catch (summaryError) {
      logError("Chatbot - Health summary failed", summaryError, {
        userId: user.id,
      });
      healthSummary =
        "HEALTH DATA: Unable to load health data. Please try again.";
    }

    const conversationContext = buildConversationContext(
      conversationHistory || [],
    );

    // Build the complete prompt with compact RAG context
    const systemPrompt = `You are SehatScan's AI Health Assistant - a knowledgeable, empathetic, and personalized health companion. You have access to the user's complete health profile and SehatScan platform knowledge.

=== SEHATSCAN PLATFORM KNOWLEDGE ===
${SEHATSCAN_KNOWLEDGE_BASE}

=== USER HEALTH DATA ===
${healthSummary}

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

    // Stream response — first token arrives in ~1-2s instead of waiting 20-30s
    const encoder = new TextEncoder();
    const userId = user.id;

    const stream = new ReadableStream({
      async start(controller) {
        let responseLength = 0;
        try {
          for await (const chunk of streamHealthInsights(systemPrompt)) {
            controller.enqueue(encoder.encode(chunk));
            responseLength += chunk.length;
          }
        } catch (error) {
          logError("Chatbot - Stream error", error, { userId });
          // If nothing was sent yet, send a fallback message
          if (responseLength === 0) {
            const fallback =
              "I apologize, but I'm having trouble responding right now. Please try again in a moment.";
            controller.enqueue(encoder.encode(fallback));
          }
        } finally {
          controller.close();
          const duration = Date.now() - startTime;
          console.log(
            `[${new Date().toISOString()}] Chatbot streamed in ${duration}ms`,
            {
              userId,
              messageLength: message.length,
              responseLength,
              summaryLength: healthSummary.length,
            },
          );
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
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
      { status: 500 },
    );
  }
}
