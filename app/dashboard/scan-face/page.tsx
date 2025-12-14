"use client";

import { useState, useRef, useCallback } from "react";
import { analyzeFace } from "../../actions/scan";
import { validateFile } from "@/lib/validation";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  handleServerActionResponse,
} from "@/lib/toast";
import ErrorBoundary from "../../components/ErrorBoundary";
import FileUploadProgress from "../../components/FileUploadProgress";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import {
  PhotoIcon,
  CloudArrowUpIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  FaceSmileIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface FaceAnalysisResult {
  face_detected: boolean;
  faces_count: number;
  faces: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
  }>;
  visual_metrics: Array<{
    redness_percentage: number;
    yellowness_percentage: number;
  }>;
  annotated_image: string; // Base64 encoded or bytes
}

function ScanFacePageContent() {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FaceAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = (selectedFile: File) => {
    const validation = validateFile(selectedFile, {
      allowedTypes: ["image/jpeg", "image/png"],
      allowedExtensions: [".jpg", ".jpeg", ".png"],
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

    // Create image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.onerror = () => {
      showErrorToast("Failed to read image file");
    };
    reader.readAsDataURL(selectedFile);

    showSuccessToast("Image selected successfully");
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
      showErrorToast("Please select an image to upload");
      return;
    }

    // Re-validate file before submission
    const validation = validateFile(file, {
      allowedTypes: ["image/jpeg", "image/png"],
      allowedExtensions: [".jpg", ".jpeg", ".png"],
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

      const response = await analyzeFace(formData);

      const success = handleServerActionResponse(response, {
        successMessage:
          "Face analysis completed successfully! You can view this in your history.",
        onSuccess: (data) => {
          setResult(data);
        },
        onError: (error) => {
          setError(error.error || "Failed to analyze face");
        },
      });

      if (!success && response.error) {
        setError(response.error);
      }
    } catch (err) {
      console.error("Face analysis error:", err);
      const errorMessage = "An unexpected error occurred during face analysis";
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get metric color based on value
  const getMetricColor = (
    percentage: number,
    type: "redness" | "yellowness"
  ) => {
    if (percentage > 15) {
      return "text-amber-600 dark:text-amber-400"; // Warning color for high values
    }
    return "text-green-600 dark:text-green-400"; // Normal color
  };

  const getMetricBgColor = (
    percentage: number,
    type: "redness" | "yellowness"
  ) => {
    if (percentage > 15) {
      return "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800";
    }
    return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
  };

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
            Facial Health Analysis
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Upload a clear photo of your face to analyze visual health
            indicators
          </p>
        </div>

        {/* Upload Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 animate-fade-in-up">
          <FileUploadProgress
            onFileSelect={handleFileSelect}
            onSubmit={async (selectedFile) => {
              const formData = new FormData();
              formData.append("file", selectedFile);

              const response = await analyzeFace(formData);

              const success = handleServerActionResponse(response, {
                successMessage:
                  "Face analysis completed successfully! You can view this in your history.",
                onSuccess: (data) => {
                  setResult(data);
                },
                onError: (error) => {
                  setError(error.error || "Failed to analyze face");
                },
              });

              if (!success && response.error) {
                setError(response.error);
                throw new Error(response.error);
              }
            }}
            acceptedTypes={["image/jpeg", "image/png"]}
            acceptedExtensions={[".jpg", ".jpeg", ".png"]}
            maxSize={10 * 1024 * 1024}
            uploadType="image"
            isLoading={isLoading}
          />
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-fade-in">
            {/* Face Detection Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaceSmileIcon className="h-6 w-6 text-[#037BFC]" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white font-poppins">
                  Face Detection Results
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Faces Detected
                  </p>
                  <p className="text-2xl font-bold text-[#037BFC]">
                    {result.faces_count}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Detection Status
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      result.face_detected
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {result.face_detected ? "Success" : "No Face Detected"}
                  </p>
                </div>
              </div>
            </div>

            {/* Annotated Image */}
            {result.annotated_image && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white font-poppins mb-4">
                  Analyzed Image
                </h2>
                <div className="flex justify-center">
                  <img
                    src={`data:image/jpeg;base64,${result.annotated_image}`}
                    alt="Analyzed face with bounding boxes"
                    className="max-w-full h-auto rounded-lg shadow-md"
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                  Green boxes indicate detected faces
                </p>
              </div>
            )}

            {/* Visual Metrics */}
            {result.visual_metrics && result.visual_metrics.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white font-poppins mb-4">
                  Visual Health Metrics
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result.visual_metrics.map((metrics, index) => (
                    <div key={index} className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Face {index + 1}
                      </h3>

                      {/* Redness Metric */}
                      <div
                        className={`rounded-lg p-4 border ${getMetricBgColor(
                          metrics.redness_percentage,
                          "redness"
                        )}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              Redness Level
                            </span>
                          </div>
                          <span
                            className={`text-lg font-bold ${getMetricColor(
                              metrics.redness_percentage,
                              "redness"
                            )}`}
                          >
                            {metrics.redness_percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.min(
                                metrics.redness_percentage,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        {metrics.redness_percentage > 15 && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            ⚠️ Elevated redness detected - consider consulting a
                            healthcare provider
                          </p>
                        )}
                      </div>

                      {/* Yellowness Metric */}
                      <div
                        className={`rounded-lg p-4 border ${getMetricBgColor(
                          metrics.yellowness_percentage,
                          "yellowness"
                        )}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              Yellowness Level
                            </span>
                          </div>
                          <span
                            className={`text-lg font-bold ${getMetricColor(
                              metrics.yellowness_percentage,
                              "yellowness"
                            )}`}
                          >
                            {metrics.yellowness_percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.min(
                                metrics.yellowness_percentage,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        {metrics.yellowness_percentage > 15 && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            ⚠️ Elevated yellowness detected - may indicate
                            jaundice, consult a healthcare provider
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Health Disclaimer */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <ExclamationCircleIcon className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Medical Disclaimer
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        This analysis is for informational purposes only and
                        should not replace professional medical advice. Consult
                        with a healthcare provider for proper medical
                        evaluation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* No Face Detected Message */}
            {!result.face_detected && (
              <EmptyState
                icon={
                  <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500" />
                }
                title="No Face Detected"
                description="Please try uploading a clearer image with a visible face. Make sure the photo is well-lit and the face is clearly visible."
                className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6"
              />
            )}
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

export default function ScanFacePage() {
  return (
    <ErrorBoundary>
      <ScanFacePageContent />
    </ErrorBoundary>
  );
}
