import { requireAuth } from "@/lib/clerk-session";
import { prisma } from "@/lib/db";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import DashboardClient from "@/app/components/DashboardClient";

// Force dynamic rendering for authentication
export const dynamic = "force-dynamic";

interface AnalysisStats {
  total: number;
  reports: number;
  faces: number;
  risks: number;
}

/**
 * Get dashboard data with optimized single query using groupBy
 * Instead of 4 separate COUNT queries, we use groupBy + findMany in parallel
 */
async function getDashboardData(userId: string) {
  try {
    const [typeCounts, recentAnalyses] = await Promise.all([
      // Single groupBy query instead of 4 separate counts
      prisma.analysis.groupBy({
        by: ["type"],
        where: { userId },
        _count: { type: true },
      }),
      // Get recent analyses with only needed fields
      prisma.analysis.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          type: true,
          createdAt: true,
          structuredData: true,
          riskAssessment: true,
          rawData: true,
          visualMetrics: true,
          problemsDetected: true,
          treatments: true,
        },
      }),
    ]);

    // Transform groupBy result to stats object
    const stats: AnalysisStats = {
      total: 0,
      reports: 0,
      faces: 0,
      risks: 0,
    };

    for (const item of typeCounts) {
      stats.total += item._count.type;
      if (item.type === "report") stats.reports = item._count.type;
      if (item.type === "face") stats.faces = item._count.type;
      if (item.type === "risk") stats.risks = item._count.type;
    }

    return { stats, recentAnalyses, hasError: false };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      stats: { total: 0, reports: 0, faces: 0, risks: 0 },
      recentAnalyses: [],
      hasError: true,
    };
  }
}

async function DashboardPageContent() {
  const user = await requireAuth();

  const { stats, recentAnalyses, hasError } = user
    ? await getDashboardData(user.id)
    : {
        stats: { total: 0, reports: 0, faces: 0, risks: 0 },
        recentAnalyses: [],
        hasError: false,
      };

  return (
    <DashboardClient
      user={user}
      stats={stats}
      recentAnalyses={recentAnalyses}
      hasError={hasError}
    />
  );
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardPageContent />
    </ErrorBoundary>
  );
}
