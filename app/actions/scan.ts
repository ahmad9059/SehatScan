"use server";

import { headers } from "next/headers";
import { requireAuth } from "@/lib/clerk-session";
import { saveAnalysis } from "@/lib/analysis";

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

// File validation utility
function validateUploadFile(formData: FormData): {
  isValid: boolean;
  error?: string;
  file?: File;
} {
  const file = formData.get("file") as File;

  if (!file) {
    return { isValid: false, error: "No file provided" };
  }

  if (!(file instanceof File)) {
    return { isValid: false, error: "Invalid file format" };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: "File size must be less than 10MB" };
  }

  if (file.size === 0) {
    return { isValid: false, error: "File is empty" };
  }

  return { isValid: true, file };
}

async function resolveBaseUrl() {
  const headerStore = await headers();
  const host =
    headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "";
  const proto = headerStore.get("x-forwarded-proto") ?? "https";

  if (host) {
    return `${proto}://${host}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function analyzeFace(formData: FormData) {
  const startTime = Date.now();

  try {
    // Validate file first
    const fileValidation = validateUploadFile(formData);
    if (!fileValidation.isValid) {
      logError("analyzeFace - File validation failed", fileValidation.error);
      return {
        success: false,
        error: fileValidation.error,
        errorType: "validation",
      };
    }

    // Get authenticated user
    let user;
    try {
      user = await requireAuth();
    } catch (authError) {
      logError("analyzeFace - Authentication failed", authError);
      return {
        success: false,
        error: "Authentication required. Please log in again.",
        errorType: "auth",
      };
    }

    // Validate file type for face analysis
    const file = fileValidation.file!;
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Please upload a JPEG or PNG image file",
        errorType: "validation",
      };
    }

    // Call frontend API with timeout
    let response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      // Get the base URL for server-side requests
      const baseUrl = await resolveBaseUrl();

      response = await fetch(`${baseUrl}/api/analyze/face`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch (fetchError) {
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        logError("analyzeFace - Request timeout", fetchError);
        return {
          success: false,
          error: "Request timed out. Please try again with a smaller image.",
          errorType: "timeout",
        };
      }

      logError("analyzeFace - Network error", fetchError, {
        fileName: file.name,
        fileSize: file.size,
      });
      return {
        success: false,
        error:
          "Unable to connect to analysis service. Please check your connection and try again.",
        errorType: "network",
      };
    }

    // Handle HTTP errors
    if (!response.ok) {
      let errorMessage = `Analysis service error (${response.status})`;
      let errorType = "service";

      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;

        // Categorize errors based on status code
        if (response.status === 400) {
          errorType = "validation";
        } else if (response.status === 429) {
          errorType = "rate_limit";
          errorMessage = "Service is busy. Please try again in a few moments.";
        } else if (response.status >= 500) {
          errorType = "service";
          errorMessage =
            "Analysis service is temporarily unavailable. Please try again later.";
        }
      } catch (parseError) {
        logError("analyzeFace - Error parsing error response", parseError);
      }

      logError(
        "analyzeFace - HTTP error",
        `${response.status}: ${errorMessage}`,
        { fileName: file.name }
      );
      return {
        success: false,
        error: errorMessage,
        errorType,
      };
    }

    // Parse response
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      logError("analyzeFace - Response parsing failed", parseError);
      return {
        success: false,
        error: "Invalid response from analysis service. Please try again.",
        errorType: "service",
      };
    }

    // Validate response structure
    if (!data || typeof data !== "object") {
      logError("analyzeFace - Invalid response structure", data);
      return {
        success: false,
        error: "Invalid analysis results. Please try again.",
        errorType: "service",
      };
    }

    // Save analysis to database
    let saveResult;
    try {
      saveResult = await saveAnalysis({
        userId: user.id!,
        type: "face",
        rawData: data,
        visualMetrics: data.visual_metrics,
        problemsDetected: data.problems_detected,
        treatments: data.treatments,
      });
    } catch (saveError) {
      logError("analyzeFace - Database save failed", saveError, {
        userId: user.id,
      });
      // Continue with analysis results even if saving fails
      return {
        success: true,
        data,
        saveError: "Failed to save analysis to history",
        warning: "Analysis completed but couldn't be saved to your history",
      };
    }

    if (!saveResult.success) {
      logError("analyzeFace - Database save failed", saveResult.error, {
        userId: user.id,
      });
      return {
        success: true,
        data,
        saveError: saveResult.error,
        warning: "Analysis completed but couldn't be saved to your history",
      };
    }

    const duration = Date.now() - startTime;
    console.log(
      `[${new Date().toISOString()}] analyzeFace completed successfully in ${duration}ms`,
      {
        userId: user.id,
        fileName: file.name,
        fileSize: file.size,
        analysisId: saveResult.analysis!.id,
      }
    );

    return {
      success: true,
      data,
      analysisId: saveResult.analysis!.id,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logError("analyzeFace - Unexpected error", error, { duration });
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
      errorType: "unexpected",
    };
  }
}

export async function analyzeReport(formData: FormData) {
  const startTime = Date.now();

  try {
    // Validate file first
    const fileValidation = validateUploadFile(formData);
    if (!fileValidation.isValid) {
      logError("analyzeReport - File validation failed", fileValidation.error);
      return {
        success: false,
        error: fileValidation.error,
        errorType: "validation",
      };
    }

    // Get authenticated user
    let user;
    try {
      user = await requireAuth();
    } catch (authError) {
      logError("analyzeReport - Authentication failed", authError);
      return {
        success: false,
        error: "Authentication required. Please log in again.",
        errorType: "auth",
      };
    }

    // Validate file type for report analysis
    const file = fileValidation.file!;
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Please upload a JPEG, PNG, or PDF file",
        errorType: "validation",
      };
    }

    // Call frontend API with timeout
    let response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for OCR

      // Get the base URL for server-side requests
      const baseUrl = await resolveBaseUrl();

      response = await fetch(`${baseUrl}/api/analyze/report`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch (fetchError) {
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        logError("analyzeReport - Request timeout", fetchError);
        return {
          success: false,
          error:
            "Request timed out. OCR processing can take time for large files. Please try again with a smaller or clearer image.",
          errorType: "timeout",
        };
      }

      logError("analyzeReport - Network error", fetchError, {
        fileName: file.name,
        fileSize: file.size,
      });
      return {
        success: false,
        error:
          "Unable to connect to analysis service. Please check your connection and try again.",
        errorType: "network",
      };
    }

    // Check if response is valid
    if (!response) {
      logError(
        "analyzeReport - No response received",
        new Error("Response is undefined")
      );
      return {
        success: false,
        error: "No response received from analysis service. Please try again.",
        errorType: "network",
      };
    }

    // Handle HTTP errors
    if (!response.ok) {
      let errorMessage = `Analysis service error (${response.status})`;
      let errorType = "service";

      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;

        // Categorize errors based on status code
        if (response.status === 400) {
          errorType = "validation";
        } else if (response.status === 422) {
          errorType = "validation";
          errorMessage =
            "Unable to process this file. Please ensure it's a clear, readable medical report.";
        } else if (response.status === 429) {
          errorType = "rate_limit";
          errorMessage = "Service is busy. Please try again in a few moments.";
        } else if (response.status >= 500) {
          errorType = "service";
          errorMessage =
            "Analysis service is temporarily unavailable. Please try again later.";
        }
      } catch (parseError) {
        logError("analyzeReport - Error parsing error response", parseError);
      }

      logError(
        "analyzeReport - HTTP error",
        `${response.status}: ${errorMessage}`,
        { fileName: file.name }
      );
      return {
        success: false,
        error: errorMessage,
        errorType,
      };
    }

    // Parse response
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      logError("analyzeReport - Response parsing failed", parseError);
      return {
        success: false,
        error: "Invalid response from analysis service. Please try again.",
        errorType: "service",
      };
    }

    // Validate response structure
    if (!data || typeof data !== "object") {
      logError("analyzeReport - Invalid response structure", data);
      return {
        success: false,
        error: "Invalid analysis results. Please try again.",
        errorType: "service",
      };
    }

    // Save analysis to database
    let saveResult;
    try {
      saveResult = await saveAnalysis({
        userId: user.id!,
        type: "report",
        rawData: data,
        structuredData: data.structured_data,
      });
    } catch (saveError) {
      logError("analyzeReport - Database save failed", saveError, {
        userId: user.id,
      });
      // Continue with analysis results even if saving fails
      return {
        success: true,
        data,
        saveError: "Failed to save analysis to history",
        warning: "Analysis completed but couldn't be saved to your history",
      };
    }

    if (!saveResult.success) {
      logError("analyzeReport - Database save failed", saveResult.error, {
        userId: user.id,
      });
      return {
        success: true,
        data,
        saveError: saveResult.error,
        warning: "Analysis completed but couldn't be saved to your history",
      };
    }

    const duration = Date.now() - startTime;
    console.log(
      `[${new Date().toISOString()}] analyzeReport completed successfully in ${duration}ms`,
      {
        userId: user.id,
        fileName: file.name,
        fileSize: file.size,
        analysisId: saveResult.analysis!.id,
        hasStructuredData: !!data.structured_data,
      }
    );

    return {
      success: true,
      data,
      analysisId: saveResult.analysis!.id,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logError("analyzeReport - Unexpected error", error, { duration });
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
      errorType: "unexpected",
    };
  }
}

export async function generateRiskAssessment(
  reportAnalysisId: string,
  faceAnalysisId: string,
  userFormData: any
) {
  const startTime = Date.now();

  try {
    // Validate input parameters
    if (!reportAnalysisId || typeof reportAnalysisId !== "string") {
      return {
        success: false,
        error: "Report analysis ID is required",
        errorType: "validation",
      };
    }

    if (!faceAnalysisId || typeof faceAnalysisId !== "string") {
      return {
        success: false,
        error: "Face analysis ID is required",
        errorType: "validation",
      };
    }

    if (!userFormData || typeof userFormData !== "object") {
      return {
        success: false,
        error: "User form data is required",
        errorType: "validation",
      };
    }

    // Get authenticated user
    let user;
    try {
      user = await requireAuth();
    } catch (authError) {
      logError("generateRiskAssessment - Authentication failed", authError);
      return {
        success: false,
        error: "Authentication required. Please log in again.",
        errorType: "auth",
      };
    }

    // Fetch the selected analyses from database
    let reportAnalysis, faceAnalysis;
    try {
      const { getAnalysisById } = await import("@/lib/analysis");

      [reportAnalysis, faceAnalysis] = await Promise.all([
        getAnalysisById(reportAnalysisId, user.id!),
        getAnalysisById(faceAnalysisId, user.id!),
      ]);
    } catch (dbError) {
      logError("generateRiskAssessment - Database fetch failed", dbError, {
        reportAnalysisId,
        faceAnalysisId,
        userId: user.id,
      });
      return {
        success: false,
        error: "Failed to retrieve analysis data. Please try again.",
        errorType: "database",
      };
    }

    if (!reportAnalysis) {
      logError("generateRiskAssessment - Report analysis not found", null, {
        reportAnalysisId,
        userId: user.id,
      });
      return {
        success: false,
        error:
          "Selected report analysis not found. Please select a different report.",
        errorType: "not_found",
      };
    }

    if (!faceAnalysis) {
      logError("generateRiskAssessment - Face analysis not found", null, {
        faceAnalysisId,
        userId: user.id,
      });
      return {
        success: false,
        error:
          "Selected face analysis not found. Please select a different face analysis.",
        errorType: "not_found",
      };
    }

    // Validate analysis data
    const labData = reportAnalysis.structuredData || reportAnalysis.rawData;
    const visualMetrics = faceAnalysis.visualMetrics || {};

    if (
      !labData ||
      (typeof labData === "object" && Object.keys(labData).length === 0)
    ) {
      return {
        success: false,
        error:
          "Selected report analysis contains no usable data. Please select a different report.",
        errorType: "validation",
      };
    }

    // Prepare combined data payload
    const requestData = {
      lab_data: labData,
      visual_metrics: visualMetrics,
      user_data: userFormData,
    };

    // Call frontend API risk assessment endpoint with timeout
    let response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout for AI processing

      // Get the base URL for server-side requests
      const baseUrl = await resolveBaseUrl();

      response = await fetch(`${baseUrl}/api/analyze/risk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch (fetchError) {
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        logError("generateRiskAssessment - Request timeout", fetchError);
        return {
          success: false,
          error:
            "Risk assessment is taking longer than expected. Please try again.",
          errorType: "timeout",
        };
      }

      logError("generateRiskAssessment - Network error", fetchError, {
        reportAnalysisId,
        faceAnalysisId,
      });
      return {
        success: false,
        error:
          "Unable to connect to analysis service. Please check your connection and try again.",
        errorType: "network",
      };
    }

    // Handle HTTP errors
    if (!response.ok) {
      let errorMessage = `Risk assessment service error (${response.status})`;
      let errorType = "service";

      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;

        // Categorize errors based on status code
        if (response.status === 400) {
          errorType = "validation";
          errorMessage =
            "Invalid data provided for risk assessment. Please check your selected analyses.";
        } else if (response.status === 429) {
          errorType = "rate_limit";
          errorMessage =
            "AI service is busy. Please try again in a few moments.";
        } else if (response.status >= 500) {
          errorType = "service";
          errorMessage =
            "Risk assessment service is temporarily unavailable. Please try again later.";
        }
      } catch (parseError) {
        logError(
          "generateRiskAssessment - Error parsing error response",
          parseError
        );
      }

      logError(
        "generateRiskAssessment - HTTP error",
        `${response.status}: ${errorMessage}`,
        {
          reportAnalysisId,
          faceAnalysisId,
        }
      );
      return {
        success: false,
        error: errorMessage,
        errorType,
      };
    }

    // Parse response
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      logError("generateRiskAssessment - Response parsing failed", parseError);
      return {
        success: false,
        error:
          "Invalid response from risk assessment service. Please try again.",
        errorType: "service",
      };
    }

    // Validate response structure
    if (!data || typeof data !== "object" || !data.risk_assessment) {
      logError("generateRiskAssessment - Invalid response structure", data);
      return {
        success: false,
        error: "Invalid risk assessment results. Please try again.",
        errorType: "service",
      };
    }

    // Save risk assessment to database
    let saveResult;
    try {
      saveResult = await saveAnalysis({
        userId: user.id!,
        type: "risk",
        rawData: {
          reportAnalysisId,
          faceAnalysisId,
          userFormData,
          combinedData: requestData,
        },
        riskAssessment: data.risk_assessment,
      });
    } catch (saveError) {
      logError("generateRiskAssessment - Database save failed", saveError, {
        userId: user.id,
      });
      // Continue with assessment results even if saving fails
      return {
        success: true,
        data,
        saveError: "Failed to save risk assessment to history",
        warning:
          "Risk assessment completed but couldn't be saved to your history",
      };
    }

    if (!saveResult.success) {
      logError(
        "generateRiskAssessment - Database save failed",
        saveResult.error,
        { userId: user.id }
      );
      return {
        success: true,
        data,
        saveError: saveResult.error,
        warning:
          "Risk assessment completed but couldn't be saved to your history",
      };
    }

    const duration = Date.now() - startTime;
    console.log(
      `[${new Date().toISOString()}] generateRiskAssessment completed successfully in ${duration}ms`,
      {
        userId: user.id,
        reportAnalysisId,
        faceAnalysisId,
        analysisId: saveResult.analysis!.id,
      }
    );

    return {
      success: true,
      data,
      analysisId: saveResult.analysis!.id,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logError("generateRiskAssessment - Unexpected error", error, {
      duration,
      reportAnalysisId,
      faceAnalysisId,
    });
    return {
      success: false,
      error:
        "An unexpected error occurred during risk assessment. Please try again.",
      errorType: "unexpected",
    };
  }
}
