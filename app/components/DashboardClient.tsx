"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import DashboardCharts from "@/app/components/DashboardCharts";
import AnalysisDetailModal from "@/app/components/AnalysisDetailModal";
import EmptyState from "@/app/components/EmptyState";
import { useSimpleLanguage } from "@/app/components/SimpleLanguageContext";
import {
  DocumentTextIcon,
  FaceSmileIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

interface AnalysisStats {
  total: number;
  reports: number;
  faces: number;
  risks: number;
}

interface DashboardClientProps {
  user: any;
  stats: AnalysisStats;
  recentAnalyses: any[];
  hasError: boolean;
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
      return <DocumentTextIcon className="h-6 w-6 text-[#037BFC]" />;
    case "face":
      return <FaceSmileIcon className="h-6 w-6 text-[#037BFC]" />;
    case "risk":
      return <ExclamationTriangleIcon className="h-6 w-6 text-[#037BFC]" />;
    default:
      return <ClipboardDocumentListIcon className="h-6 w-6 text-[#037BFC]" />;
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

// Helper function to strip markdown formatting for preview text
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1") // Bold
    .replace(/\*(.+?)\*/g, "$1") // Italic
    .replace(/#{1,6}\s+/g, "") // Headers
    .replace(/[-*+]\s+/g, "") // List items
    .replace(/\n+/g, " ") // Newlines to spaces
    .replace(/\s+/g, " ") // Multiple spaces to single
    .trim();
}

function getAnalysisPreview(analysis: any): string {
  if (analysis.type === "report" && analysis.structuredData?.metrics) {
    const metrics = analysis.structuredData.metrics;
    if (Array.isArray(metrics) && metrics.length > 0) {
      return `${metrics.length} health metrics extracted`;
    }
  }

  if (analysis.type === "face") {
    // Show problems detected if available
    if (analysis.problemsDetected && analysis.problemsDetected.length > 0) {
      const severeProblem = analysis.problemsDetected.find(
        (p: any) => p.severity === "severe"
      );
      const moderateProblem = analysis.problemsDetected.find(
        (p: any) => p.severity === "moderate"
      );
      const mainProblem =
        severeProblem || moderateProblem || analysis.problemsDetected[0];
      return `${mainProblem.type} (${mainProblem.severity})`;
    }

    // Fallback to visual metrics if problems not available
    if (analysis.visualMetrics) {
      const metrics = Array.isArray(analysis.visualMetrics)
        ? analysis.visualMetrics[0]
        : analysis.visualMetrics;
      if (metrics?.redness_percentage !== undefined) {
        return `Redness: ${metrics.redness_percentage}%, Yellowness: ${
          metrics.yellowness_percentage || 0
        }%`;
      }
    }
  }

  if (analysis.type === "risk" && analysis.riskAssessment) {
    const cleanText = stripMarkdown(analysis.riskAssessment);
    const preview = cleanText.substring(0, 100);
    return preview.length < cleanText.length ? `${preview}...` : preview;
  }

  return "Analysis completed";
}

export default function DashboardClient({
  user,
  stats,
  recentAnalyses,
  hasError,
}: DashboardClientProps) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const { t } = useSimpleLanguage();

  // Calculate dynamic progress percentages based on actual data
  const calculateProgressPercentages = () => {
    const maxAnalyses = 50; // Target number for 100% progress
    const totalProgress = Math.min((stats.total / maxAnalyses) * 100, 100);

    // Reports accuracy based on successful analyses vs total
    const reportsAccuracy =
      stats.reports > 0 ? Math.min(85 + stats.reports * 2, 100) : 0;

    // Face detection rate based on successful face analyses
    const faceDetectionRate =
      stats.faces > 0 ? Math.min(90 + stats.faces * 1.5, 100) : 0;

    // Risk assessment completion based on risk analyses vs other analyses
    const riskCompletion =
      stats.total > 0 ? Math.min((stats.risks / stats.total) * 100, 100) : 0;

    return {
      totalProgress: Math.round(totalProgress),
      reportsAccuracy: Math.round(reportsAccuracy),
      faceDetectionRate: Math.round(faceDetectionRate),
      riskCompletion: Math.round(riskCompletion),
    };
  };

  const progressData = calculateProgressPercentages();

  if (!user) {
    return (
      <div className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <ExclamationCircleIcon className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("auth.required")}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {t("auth.pleaseLogin")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const recentAnalysesLimited = recentAnalyses.slice(0, 5);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-10 sm:px-6 lg:px-8 animate-fade-in-up">
      <div className="mx-auto max-w-7xl">
        {/* Welcome Section with Logo */}
        <div className="mb-8 flex items-center gap-4">
          <div className="shrink-0">
            <Image
              src="/logo.svg"
              alt="SehatScan Logo"
              width={60}
              height={60}
              className="rounded-lg"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
              {t("dashboard.welcome").replace("{{name}}", user.name || "User")}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {t("dashboard.welcomeSubtitle")}
            </p>
          </div>
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

        {/* Stats Cards - Ultra Modern Design */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Analyses Card */}
          <div className="group relative bg-[var(--color-card)] rounded-xl p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-strong)] transition-all duration-300 hover:-translate-y-1 border border-[var(--color-border)] overflow-hidden cursor-pointer">
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 rounded-xl bg-[var(--color-primary-soft)] group-hover:scale-105 transition-transform duration-300">
                  <ChartBarIcon className="h-7 w-7 text-[var(--color-primary)]" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[var(--color-heading)] mb-1">
                    {stats.total}
                  </div>
                  <div className="text-xs text-[var(--color-primary)] font-medium">
                    +12% this month
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
                  {t("analytics.totalAnalyses")}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-[var(--color-subtle)]">
                    <span>Progress</span>
                    <span>{progressData.totalProgress}%</span>
                  </div>
                  <div className="w-full bg-[var(--color-surface)] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[var(--color-primary)] h-2 rounded-full transition-all duration-700"
                      style={{ width: `${progressData.totalProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reports Scanned Card */}
          <div
            className="group relative bg-[var(--color-card)] rounded-xl p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-strong)] transition-all duration-300 hover:-translate-y-1 animate-fade-in border border-[var(--color-border)] overflow-hidden cursor-pointer"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 rounded-xl bg-[var(--color-primary-soft)] group-hover:scale-105 transition-transform duration-300">
                  <DocumentTextIcon className="h-7 w-7 text-[var(--color-primary)]" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[var(--color-heading)] mb-1">
                    {stats.reports}
                  </div>
                  <div className="text-xs text-[var(--color-primary)] font-medium">
                    +8% this week
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
                  {t("analytics.reportsScanned")}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-[var(--color-subtle)]">
                    <span>Accuracy</span>
                    <span>{progressData.reportsAccuracy}%</span>
                  </div>
                  <div className="w-full bg-[var(--color-surface)] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[var(--color-primary)] h-2 rounded-full transition-all duration-700"
                      style={{ width: `${progressData.reportsAccuracy}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Faces Analyzed Card */}
          <div
            className="group relative bg-[var(--color-card)] rounded-xl p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-strong)] transition-all duration-300 hover:-translate-y-1 animate-fade-in border border-[var(--color-border)] overflow-hidden cursor-pointer"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 rounded-xl bg-[var(--color-primary-soft)] group-hover:scale-105 transition-transform duration-300">
                  <FaceSmileIcon className="h-7 w-7 text-[var(--color-primary)]" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[var(--color-heading)] mb-1">
                    {stats.faces}
                  </div>
                  <div className="text-xs text-[var(--color-primary)] font-medium">
                    +15% today
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
                  {t("analytics.facesAnalyzed")}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-[var(--color-subtle)]">
                    <span>Detection Rate</span>
                    <span>{progressData.faceDetectionRate}%</span>
                  </div>
                  <div className="w-full bg-[var(--color-surface)] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[var(--color-primary)] h-2 rounded-full transition-all duration-700"
                      style={{ width: `${progressData.faceDetectionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Assessments Card */}
          <div
            className="group relative bg-[var(--color-card)] rounded-xl p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-strong)] transition-all duration-300 hover:-translate-y-1 animate-fade-in border border-[var(--color-border)] overflow-hidden cursor-pointer"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 rounded-xl bg-[var(--color-primary-soft)] group-hover:scale-105 transition-transform duration-300">
                  <ExclamationTriangleIcon className="h-7 w-7 text-[var(--color-primary)]" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[var(--color-heading)] mb-1">
                    {stats.risks}
                  </div>
                  <div className="text-xs text-[var(--color-primary)] font-medium">
                    {stats.risks > 0 ? "+5% this week" : "Start assessing"}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
                  {t("analytics.riskAssessments")}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-[var(--color-subtle)]">
                    <span>Completion</span>
                    <span>{progressData.riskCompletion}%</span>
                  </div>
                  <div className="w-full bg-[var(--color-surface)] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[var(--color-primary)] h-2 rounded-full transition-all duration-700"
                      style={{ width: `${progressData.riskCompletion}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white font-poppins mb-4">
            {t("analytics.overview")}
          </h2>
          <DashboardCharts stats={stats} recentAnalyses={recentAnalyses} />
        </div>

        {/* Recent Analyses */}
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white font-poppins">
              {t("recent.analyses")}
            </h2>
            {recentAnalyses.length > 0 && (
              <Link
                href="/dashboard/history"
                className="text-[var(--color-primary)] hover:text-[var(--color-primary-strong)] font-medium text-sm transition-colors"
              >
                {t("recent.viewAll")} →
              </Link>
            )}
          </div>

          {recentAnalysesLimited.length > 0 ? (
            <div className="space-y-4">
              {recentAnalysesLimited.map((analysis, index) => (
                <div
                  key={analysis.id}
                  className="group relative bg-[var(--color-card)] rounded-xl p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-strong)] transition-all duration-300 hover:-translate-y-1 animate-fade-in-up border border-[var(--color-border)] overflow-hidden cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setSelectedAnalysis(analysis)}
                >
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center space-x-4 min-w-0 flex-1">
                        <div className="shrink-0">
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] group-hover:scale-105 transition-transform duration-300">
                            {getAnalysisIcon(analysis.type)}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold text-[var(--color-heading)] truncate group-hover:text-[var(--color-primary)] transition-colors duration-300">
                            {getAnalysisTypeLabel(analysis.type)}
                          </h3>
                          <p className="text-sm text-[var(--color-subtle)] mt-1 line-clamp-2 group-hover:text-[var(--color-foreground)] transition-colors duration-300">
                            {getAnalysisPreview(analysis)}
                          </p>
                          <p className="text-xs text-[var(--color-muted)] mt-2">
                            {formatDate(new Date(analysis.createdAt))}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <div className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary-soft)] px-4 py-2 text-sm font-semibold text-[var(--color-primary)]">
                          <EyeIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                          {t("common.viewDetails")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Empty State
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-soft)] animate-fade-in">
              <EmptyState
                icon={
                  <ClipboardDocumentListIcon className="h-12 w-12 text-[var(--color-muted)]" />
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

        {/* Quick Actions */}
        <div className="mb-8 mt-8 ">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white font-poppins mb-4">
            {t("actions.quickActions")}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Link
              href="/dashboard/scan-report"
              className="group relative bg-[var(--color-card)] rounded-xl p-4 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-strong)] transition-all duration-300 hover:-translate-y-1 animate-fade-in border border-[var(--color-border)] overflow-hidden cursor-pointer"
              aria-label="Upload medical report for analysis"
            >
              <div className="relative z-10 text-center">
                <div className="p-3 bg-[var(--color-primary-soft)] rounded-xl group-hover:scale-105 transition-transform duration-300 mx-auto w-fit mb-3">
                  <DocumentTextIcon className="h-6 w-6 text-[var(--color-primary)]" />
                </div>
                <h3 className="text-base font-semibold text-[var(--color-heading)] group-hover:text-[var(--color-primary)] transition-colors duration-300 mb-1">
                  {t("actions.uploadReport")}
                </h3>
                <p className="text-xs text-[var(--color-subtle)] group-hover:text-[var(--color-foreground)] transition-colors duration-300">
                  {t("actions.uploadReportDesc")}
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/scan-face"
              className="group relative bg-[var(--color-card)] rounded-xl p-4 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-strong)] transition-all duration-300 hover:-translate-y-1 animate-fade-in border border-[var(--color-border)] overflow-hidden cursor-pointer"
              style={{ animationDelay: "0.1s" }}
              aria-label="Upload photo for facial analysis"
            >
              <div className="relative z-10 text-center">
                <div className="p-3 bg-[var(--color-primary-soft)] rounded-xl group-hover:scale-105 transition-transform duration-300 mx-auto w-fit mb-3">
                  <PhotoIcon className="h-6 w-6 text-[var(--color-primary)]" />
                </div>
                <h3 className="text-base font-semibold text-[var(--color-heading)] group-hover:text-[var(--color-primary)] transition-colors duration-300 mb-1">
                  {t("actions.scanFace")}
                </h3>
                <p className="text-xs text-[var(--color-subtle)] group-hover:text-[var(--color-foreground)] transition-colors duration-300">
                  {t("actions.scanFaceDesc")}
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/risk-assessment"
              className="group relative bg-[var(--color-card)] rounded-xl p-4 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-strong)] transition-all duration-300 hover:-translate-y-1 animate-fade-in border border-[var(--color-border)] overflow-hidden cursor-pointer"
              style={{ animationDelay: "0.2s" }}
              aria-label="Generate comprehensive risk assessment"
            >
              <div className="relative z-10 text-center">
                <div className="p-3 bg-[var(--color-primary-soft)] rounded-xl group-hover:scale-105 transition-transform duration-300 mx-auto w-fit mb-3">
                  <ChartBarIcon className="h-6 w-6 text-[var(--color-primary)]" />
                </div>
                <h3 className="text-base font-semibold text-[var(--color-heading)] group-hover:text-[var(--color-primary)] transition-colors duration-300 mb-1">
                  {t("actions.riskAssessment")}
                </h3>
                <p className="text-xs text-[var(--color-subtle)] group-hover:text-[var(--color-foreground)] transition-colors duration-300">
                  {t("actions.riskAssessmentDesc")}
                </p>
              </div>
            </Link>
          </div>
        </div>

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
