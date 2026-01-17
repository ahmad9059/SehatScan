import { requireAuth } from "@/lib/clerk-session";
import { prisma } from "@/lib/db";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import DashboardClient from "@/app/components/DashboardClient";
import { withCache, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";

// Force dynamic rendering for authentication
export const dynamic = "force-dynamic";

interface AnalysisStats {
  total: number;
  reports: number;
  faces: number;
  risks: number;
}

/**
 * Get dashboard data with Redis caching and optimized queries
 * Stats cached for 5 minutes, analyses cached for 2 minutes
 */
async function getDashboardData(userId: string) {
  try {
    // Fetch stats and analyses in parallel, both with Redis caching
    const [stats, recentAnalyses] = await Promise.all([
      // Cache stats for 5 minutes
      withCache(
        CACHE_KEYS.stats(userId),
        async () => {
          const typeCounts = await prisma.analysis.groupBy({
            by: ["type"],
            where: { userId },
            _count: { type: true },
          });

          const result: AnalysisStats = {
            total: 0,
            reports: 0,
            faces: 0,
            risks: 0,
          };

          for (const item of typeCounts) {
            result.total += item._count.type;
            if (item.type === "report") result.reports = item._count.type;
            if (item.type === "face") result.faces = item._count.type;
            if (item.type === "risk") result.risks = item._count.type;
          }

          return result;
        },
        CACHE_TTL.STATS,
      ),
      // Cache recent analyses for 2 minutes
      withCache(
        CACHE_KEYS.analyses(userId),
        async () => {
          return prisma.analysis.findMany({
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
          });
        },
        CACHE_TTL.ANALYSES,
      ),
    ]);

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
