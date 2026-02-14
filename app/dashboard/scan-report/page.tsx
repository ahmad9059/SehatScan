"use client";

import { useRef, useState } from "react";
import { analyzeReport } from "../../actions/scan";
import { validateFile } from "@/lib/validation";
import {
  showSuccessToast,
  showErrorToast,
  handleServerActionResponse,
} from "@/lib/toast";
import ErrorBoundary from "../../components/ErrorBoundary";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  XMarkIcon,
  PhotoIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  HeartIcon,
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
  sectionTitle,
  subheading,
} from "@/app/components/dashboardStyles";
import { useSimpleLanguage } from "@/app/components/SimpleLanguageContext";

interface AnalysisResult {
  raw_text: string;
  structured_data: {
    metrics: Array<{
      name: string;
      value: string;
      unit?: string;
      status?: "normal" | "low" | "high" | "critical";
      reference_range?: string;
    }>;
    problems_detected?: Array<{
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
    summary?: string;
  };
}

function ScanReportPageContent() {
  const { language } = useSimpleLanguage();
  const isUrdu = language === "ur";
  const uploadTips = isUrdu
    ? [
        "بہترین درستگی کے لیے واضح اور روشن اسکین استعمال کریں۔",
        "معاون فائلیں: PDF، JPG، یا PNG (زیادہ سے زیادہ 10MB)",
        "تمام میٹرکس نکالنے کے لیے مکمل صفحات شامل کریں۔",
      ]
    : [
        "Use clear, well-lit scans for best accuracy.",
        "Supported files: PDF, JPG, or PNG up to 10MB.",
        "Include complete pages to extract all metrics.",
      ];
  const quickWins = isUrdu
    ? ["خودکار میٹرک اخذ", "محفوظ اپ لوڈ پروسیسنگ", "فوراً تاریخ میں محفوظ"]
    : [
        "Automatic metric extraction",
        "Secure upload processing",
        "Save to history instantly",
      ];
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    const validation = validateFile(selectedFile, {
      allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
      allowedExtensions: [".jpg", ".jpeg", ".png", ".pdf"],
      maxSize: 10 * 1024 * 1024,
    });

    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors)[0];
      showErrorToast(errorMessage);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResult(null);

    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setImagePreview(null);
    }

    showSuccessToast(
      isUrdu ? "فائل کامیابی سے منتخب ہو گئی" : "File selected successfully"
    );
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const clearFile = () => {
    setFile(null);
    setImagePreview(null);
    setError(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      showErrorToast(
        isUrdu ? "براہ کرم اپ لوڈ کے لیے فائل منتخب کریں" : "Please select a file to upload"
      );
      return;
    }

    const validation = validateFile(file, {
      allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
      allowedExtensions: [".jpg", ".jpeg", ".png", ".pdf"],
      maxSize: 10 * 1024 * 1024,
    });

    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors)[0];
      showErrorToast(errorMessage);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await analyzeReport(formData);

      const success = handleServerActionResponse(response, {
        successMessage:
          isUrdu
            ? "رپورٹ کامیابی سے تجزیہ ہو گئی! آپ اسے اپنی تاریخ میں دیکھ سکتے ہیں۔"
            : "Report analyzed successfully! You can view this in your history.",
        onSuccess: (data) => {
          setResult(data);
        },
        onError: (serverError) => {
          setError(
            serverError.error ||
              (isUrdu ? "رپورٹ کا تجزیہ کرنے میں ناکامی" : "Failed to analyze report")
          );
        },
      });

      if (!success && response.error) {
        setError(response.error);
      }
    } catch (err) {
      console.error("Report analysis error:", err);
      const errorMessage = isUrdu
        ? "رپورٹ کے تجزیے کے دوران غیر متوقع خرابی پیش آئی"
        : "An unexpected error occurred during report analysis";
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={pageContainer}>
      <div className={contentWidth}>
        <section className={`${fullWidthSection} space-y-10`}>
          <div className="flex flex-col gap-4 border-b border-[var(--color-border)] pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                <DocumentTextIcon className="h-7 w-7" />
              </div>
              <div>
                <h1 className={heading}>
                  {isUrdu ? "طبی رپورٹ اسکین کریں" : "Scan Medical Report"}
                </h1>
                <p className={`${subheading} mt-2 text-sm sm:text-base`}>
                  {isUrdu
                    ? "اپنی لیب رپورٹ اپ لوڈ کریں تاکہ صحت کے میٹرکس ایک مسلسل، فل-وِڈتھ ڈیش بورڈ فلو میں اخذ اور تجزیہ کیے جا سکیں۔"
                    : "Upload your lab report to extract and analyze health metrics in a continuous, full-width dashboard flow."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={pill}>PDF, JPG, PNG</span>
                  <span className={pill}>Max 10MB</span>
                  <span className={pill}>Secure processing</span>
                </div>
              </div>
            </div>
            {file && (
              <button
                type="button"
                onClick={clearFile}
                className={secondaryButton}
                aria-label={isUrdu ? "منتخب فائل ہٹائیں" : "Remove selected file"}
              >
                <XMarkIcon className="h-4 w-4" />
                {isUrdu ? "فائل صاف کریں" : "Clear file"}
              </button>
            )}
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.6fr,1fr]">
            <div className="space-y-6 border border-[var(--color-border)] bg-[var(--color-card)]/60 px-5 py-6 rounded-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all duration-200 ${
                    isDragOver
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={handleFileInputChange}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    disabled={isLoading}
                    aria-label={isUrdu ? "طبی دستاویز اپ لوڈ کریں" : "Upload medical document"}
                  />

                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 rounded-lg bg-[var(--color-card)]">
                        {isLoading ? (
                          <LoadingSpinner size="lg" />
                        ) : (
                          <CloudArrowUpIcon className="h-10 w-10 text-[var(--color-primary)]" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-[var(--color-heading)]">
                        {isLoading
                          ? isUrdu
                            ? "دستاویز پروسیس ہو رہی ہے..."
                            : "Processing document..."
                          : isUrdu
                            ? "اپنی دستاویز چھوڑیں یا منتخب کریں"
                            : "Drop your document or browse"}
                      </h3>
                      <p className={`${subheading} text-sm`}>
                        {isUrdu
                          ? "اعلیٰ معیار کی اپ لوڈز سے درست صحت میٹرکس اخذ کرنے میں مدد ملتی ہے۔"
                          : "High-quality uploads help us extract accurate health metrics."}
                      </p>
                    </div>

                    {file ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                            {file.type.startsWith("image/") ? (
                              <PhotoIcon className="h-5 w-5" />
                            ) : (
                              <DocumentTextIcon className="h-5 w-5" />
                            )}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-[var(--color-heading)]">
                              {file.name}
                            </p>
                            <p className={`${mutedText} text-xs`}>
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>

                        {imagePreview && (
                          <div className="flex justify-center">
                            <div className="overflow-hidden border border-[var(--color-border)] bg-[var(--color-card)] rounded-xl">
                              <img
                                src={imagePreview}
                                alt={isUrdu ? "منتخب پیش منظر" : "Selected preview"}
                                className="h-48 w-full object-contain"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap justify-center gap-2">
                        <span className={chip}>
                          {isUrdu ? "ایک وقت میں ایک فائل" : "Single file at a time"}
                        </span>
                        <span className={chip}>{isUrdu ? "متن واضح رکھیں" : "Keep text sharp"}</span>
                        <span className={chip}>{isUrdu ? "ذاتی شناختی معلومات شامل نہ کریں" : "No personal IDs"}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className={chip}>AI extraction</span>
                    <span className={chip}>Auto-save to history</span>
                    <span className={chip}>One-step workflow</span>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={secondaryButton}
                      disabled={isLoading}
                    >
                      <PhotoIcon className="h-4 w-4" />
                      {isUrdu ? "فائل منتخب کریں" : "Choose file"}
                    </button>
                    <button
                      type="submit"
                      disabled={!file || isLoading}
                      className={primaryButton}
                      aria-label={isUrdu ? "دستاویز کا تجزیہ کریں" : "Analyze document"}
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="sm" color="white" />
                          {isUrdu ? "تجزیہ جاری ہے..." : "Analyzing..."}
                        </>
                      ) : (
                        <>
                          <ChartBarIcon className="h-4 w-4" />
                          {isUrdu ? "رپورٹ کا تجزیہ کریں" : "Analyze report"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="space-y-6 border border-[var(--color-border)] bg-[var(--color-card)]/60 px-5 py-6 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                  <InformationCircleIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={sectionTitle}>
                    {isUrdu ? "اپ لوڈ رہنمائی" : "Upload guidance"}
                  </h3>
                  <p className={`${subheading} mt-1 text-sm`}>
                    {isUrdu
                      ? "قابلِ اعتماد میٹرکس کے لیے ان تجاویز پر عمل کریں۔"
                      : "Follow these tips to keep the experience open and readable while getting reliable metrics."}
                  </p>
                </div>
              </div>

              <ul className="space-y-3">
                {uploadTips.map((tip) => (
                  <li
                    key={tip}
                    className="flex items-start gap-3 border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 rounded-xl"
                  >
                    <CheckCircleIcon className="mt-0.5 h-5 w-5 text-[var(--color-primary)]" />
                    <p className={`${mutedText} text-sm`}>{tip}</p>
                  </li>
                ))}
              </ul>

              <div className="border-t border-[var(--color-border)] pt-4 space-y-3">
                <h4 className="text-sm font-semibold text-[var(--color-foreground)]">
                  {isUrdu ? "آپ کو حاصل ہوگا" : "You will receive"}
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {quickWins.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 rounded-xl"
                    >
                      <div className="h-9 w-9 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
                        <ChartBarIcon className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-semibold text-[var(--color-heading)]">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {result && (
            <div className="space-y-8 border-t border-[var(--color-border)] pt-8">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                  <CheckCircleIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className={sectionTitle}>Analysis complete</h2>
                  <p className={`${subheading} mt-1 text-sm`}>
                    {isUrdu
                      ? "آپ کی طبی رپورٹ پروسیس ہو گئی ہے۔ اہم نتائج تیار ہیں اور تاریخ میں محفوظ ہو چکے ہیں۔"
                      : "Your medical report has been processed. Key findings are ready and saved to your history."}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={sectionTitle}>
                        {isUrdu ? "صحت میٹرکس" : "Health metrics"}
                      </h3>
                      <p className={`${subheading} text-sm`}>
                        {isUrdu
                          ? "آپ کی رپورٹ سے اخذ شدہ ساختہ اقدار"
                          : "Structured values extracted from your report"}
                      </p>
                    </div>
                    {result.structured_data?.metrics && (
                        <span className={pill}>
                        {result.structured_data.metrics.length}{" "}
                        {isUrdu ? "میٹرکس" : "metrics"}
                      </span>
                    )}
                  </div>

                  {result.structured_data?.metrics &&
                  result.structured_data.metrics.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {result.structured_data.metrics.map((metric, index) => {
                        const statusColors = {
                          normal: "text-[var(--color-success)]",
                          low: "text-[var(--color-warning)]",
                          high: "text-[var(--color-warning)]",
                          critical: "text-[var(--color-danger)]",
                        };
                        const statusBg = {
                          normal: "bg-[var(--color-success)]/10",
                          low: "bg-[var(--color-warning)]/10",
                          high: "bg-[var(--color-warning)]/10",
                          critical: "bg-[var(--color-danger)]/10",
                        };
                        return (
                          <div
                            key={`${metric.name}-${index}`}
                            className="border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-4 rounded-xl"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              {metric.status && (
                                <span
                                  className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${
                                    statusColors[metric.status]
                                  } ${statusBg[metric.status]}`}
                                >
                                  {metric.status}
                                </span>
                              )}
                              {!metric.status && (
                                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-subtle)]">
                                  #{index + 1}
                                </span>
                              )}
                              <div className="h-8 w-8 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
                                <ChartBarIcon className="h-4 w-4" />
                              </div>
                            </div>
                            <h4 className="text-sm font-semibold text-[var(--color-heading)] mb-2">
                              {metric.name}
                            </h4>
                            <div className="flex items-baseline gap-2">
                              <span
                                className={`text-2xl font-bold ${
                                  metric.status && metric.status !== "normal"
                                    ? statusColors[metric.status]
                                    : "text-[var(--color-primary)]"
                                }`}
                              >
                                {metric.value}
                              </span>
                              {metric.unit && (
                                <span className={`${mutedText} text-sm`}>
                                  {metric.unit}
                                </span>
                              )}
                            </div>
                            {metric.reference_range && (
                              <p className={`${mutedText} text-xs mt-1`}>
                                {isUrdu ? "حوالہ:" : "Reference:"} {metric.reference_range}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-6 text-center rounded-xl">
                      <ExclamationCircleIcon className="mx-auto h-10 w-10 text-[var(--color-muted)]" />
                      <h4 className="mt-3 text-base font-semibold text-[var(--color-heading)]">
                        {isUrdu ? "صحت میٹرکس نہیں ملے" : "No health metrics found"}
                      </h4>
                      <p className={`${subheading} mt-1 text-sm`}>
                        {isUrdu
                          ? "ہم اس دستاویز میں ساختہ میٹرکس نہیں ڈھونڈ سکے۔ براہ کرم زیادہ واضح رپورٹ اپ لوڈ کریں۔"
                          : "We could not detect structured metrics in this document. Please upload a clearer report."}
                      </p>
                    </div>
                  )}
                </div>

                {/* Summary section */}
                {result.structured_data?.summary && (
                  <div className="border border-[var(--color-border)] bg-[var(--color-primary-soft)] px-5 py-4 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-[var(--color-primary)]/20 text-[var(--color-primary)]">
                        <InformationCircleIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--color-heading)]">
                          {isUrdu ? "خلاصہ" : "Summary"}
                        </h3>
                        <p className={`${mutedText} mt-1 text-sm`}>
                          {result.structured_data.summary}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Problems detected section */}
                {result.structured_data?.problems_detected &&
                  result.structured_data.problems_detected.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[var(--color-warning)]/10 text-[var(--color-warning)]">
                            <ExclamationTriangleIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className={sectionTitle}>
                              {isUrdu ? "شناخت شدہ خدشات" : "Detected concerns"}
                            </h3>
                            <p className={`${subheading} text-sm`}>
                              {isUrdu
                                ? "آپ کی رپورٹ میں شناخت شدہ صحت کے مسائل"
                                : "Health issues identified in your report"}
                            </p>
                          </div>
                        </div>
                        <span className={pill}>
                          {result.structured_data.problems_detected.length}{" "}
                          {isUrdu ? "مسائل" : "issues"}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {result.structured_data.problems_detected.map(
                          (problem, idx) => {
                            const severityStyles = {
                              mild: {
                                border: "border-[var(--color-success)]/60",
                                bg: "bg-[var(--color-success)]/10",
                                text: "text-[var(--color-success)]",
                              },
                              moderate: {
                                border: "border-[var(--color-warning)]/60",
                                bg: "bg-[var(--color-warning)]/10",
                                text: "text-[var(--color-warning)]",
                              },
                              severe: {
                                border: "border-[var(--color-danger)]/60",
                                bg: "bg-[var(--color-danger)]/10",
                                text: "text-[var(--color-danger)]",
                              },
                            };
                            const style =
                              severityStyles[problem.severity] ||
                              severityStyles.mild;
                            return (
                              <div
                                key={`${problem.type}-${idx}`}
                                className={`border ${style.border} ${style.bg} px-4 py-4 rounded-xl`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <ExclamationTriangleIcon
                                      className={`h-5 w-5 ${style.text}`}
                                    />
                                    <p className="text-sm font-semibold text-[var(--color-heading)]">
                                      {problem.type}
                                    </p>
                                  </div>
                                  <span
                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${style.text} ${style.border} border`}
                                  >
                                    {problem.severity}
                                  </span>
                                </div>
                                <p className={`${mutedText} mt-2 text-sm`}>
                                  {problem.description}
                                </p>
                                <div className="mt-3 flex items-center gap-2 text-xs text-[var(--color-subtle)]">
                                  <span className="font-semibold text-[var(--color-heading)]">
                                    {isUrdu ? "اعتماد" : "Confidence"}
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
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}

                {/* Treatments section */}
                {result.structured_data?.treatments &&
                  result.structured_data.treatments.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                            <HeartIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className={sectionTitle}>
                              {isUrdu ? "تجویز کردہ اقدامات" : "Recommended actions"}
                            </h3>
                            <p className={`${subheading} text-sm`}>
                              {isUrdu
                                ? "تجویز کردہ علاج اور اگلے اقدامات"
                                : "Suggested treatments and next steps"}
                            </p>
                          </div>
                        </div>
                        <span className={pill}>
                          {result.structured_data.treatments.length}{" "}
                          {isUrdu ? "تجاویز" : "suggestions"}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {result.structured_data.treatments
                          .sort((a, b) => {
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
                          .map((treatment, idx) => (
                            <div
                              key={`${treatment.category}-${idx}`}
                              className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 rounded-xl"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <HeartIcon className="h-5 w-5 text-[var(--color-primary)]" />
                                  <p className="text-sm font-semibold text-[var(--color-heading)]">
                                    {treatment.category}
                                  </p>
                                </div>
                                <span className={chip}>
                                  {treatment.priority} · {treatment.timeframe}
                                </span>
                              </div>
                              <p className={`${mutedText} mt-2 text-sm`}>
                                {treatment.recommendation}
                              </p>
                            </div>
                          ))}
                      </div>

                      <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
                        <div className="flex items-start gap-2">
                          <ExclamationTriangleIcon className="h-5 w-5 text-[var(--color-warning)] mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-[var(--color-heading)]">
                              {isUrdu ? "اہم طبی انتباہ" : "Important Medical Disclaimer"}
                            </p>
                            <p className="text-xs text-[var(--color-foreground)] mt-1 leading-relaxed">
                              {isUrdu
                                ? "یہ سفارشات صرف معلوماتی مقاصد کے لیے ہیں اور پیشہ ورانہ طبی مشورے کا متبادل نہیں۔ درست تشخیص اور علاج کے لیے ہمیشہ مستند ڈاکٹر سے رجوع کریں۔"
                                : "These recommendations are for informational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for proper diagnosis and treatment."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                <div className="border border-[var(--color-border)] bg-[var(--color-card)]/70 px-5 py-5 rounded-xl">
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-heading)] rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
                          <DocumentTextIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-heading)]">
                            {isUrdu ? "اخذ شدہ متن" : "Extracted text"}
                          </p>
                          <p className={`${subheading} text-xs`}>
                            {isUrdu ? "آپ کی اپ لوڈ سے مکمل OCR آؤٹ پٹ" : "Full OCR output from your upload"}
                          </p>
                        </div>
                      </div>
                      <span className={`${mutedText} text-xs`}>
                        {isUrdu ? "ویو بدلیں" : "Toggle view"}
                      </span>
                    </summary>
                    <div className="mt-4 border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-4 rounded-lg">
                      <div className="max-h-96 overflow-auto bg-[var(--color-surface)] px-4 py-4 rounded">
                        <pre className="whitespace-pre-wrap text-sm text-[var(--color-foreground)]">
                          {result.raw_text || (isUrdu ? "کوئی متن اخذ نہیں ہوا" : "No text extracted")}
                        </pre>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="border border-[var(--color-danger)] bg-[var(--color-card)]/70 px-5 py-4 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[var(--color-danger)]/10 text-[var(--color-danger)]">
                  <ExclamationCircleIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-heading)]">
                    {isUrdu ? "تجزیہ خرابی" : "Analysis error"}
                  </h3>
                  <p className={`${mutedText} mt-1 text-sm`}>{error}</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function ScanReportPage() {
  return (
    <ErrorBoundary>
      <ScanReportPageContent />
    </ErrorBoundary>
  );
}
