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
import FileUploadProgress from "../../components/FileUploadProgress";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
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
    <div className="px-4 py-10 sm:px-6 lg:px-8">
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 animate-fade-in-up">
          <FileUploadProgress
            onFileSelect={handleFileSelect}
            onSubmit={async (selectedFile) => {
              const formData = new FormData();
              formData.append("file", selectedFile);

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
                throw new Error(response.error);
              }
            }}
            acceptedTypes={["image/jpeg", "image/png", "application/pdf"]}
            acceptedExtensions={[".jpg", ".jpeg", ".png", ".pdf"]}
            maxSize={10 * 1024 * 1024}
            uploadType="document"
            isLoading={isLoading}
          />
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-fade-in">
            {/* Raw OCR Text */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white font-poppins mb-4">
                Extracted Text
              </h2>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4 overflow-auto">
                <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                  {result.raw_text || "No text extracted"}
                </pre>
              </div>
            </div>

            {/* Structured Health Metrics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white font-poppins mb-4">
                Health Metrics
              </h2>

              {result.structured_data?.metrics &&
              result.structured_data.metrics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                  {result.structured_data.metrics.map((metric, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                        {metric.name}
                      </h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-[#037BFC]">
                          {metric.value}
                        </span>
                        {metric.unit && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {metric.unit}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={
                    <ExclamationCircleIcon className="h-12 w-12 text-gray-400" />
                  }
                  title="No Health Metrics Found"
                  description="No structured health metrics could be extracted from this report. The document may not contain recognizable lab values or the text quality might be too low."
                />
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 animate-fade-in">
            <div className="flex items-center gap-2">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-red-700 dark:text-red-400 font-medium">
                {error}
              </p>
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
