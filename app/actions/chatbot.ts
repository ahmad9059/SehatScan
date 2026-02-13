"use server";

import { requireAuth } from "@/lib/clerk-session";
import { getCompactHealthSummary } from "@/lib/health-summary";

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

export async function getChatbotContext() {
  try {
    // Get authenticated user
    let user;
    try {
      user = await requireAuth();
    } catch (authError) {
      logError("getChatbotContext - Authentication failed", authError);
      return {
        success: false,
        error: "Authentication required. Please log in again.",
        errorType: "auth",
      };
    }

    try {
      const healthSummary = await getCompactHealthSummary(user.id!);

      return {
        success: true,
        data: {
          healthSummary,
          userId: user.id,
          userName: user.name || user.email,
        },
      };
    } catch (error) {
      logError("getChatbotContext - Failed to load health summary", error, {
        userId: user.id,
      });
      return {
        success: false,
        error: "Failed to load your health data",
        errorType: "database",
      };
    }
  } catch (error) {
    logError("getChatbotContext - Unexpected error", error);
    return {
      success: false,
      error: "An unexpected error occurred",
      errorType: "unexpected",
    };
  }
}
