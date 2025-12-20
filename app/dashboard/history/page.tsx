"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { showErrorToast, showInfoToast } from "@/lib/toast";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import { CardSkeleton } from "@/app/components/SkeletonLoader";
import EmptyState from "@/app/components/EmptyState";
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
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-all animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#037BFC]/10">
                          <IconComponent className="h-6 w-6 text-[#037BFC]" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-poppins truncate">
                          {getAnalysisTypeLabel(analysis.type)}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {getAnalysisPreview(analysis)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(analysis.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedAnalysis(analysis)}
                      className="flex items-center justify-center gap-2 rounded-md bg-gray-100 dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#037BFC] focus:ring-offset-2 w-full sm:w-auto"
                      aria-label={`View details for ${getAnalysisTypeLabel(
                        analysis.type
                      )}`}
                    >
                      <EyeIcon className="h-4 w-4" />
                      View Details
                    </button>
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
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => setSelectedAnalysis(null)}
              />
              <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-poppins">
                    {getAnalysisTypeLabel(selectedAnalysis.type)} Details
                  </h3>
                  <button
                    onClick={() => setSelectedAnalysis(null)}
                    className="rounded-md bg-gray-100 dark:bg-gray-700 p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Analysis Info */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Type:
                        </span>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {getAnalysisTypeLabel(selectedAnalysis.type)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Date:
                        </span>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {formatDate(selectedAnalysis.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Analysis Content */}
                  {selectedAnalysis.type === "face" &&
                    selectedAnalysis.visualMetrics &&
                    Array.isArray(selectedAnalysis.visualMetrics) &&
                    selectedAnalysis.visualMetrics.length > 0 && (
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                          Visual Metrics
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Redness Percentage:
                            </span>
                            <p className="text-2xl font-bold text-red-600">
                              {selectedAnalysis.visualMetrics[0]
                                .redness_percentage || 0}
                              %
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Yellowness Percentage:
                            </span>
                            <p className="text-2xl font-bold text-yellow-600">
                              {selectedAnalysis.visualMetrics[0]
                                .yellowness_percentage || 0}
                              %
                            </p>
                          </div>
                        </div>
                        {selectedAnalysis.visualMetrics[0]
                          .skin_tone_analysis && (
                          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                            <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                              Skin Tone Analysis:
                            </h5>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              {
                                selectedAnalysis.visualMetrics[0]
                                  .skin_tone_analysis
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                  {/* Problems Detected */}
                  {selectedAnalysis.type === "face" &&
                    selectedAnalysis.problemsDetected &&
                    selectedAnalysis.problemsDetected.length > 0 && (
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                          Detected Skin Conditions
                        </h4>
                        <div className="space-y-3">
                          {selectedAnalysis.problemsDetected.map(
                            (problem, index) => (
                              <div
                                key={index}
                                className={`rounded-lg p-4 border ${
                                  problem.severity === "severe"
                                    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                                    : problem.severity === "moderate"
                                    ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                                    : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-3 h-3 rounded-full ${
                                        problem.severity === "severe"
                                          ? "bg-red-500"
                                          : problem.severity === "moderate"
                                          ? "bg-yellow-500"
                                          : "bg-green-500"
                                      }`}
                                    />
                                    <h5 className="font-semibold text-gray-900 dark:text-white">
                                      {problem.type}
                                    </h5>
                                  </div>
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                                      problem.severity === "severe"
                                        ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                                        : problem.severity === "moderate"
                                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                                        : "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                    }`}
                                  >
                                    {problem.severity}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                  {problem.description}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                  <span>Confidence:</span>
                                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 max-w-20">
                                    <div
                                      className="bg-blue-500 h-1.5 rounded-full"
                                      style={{
                                        width: `${problem.confidence * 100}%`,
                                      }}
                                    />
                                  </div>
                                  <span>
                                    {Math.round(problem.confidence * 100)}%
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Treatment Recommendations */}
                  {selectedAnalysis.type === "face" &&
                    selectedAnalysis.treatments &&
                    selectedAnalysis.treatments.length > 0 && (
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                          Treatment Recommendations
                        </h4>
                        <div className="space-y-3">
                          {selectedAnalysis.treatments
                            .sort((a, b) => {
                              const priorityOrder = {
                                high: 3,
                                medium: 2,
                                low: 1,
                              };
                              return (
                                priorityOrder[b.priority] -
                                priorityOrder[a.priority]
                              );
                            })
                            .map((treatment, index) => (
                              <div
                                key={index}
                                className={`rounded-lg p-4 border ${
                                  treatment.priority === "high"
                                    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                                    : treatment.priority === "medium"
                                    ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                                    : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-2 h-2 rounded-full ${
                                        treatment.priority === "high"
                                          ? "bg-red-500"
                                          : treatment.priority === "medium"
                                          ? "bg-yellow-500"
                                          : "bg-blue-500"
                                      }`}
                                    />
                                    <h5 className="font-semibold text-gray-900 dark:text-white">
                                      {treatment.category}
                                    </h5>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                                        treatment.priority === "high"
                                          ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                                          : treatment.priority === "medium"
                                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                                          : "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                                      }`}
                                    >
                                      {treatment.priority} priority
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                      {treatment.timeframe}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {treatment.recommendation}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                  {selectedAnalysis.type === "report" &&
                    selectedAnalysis.structuredData && (
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                          Health Metrics
                        </h4>
                        {selectedAnalysis.structuredData.metrics &&
                        selectedAnalysis.structuredData.metrics.length > 0 ? (
                          <div className="space-y-2">
                            {selectedAnalysis.structuredData.metrics.map(
                              (metric: any, index: number) => (
                                <div
                                  key={index}
                                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3"
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {metric.name}
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {metric.value}{" "}
                                      {metric.unit && metric.unit}
                                    </span>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400">
                            No structured metrics available
                          </p>
                        )}
                      </div>
                    )}

                  {selectedAnalysis.riskAssessment && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                        Risk Assessment
                      </h4>
                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {selectedAnalysis.riskAssessment}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Raw Data (collapsed by default) */}
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                      View Raw Data
                    </summary>
                    <div className="mt-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto">
                        {JSON.stringify(selectedAnalysis.rawData, null, 2)}
                      </pre>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>
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
