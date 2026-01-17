import { prisma } from "./db";
import { deleteCache, CACHE_KEYS } from "./redis";

export interface CreateAnalysisData {
  userId: string;
  type: "face" | "report" | "risk";
  rawData: any;
  structuredData?: any;
  visualMetrics?: any;
  riskAssessment?: string;
  problemsDetected?: any[];
  treatments?: any[];
}

/**
 * Save analysis results to the database
 * Invalidates Redis cache for user's stats and analyses
 * @param data Analysis data to save
 * @returns Saved analysis with ID
 */
export async function saveAnalysis(data: CreateAnalysisData) {
  try {
    const analysis = await prisma.analysis.create({
      data: {
        userId: data.userId,
        type: data.type,
        rawData: data.rawData,
        structuredData: data.structuredData,
        visualMetrics: data.visualMetrics,
        riskAssessment: data.riskAssessment,
        problemsDetected: data.problemsDetected,
        treatments: data.treatments,
      },
    });

    // Invalidate user's cached stats and analyses so dashboard shows new data
    await Promise.all([
      deleteCache(CACHE_KEYS.stats(data.userId)),
      deleteCache(CACHE_KEYS.analyses(data.userId)),
    ]);

    return { success: true, analysis };
  } catch (error) {
    console.error("Error saving analysis:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save analysis",
    };
  }
}

/**
 * Get analysis by ID for a specific user
 * @param analysisId Analysis ID
 * @param userId User ID
 * @returns Analysis or null
 */
export async function getAnalysisById(analysisId: string, userId: string) {
  try {
    const analysis = await prisma.analysis.findFirst({
      where: {
        id: analysisId,
        userId: userId,
      },
    });

    return analysis;
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return null;
  }
}

/**
 * Get all analyses for a user
 * @param userId User ID
 * @param type Optional analysis type filter
 * @returns Array of analyses
 */
export async function getUserAnalyses(
  userId: string,
  type?: "face" | "report" | "risk",
) {
  if (!userId) return [];
  // Ensure this runs server-side only
  if (typeof window !== "undefined") {
    throw new Error("getUserAnalyses should not be called on the client");
  }
  try {
    const analyses = await prisma.analysis.findMany({
      where: {
        userId: userId,
        ...(type && { type }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return analyses;
  } catch (error) {
    console.error("Error fetching user analyses:", error);
    return [];
  }
}

/**
 * Get paginated analyses for a user
 * @param userId User ID
 * @param options Pagination and filter options
 * @returns Paginated analyses result
 */
export async function getUserAnalysesPaginated(
  userId: string,
  options: {
    page?: number;
    limit?: number;
    type?: "face" | "report" | "risk";
  } = {},
) {
  try {
    const { page = 1, limit = 10, type } = options;
    const skip = (page - 1) * limit;

    const where: any = {
      userId: userId,
    };

    if (type) {
      where.type = type;
    }

    // Get total count for pagination
    const total = await prisma.analysis.count({ where });

    // Get analyses with pagination
    const analyses = await prisma.analysis.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
      select: {
        id: true,
        type: true,
        rawData: true,
        structuredData: true,
        visualMetrics: true,
        riskAssessment: true,
        problemsDetected: true,
        treatments: true,
        createdAt: true,
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      analyses,
      total,
      page,
      totalPages,
    };
  } catch (error) {
    console.error("Error fetching paginated user analyses:", error);
    return {
      analyses: [],
      total: 0,
      page: 1,
      totalPages: 1,
    };
  }
}

/**
 * Delete analysis by ID for a specific user
 * @param analysisId Analysis ID
 * @param userId User ID
 * @returns Success status
 */
export async function deleteAnalysis(analysisId: string, userId: string) {
  try {
    await prisma.analysis.deleteMany({
      where: {
        id: analysisId,
        userId: userId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting analysis:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete analysis",
    };
  }
}
