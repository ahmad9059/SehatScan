"use client";

import { useState, useRef, useCallback } from "react";
import { analyzeReport } from "../../actions/scan";
import { validateFile } from "@/lib/validation";
import {
  showSuccessToast,
  showErrorToast,
  handleServerActionResponse,
} from "@/lib/toast";
import ErrorBoundary from "../../components/ErrorBoundary";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  HeartIcon,
  ChartBarIcon,
  EyeIcon,
  XMarkIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

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

function ScanReportPageContent() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = (selectedFile: File) => {
    const validation = validateFile(selectedFile, {
      allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
      allowedExtensions: [".jpg", ".jpeg", ".png", ".pdf"],
      maxSize: 10 * 1024 * 1024, // 10MB
    });

    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors)[0];
      showErrorToast(errorMessage);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResult(null);

    // Create image preview for image uploads
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

  // Drag and drop handlers
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

  // File input change handler
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

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      showErrorToast("Please select a file to upload");
      return;
    }

    // Re-validate file before submission
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
        onError: (error) => {
          setError(error.error || "Failed to analyze report");
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
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-10 sm:px-6 lg:px-8 animate-fade-in-up">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
            Scan Medical Report
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Upload your lab report to extract and analyze health metrics
          </p>
        </div>

        {/* Upload Form */}
        <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden mb-8">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-300/10 to-blue-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

          <div className="relative z-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Drag and Drop Area */}
              <div
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  isDragOver
                    ? "border-[#037BFC] bg-[#037BFC]/5 dark:bg-[#037BFC]/10 scale-105"
                    : "border-gray-300 dark:border-gray-600 hover:border-[#037BFC] hover:bg-gray-50 dark:hover:bg-gray-700/50"
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
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isLoading}
                  aria-label="Upload document"
                />

                <div className="space-y-6">
                  <div className="flex justify-center">
                    {isLoading ? (
                      <div className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl">
                        <LoadingSpinner size="lg" />
                      </div>
                    ) : (
                      <div className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl hover:scale-110 transition-transform duration-300 hover:rotate-3">
                        <CloudArrowUpIcon className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                  </div>

                  {file ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Selected File:
                        </h3>
                        <button
                          type="button"
                          onClick={clearFile}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          aria-label="Remove file"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          {file.type.startsWith("image/") ? (
                            <PhotoIcon className="h-5 w-5 text-white" />
                          ) : (
                            <DocumentTextIcon className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>

                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="flex justify-center">
                          <div className="relative group">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="max-w-xs max-h-48 rounded-xl shadow-lg object-cover border-2 border-gray-200 dark:border-gray-700 group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {isLoading
                          ? "Processing Document..."
                          : "Drop your document here"}
                      </h3>
                      {!isLoading && (
                        <>
                          <p className="text-gray-600 dark:text-gray-400">
                            or click to browse files
                          </p>
                          <div className="flex flex-wrap justify-center gap-2 text-xs">
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                              PDF
                            </span>
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                              JPG
                            </span>
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                              PNG
                            </span>
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                              Max 10MB
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={!file || isLoading}
                  className={`group relative inline-flex items-center gap-3 px-8 py-4 text-base font-semibold text-white transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-2xl overflow-hidden ${
                    !file || isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:scale-105 hover:shadow-xl"
                  }`}
                  aria-label="Analyze document"
                >
                  {/* Button Background Animation */}
                  {!(!file || isLoading) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  )}

                  <div className="relative z-10 flex items-center gap-3">
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" color="white" />
                        <span>Analyzing Document...</span>
                      </>
                    ) : (
                      <>
                        <ChartBarIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                        <span>Analyze Document</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-8 animate-fade-in">
            {/* Success Message */}
            <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-gray-100 dark:border-gray-700/50 overflow-hidden">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-300/10 to-green-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                    <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                      Analysis Complete!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                      Your medical report has been successfully processed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Structured Health Metrics */}
            <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-gray-100 dark:border-gray-700/50 overflow-hidden">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-300/10 to-blue-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                    <HeartIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    Health Metrics
                  </h2>
                </div>

                {result.structured_data?.metrics &&
                result.structured_data.metrics.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {result.structured_data.metrics.map((metric, index) => (
                      <div
                        key={index}
                        className="group/card relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 dark:border-gray-700/50 overflow-hidden"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        {/* Animated Background Elements */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5"></div>
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/15 to-pink-500/15 rounded-full blur-xl -translate-y-10 translate-x-10 group-hover/card:scale-125 transition-transform duration-500"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-300/8 to-purple-500/8 rounded-full blur-lg translate-y-8 -translate-x-8 group-hover/card:scale-110 transition-transform duration-500"></div>

                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl group-hover/card:scale-110 transition-transform duration-300 group-hover/card:rotate-3">
                              <ChartBarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                              #{index + 1}
                            </span>
                          </div>

                          <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3 group-hover/card:text-purple-600 dark:group-hover/card:text-purple-400 transition-colors duration-300">
                            {metric.name}
                          </h3>

                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-[#037BFC] group-hover/card:text-purple-600 transition-colors duration-300">
                              {metric.value}
                            </span>
                            {metric.unit && (
                              <span className="text-sm text-gray-500 dark:text-gray-400 group-hover/card:text-gray-600 dark:group-hover/card:text-gray-300 transition-colors duration-300">
                                {metric.unit}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gradient-to-br from-gray-500/10 to-slate-500/10 rounded-2xl mx-auto w-fit mb-4">
                      <ExclamationCircleIcon className="h-12 w-12 text-gray-400 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Health Metrics Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      No structured health metrics could be extracted from this
                      report. The document may not contain recognizable lab
                      values or the text quality might be too low.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Raw OCR Text */}
            <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-100 dark:border-gray-700/50 overflow-hidden">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 via-transparent to-slate-500/5"></div>

              <details className="group/details">
                <summary className="cursor-pointer p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600/50 dark:hover:to-gray-500/50 transition-colors relative z-10 list-none [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-slate-500/10 to-gray-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                      <DocumentTextIcon className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors duration-300">
                        Extracted Text
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        View the raw text extracted from your document
                      </p>
                    </div>
                    <svg
                      className="w-6 h-6 transition-transform group-open/details:rotate-90 text-gray-600 dark:text-gray-400"
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
                    <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full">
                      Advanced
                    </span>
                  </div>
                </summary>
                <div className="p-6 bg-gray-900 dark:bg-gray-950 relative z-10">
                  <div className="bg-black rounded-xl p-6 overflow-hidden">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-gray-400 text-xs font-mono">
                        extracted_text.txt
                      </span>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-auto">
                      <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap leading-relaxed">
                        {result.raw_text || "No text extracted"}
                      </pre>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-red-200 dark:border-red-800 overflow-hidden animate-fade-in">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-pink-500/5"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/20 to-pink-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-red-300/10 to-red-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                  <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-700 dark:text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors duration-300">
                    Analysis Error
                  </h3>
                  <p className="text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors duration-300">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
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
