"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-semibold leading-6 text-gray-900 dark:text-white"
                  >
                    {getAnalysisTypeLabel(analysis.type)} Details
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md bg-gray-100 dark:bg-gray-700 p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#037BFC]"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
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
                          {getAnalysisTypeLabel(analysis.type)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Date:
                        </span>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {formatDate(analysis.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Analysis Content */}
                  {analysis.type === "face" &&
                    analysis.visualMetrics &&
                    Array.isArray(analysis.visualMetrics) &&
                    analysis.visualMetrics.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Visual Metrics
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Redness Percentage:
                            </span>
                            <p className="text-2xl font-bold text-red-600 mt-1">
                              {analysis.visualMetrics[0].redness_percentage ||
                                0}
                              %
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Yellowness Percentage:
                            </span>
                            <p className="text-2xl font-bold text-yellow-600 mt-1">
                              {analysis.visualMetrics[0]
                                .yellowness_percentage || 0}
                              %
                            </p>
                          </div>
                        </div>
                        {analysis.visualMetrics[0].skin_tone_analysis && (
                          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                            <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                              Skin Tone Analysis:
                            </h5>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              {analysis.visualMetrics[0].skin_tone_analysis}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                  {analysis.type === "report" && analysis.structuredData && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Health Metrics
                      </h4>
                      {analysis.structuredData.metrics &&
                      analysis.structuredData.metrics.length > 0 ? (
                        <div className="space-y-3">
                          {analysis.structuredData.metrics.map(
                            (metric: any, index: number) => (
                              <div
                                key={index}
                                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {metric.name}
                                  </span>
                                  <span className="text-gray-600 dark:text-gray-400 font-semibold">
                                    {metric.value} {metric.unit && metric.unit}
                                  </span>
                                </div>
                                {metric.normalRange && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Normal range: {metric.normalRange}
                                  </p>
                                )}
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

                  {analysis.riskAssessment && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Risk Assessment
                      </h4>
                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                          {analysis.riskAssessment}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Raw Data (collapsed by default) */}
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-2">
                      <svg
                        className="w-4 h-4 transition-transform group-open:rotate-90"
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
                      View Raw Data
                    </summary>
                    <div className="mt-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-64">
                        {JSON.stringify(analysis.rawData, null, 2)}
                      </pre>
                    </div>
                  </details>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-[#037BFC] px-4 py-2 text-sm font-medium text-white hover:bg-[#0260c9] focus:outline-none focus:ring-2 focus:ring-[#037BFC] focus:ring-offset-2 transition-colors"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
