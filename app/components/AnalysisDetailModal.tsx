"use client";

import { Fragment, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  XMarkIcon,
  ChartBarIcon,
  HeartIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface AnalysisDetailModalProps {
  analysis: any;
  onClose: () => void;
}

const sectionBox =
  "border border-[var(--color-border)] bg-[var(--color-card)]/85 rounded-xl p-4 space-y-4";

const chipStyles =
  "inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-heading)]";

function getAnalysisTypeLabel(type: string): string {
  switch (type) {
    case "report":
      return "Report Analysis";
    case "face":
      return "Face Analysis";
    case "risk":
      return "Health Check";
    default:
      return "Analysis";
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const metricColors = ["#2563EB", "#F97316", "#10B981", "#8B5CF6", "#EC4899"];

function normalizeTooltipValue(value: unknown): string | number {
  if (Array.isArray(value)) {
    return value[0] ?? 0;
  }
  if (value === undefined || value === null) {
    return 0;
  }
  return value as string | number;
}

function getTooltipUnit(payload: unknown): string {
  if (
    payload &&
    typeof payload === "object" &&
    "payload" in payload &&
    payload.payload &&
    typeof payload.payload === "object" &&
    "unit" in payload.payload &&
    typeof payload.payload.unit === "string"
  ) {
    return payload.payload.unit;
  }
  return "";
}

export default function AnalysisDetailModal({
  analysis,
  onClose,
}: AnalysisDetailModalProps) {
  const faceMetrics = useMemo(() => {
    if (analysis?.type !== "face" || !analysis?.visualMetrics?.[0]) return null;
    return {
      redness: analysis.visualMetrics[0].redness_percentage || 0,
      yellowness: analysis.visualMetrics[0].yellowness_percentage || 0,
    };
  }, [analysis]);

  const pieData = useMemo(() => {
    if (!faceMetrics) return [];
    return [
      { name: "Redness", value: faceMetrics.redness, color: "#EF4444" },
      { name: "Yellowness", value: faceMetrics.yellowness, color: "#F59E0B" },
      {
        name: "Normal",
        value: Math.max(0, 100 - faceMetrics.redness - faceMetrics.yellowness),
        color: "#10B981",
      },
    ];
  }, [faceMetrics]);

  const radialData = useMemo(() => {
    if (!faceMetrics) return [];
    return [
      { name: "Redness", value: faceMetrics.redness, fill: "#EF4444" },
      { name: "Yellowness", value: faceMetrics.yellowness, fill: "#F59E0B" },
    ];
  }, [faceMetrics]);

  const healthMetrics = useMemo(() => {
    if (analysis?.type !== "report" || !analysis?.structuredData?.metrics)
      return [];
    return analysis.structuredData.metrics.map(
      (metric: any, index: number) => ({
        name: metric.name,
        value: parseFloat(metric.value) || 0,
        unit: metric.unit || "",
        color: metricColors[index % metricColors.length],
      })
    );
  }, [analysis]);

  const sourceImageUrl = useMemo(() => {
    if (analysis?.type !== "face") return null;
    if (
      analysis?.rawData &&
      typeof analysis.rawData === "object" &&
      typeof analysis.rawData.source_image_url === "string"
    ) {
      return analysis.rawData.source_image_url;
    }
    return null;
  }, [analysis]);

  // Face-specific problems and treatments
  const hasFaceProblems =
    analysis?.type === "face" &&
    Array.isArray(analysis?.problemsDetected) &&
    analysis.problemsDetected.length > 0;

  const hasFaceTreatments =
    analysis?.type === "face" &&
    Array.isArray(analysis?.treatments) &&
    analysis.treatments.length > 0;

  // Report-specific problems and treatments
  const hasReportProblems =
    analysis?.type === "report" &&
    Array.isArray(analysis?.structuredData?.problems_detected) &&
    analysis.structuredData.problems_detected.length > 0;

  const hasReportTreatments =
    analysis?.type === "report" &&
    Array.isArray(analysis?.structuredData?.treatments) &&
    analysis.structuredData.treatments.length > 0;

  const hasRisk = analysis?.type === "risk" && analysis?.riskAssessment;

  // Check for raw text - could be string or inside an object
  const getRawText = () => {
    if (!analysis?.rawData) return null;
    if (typeof analysis.rawData === "string") return analysis.rawData;
    if (typeof analysis.rawData === "object") {
      // Check common keys where raw text might be stored
      if (analysis.rawData.raw_text) return analysis.rawData.raw_text;
      if (analysis.rawData.text) return analysis.rawData.text;
      if (analysis.rawData.extracted_text)
        return analysis.rawData.extracted_text;
    }
    return null;
  };

  const rawText = getRawText();
  const hasRawText = analysis?.type === "report" && !!rawText;

  // Check if report has any displayable content
  const hasReportSummary =
    analysis?.type === "report" && analysis?.structuredData?.summary;

  return (
    <Transition appear show as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-3">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-strong)]">
              <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                    {analysis?.type === "face" && (
                      <EyeIcon className="h-5 w-5" />
                    )}
                    {analysis?.type === "report" && (
                      <HeartIcon className="h-5 w-5" />
                    )}
                    {analysis?.type === "risk" && (
                      <ChartBarIcon className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <Dialog.Title className="text-lg font-semibold text-[var(--color-heading)]">
                      {getAnalysisTypeLabel(analysis?.type)}
                    </Dialog.Title>
                    <p className="text-xs text-[var(--color-subtle)]">
                      {formatDate(analysis?.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-2 text-[var(--color-heading)] hover:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="grid h-[calc(92vh-68px)] grid-rows-[auto,1fr,auto] overflow-hidden">
                <div className="grid gap-3 bg-[var(--color-surface)] px-4 py-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className={sectionBox}>
                    <p className="text-xs text-[var(--color-subtle)]">
                      Analysis type
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--color-heading)]">
                        {getAnalysisTypeLabel(analysis?.type)}
                      </span>
                      <span className={chipStyles}>{analysis?.id}</span>
                    </div>
                  </div>

                  {faceMetrics && (
                    <>
                      <div className={sectionBox}>
                        <p className="text-xs text-[var(--color-subtle)]">
                          Redness level
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-[var(--color-heading)]">
                            {faceMetrics.redness}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[var(--color-border)]/60">
                          <div
                            className="h-2 rounded-full bg-[var(--color-danger)]"
                            style={{
                              width: `${Math.min(100, faceMetrics.redness)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className={sectionBox}>
                        <p className="text-xs text-[var(--color-subtle)]">
                          Yellowness level
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-[var(--color-heading)]">
                            {faceMetrics.yellowness}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[var(--color-border)]/60">
                          <div
                            className="h-2 rounded-full bg-[#f59e0b]"
                            style={{
                              width: `${Math.min(
                                100,
                                faceMetrics.yellowness
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {healthMetrics.length > 0 && (
                    <div className={sectionBox}>
                      <p className="text-xs text-[var(--color-subtle)]">
                        Extracted metrics
                      </p>
                      <div className="text-lg font-semibold text-[var(--color-heading)]">
                        {healthMetrics.length} values
                      </div>
                    </div>
                  )}

                  {sourceImageUrl && (
                    <div className={sectionBox}>
                      <p className="text-xs text-[var(--color-subtle)]">
                        Stored original image
                      </p>
                      <a
                        href={sourceImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-[var(--color-primary)] hover:underline break-all"
                      >
                        Open UploadThing file
                      </a>
                    </div>
                  )}

                  {hasRisk && (
                    <div className={sectionBox}>
                      <p className="text-xs text-[var(--color-subtle)]">
                        Risk assessment
                      </p>
                      <div className="text-sm font-semibold text-[var(--color-heading)]">
                        Generated summary
                      </div>
                    </div>
                  )}
                </div>

                <div className="overflow-y-auto px-4 pb-4">
                  <div className="space-y-4">
                    {(pieData.length > 0 || radialData.length > 0) && (
                      <div className="grid gap-4 md:grid-cols-2">
                        {pieData.length > 0 && (
                          <div className={sectionBox}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <EyeIcon className="h-5 w-5 text-[var(--color-primary)]" />
                                <p className="text-sm font-semibold text-[var(--color-heading)]">
                                  Skin analysis distribution
                                </p>
                              </div>
                            </div>
                            <div className="h-52">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={pieData}
                                    dataKey="value"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={2}
                                  >
                                    {pieData.map((entry, index) => (
                                      <Cell key={index} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <Tooltip
                                    formatter={(value) =>
                                      `${normalizeTooltipValue(value)}%`
                                    }
                                    contentStyle={{
                                      background: "var(--color-card)",
                                      border: "1px solid var(--color-border)",
                                      borderRadius: "10px",
                                      color: "var(--color-foreground)",
                                    }}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}

                        {radialData.length > 0 && (
                          <div className={sectionBox}>
                            <div className="flex items-center gap-2">
                              <ChartBarIcon className="h-5 w-5 text-[var(--color-primary)]" />
                              <p className="text-sm font-semibold text-[var(--color-heading)]">
                                Metric intensity
                              </p>
                            </div>
                            <div className="h-52">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={radialData}
                                    dataKey="value"
                                    innerRadius={45}
                                    outerRadius={70}
                                    startAngle={90}
                                    endAngle={-270}
                                    cornerRadius={8}
                                  >
                                    {radialData.map((entry, index) => (
                                      <Cell key={index} fill={entry.fill} />
                                    ))}
                                  </Pie>
                                  <Tooltip
                                    formatter={(value) =>
                                      `${normalizeTooltipValue(value)}%`
                                    }
                                    contentStyle={{
                                      background: "var(--color-card)",
                                      border: "1px solid var(--color-border)",
                                      borderRadius: "10px",
                                      color: "var(--color-foreground)",
                                    }}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {healthMetrics.length > 0 && (
                      <div className={sectionBox}>
                        <div className="flex items-center gap-2">
                          <ChartBarIcon className="h-5 w-5 text-[var(--color-primary)]" />
                          <p className="text-sm font-semibold text-[var(--color-heading)]">
                            Health metrics
                          </p>
                        </div>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={healthMetrics}>
                              <XAxis
                                dataKey="name"
                                tick={{
                                  fontSize: 12,
                                  fill: "var(--color-subtle)",
                                }}
                                interval={0}
                                height={50}
                              />
                              <YAxis
                                tick={{
                                  fontSize: 12,
                                  fill: "var(--color-subtle)",
                                }}
                              />
                              <Tooltip
                                formatter={(value, _name, payload) =>
                                  `${normalizeTooltipValue(value)} ${getTooltipUnit(payload)}`.trim()
                                }
                                contentStyle={{
                                  background: "var(--color-card)",
                                  border: "1px solid var(--color-border)",
                                  borderRadius: "10px",
                                  color: "var(--color-foreground)",
                                }}
                              />
                              <Bar dataKey="value">
                                {healthMetrics.map(
                                  (
                                    entry: {
                                      name: string;
                                      value: number;
                                      unit: string;
                                      color: string;
                                    },
                                    index: number
                                  ) => (
                                    <Cell key={index} fill={entry.color} />
                                  )
                                )}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {hasFaceProblems && (
                      <div className={sectionBox}>
                        <div className="flex items-center gap-2">
                          <ExclamationTriangleIcon className="h-5 w-5 text-[var(--color-warning)]" />
                          <p className="text-sm font-semibold text-[var(--color-heading)]">
                            Detected conditions
                          </p>
                        </div>
                        <div className="space-y-3">
                          {analysis.problemsDetected.map(
                            (problem: any, idx: number) => (
                              <div
                                key={`${problem.type}-${idx}`}
                                className={`rounded-lg border px-3 py-3 ${
                                  problem.severity === "severe"
                                    ? "border-[var(--color-danger)]/60 bg-[var(--color-danger)]/10"
                                    : problem.severity === "moderate"
                                    ? "border-[var(--color-warning)]/60 bg-[var(--color-warning)]/10"
                                    : "border-[var(--color-success)]/60 bg-[var(--color-success)]/10"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-heading)]" />
                                    <p className="text-sm font-semibold text-[var(--color-heading)]">
                                      {problem.type}
                                    </p>
                                  </div>
                                  <span className={chipStyles}>
                                    {problem.severity}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm text-[var(--color-foreground)]">
                                  {problem.description}
                                </p>
                                <div className="mt-3 flex items-center gap-2 text-xs text-[var(--color-subtle)]">
                                  <span className="font-semibold text-[var(--color-heading)]">
                                    Confidence
                                  </span>
                                  <div className="h-2 w-28 rounded-full bg-[var(--color-card)] border border-[var(--color-border)]">
                                    <div
                                      className="h-full rounded-full bg-[var(--color-primary)]"
                                      style={{
                                        width: `${Math.min(
                                          100,
                                          Math.round(
                                            (problem.confidence || 0) * 100
                                          )
                                        )}%`,
                                      }}
                                    />
                                  </div>
                                  <span className="text-[var(--color-heading)] font-semibold">
                                    {Math.round(
                                      (problem.confidence || 0) * 100
                                    )}
                                    %
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {hasFaceTreatments && (
                      <div className={sectionBox}>
                        <div className="flex items-center gap-2">
                          <HeartIcon className="h-5 w-5 text-[var(--color-primary)]" />
                          <p className="text-sm font-semibold text-[var(--color-heading)]">
                            Recommended actions
                          </p>
                        </div>
                        <div className="space-y-3">
                          {analysis.treatments
                            .sort((a: any, b: any) => {
                              const order: Record<string, number> = {
                                high: 3,
                                medium: 2,
                                low: 1,
                              };
                              return (
                                (order[b.priority] || 0) -
                                (order[a.priority] || 0)
                              );
                            })
                            .map((treatment: any, idx: number) => (
                              <div
                                key={`${treatment.category}-${idx}`}
                                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />
                                    <p className="text-sm font-semibold text-[var(--color-heading)]">
                                      {treatment.category}
                                    </p>
                                  </div>
                                  <span className={chipStyles}>
                                    {treatment.priority} · {treatment.timeframe}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm text-[var(--color-foreground)]">
                                  {treatment.recommendation}
                                </p>
                              </div>
                            ))}
                        </div>

                        <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3">
                          <div className="flex items-start gap-2">
                            <ExclamationTriangleIcon className="h-5 w-5 text-[var(--color-warning)] mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-[var(--color-heading)]">
                                Important Medical Disclaimer
                              </p>
                              <p className="text-xs text-[var(--color-foreground)] mt-1 leading-relaxed">
                                These recommendations are for informational
                                purposes only and should not replace
                                professional medical advice. Always consult with
                                a qualified healthcare provider or dermatologist
                                for proper diagnosis and treatment, especially
                                for severe or persistent symptoms.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {hasRisk && (
                      <div className={sectionBox}>
                        <div className="flex items-center gap-2">
                          <ChartBarIcon className="h-5 w-5 text-[var(--color-primary)]" />
                          <p className="text-sm font-semibold text-[var(--color-heading)]">
                            Risk assessment
                          </p>
                        </div>
                        <div className="prose prose-sm max-w-none text-[var(--color-foreground)] prose-headings:text-[var(--color-heading)] prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-strong:text-[var(--color-heading)]">
                          <ReactMarkdown>
                            {analysis.riskAssessment}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}

                    {hasRawText && (
                      <div className={sectionBox}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ArrowDownTrayIcon className="h-5 w-5 text-[var(--color-primary)]" />
                            <p className="text-sm font-semibold text-[var(--color-heading)]">
                              Extracted text
                            </p>
                          </div>
                        </div>
                        <div className="max-h-64 overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 text-sm leading-relaxed text-[var(--color-foreground)]">
                          {rawText}
                        </div>
                      </div>
                    )}

                    {hasReportSummary && (
                      <div className={sectionBox}>
                        <div className="flex items-center gap-2">
                          <HeartIcon className="h-5 w-5 text-[var(--color-primary)]" />
                          <p className="text-sm font-semibold text-[var(--color-heading)]">
                            Summary
                          </p>
                        </div>
                        <div className="prose prose-sm max-w-none text-[var(--color-foreground)] prose-headings:text-[var(--color-heading)] prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-strong:text-[var(--color-heading)]">
                          <ReactMarkdown>
                            {analysis.structuredData.summary}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}

                    {hasReportProblems && (
                      <div className={sectionBox}>
                        <div className="flex items-center gap-2">
                          <ExclamationTriangleIcon className="h-5 w-5 text-[var(--color-warning)]" />
                          <p className="text-sm font-semibold text-[var(--color-heading)]">
                            Health concerns detected
                          </p>
                        </div>
                        <div className="space-y-3">
                          {analysis.structuredData.problems_detected.map(
                            (problem: any, idx: number) => (
                              <div
                                key={`report-problem-${idx}`}
                                className={`rounded-lg border px-3 py-3 ${
                                  problem.severity === "severe"
                                    ? "border-[var(--color-danger)]/60 bg-[var(--color-danger)]/10"
                                    : problem.severity === "moderate"
                                    ? "border-[var(--color-warning)]/60 bg-[var(--color-warning)]/10"
                                    : "border-[var(--color-success)]/60 bg-[var(--color-success)]/10"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-heading)]" />
                                    <p className="text-sm font-semibold text-[var(--color-heading)]">
                                      {problem.type}
                                    </p>
                                  </div>
                                  <span className={chipStyles}>
                                    {problem.severity}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm text-[var(--color-foreground)]">
                                  {problem.description}
                                </p>
                                {problem.confidence && (
                                  <div className="mt-3 flex items-center gap-2 text-xs text-[var(--color-subtle)]">
                                    <span className="font-semibold text-[var(--color-heading)]">
                                      Confidence
                                    </span>
                                    <div className="h-2 w-28 rounded-full bg-[var(--color-card)] border border-[var(--color-border)]">
                                      <div
                                        className="h-full rounded-full bg-[var(--color-primary)]"
                                        style={{
                                          width: `${Math.min(
                                            100,
                                            Math.round(problem.confidence * 100)
                                          )}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-[var(--color-heading)] font-semibold">
                                      {Math.round(problem.confidence * 100)}%
                                    </span>
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {hasReportTreatments && (
                      <div className={sectionBox}>
                        <div className="flex items-center gap-2">
                          <HeartIcon className="h-5 w-5 text-[var(--color-primary)]" />
                          <p className="text-sm font-semibold text-[var(--color-heading)]">
                            Recommended actions
                          </p>
                        </div>
                        <div className="space-y-3">
                          {analysis.structuredData.treatments
                            .sort((a: any, b: any) => {
                              const order: Record<string, number> = {
                                high: 3,
                                medium: 2,
                                low: 1,
                              };
                              return (
                                (order[b.priority] || 0) -
                                (order[a.priority] || 0)
                              );
                            })
                            .map((treatment: any, idx: number) => (
                              <div
                                key={`report-treatment-${idx}`}
                                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />
                                    <p className="text-sm font-semibold text-[var(--color-heading)]">
                                      {treatment.category}
                                    </p>
                                  </div>
                                  <span className={chipStyles}>
                                    {treatment.priority}
                                    {treatment.timeframe &&
                                      ` · ${treatment.timeframe}`}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm text-[var(--color-foreground)]">
                                  {treatment.recommendation}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
                  <button
                    onClick={onClose}
                    className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-2 text-sm font-semibold text-[var(--color-heading)] hover:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
