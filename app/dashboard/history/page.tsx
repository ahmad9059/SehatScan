"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { showErrorToast, showInfoToast } from "@/lib/toast";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import { CardSkeleton } from "@/app/components/SkeletonLoader";
import EmptyState from "@/app/components/EmptyState";
import AnalysisDetailModal from "@/app/components/AnalysisDetailModal";
import {
  DocumentTextIcon,
  CameraIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  CalendarIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

interface Analysis {
  id: string;
  type: string;
  rawData: any;
  structuredData?: any;
  visualMetrics?: any;
  riskAssessment?: string;
  problemsDetected?: Array<{
    type: string;
    severity: "mild" | "moderate" | "severe";
    description: string;
    confidence: number;
  }>;
  treatments?: Array<{
    category: string;
    recommendation: string;
    priority: "low" | "medium" | "high";
    timeframe: string;
  }>;
  createdAt: string;
}

interface AnalysisHistoryResponse {
  analyses: Analysis[];
  total: number;
  page: number;
  totalPages: number;
}

const ITEMS_PER_PAGE = 10;

function HistoryPageContent() {
  const { data: session } = useSession();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(
    null
  );
  const [filterType, setFilterType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchAnalyses = async (page: number = 1, type: string = "all") => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(type !== "all" && { type }),
      });

      const response = await fetch(`/api/analyses?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to fetch analyses";

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
        }

        if (response.status === 401) {
          errorMessage = "Authentication required. Please log in again.";
        } else if (response.status === 403) {
          errorMessage = "You don't have permission to access this data.";
        } else if (response.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }

        throw new Error(errorMessage);
      }

      const data: AnalysisHistoryResponse = await response.json();

      // Validate response structure
      if (!data || typeof data !== "object") {
        throw new Error("Invalid response format");
      }

      if (!Array.isArray(data.analyses)) {
        throw new Error("Invalid analyses data format");
      }

      setAnalyses(data.analyses);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.page || 1);

      // Show info message if no analyses found
      if (data.analyses.length === 0 && page === 1) {
        if (type === "all") {
          showInfoToast(
            "No analyses found. Upload a report or photo to get started!"
          );
        } else {
          showInfoToast(`No ${type} analyses found. Try a different filter.`);
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load analyses";
      console.error("Error fetching analyses:", err);
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses(currentPage, filterType);
  }, [session, currentPage, filterType]);

  const handleFilterChange = (type: string) => {
    setFilterType(type);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case "face":
        return CameraIcon;
      case "report":
        return DocumentTextIcon;
      case "risk":
        return ExclamationTriangleIcon;
      default:
        return DocumentTextIcon;
    }
  };

  const getAnalysisTypeLabel = (type: string) => {
    switch (type) {
      case "face":
        return "Facial Analysis";
      case "report":
        return "Report Analysis";
      case "risk":
        return "Risk Assessment";
      default:
        return "Analysis";
    }
  };

  const getAnalysisPreview = (analysis: Analysis) => {
    switch (analysis.type) {
      case "face":
        if (analysis.problemsDetected && analysis.problemsDetected.length > 0) {
          const severeProblem = analysis.problemsDetected.find(
            (p) => p.severity === "severe"
          );
          const moderateProblem = analysis.problemsDetected.find(
            (p) => p.severity === "moderate"
          );
          const mainProblem =
            severeProblem || moderateProblem || analysis.problemsDetected[0];
          return `${mainProblem.type} (${mainProblem.severity})`;
        }
        if (
          analysis.visualMetrics &&
          Array.isArray(analysis.visualMetrics) &&
          analysis.visualMetrics.length > 0
        ) {
          const metrics = analysis.visualMetrics[0]; // Get first face metrics
          return `Redness: ${metrics.redness_percentage || 0}%, Yellowness: ${
            metrics.yellowness_percentage || 0
          }%`;
        }
        return "Facial analysis completed";
      case "report":
        if (analysis.structuredData?.metrics) {
          const count = analysis.structuredData.metrics.length;
          return `${count} health metrics extracted`;
        }
        return "Report analysis completed";
      case "risk":
        return analysis.riskAssessment
          ? "Risk assessment generated"
          : "Risk assessment completed";
      default:
        return "Analysis completed";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && analyses.length === 0) {
    return (
      <div className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header Skeleton */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
              Analysis History
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              View and manage your past health analyses
            </p>
          </div>

          {/* Loading Skeletons */}
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
            Analysis History
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            View and manage your past health analyses
          </p>
        </div>

        {/* Filters and Stats */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter:
              </span>
            </div>
            <select
              value={filterType}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-[#037BFC] bg-white dark:bg-gray-800 text-sm"
            >
              <option value="all">All Types</option>
              <option value="face">Facial Analysis</option>
              <option value="report">Report Analysis</option>
              <option value="risk">Risk Assessment</option>
            </select>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {total} {total === 1 ? "analysis" : "analyses"} total
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <div className="text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          </div>
        )}

        {/* Analysis List */}
        {analyses.length === 0 ? (
          <EmptyState
            icon={<DocumentTextIcon className="h-12 w-12 text-gray-400" />}
            title="No analyses found"
            description={
              filterType === "all"
                ? "You haven't performed any analyses yet. Get started by uploading a medical report or taking a photo for analysis."
                : `No ${getAnalysisTypeLabel(
                    filterType
                  ).toLowerCase()} found. Try a different filter or upload new content.`
            }
            action={{
              label: "Start Analysis",
              href: "/dashboard/scan-report",
            }}
            secondaryAction={{
              label: "Take Photo",
              href: "/dashboard/scan-face",
            }}
          />
        ) : (
          <div className="space-y-4">
            {analyses.map((analysis, index) => {
              const IconComponent = getAnalysisIcon(analysis.type);
              return (
                <div
                  key={analysis.id}
                  className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in-up border border-gray-100 dark:border-gray-700/50 overflow-hidden cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setSelectedAnalysis(analysis)}
                >
                  {/* Animated Background Elements */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 via-transparent to-gray-500/5"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-400/20 to-gray-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-slate-300/10 to-slate-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center space-x-4 min-w-0 flex-1">
                        <div className="shrink-0">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#037BFC]/10 to-indigo-500/10 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                            <IconComponent className="h-6 w-6 text-[#037BFC]" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-[#037BFC] dark:group-hover:text-blue-400 transition-colors duration-300">
                            {getAnalysisTypeLabel(analysis.type)}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                            {getAnalysisPreview(analysis)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors duration-300">
                            {formatDate(analysis.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <div className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#037BFC]/10 to-indigo-500/10 px-4 py-2 text-sm font-semibold text-[#037BFC] dark:text-blue-400 group-hover:from-[#037BFC]/20 group-hover:to-indigo-500/20 transition-all duration-300">
                          <EyeIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                          View Details
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Analysis Detail Modal */}
        {selectedAnalysis && (
          <AnalysisDetailModal
            analysis={selectedAnalysis}
            onClose={() => setSelectedAnalysis(null)}
          />
        )}
      </div>
    </div>
  );
}
export default function HistoryPage() {
  return (
    <ErrorBoundary>
      <HistoryPageContent />
    </ErrorBoundary>
  );
}
