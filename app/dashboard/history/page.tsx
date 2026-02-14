"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { showErrorToast, showInfoToast } from "@/lib/toast";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import AnalysisDetailModal from "@/app/components/AnalysisDetailModal";
import {
  DocumentTextIcon,
  CameraIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import {
  chip,
  contentWidth,
  fullWidthSection,
  heading,
  mutedText,
  pageContainer,
  pill,
  primaryButton,
  secondaryButton,
  subheading,
} from "@/app/components/dashboardStyles";
import { useSimpleLanguage } from "@/app/components/SimpleLanguageContext";

interface StructuredMetric {
  name?: string;
  value?: string;
  unit?: string;
}

interface StructuredData {
  metrics?: StructuredMetric[];
  [key: string]: unknown;
}

interface VisualMetric {
  redness_percentage?: number;
  yellowness_percentage?: number;
  [key: string]: unknown;
}

interface Analysis {
  id: string;
  type: string;
  rawData?: unknown;
  structuredData?: StructuredData;
  visualMetrics?: VisualMetric[];
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
  const { user } = useUser();
  const { language } = useSimpleLanguage();
  const isUrdu = language === "ur";
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

  const fetchAnalyses = useCallback(
    async (page: number = 1, type: string = "all") => {
      if (!user?.id) {
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
          let errorMessage = isUrdu
            ? "تجزیے حاصل کرنے میں ناکامی"
            : "Failed to fetch analyses";

          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (parseError) {
            console.error("Failed to parse error response:", parseError);
          }

          if (response.status === 401) {
            errorMessage = isUrdu
              ? "تصدیق درکار ہے۔ براہ کرم دوبارہ لاگ ان کریں۔"
              : "Authentication required. Please log in again.";
          } else if (response.status === 403) {
            errorMessage = isUrdu
              ? "آپ کو اس ڈیٹا تک رسائی کی اجازت نہیں ہے۔"
              : "You don't have permission to access this data.";
          } else if (response.status >= 500) {
            errorMessage = isUrdu
              ? "سرور خرابی۔ براہ کرم بعد میں دوبارہ کوشش کریں۔"
              : "Server error. Please try again later.";
          }

          throw new Error(errorMessage);
        }

        const data: AnalysisHistoryResponse = await response.json();

        if (!data || typeof data !== "object") {
          throw new Error(
            isUrdu ? "غلط رسپانس فارمیٹ" : "Invalid response format"
          );
        }

        if (!Array.isArray(data.analyses)) {
          throw new Error(
            isUrdu ? "تجزیوں کے ڈیٹا کا فارمیٹ غلط ہے" : "Invalid analyses data format"
          );
        }

        setAnalyses(data.analyses);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.page || 1);

        if (data.analyses.length === 0 && page === 1) {
          if (type === "all") {
            showInfoToast(
              isUrdu
                ? "کوئی تجزیہ نہیں ملا۔ آغاز کے لیے رپورٹ یا تصویر اپ لوڈ کریں!"
                : "No analyses found. Upload a report or photo to get started!"
            );
          } else {
            showInfoToast(
              isUrdu
                ? `${type} کے کوئی تجزیے نہیں ملے۔ دوسرا فلٹر آزمائیں۔`
                : `No ${type} analyses found. Try a different filter.`
            );
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : isUrdu
              ? "تجزیے لوڈ کرنے میں ناکامی"
              : "Failed to load analyses";
        console.error("Error fetching analyses:", err);
        setError(errorMessage);
        showErrorToast(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [isUrdu, user?.id]
  );

  useEffect(() => {
    fetchAnalyses(currentPage, filterType);
  }, [fetchAnalyses, currentPage, filterType]);

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
        return isUrdu ? "چہرے کا تجزیہ" : "Facial Analysis";
      case "report":
        return isUrdu ? "رپورٹ تجزیہ" : "Report Analysis";
      case "risk":
        return isUrdu ? "صحت کی جانچ" : "Health Check";
      default:
        return isUrdu ? "تجزیہ" : "Analysis";
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
          const metrics = analysis.visualMetrics[0];
          return isUrdu
            ? `سرخی: ${metrics.redness_percentage || 0}٪، زردی: ${
                metrics.yellowness_percentage || 0
              }٪`
            : `Redness: ${metrics.redness_percentage || 0}%, Yellowness: ${
                metrics.yellowness_percentage || 0
              }%`;
        }
        return isUrdu ? "چہرے کا تجزیہ مکمل" : "Facial analysis completed";
      case "report":
        if (analysis.structuredData?.metrics) {
          const count = analysis.structuredData.metrics.length;
          return isUrdu
            ? `${count} صحت میٹرکس اخذ کیے گئے`
            : `${count} health metrics extracted`;
        }
        return isUrdu ? "رپورٹ تجزیہ مکمل" : "Report analysis completed";
      case "risk":
        return analysis.riskAssessment
          ? isUrdu
            ? "خطرے کی جانچ تیار ہو گئی"
            : "Risk assessment generated"
          : isUrdu
            ? "خطرے کی جانچ مکمل"
            : "Risk assessment completed";
      default:
        return isUrdu ? "تجزیہ مکمل" : "Analysis completed";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isUrdu ? "ur-PK" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filterOptions = [
    { value: "all", label: isUrdu ? "سب" : "All" },
    { value: "report", label: isUrdu ? "رپورٹس" : "Reports" },
    { value: "face", label: isUrdu ? "چہرے" : "Faces" },
    { value: "risk", label: isUrdu ? "خطرہ" : "Risk" },
  ];

  return (
    <div className={pageContainer}>
      <div className={contentWidth}>
        <section className={`${fullWidthSection} space-y-8`}>
          <div className="flex flex-col gap-3 border-b border-[var(--color-border)] pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className={heading}>
                {isUrdu ? "تجزیہ کی تاریخ" : "Analysis History"}
              </h1>
              <p className={`${subheading} mt-2 text-sm sm:text-base`}>
                {isUrdu
                  ? "ایک مسلسل ڈیش بورڈ ویو میں پچھلے تجزیے دیکھیں۔"
                  : "Review past analyses in a single, continuous dashboard view."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={pill}>
                {total} {isUrdu ? "کل" : "total"}
              </span>
              <span className={chip}>
                <CalendarIcon className="h-4 w-4" />
                {isUrdu ? "خودکار محفوظ" : "Auto-saved"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange(option.value)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                    filterType === option.value
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                      : "border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)] hover:border-[var(--color-primary)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className={`${mutedText} text-sm`}>
              {isUrdu
                ? `صفحہ ${currentPage} از ${totalPages}`
                : `Showing page ${currentPage} of ${totalPages}`}
            </div>
          </div>

          {error && (
            <div className="border border-[var(--color-danger)] bg-[var(--color-card)]/70 px-4 py-3 rounded-xl">
              <p className="text-sm text-[var(--color-danger)]">{error}</p>
            </div>
          )}

          {loading && analyses.length === 0 ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 bg-[var(--color-surface)] animate-pulse"
                />
              ))}
            </div>
          ) : analyses.length === 0 ? (
            <div className="space-y-3 border border-[var(--color-border)] bg-[var(--color-card)]/60 px-6 py-8 text-center rounded-xl">
              <DocumentTextIcon className="mx-auto h-10 w-10 text-[var(--color-muted)]" />
              <h3 className="mt-3 text-lg font-semibold text-[var(--color-heading)]">
                {isUrdu ? "کوئی تجزیہ نہیں ملا" : "No analyses found"}
              </h3>
              <p className={`${subheading} mt-1 text-sm`}>
                {filterType === "all"
                  ? isUrdu
                    ? "تجزیے شروع کرنے کے لیے رپورٹ یا تصویر اپ لوڈ کریں۔"
                    : "Upload a report or photo to start generating analyses."
                  : isUrdu
                    ? `ابھی ${filterType} تجزیے موجود نہیں۔ دوسرا فلٹر آزمائیں یا نیا مواد اپ لوڈ کریں۔`
                    : `No ${filterType} analyses yet. Try another filter or upload new content.`}
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <a href="/dashboard/scan-report" className={primaryButton}>
                  {isUrdu ? "رپورٹ اپ لوڈ کریں" : "Upload report"}
                </a>
                <a href="/dashboard/scan-face" className={secondaryButton}>
                  {isUrdu ? "چہرہ اسکین کریں" : "Scan face"}
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {analyses.map((analysis) => {
                const IconComponent = getAnalysisIcon(analysis.type);
                return (
                  <div
                    key={analysis.id}
                    className="cursor-pointer border border-[var(--color-border)] bg-[var(--color-card)]/60 px-5 py-4 transition-colors duration-200 hover:border-[var(--color-primary)] rounded-xl"
                    onClick={() => setSelectedAnalysis(analysis)}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-1 items-start gap-3">
                        <div className="h-12 w-12 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-[var(--color-heading)]">
                            {getAnalysisTypeLabel(analysis.type)}
                          </h3>
                          <p className={`${mutedText} mt-1 text-sm line-clamp-2`}>
                            {getAnalysisPreview(analysis)}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--color-subtle)]">
                            <span className={chip}>{formatDate(analysis.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <span className={secondaryButton}>
                          <EyeIcon className="h-4 w-4" />
                          {isUrdu ? "تفصیل دیکھیں" : "View details"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className={`${mutedText} text-sm`}>
                {isUrdu
                  ? `${total} کل تجزیے`
                  : `${total} ${total === 1 ? "analysis" : "analyses"} total`}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`${secondaryButton} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  {isUrdu ? "پچھلا" : "Previous"}
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`${secondaryButton} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isUrdu ? "اگلا" : "Next"}
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </section>

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
