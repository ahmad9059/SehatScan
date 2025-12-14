"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import DashboardCharts from "@/app/components/DashboardCharts";
import AnalysisDetailModal from "@/app/components/AnalysisDetailModal";
import EmptyState from "@/app/components/EmptyState";
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

export default function DashboardClient({
  user,
  stats,
  recentAnalyses,
  hasError,
}: DashboardClientProps) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);

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

  const recentAnalysesLimited = recentAnalyses.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 px-4 py-10 sm:px-6 lg:px-8 animate-fade-in-up">
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
              Welcome back, {user.name || "User"}!
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Your health analysis platform powered by AI
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
          <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden cursor-pointer">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-300/10 to-blue-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                  <ChartBarIcon className="h-7 w-7 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {stats.total}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    +12% this month
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                  Total Analyses
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Progress</span>
                    <span>85%</span>
                  </div>
                  <div className="w-full bg-gray-200/60 dark:bg-gray-700/60 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-1000 group-hover:from-blue-600 group-hover:to-indigo-600"
                      style={{ width: "85%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reports Scanned Card */}
          <div
            className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden cursor-pointer"
            style={{ animationDelay: "0.1s" }}
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-300/10 to-emerald-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                  <DocumentTextIcon className="h-7 w-7 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors duration-300" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                    {stats.reports}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    +8% this week
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                  Reports Scanned
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Accuracy</span>
                    <span>96%</span>
                  </div>
                  <div className="w-full bg-gray-200/60 dark:bg-gray-700/60 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-1000 group-hover:from-emerald-600 group-hover:to-teal-600"
                      style={{ width: "96%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Faces Analyzed Card */}
          <div
            className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden cursor-pointer"
            style={{ animationDelay: "0.2s" }}
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-300/10 to-purple-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                  <FaceSmileIcon className="h-7 w-7 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                    {stats.faces}
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                    +15% today
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                  Faces Analyzed
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Detection Rate</span>
                    <span>98%</span>
                  </div>
                  <div className="w-full bg-gray-200/60 dark:bg-gray-700/60 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000 group-hover:from-purple-600 group-hover:to-pink-600"
                      style={{ width: "98%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Assessments Card */}
          <div
            className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden cursor-pointer"
            style={{ animationDelay: "0.3s" }}
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-300/10 to-amber-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                  <ExclamationTriangleIcon className="h-7 w-7 text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors duration-300" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300">
                    {stats.risks}
                  </div>
                  <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    {stats.risks > 0 ? "+5% this week" : "Start assessing"}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                  Risk Assessments
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Completion</span>
                    <span>{stats.risks > 0 ? "78%" : "0%"}</span>
                  </div>
                  <div className="w-full bg-gray-200/60 dark:bg-gray-700/60 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-1000 group-hover:from-amber-600 group-hover:to-orange-600"
                      style={{ width: stats.risks > 0 ? "78%" : "0%" }}
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
            Analytics Overview
          </h2>
          <DashboardCharts stats={stats} recentAnalyses={recentAnalyses} />
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
            <div className="space-y-4">
              {recentAnalysesLimited.map((analysis, index) => (
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
                            {getAnalysisIcon(analysis.type)}
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
                            {formatDate(new Date(analysis.createdAt))}
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
              ))}
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

        {/* Quick Actions */}
        <div className="mb-8 mt-8 ">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white font-poppins mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Link
              href="/dashboard/scan-report"
              className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden cursor-pointer"
              aria-label="Upload medical report for analysis"
            >
              {/* Animated Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5"></div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-2xl -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-300/10 to-blue-500/10 rounded-full blur-xl translate-y-8 -translate-x-8 group-hover:scale-125 transition-transform duration-700"></div>

              <div className="relative z-10 text-center">
                <div className="p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3 mx-auto w-fit mb-3">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 mb-1">
                  Upload Report
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                  Analyze medical reports with AI
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/scan-face"
              className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden cursor-pointer"
              style={{ animationDelay: "0.1s" }}
              aria-label="Upload photo for facial analysis"
            >
              {/* Animated Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5"></div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-2xl -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-300/10 to-purple-500/10 rounded-full blur-xl translate-y-8 -translate-x-8 group-hover:scale-125 transition-transform duration-700"></div>

              <div className="relative z-10 text-center">
                <div className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3 mx-auto w-fit mb-3">
                  <PhotoIcon className="h-6 w-6 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 mb-1">
                  Upload Photo
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                  Facial health analysis
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/risk-assessment"
              className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden cursor-pointer"
              style={{ animationDelay: "0.2s" }}
              aria-label="Generate comprehensive risk assessment"
            >
              {/* Animated Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5"></div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-full blur-2xl -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-emerald-300/10 to-emerald-500/10 rounded-full blur-xl translate-y-8 -translate-x-8 group-hover:scale-125 transition-transform duration-700"></div>

              <div className="relative z-10 text-center">
                <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3 mx-auto w-fit mb-3">
                  <ChartBarIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors duration-300" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300 mb-1">
                  Generate Assessment
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                  Comprehensive risk analysis
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
