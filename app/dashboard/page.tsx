import { requireAuth } from "@/lib/clerk-session";
import { getUserAnalyses } from "@/lib/analysis";
import { prisma } from "@/lib/db";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import DashboardClient from "@/app/components/DashboardClient";

interface AnalysisStats {
  total: number;
  reports: number;
  faces: number;
  risks: number;
}

async function getAnalysisStats(userId: string): Promise<AnalysisStats> {
  try {
    // Use aggregation instead of fetching all records
    const [total, reports, faces, risks] = await Promise.all([
      prisma.analysis.count({ where: { userId } }),
      prisma.analysis.count({ where: { userId, type: "report" } }),
      prisma.analysis.count({ where: { userId, type: "face" } }),
      prisma.analysis.count({ where: { userId, type: "risk" } }),
    ]);

    return { total, reports, faces, risks };
  } catch (error) {
    console.error("Error fetching analysis stats:", error);
    return { total: 0, reports: 0, faces: 0, risks: 0 };
  }
}

async function DashboardPageContent() {
  const user = await requireAuth(); // This will ensure user exists in database

  let stats: AnalysisStats = { total: 0, reports: 0, faces: 0, risks: 0 };
  let recentAnalyses: any[] = [];
  let hasError = false;

  if (user) {
    try {
      // Fetch stats and recent analyses with error handling
      [stats, recentAnalyses] = await Promise.all([
        getAnalysisStats(user.id),
        getUserAnalyses(user.id),
      ]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      hasError = true;
      stats = { total: 0, reports: 0, faces: 0, risks: 0 };
      recentAnalyses = [];
    }
  }

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
