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
  EyeIcon,
  HeartIcon,
  ChartBarIcon,
  XMarkIcon,
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
  problems_detected: Array<{
    type: string;
    severity: "mild" | "moderate" | "severe";
    description: string;
    confidence: number;
  }>;
  treatments: Array<{
    category: string;
    recommendation: string;
    priority: "low" | "medium" | "high";
    timeframe: string;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 px-4 py-10 sm:px-6 lg:px-8 animate-fade-in-up">
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
        <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden mb-8">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-300/10 to-purple-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

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
                  accept="image/jpeg,image/png"
                  onChange={handleFileInputChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isLoading}
                  aria-label="Upload face image"
                />

                <div className="space-y-6">
                  <div className="flex justify-center">
                    {isLoading ? (
                      <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl">
                        <LoadingSpinner size="lg" />
                      </div>
                    ) : (
                      <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl hover:scale-110 transition-transform duration-300 hover:rotate-3">
                        <FaceSmileIcon className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                      </div>
                    )}
                  </div>

                  {file ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Selected Image:
                        </h3>
                        <button
                          type="button"
                          onClick={clearFile}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          aria-label="Remove image"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                        <div className="p-2 bg-purple-500 rounded-lg">
                          <PhotoIcon className="h-5 w-5 text-white" />
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
                          ? "Analyzing Face..."
                          : "Drop your face photo here"}
                      </h3>
                      {!isLoading && (
                        <>
                          <p className="text-gray-600 dark:text-gray-400">
                            or click to browse files
                          </p>
                          <div className="flex flex-wrap justify-center gap-2 text-xs">
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
                  className={`group relative inline-flex items-center gap-3 px-8 py-4 text-base font-semibold text-white transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-2xl overflow-hidden ${
                    !file || isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:scale-105 hover:shadow-xl"
                  }`}
                  aria-label="Analyze face"
                >
                  {/* Button Background Animation */}
                  {!(!file || isLoading) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  )}

                  <div className="relative z-10 flex items-center gap-3">
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" color="white" />
                        <span>Analyzing Face...</span>
                      </>
                    ) : (
                      <>
                        <EyeIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                        <span>Analyze Face</span>
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
                      Face Analysis Complete!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                      Your facial health analysis has been successfully
                      processed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Face Detection Status */}
            <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-gray-100 dark:border-gray-700/50 overflow-hidden">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-300/10 to-blue-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                    <FaceSmileIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    Face Detection Results
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group/card relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5"></div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-400/15 to-blue-500/15 rounded-full blur-xl -translate-y-10 translate-x-10 group-hover/card:scale-125 transition-transform duration-500"></div>

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl group-hover/card:scale-110 transition-transform duration-300">
                          <EyeIcon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3 group-hover/card:text-cyan-600 dark:group-hover/card:text-cyan-400 transition-colors duration-300">
                        Faces Detected
                      </h3>
                      <p className="text-3xl font-bold text-[#037BFC] group-hover/card:text-cyan-600 transition-colors duration-300">
                        {result.faces_count}
                      </p>
                    </div>
                  </div>

                  <div className="group/card relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-green-500/5"></div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/15 to-green-500/15 rounded-full blur-xl -translate-y-10 translate-x-10 group-hover/card:scale-125 transition-transform duration-500"></div>

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-xl group-hover/card:scale-110 transition-transform duration-300">
                          <CheckCircleIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3 group-hover/card:text-emerald-600 dark:group-hover/card:text-emerald-400 transition-colors duration-300">
                        Detection Status
                      </h3>
                      <p
                        className={`text-2xl font-bold ${
                          result.face_detected
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        } group-hover/card:text-emerald-600 transition-colors duration-300`}
                      >
                        {result.face_detected ? "Success" : "No Face Detected"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Annotated Image */}
            {result.annotated_image && (
              <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-300/10 to-indigo-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                      <PhotoIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                      Analyzed Image
                    </h2>
                  </div>

                  <div className="flex justify-center">
                    <div className="relative group/image">
                      <img
                        src={`data:image/jpeg;base64,${result.annotated_image}`}
                        alt="Analyzed face with bounding boxes"
                        className="max-w-full h-auto rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 group-hover/image:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">
                    Green boxes indicate detected faces
                  </p>
                </div>
              </div>
            )}

            {/* Visual Metrics */}
            {result.visual_metrics && result.visual_metrics.length > 0 && (
              <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-300/10 to-orange-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                      <ChartBarIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                      Visual Health Metrics
                    </h2>
                  </div>

                  <div className="space-y-8">
                    {result.visual_metrics.map((metrics, index) => (
                      <div key={index} className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Face {index + 1}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Redness Metric */}
                          <div className="group/metric relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                            {/* Animated Background Elements */}
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-pink-500/5"></div>
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400/15 to-pink-500/15 rounded-full blur-xl -translate-y-10 translate-x-10 group-hover/metric:scale-125 transition-transform duration-500"></div>

                            <div className="relative z-10">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-xl group-hover/metric:scale-110 transition-transform duration-300">
                                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                                  </div>
                                  <span className="font-semibold text-gray-900 dark:text-white group-hover/metric:text-red-600 dark:group-hover/metric:text-red-400 transition-colors duration-300">
                                    Redness Level
                                  </span>
                                </div>
                                <span
                                  className={`text-2xl font-bold ${getMetricColor(
                                    metrics.redness_percentage,
                                    "redness"
                                  )} group-hover/metric:text-red-600 transition-colors duration-300`}
                                >
                                  {metrics.redness_percentage.toFixed(1)}%
                                </span>
                              </div>

                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3">
                                <div
                                  className="bg-gradient-to-r from-red-500 to-pink-500 h-3 rounded-full transition-all duration-1000"
                                  style={{
                                    width: `${Math.min(
                                      metrics.redness_percentage,
                                      100
                                    )}%`,
                                  }}
                                ></div>
                              </div>

                              {metrics.redness_percentage > 15 && (
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                  <p className="text-xs text-amber-700 dark:text-amber-300">
                                    ⚠️ Elevated redness detected - consider
                                    consulting a healthcare provider
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Yellowness Metric */}
                          <div className="group/metric relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                            {/* Animated Background Elements */}
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-amber-500/5"></div>
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400/15 to-amber-500/15 rounded-full blur-xl -translate-y-10 translate-x-10 group-hover/metric:scale-125 transition-transform duration-500"></div>

                            <div className="relative z-10">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-xl group-hover/metric:scale-110 transition-transform duration-300">
                                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                                  </div>
                                  <span className="font-semibold text-gray-900 dark:text-white group-hover/metric:text-yellow-600 dark:group-hover/metric:text-yellow-400 transition-colors duration-300">
                                    Yellowness Level
                                  </span>
                                </div>
                                <span
                                  className={`text-2xl font-bold ${getMetricColor(
                                    metrics.yellowness_percentage,
                                    "yellowness"
                                  )} group-hover/metric:text-yellow-600 transition-colors duration-300`}
                                >
                                  {metrics.yellowness_percentage.toFixed(1)}%
                                </span>
                              </div>

                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3">
                                <div
                                  className="bg-gradient-to-r from-yellow-500 to-amber-500 h-3 rounded-full transition-all duration-1000"
                                  style={{
                                    width: `${Math.min(
                                      metrics.yellowness_percentage,
                                      100
                                    )}%`,
                                  }}
                                ></div>
                              </div>

                              {metrics.yellowness_percentage > 15 && (
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                  <p className="text-xs text-amber-700 dark:text-amber-300">
                                    ⚠️ Elevated yellowness detected - may
                                    indicate jaundice, consult a healthcare
                                    provider
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Problems Detected */}
            {result.problems_detected &&
              result.problems_detected.length > 0 && (
                <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                  {/* Animated Background Elements */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/20 to-orange-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-red-300/10 to-red-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                        <svg
                          className="h-6 w-6 text-red-600 dark:text-red-400"
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
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                        Detected Skin Conditions
                      </h2>
                    </div>

                    <div className="space-y-4">
                      {result.problems_detected.map((problem, index) => (
                        <div
                          key={index}
                          className={`group/problem relative rounded-2xl p-6 border transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${
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
                              <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover/problem:text-gray-700 dark:group-hover/problem:text-gray-200 transition-colors duration-300">
                                {problem.type}
                              </h3>
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
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed group-hover/problem:text-gray-600 dark:group-hover/problem:text-gray-200 transition-colors duration-300">
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
                      ))}
                    </div>
                  </div>
                </div>
              )}

            {/* Treatment Recommendations */}
            {result.treatments && result.treatments.length > 0 && (
              <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-300/10 to-green-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                      <HeartIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                      Treatment Recommendations
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {result.treatments
                      .sort((a, b) => {
                        const priorityOrder = { high: 3, medium: 2, low: 1 };
                        return (
                          priorityOrder[b.priority] - priorityOrder[a.priority]
                        );
                      })
                      .map((treatment, index) => (
                        <div
                          key={index}
                          className={`group/treatment relative rounded-2xl p-6 border transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${
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
                              <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover/treatment:text-gray-700 dark:group-hover/treatment:text-gray-200 transition-colors duration-300">
                                {treatment.category}
                              </h3>
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
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed group-hover/treatment:text-gray-600 dark:group-hover/treatment:text-gray-200 transition-colors duration-300">
                            {treatment.recommendation}
                          </p>
                        </div>
                      ))}
                  </div>

                  {/* Medical Disclaimer */}
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <div className="flex items-start gap-3">
                      <ExclamationCircleIcon className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Important Medical Disclaimer
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          These recommendations are for informational purposes
                          only and should not replace professional medical
                          advice. Always consult with a qualified healthcare
                          provider or dermatologist for proper diagnosis and
                          treatment, especially for severe or persistent
                          symptoms.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* No Face Detected Message */}
            {!result.face_detected && (
              <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 text-center border border-yellow-200 dark:border-yellow-800 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-amber-500/5"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>

                <div className="relative z-10">
                  <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-2xl mx-auto w-fit mb-4">
                    <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    No Face Detected
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Please try uploading a clearer image with a visible face.
                    Make sure the photo is well-lit and the face is clearly
                    visible.
                  </p>
                </div>
              </div>
            )}
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

export default function ScanFacePage() {
  return (
    <ErrorBoundary>
      <ScanFacePageContent />
    </ErrorBoundary>
  );
}
