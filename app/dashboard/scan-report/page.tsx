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

interface AnalysisResult {
  raw_text: string;
  structured_data: {
    metrics: Array<{
      name: string;
      value: string;
      unit?: string;
    }>;
  };
}

const uploadTips = [
  "Use clear, well-lit scans for best accuracy.",
  "Supported files: PDF, JPG, or PNG up to 10MB.",
  "Include complete pages to extract all metrics.",
];

const quickWins = [
  "Automatic metric extraction",
  "Secure upload processing",
  "Save to history instantly",
];

function ScanReportPageContent() {
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

    showSuccessToast("File selected successfully");
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
      showErrorToast("Please select a file to upload");
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
          "Report analyzed successfully! You can view this in your history.",
        onSuccess: (data) => {
          setResult(data);
        },
        onError: (serverError) => {
          setError(serverError.error || "Failed to analyze report");
        },
      });

      if (!success && response.error) {
        setError(response.error);
      }
    } catch (err) {
      console.error("Report analysis error:", err);
      const errorMessage =
        "An unexpected error occurred during report analysis";
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
                <h1 className={heading}>Scan Medical Report</h1>
                <p className={`${subheading} mt-2 text-sm sm:text-base`}>
                  Upload your lab report to extract and analyze health metrics in
                  a continuous, full-width dashboard flow.
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
                aria-label="Remove selected file"
              >
                <XMarkIcon className="h-4 w-4" />
                Clear file
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
                    aria-label="Upload medical document"
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
                          ? "Processing document..."
                          : "Drop your document or browse"}
                      </h3>
                      <p className={`${subheading} text-sm`}>
                        High-quality uploads help us extract accurate health
                        metrics.
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
                                alt="Selected preview"
                                className="h-48 w-full object-contain"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap justify-center gap-2">
                        <span className={chip}>Single file at a time</span>
                        <span className={chip}>Keep text sharp</span>
                        <span className={chip}>No personal IDs</span>
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
                      Choose file
                    </button>
                    <button
                      type="submit"
                      disabled={!file || isLoading}
                      className={primaryButton}
                      aria-label="Analyze document"
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="sm" color="white" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <ChartBarIcon className="h-4 w-4" />
                          Analyze report
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
                  <h3 className={sectionTitle}>Upload guidance</h3>
                  <p className={`${subheading} mt-1 text-sm`}>
                    Follow these tips to keep the experience open and readable
                    while getting reliable metrics.
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
                  You will receive
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
                    Your medical report has been processed. Key findings are
                    ready and saved to your history.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={sectionTitle}>Health metrics</h3>
                      <p className={`${subheading} text-sm`}>
                        Structured values extracted from your report
                      </p>
                    </div>
                    {result.structured_data?.metrics && (
                      <span className={pill}>
                        {result.structured_data.metrics.length} metrics
                      </span>
                    )}
                  </div>

                  {result.structured_data?.metrics &&
                  result.structured_data.metrics.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {result.structured_data.metrics.map((metric, index) => (
                        <div
                          key={`${metric.name}-${index}`}
                          className="border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-4 rounded-xl"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-subtle)]">
                              #{index + 1}
                            </span>
                            <div className="h-8 w-8 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
                              <ChartBarIcon className="h-4 w-4" />
                            </div>
                          </div>
                          <h4 className="text-sm font-semibold text-[var(--color-heading)] mb-2">
                            {metric.name}
                          </h4>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-[var(--color-primary)]">
                              {metric.value}
                            </span>
                            {metric.unit && (
                              <span className={`${mutedText} text-sm`}>
                                {metric.unit}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-6 text-center rounded-xl">
                      <ExclamationCircleIcon className="mx-auto h-10 w-10 text-[var(--color-muted)]" />
                      <h4 className="mt-3 text-base font-semibold text-[var(--color-heading)]">
                        No health metrics found
                      </h4>
                      <p className={`${subheading} mt-1 text-sm`}>
                        We could not detect structured metrics in this document.
                        Please upload a clearer report.
                      </p>
                    </div>
                  )}
                </div>

                <div className="border border-[var(--color-border)] bg-[var(--color-card)]/70 px-5 py-5 rounded-xl">
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-heading)] rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
                          <DocumentTextIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-heading)]">
                            Extracted text
                          </p>
                          <p className={`${subheading} text-xs`}>
                            Full OCR output from your upload
                          </p>
                        </div>
                      </div>
                      <span className={`${mutedText} text-xs`}>Toggle view</span>
                    </summary>
                    <div className="mt-4 border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-4 rounded-lg">
                      <div className="max-h-96 overflow-auto bg-[var(--color-surface)] px-4 py-4 rounded">
                        <pre className="whitespace-pre-wrap text-sm text-[var(--color-foreground)]">
                          {result.raw_text || "No text extracted"}
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
                    Analysis error
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
