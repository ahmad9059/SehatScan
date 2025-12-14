import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getUserAnalyses } from "@/lib/analysis";
import { prisma } from "@/lib/db";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import EmptyState from "@/app/components/EmptyState";
import {
  DocumentTextIcon,
  FaceSmileIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

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

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getAnalysisIcon(type: string) {
  switch (type) {
    case "report":
      return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
    case "face":
      return <FaceSmileIcon className="h-5 w-5 text-green-500" />;
    case "risk":
      return <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />;
    default:
      return <ClipboardDocumentListIcon className="h-5 w-5 text-gray-500" />;
  }
}

function getAnalysisTypeLabel(type: string): string {
  switch (type) {
    case "report":
      return "Report Analysis";
    case "face":
      return "Face Analysis";
    case "risk":
      return "Risk Assessment";
    default:
      return "Analysis";
  }
}

function getAnalysisPreview(analysis: any): string {
  if (analysis.type === "report" && analysis.structuredData?.metrics) {
    const metrics = analysis.structuredData.metrics;
    if (Array.isArray(metrics) && metrics.length > 0) {
      return `${metrics.length} health metrics extracted`;
    }
  }

  if (analysis.type === "face" && analysis.visualMetrics) {
    const metrics = Array.isArray(analysis.visualMetrics)
      ? analysis.visualMetrics[0]
      : analysis.visualMetrics;
    if (metrics?.redness_percentage !== undefined) {
      return `Redness: ${metrics.redness_percentage}%, Yellowness: ${
        metrics.yellowness_percentage || 0
      }%`;
    }
  }

  if (analysis.type === "risk" && analysis.riskAssessment) {
    const preview = analysis.riskAssessment.substring(0, 100);
    return preview.length < analysis.riskAssessment.length
      ? `${preview}...`
      : preview;
  }

  return "Analysis completed";
}

async function DashboardPageContent() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <ExclamationCircleIcon className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Authentication Required
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Please log in to access your dashboard
            </p>
          </div>
        </div>
      </div>
    );
  }

  let stats: AnalysisStats;
  let recentAnalyses: any[] = [];
  let hasError = false;

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

  const recentAnalysesLimited = recentAnalyses.slice(0, 5);

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8 animate-fade-in-up">
      <div className="mx-auto max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
            Welcome back, {user.name || "User"}!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Your health analysis platform powered by AI
          </p>
        </div>

        {/* Error Alert */}
        {hasError && (
          <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 animate-fade-in">
            <div className="flex items-center">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500 shrink-0" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Unable to load dashboard data
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Some information may not be up to date. Please refresh the
                  page or try again later.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all transform hover:scale-105 animate-fade-in">
            <div className="flex items-center">
              <div className="shrink-0">
                <ChartBarIcon className="h-8 w-8 text-[#037BFC]" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-poppins">
                  Total Analyses
                </h3>
                <p className="text-3xl font-bold text-[#037BFC] mt-1 animate-fade-in">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all transform hover:scale-105 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex items-center">
              <div className="shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-poppins">
                  Reports Scanned
                </h3>
                <p className="text-3xl font-bold text-[#037BFC] mt-1 animate-fade-in">
                  {stats.reports}
                </p>
              </div>
            </div>
          </div>

          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all transform hover:scale-105 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex items-center">
              <div className="shrink-0">
                <FaceSmileIcon className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-poppins">
                  Faces Analyzed
                </h3>
                <p className="text-3xl font-bold text-[#037BFC] mt-1 animate-fade-in">
                  {stats.faces}
                </p>
              </div>
            </div>
          </div>

          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all transform hover:scale-105 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-center">
              <div className="shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-amber-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-poppins">
                  Risk Assessments
                </h3>
                <p className="text-3xl font-bold text-[#037BFC] mt-1 animate-fade-in">
                  {stats.risks}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white font-poppins mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              href="/dashboard/scan-report"
              className="bg-[#037BFC] hover:bg-[#0260c9] text-white rounded-md px-6 py-4 transition-all transform hover:scale-105 text-center font-semibold flex items-center justify-center gap-2 animate-fade-in focus:outline-none focus:ring-2 focus:ring-[#037BFC] focus:ring-offset-2"
              aria-label="Upload medical report for analysis"
            >
              <DocumentTextIcon className="h-5 w-5" />
              Upload Report
            </Link>
            <Link
              href="/dashboard/scan-face"
              className="bg-[#037BFC] hover:bg-[#0260c9] text-white rounded-md px-6 py-4 transition-all transform hover:scale-105 text-center font-semibold flex items-center justify-center gap-2 animate-fade-in focus:outline-none focus:ring-2 focus:ring-[#037BFC] focus:ring-offset-2"
              style={{ animationDelay: "0.1s" }}
              aria-label="Upload photo for facial analysis"
            >
              <PhotoIcon className="h-5 w-5" />
              Upload Photo
            </Link>
            <Link
              href="/dashboard/risk-assessment"
              className="bg-[#037BFC] hover:bg-[#0260c9] text-white rounded-md px-6 py-4 transition-all transform hover:scale-105 text-center font-semibold flex items-center justify-center gap-2 animate-fade-in focus:outline-none focus:ring-2 focus:ring-[#037BFC] focus:ring-offset-2"
              style={{ animationDelay: "0.2s" }}
              aria-label="Generate comprehensive risk assessment"
            >
              <ChartBarIcon className="h-5 w-5" />
              Generate Assessment
            </Link>
          </div>
        </div>

        {/* Recent Analyses */}
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white font-poppins">
              Recent Analyses
            </h2>
            {recentAnalyses.length > 0 && (
              <Link
                href="/dashboard/history"
                className="text-[#037BFC] hover:text-[#0260c9] font-medium text-sm transition-colors"
              >
                View all →
              </Link>
            )}
          </div>

          {recentAnalysesLimited.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentAnalysesLimited.map((analysis, index) => (
                  <div
                    key={analysis.id}
                    className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        {getAnalysisIcon(analysis.type)}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {getAnalysisTypeLabel(analysis.type)}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {getAnalysisPreview(analysis)}
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(new Date(analysis.createdAt))}
                        </p>
                        <Link
                          href={`/dashboard/history?id=${analysis.id}`}
                          className="text-xs text-[#037BFC] hover:text-[#0260c9] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#037BFC] focus:ring-offset-2 rounded"
                          aria-label={`View details for ${getAnalysisTypeLabel(
                            analysis.type
                          )}`}
                        >
                          View details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Empty State
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 animate-fade-in">
              <EmptyState
                icon={
                  <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400" />
                }
                title="No analyses yet"
                description="Get started by uploading a medical report or taking a photo for analysis. Our AI will help you understand your health data better."
                action={{
                  label: "Upload Your First Report",
                  href: "/dashboard/scan-report",
                }}
                secondaryAction={{
                  label: "Take a Photo",
                  href: "/dashboard/scan-face",
                }}
                className="p-12"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardPageContent />
    </ErrorBoundary>
  );
}
