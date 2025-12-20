"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  XMarkIcon,
  ChartBarIcon,
  HeartIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";

interface AnalysisDetailModalProps {
  analysis: any;
  onClose: () => void;
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

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AnalysisDetailModal({
  analysis,
  onClose,
}: AnalysisDetailModalProps) {
  // Prepare chart data for face analysis
  const faceMetrics =
    analysis.type === "face" && analysis.visualMetrics?.[0]
      ? {
          redness: analysis.visualMetrics[0].redness_percentage || 0,
          yellowness: analysis.visualMetrics[0].yellowness_percentage || 0,
        }
      : null;

  const pieData = faceMetrics
    ? [
        { name: "Redness", value: faceMetrics.redness, color: "#EF4444" },
        { name: "Yellowness", value: faceMetrics.yellowness, color: "#F59E0B" },
        {
          name: "Normal",
          value: Math.max(
            0,
            100 - faceMetrics.redness - faceMetrics.yellowness
          ),
          color: "#10B981",
        },
      ]
    : [];

  const radialData = faceMetrics
    ? [
        { name: "Redness", value: faceMetrics.redness, fill: "#EF4444" },
        { name: "Yellowness", value: faceMetrics.yellowness, fill: "#F59E0B" },
      ]
    : [];

  // Prepare health metrics chart data
  const healthMetrics =
    analysis.type === "report" && analysis.structuredData?.metrics
      ? analysis.structuredData.metrics.map((metric: any) => ({
          name: metric.name,
          value: parseFloat(metric.value) || 0,
          unit: metric.unit || "",
        }))
      : [];

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-6xl max-h-[92vh] transform overflow-hidden rounded-3xl bg-white dark:bg-gray-800/50 backdrop-blur-sm shadow-2xl transition-all overflow-y-auto border border-gray-100 dark:border-gray-700/50">
                {/* Header with gradient background */}
                <div className="relative bg-gradient-to-r from-slate-700 via-slate-600 to-slate-500 rounded-t-3xl p-4 text-white sticky top-0 z-10 overflow-hidden">
                  {/* Animated Background Elements */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-600/20 via-transparent to-slate-500/20"></div>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-500/30 to-slate-400/30 rounded-full blur-xl -translate-y-12 translate-x-12"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-slate-400/20 to-slate-500/20 rounded-full blur-lg translate-y-10 -translate-x-10"></div>

                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl hover:scale-110 transition-transform duration-300 hover:rotate-3">
                        {analysis.type === "face" && (
                          <EyeIcon className="h-6 w-6" />
                        )}
                        {analysis.type === "report" && (
                          <HeartIcon className="h-6 w-6" />
                        )}
                        {analysis.type === "risk" && (
                          <ChartBarIcon className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <Dialog.Title as="h3" className="text-xl font-bold">
                          {getAnalysisTypeLabel(analysis.type)} Dashboard
                        </Dialog.Title>
                        <p className="text-white/80 text-xs mt-1">
                          {formatDate(analysis.createdAt)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 p-2 text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 hover:scale-110 hover:rotate-3"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-5">
                  {/* Quick Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-102 hover:-translate-y-1 animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden cursor-pointer">
                      {/* Animated Background Elements */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5"></div>
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/15 to-cyan-500/15 rounded-full blur-xl -translate-y-10 translate-x-10 group-hover:scale-125 transition-transform duration-500"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-300/8 to-blue-500/8 rounded-full blur-lg translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-500"></div>

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl group-hover:scale-105 transition-transform duration-300 group-hover:rotate-2">
                            {analysis.type === "face" && (
                              <EyeIcon className="h-7 w-7 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300" />
                            )}
                            {analysis.type === "report" && (
                              <HeartIcon className="h-7 w-7 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300" />
                            )}
                            {analysis.type === "risk" && (
                              <ChartBarIcon className="h-7 w-7 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300" />
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                              {getAnalysisTypeLabel(analysis.type)}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                            Analysis Type
                          </h3>
                        </div>
                      </div>
                    </div>

                    {faceMetrics && (
                      <>
                        <div
                          className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-102 hover:-translate-y-1 animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden cursor-pointer"
                          style={{ animationDelay: "0.1s" }}
                        >
                          {/* Animated Background Elements */}
                          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-pink-500/5"></div>
                          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400/15 to-pink-500/15 rounded-full blur-xl -translate-y-10 translate-x-10 group-hover:scale-125 transition-transform duration-500"></div>
                          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-red-300/8 to-red-500/8 rounded-full blur-lg translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-500"></div>

                          <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                              <div className="p-3 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-xl group-hover:scale-105 transition-transform duration-300 group-hover:rotate-2">
                                <div className="h-5 w-5 bg-red-500 rounded-lg"></div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                                  {faceMetrics.redness}%
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                                Redness Level
                              </h3>
                              <div className="space-y-2">
                                <div className="w-full bg-gray-200/60 dark:bg-gray-700/60 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full transition-all duration-1000 group-hover:from-red-600 group-hover:to-pink-600"
                                    style={{ width: `${faceMetrics.redness}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-102 hover:-translate-y-1 animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden cursor-pointer"
                          style={{ animationDelay: "0.2s" }}
                        >
                          {/* Animated Background Elements */}
                          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-amber-500/5"></div>
                          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400/15 to-amber-500/15 rounded-full blur-xl -translate-y-10 translate-x-10 group-hover:scale-125 transition-transform duration-500"></div>
                          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-yellow-300/8 to-yellow-500/8 rounded-full blur-lg translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-500"></div>

                          <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                              <div className="p-3 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-xl group-hover:scale-105 transition-transform duration-300 group-hover:rotate-2">
                                <div className="h-5 w-5 bg-yellow-500 rounded-lg"></div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors duration-300">
                                  {faceMetrics.yellowness}%
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                                Yellowness Level
                              </h3>
                              <div className="space-y-2">
                                <div className="w-full bg-gray-200/60 dark:bg-gray-700/60 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-yellow-500 to-amber-500 h-2 rounded-full transition-all duration-1000 group-hover:from-yellow-600 group-hover:to-amber-600"
                                    style={{
                                      width: `${faceMetrics.yellowness}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {analysis.type === "report" && healthMetrics.length > 0 && (
                      <div
                        className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden cursor-pointer"
                        style={{ animationDelay: "0.1s" }}
                      >
                        {/* Animated Background Elements */}
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-300/10 to-green-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-6">
                            <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                              <HeartIcon className="h-7 w-7 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300" />
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                                {healthMetrics.length}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                              Health Metrics
                            </h3>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Charts Section for Face Analysis */}
                  {faceMetrics && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Pie Chart */}
                      <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-102 hover:-translate-y-1 animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                        {/* Animated Background Elements */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"></div>
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/15 to-purple-500/15 rounded-full blur-xl -translate-y-10 translate-x-10 group-hover:scale-125 transition-transform duration-500"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-300/8 to-blue-500/8 rounded-full blur-lg translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-500"></div>

                        <div className="relative z-10">
                          <h4 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                            <ChartBarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            Skin Analysis Distribution
                          </h4>
                          <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={pieData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={80}
                                  paddingAngle={3}
                                  dataKey="value"
                                  animationBegin={0}
                                  animationDuration={800}
                                >
                                  {pieData.map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={entry.color}
                                      stroke="rgba(255, 255, 255, 0.8)"
                                      strokeWidth={2}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip
                                  formatter={(value) => [
                                    `${value}%`,
                                    "Percentage",
                                  ]}
                                  contentStyle={{
                                    backgroundColor:
                                      "rgba(255, 255, 255, 0.95)",
                                    border: "1px solid rgba(0, 0, 0, 0.1)",
                                    borderRadius: "12px",
                                    color: "#374151",
                                    boxShadow:
                                      "0 10px 25px rgba(0, 0, 0, 0.15)",
                                    backdropFilter: "blur(10px)",
                                  }}
                                />
                                <Legend
                                  wrapperStyle={{
                                    paddingTop: "10px",
                                    fontSize: "12px",
                                    color: "#6B7280",
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Radial Bar Chart */}
                      <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-102 hover:-translate-y-1 animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                        {/* Animated Background Elements */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-300/10 to-purple-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

                        <div className="relative z-10">
                          <h4 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                            <EyeIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            Metric Intensity
                          </h4>
                          <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadialBarChart
                                cx="50%"
                                cy="50%"
                                innerRadius="20%"
                                outerRadius="90%"
                                data={radialData}
                              >
                                <RadialBar
                                  dataKey="value"
                                  cornerRadius={10}
                                  fill="#8884d8"
                                />
                                <Tooltip
                                  formatter={(value) => [`${value}%`, "Level"]}
                                  contentStyle={{
                                    backgroundColor:
                                      "rgba(255, 255, 255, 0.95)",
                                    border: "1px solid rgba(0, 0, 0, 0.1)",
                                    borderRadius: "12px",
                                    color: "#374151",
                                    boxShadow:
                                      "0 10px 25px rgba(0, 0, 0, 0.15)",
                                    backdropFilter: "blur(10px)",
                                  }}
                                />
                                <Legend
                                  wrapperStyle={{
                                    paddingTop: "10px",
                                    fontSize: "12px",
                                    color: "#6B7280",
                                  }}
                                />
                              </RadialBarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Skin Tone Analysis Card */}
                  {analysis.type === "face" &&
                    analysis.visualMetrics?.[0]?.skin_tone_analysis && (
                      <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                        {/* Animated Background Elements */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-300/10 to-indigo-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

                        <div className="relative z-10">
                          <h5 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                            <EyeIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            AI Skin Tone Analysis
                          </h5>
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 backdrop-blur-sm">
                            <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                              {analysis.visualMetrics[0].skin_tone_analysis}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Problems Detected */}
                  {analysis.type === "face" &&
                    analysis.problemsDetected &&
                    analysis.problemsDetected.length > 0 && (
                      <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 transform   animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                        {/* Animated Background Elements */}
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/20 to-orange-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-red-300/10 to-red-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

                        <div className="relative z-10">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                            <svg
                              className="h-5 w-5 text-red-600 dark:text-red-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Detected Skin Conditions
                          </h4>
                          <div className="space-y-4">
                            {analysis.problemsDetected.map(
                              (problem: any, index: number) => (
                                <div
                                  key={index}
                                  className={`rounded-xl p-4 border ${
                                    problem.severity === "severe"
                                      ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                                      : problem.severity === "moderate"
                                      ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                                      : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`w-4 h-4 rounded-full ${
                                          problem.severity === "severe"
                                            ? "bg-red-500"
                                            : problem.severity === "moderate"
                                            ? "bg-yellow-500"
                                            : "bg-green-500"
                                        }`}
                                      />
                                      <h5 className="font-semibold text-gray-900 dark:text-white text-lg">
                                        {problem.type}
                                      </h5>
                                    </div>
                                    <span
                                      className={`text-xs px-3 py-1 rounded-full font-medium ${
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
                                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                                    {problem.description}
                                  </p>
                                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                    <span>Confidence:</span>
                                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-24">
                                      <div
                                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                        style={{
                                          width: `${problem.confidence * 100}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="font-medium">
                                      {Math.round(problem.confidence * 100)}%
                                    </span>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Treatment Recommendations */}
                  {analysis.type === "face" &&
                    analysis.treatments &&
                    analysis.treatments.length > 0 && (
                      <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 transform  animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                        {/* Animated Background Elements */}
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-300/10 to-green-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

                        <div className="relative z-10">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                            <HeartIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                            Treatment Recommendations
                          </h4>
                          <div className="space-y-4">
                            {analysis.treatments
                              .sort((a: any, b: any) => {
                                const priorityOrder: { [key: string]: number } =
                                  {
                                    high: 3,
                                    medium: 2,
                                    low: 1,
                                  };
                                return (
                                  priorityOrder[b.priority] -
                                  priorityOrder[a.priority]
                                );
                              })
                              .map((treatment: any, index: number) => (
                                <div
                                  key={index}
                                  className={`rounded-xl p-4 border ${
                                    treatment.priority === "high"
                                      ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                                      : treatment.priority === "medium"
                                      ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                                      : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`w-3 h-3 rounded-full ${
                                          treatment.priority === "high"
                                            ? "bg-red-500"
                                            : treatment.priority === "medium"
                                            ? "bg-yellow-500"
                                            : "bg-blue-500"
                                        }`}
                                      />
                                      <h5 className="font-semibold text-gray-900 dark:text-white text-lg">
                                        {treatment.category}
                                      </h5>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`text-xs px-3 py-1 rounded-full font-medium ${
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
                                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {treatment.recommendation}
                                  </p>
                                </div>
                              ))}
                          </div>

                          {/* Medical Disclaimer */}
                          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                            <div className="flex items-start gap-3">
                              <svg
                                className="h-5 w-5 text-blue-500 shrink-0 mt-0.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <div>
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                  Important Medical Disclaimer
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                  These recommendations are for informational
                                  purposes only and should not replace
                                  professional medical advice. Always consult
                                  with a qualified healthcare provider or
                                  dermatologist for proper diagnosis and
                                  treatment, especially for severe or persistent
                                  symptoms.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Health Metrics Dashboard */}
                  {analysis.type === "report" && healthMetrics.length > 0 && (
                    <div className="space-y-6">
                      {/* Bar Chart for Health Metrics */}
                      <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                        {/* Animated Background Elements */}
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-300/10 to-green-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

                        <div className="relative z-10">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                            <HeartIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                            Health Metrics Overview
                          </h4>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={healthMetrics}
                                margin={{
                                  top: 20,
                                  right: 30,
                                  left: 20,
                                  bottom: 5,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#374151"
                                  opacity={0.3}
                                />
                                <XAxis
                                  dataKey="name"
                                  tick={{ fontSize: 12 }}
                                  stroke="#6B7280"
                                />
                                <YAxis
                                  tick={{ fontSize: 12 }}
                                  stroke="#6B7280"
                                />
                                <Tooltip
                                  formatter={(value, name, props) => [
                                    `${value} ${props.payload.unit}`,
                                    "Value",
                                  ]}
                                  contentStyle={{
                                    backgroundColor:
                                      "rgba(255, 255, 255, 0.95)",
                                    border: "1px solid rgba(0, 0, 0, 0.1)",
                                    borderRadius: "12px",
                                    color: "#374151",
                                    boxShadow:
                                      "0 10px 25px rgba(0, 0, 0, 0.15)",
                                    backdropFilter: "blur(10px)",
                                  }}
                                />
                                <Bar
                                  dataKey="value"
                                  fill="#037BFC"
                                  radius={[4, 4, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Health Metrics Cards Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {analysis.structuredData.metrics.map(
                          (metric: any, index: number) => (
                            <div
                              key={index}
                              className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-4 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-gray-100 dark:border-gray-700/50 overflow-hidden cursor-pointer"
                            >
                              {/* Animated Background Elements */}
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5"></div>
                              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-full blur-xl -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700"></div>

                              <div className="relative z-10">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="p-2 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                    <HeartIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                    #{index + 1}
                                  </span>
                                </div>
                                <h5 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                                  {metric.name}
                                </h5>
                                <p className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                                  {metric.value}{" "}
                                  {metric.unit && (
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                      {metric.unit}
                                    </span>
                                  )}
                                </p>
                                {metric.normalRange && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Normal: {metric.normalRange}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {analysis.type === "report" &&
                    (!analysis.structuredData?.metrics ||
                      analysis.structuredData.metrics.length === 0) && (
                      <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 text-center border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                        {/* Animated Background Elements */}
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 via-transparent to-gray-400/5"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-400/10 to-gray-500/10 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>

                        <div className="relative z-10">
                          <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400 text-lg">
                            No structured health metrics available for this
                            report
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Risk Assessment Card */}
                  {analysis.riskAssessment && (
                    <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                      {/* Animated Background Elements */}
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5"></div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-300/10 to-amber-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

                      <div className="relative z-10">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300">
                          <ChartBarIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          AI Risk Assessment
                        </h4>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 backdrop-blur-sm">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-amber-500 rounded-lg shrink-0 mt-1">
                              <svg
                                className="h-4 w-4 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <p className="text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap flex-1">
                              {analysis.riskAssessment}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Raw Data Section */}
                  <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 via-transparent to-slate-500/5"></div>

                    <details className="group/details">
                      <summary className="cursor-pointer p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600/50 dark:hover:to-gray-500/50 transition-colors relative z-10 list-none [&::-webkit-details-marker]:hidden">
                        <div className="flex items-center gap-3">
                          <svg
                            className="w-5 h-5 transition-transform group-open/details:rotate-90 text-gray-600 dark:text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                          <span className="font-medium text-gray-900 dark:text-white">
                            View Technical Data
                          </span>
                          <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full ml-auto">
                            Advanced
                          </span>
                        </div>
                      </summary>
                      <div className="p-4 bg-gray-900 dark:bg-gray-950 relative z-10">
                        <div className="bg-black rounded-lg p-4 overflow-hidden">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex gap-1">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>
                            <span className="text-gray-400 text-xs font-mono">
                              analysis_data.json
                            </span>
                          </div>
                          <pre className="text-xs text-green-400 font-mono overflow-auto max-h-64 leading-relaxed">
                            {JSON.stringify(analysis.rawData, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>

                {/* Footer with Action Buttons */}
                <div className="relative bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/80 dark:to-gray-700/80 backdrop-blur-sm p-3 rounded-b-3xl border-t border-gray-200 dark:border-gray-700/50 sticky bottom-0 overflow-hidden">
                  {/* Animated Background Elements */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5"></div>
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400/8 to-cyan-500/8 rounded-full blur-lg -translate-y-8 translate-x-8"></div>

                  <div className="relative z-10 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Analysis completed {formatDate(analysis.createdAt)}
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 hover:scale-105"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            JSON.stringify(analysis, null, 2)
                          );
                        }}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        Copy Data
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl hover:from-blue-500 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                        onClick={onClose}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
