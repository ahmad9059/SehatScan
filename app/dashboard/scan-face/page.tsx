"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { analyzeFace } from "../../actions/scan";
import { validateFile } from "@/lib/validation";
import {
  showSuccessToast,
  showErrorToast,
  handleServerActionResponse,
} from "@/lib/toast";
import ErrorBoundary from "../../components/ErrorBoundary";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  PhotoIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  FaceSmileIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  ChartBarIcon,
  XMarkIcon,
  SparklesIcon,
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

interface FaceBoundingBox {
  x: number;
  y: number;
  width?: number;
  height?: number;
  w?: number;
  h?: number;
  label?: string;
}

interface FaceAnalysisResult {
  face_detected: boolean;
  faces_count: number;
  faces: FaceBoundingBox[];
  problem_areas?: FaceBoundingBox[];
  image_width?: number;
  image_height?: number;
  visual_metrics: Array<{
    redness_percentage: number;
    yellowness_percentage: number;
    skin_tone_analysis?: string;
    overall_skin_health?: string;
  }>;
  problems_detected: Array<{
    type: string;
    severity: "mild" | "moderate" | "severe";
    description: string;
    confidence: number;
    location?: string;
  }>;
  treatments: Array<{
    category: string;
    recommendation: string;
    priority: "low" | "medium" | "high";
    timeframe: string;
    for_condition?: string;
  }>;
  annotated_image: string;
}

const photoTips = [
  "Face the camera with even lighting and no strong shadows.",
  "Remove glasses or accessories covering the face.",
  "Use a neutral expression for accurate health cues.",
];

const severityStyles = {
  mild: {
    text: "text-[var(--color-success)]",
    border: "border-[var(--color-success)]",
    label: "Mild",
  },
  moderate: {
    text: "text-[var(--color-warning)]",
    border: "border-[var(--color-warning)]",
    label: "Moderate",
  },
  severe: {
    text: "text-[var(--color-danger)]",
    border: "border-[var(--color-danger)]",
    label: "Severe",
  },
};

function ScanFacePageContent() {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FaceAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [annotatedDims, setAnnotatedDims] = useState({
    renderW: 0,
    renderH: 0,
    naturalW: 0,
    naturalH: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const annotatedImageRef = useRef<HTMLImageElement>(null);

  const syncAnnotatedDims = useCallback((img: HTMLImageElement | null) => {
    if (!img) {
      return;
    }

    setAnnotatedDims((prev) => {
      const next = {
        renderW: img.clientWidth,
        renderH: img.clientHeight,
        naturalW: img.naturalWidth,
        naturalH: img.naturalHeight,
      };

      if (
        prev.renderW === next.renderW &&
        prev.renderH === next.renderH &&
        prev.naturalW === next.naturalW &&
        prev.naturalH === next.naturalH
      ) {
        return prev;
      }

      return next;
    });
  }, []);

  useEffect(() => {
    if (!result?.annotated_image) {
      return;
    }

    const handleResize = () => {
      syncAnnotatedDims(annotatedImageRef.current);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    let observer: ResizeObserver | null = null;
    if (annotatedImageRef.current && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(handleResize);
      observer.observe(annotatedImageRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      observer?.disconnect();
    };
  }, [result?.annotated_image, syncAnnotatedDims]);

  const handleFileSelect = (selectedFile: File) => {
    const validation = validateFile(selectedFile, {
      allowedTypes: ["image/jpeg", "image/png"],
      allowedExtensions: [".jpg", ".jpeg", ".png"],
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
    setAnnotatedDims({ renderW: 0, renderH: 0, naturalW: 0, naturalH: 0 });

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
    setAnnotatedDims({ renderW: 0, renderH: 0, naturalW: 0, naturalH: 0 });
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
      showErrorToast("Please select an image to upload");
      return;
    }

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
        onError: (serverError) => {
          setError(serverError.error || "Failed to analyze face");
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

  const visualMetrics = result?.visual_metrics?.[0];

  return (
    <div className={pageContainer}>
      <div className={contentWidth}>
        <section className={`${fullWidthSection} space-y-10`}>
          <div className="flex flex-col gap-4 border-b border-[var(--color-border)] pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                <FaceSmileIcon className="h-7 w-7" />
              </div>
              <div>
                <h1 className={heading}>Facial Health Analysis</h1>
                <p className={`${subheading} mt-2 text-sm sm:text-base`}>
                  Upload a clear portrait to detect visual health indicators in
                  a full-width, continuous dashboard view.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={pill}>JPG or PNG</span>
                  <span className={pill}>Max 10MB</span>
                  <span className={pill}>AI-powered detection</span>
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
                Clear photo
              </button>
            )}
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.6fr,1fr]">
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
                  accept="image/jpeg,image/png"
                  onChange={handleFileInputChange}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  disabled={isLoading}
                  aria-label="Upload face image"
                />

                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 rounded-lg bg-[var(--color-card)]">
                      {isLoading ? (
                        <LoadingSpinner size="lg" />
                      ) : (
                        <PhotoIcon className="h-10 w-10 text-[var(--color-primary)]" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-[var(--color-heading)]">
                      {isLoading ? "Processing photo..." : "Drop your photo"}
                    </h3>
                    <p className={`${subheading} text-sm`}>
                      Keep your face centered with neutral lighting for an
                      accurate read.
                    </p>
                  </div>

                  {file ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                          <FaceSmileIcon className="h-5 w-5" />
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
                              className="h-56 w-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap justify-center gap-2">
                      <span className={chip}>Centered portrait</span>
                      <span className={chip}>Natural light</span>
                      <span className={chip}>No heavy filters</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className={chip}>AI skin cues</span>
                  <span className={chip}>Detection status</span>
                  <span className={chip}>Saved to history</span>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={secondaryButton}
                    disabled={isLoading}
                  >
                    <SparklesIcon className="h-4 w-4" />
                    Choose photo
                  </button>
                  <button
                    type="submit"
                    disabled={!file || isLoading}
                    className={primaryButton}
                    aria-label="Analyze face"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" color="white" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <ChartBarIcon className="h-4 w-4" />
                        Analyze face
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            <div className="space-y-5 border border-[var(--color-border)] bg-[var(--color-card)]/50 px-5 py-6 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                  <HeartIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={sectionTitle}>Capture guidance</h3>
                  <p className={`${subheading} mt-1 text-sm`}>
                    Quick reminders to keep the experience aligned with the open
                    dashboard flow.
                  </p>
                </div>
              </div>

              <ul className="space-y-3">
                {photoTips.map((tip) => (
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
                  Analysis includes
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 rounded-xl">
                    <div className="h-9 w-9 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
                      <FaceSmileIcon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--color-heading)]">
                      Detection & confidence
                    </p>
                  </div>
                  <div className="flex items-center gap-3 border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 rounded-xl">
                    <div className="h-9 w-9 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
                      <ChartBarIcon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--color-heading)]">
                      Visual health cues
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {result && (
            <div className="space-y-8 border-t border-[var(--color-border)] pt-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                    <CheckCircleIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className={sectionTitle}>Analysis complete</h2>
                    <p className={`${subheading} mt-1 text-sm`}>
                      Your facial analysis is ready and saved to history within
                      the continuous dashboard layout.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={pill}>
                    {result.faces_count} face
                    {result.faces_count === 1 ? "" : "s"} detected
                  </span>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                      result.face_detected
                        ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                        : "bg-[var(--color-surface)] text-[var(--color-danger)] border border-[var(--color-danger)]"
                    }`}
                  >
                    {result.face_detected
                      ? "Detection success"
                      : "No face found"}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className={sectionTitle}>Visual metrics</h3>
                      <p className={`${subheading} text-sm`}>
                        Key signals observed from your uploaded image
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className={chip}>Redness</span>
                      <span className={chip}>Yellowness</span>
                    </div>
                  </div>

                  {visualMetrics ? (
                    <div className="space-y-4">
                      {/* Overall Skin Health Indicator */}
                      {visualMetrics.overall_skin_health && (
                        <div className="border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-4 rounded-xl">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-[var(--color-heading)]">
                              Overall Skin Health
                            </h4>
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                                visualMetrics.overall_skin_health === "healthy"
                                  ? "bg-[var(--color-primary-soft)] text-[var(--color-success)]"
                                  : visualMetrics.overall_skin_health === "fair"
                                    ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                                    : visualMetrics.overall_skin_health === "concerning"
                                      ? "bg-[var(--color-surface)] text-[var(--color-warning)]"
                                      : "bg-[var(--color-surface)] text-[var(--color-danger)]"
                              }`}
                            >
                              {visualMetrics.overall_skin_health.charAt(0).toUpperCase() +
                                visualMetrics.overall_skin_health.slice(1).replace("_", " ")}
                            </span>
                          </div>
                          {visualMetrics.skin_tone_analysis && (
                            <p className={`${mutedText} mt-2 text-sm`}>
                              {visualMetrics.skin_tone_analysis}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Redness and Yellowness Metrics */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        {[
                          {
                            label: "Redness percentage",
                            value: visualMetrics.redness_percentage,
                            color: "bg-[var(--color-danger)]",
                          },
                          {
                            label: "Yellowness percentage",
                            value: visualMetrics.yellowness_percentage,
                            color:
                              visualMetrics.yellowness_percentage > 15
                                ? "bg-[var(--color-warning)]"
                                : "bg-[var(--color-success)]",
                          },
                        ].map((metric) => (
                          <div
                            key={metric.label}
                            className="border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-4 rounded-xl"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-[var(--color-heading)]">
                                {metric.label}
                              </h4>
                              <span className={pill}>{metric.value}%</span>
                            </div>
                            <div className="mt-3 h-2 w-full rounded-full bg-[var(--color-surface)]">
                              <div
                                className={`h-2 rounded-full ${metric.color}`}
                                style={{
                                  width: `${Math.min(metric.value, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-6 text-center rounded-xl">
                      <ExclamationCircleIcon className="mx-auto h-10 w-10 text-[var(--color-muted)]" />
                      <h4 className="mt-3 text-base font-semibold text-[var(--color-heading)]">
                        No visual metrics found
                      </h4>
                      <p className={`${subheading} mt-1 text-sm`}>
                        Try another photo with brighter lighting and clearer
                        focus.
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-3 border border-[var(--color-border)] bg-[var(--color-card)]/60 px-5 py-5 rounded-xl">
                    <div className="flex items-center justify-between">
                      <h3 className={sectionTitle}>Detected concerns</h3>
                      <span className={chip}>
                        {result.problems_detected?.length || 0} items
                      </span>
                    </div>

                    {result.problems_detected &&
                    result.problems_detected.length > 0 ? (
                      <div className="space-y-3">
                        {result.problems_detected.map((problem, idx) => {
                          const styles = severityStyles[problem.severity];
                          const isHealthy = problem.type === "Healthy Skin";
                          return (
                            <div
                              key={`${problem.type}-${idx}`}
                              className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 rounded-xl"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {isHealthy ? (
                                    <CheckCircleIcon className="h-5 w-5 text-[var(--color-success)]" />
                                  ) : (
                                    <ExclamationTriangleIcon className="h-5 w-5 text-[var(--color-warning)]" />
                                  )}
                                  <p className="text-sm font-semibold text-[var(--color-heading)]">
                                    {problem.type}
                                  </p>
                                </div>
                                <span
                                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${styles.text} ${styles.border} border`}
                                >
                                  {styles.label}
                                </span>
                              </div>
                              {problem.location && (
                                <p className="mt-1 text-xs text-[var(--color-primary)] font-medium">
                                  Location: {problem.location}
                                </p>
                              )}
                              <p className={`${mutedText} mt-2 text-sm`}>
                                {problem.description}
                              </p>
                              {problem.confidence > 0 && (
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-xs text-[var(--color-muted)]">Confidence:</span>
                                  <div className="flex-1 h-1.5 bg-[var(--color-surface)] rounded-full max-w-[100px]">
                                    <div
                                      className="h-1.5 bg-[var(--color-primary)] rounded-full"
                                      style={{ width: `${Math.round(problem.confidence * 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-[var(--color-muted)]">
                                    {Math.round(problem.confidence * 100)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className={`${mutedText} text-sm`}>
                        No specific concerns detected for this photo.
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 border border-[var(--color-border)] bg-[var(--color-card)]/60 px-5 py-5 rounded-xl">
                    <div className="flex items-center justify-between">
                      <h3 className={sectionTitle}>Recommended actions</h3>
                      <span className={chip}>
                        {result.treatments?.length || 0} suggestions
                      </span>
                    </div>

                    {result.treatments && result.treatments.length > 0 ? (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                        {result.treatments.map((treatment, idx) => {
                          const priorityColors = {
                            high: "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]",
                            medium: "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]",
                            low: "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]",
                          };
                          return (
                            <div
                              key={`${treatment.category}-${idx}`}
                              className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 rounded-xl"
                            >
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                  <HeartIcon className="h-5 w-5 text-[var(--color-primary)]" />
                                  <p className="text-sm font-semibold text-[var(--color-heading)]">
                                    {treatment.category}
                                  </p>
                                </div>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${priorityColors[treatment.priority]}`}>
                                  {treatment.priority.charAt(0).toUpperCase() + treatment.priority.slice(1)} Priority
                                </span>
                              </div>
                              {treatment.for_condition && (
                                <p className="mt-1.5 text-xs text-[var(--color-primary)] font-medium">
                                  For: {treatment.for_condition}
                                </p>
                              )}
                              <p className={`${mutedText} mt-2 text-sm leading-relaxed`}>
                                {treatment.recommendation}
                              </p>
                              <div className="mt-3 flex items-center gap-2 text-xs">
                                <span className="text-[var(--color-muted)]">Timeline:</span>
                                <span className="font-medium text-[var(--color-foreground)]">
                                  {treatment.timeframe}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className={`${mutedText} text-sm`}>
                        Recommendations will appear here after analysis.
                      </p>
                    )}
                  </div>
                </div>

                {result.annotated_image && (
                  <div className="space-y-3 border border-[var(--color-border)] bg-[var(--color-card)]/60 px-5 py-5 rounded-xl">
                    <div className="flex items-center justify-between">
                      <h3 className={sectionTitle}>Annotated image</h3>
                      <div className="flex gap-2">
                        <span className={chip}>AI overlay</span>
                        {result.problem_areas && result.problem_areas.length > 0 && (
                          <span className={chip}>{result.problem_areas.length} areas detected</span>
                        )}
                      </div>
                    </div>
                    <div className="overflow-hidden border border-[var(--color-border)] bg-[var(--color-card)] rounded-lg">
                      <div className="flex justify-center bg-[var(--color-surface)]">
                        <div className="relative">
                          <img
                            ref={annotatedImageRef}
                            src={
                              result.annotated_image.startsWith("data:")
                                ? result.annotated_image
                                : `data:image/png;base64,${result.annotated_image}`
                            }
                            alt="Annotated analysis"
                            className="block h-auto max-h-[70vh] w-auto max-w-full bg-[var(--color-surface)]"
                            onLoad={(e) => {
                              syncAnnotatedDims(e.currentTarget);
                            }}
                          />

                          {/* Face bounding boxes */}
                          {result.faces && result.faces.length > 0 && (
                            <div className="pointer-events-none absolute inset-0">
                              {result.faces.map((face, idx) => {
                                const imgW =
                                  result.image_width ||
                                  annotatedDims.naturalW ||
                                  annotatedDims.renderW ||
                                  1;
                                const imgH =
                                  result.image_height ||
                                  annotatedDims.naturalH ||
                                  annotatedDims.renderH ||
                                  1;
                                const scaleX = annotatedDims.renderW
                                  ? annotatedDims.renderW / imgW
                                  : 1;
                                const scaleY = annotatedDims.renderH
                                  ? annotatedDims.renderH / imgH
                                  : 1;

                                const rawWidth =
                                  face.width ?? face.w ?? Math.round(imgW * 0.45);
                                const rawHeight =
                                  face.height ?? face.h ?? Math.round(imgH * 0.5);
                                const rawX =
                                  face.x ??
                                  Math.max(0, Math.round((imgW - rawWidth) / 2));
                                const rawY =
                                  face.y ??
                                  Math.max(0, Math.round((imgH - rawHeight) / 2.5));

                                const boxStyle: CSSProperties = {
                                  left: rawX * scaleX,
                                  top: rawY * scaleY,
                                  width: rawWidth * scaleX,
                                  height: rawHeight * scaleY,
                                  border: "2px solid var(--color-primary)",
                                  boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
                                  borderRadius: "12px",
                                  position: "absolute",
                                  background:
                                    "linear-gradient(135deg, rgba(76,110,245,0.08), rgba(76,110,245,0.02))",
                                };

                                return (
                                  <div
                                    key={`face-${face.x}-${face.y}-${idx}`}
                                    style={boxStyle}
                                    className="flex items-start"
                                  >
                                    <span className="m-2 rounded-md bg-[var(--color-card)] px-2 py-1 text-[10px] font-semibold text-[var(--color-primary)] shadow-sm">
                                      {face.label || `Face ${idx + 1}`}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Problem area annotations */}
                          {result.problem_areas && result.problem_areas.length > 0 && (
                            <div className="pointer-events-none absolute inset-0">
                              {result.problem_areas.map((area, idx) => {
                                const imgW =
                                  result.image_width ||
                                  annotatedDims.naturalW ||
                                  annotatedDims.renderW ||
                                  1;
                                const imgH =
                                  result.image_height ||
                                  annotatedDims.naturalH ||
                                  annotatedDims.renderH ||
                                  1;
                                const scaleX = annotatedDims.renderW
                                  ? annotatedDims.renderW / imgW
                                  : 1;
                                const scaleY = annotatedDims.renderH
                                  ? annotatedDims.renderH / imgH
                                  : 1;

                                const rawWidth = area.width ?? area.w ?? 50;
                                const rawHeight = area.height ?? area.h ?? 50;
                                const rawX = area.x ?? 0;
                                const rawY = area.y ?? 0;

                                // Get severity color based on corresponding problem
                                const problem = result.problems_detected?.find(
                                  (p) => p.type === area.label
                                );
                                const severity = problem?.severity || "mild";
                                const severityColors = {
                                  mild: {
                                    border: "var(--color-success)",
                                    bg: "rgba(16, 185, 129, 0.15)",
                                    text: "var(--color-success)",
                                  },
                                  moderate: {
                                    border: "var(--color-warning)",
                                    bg: "rgba(245, 158, 11, 0.15)",
                                    text: "var(--color-warning)",
                                  },
                                  severe: {
                                    border: "var(--color-danger)",
                                    bg: "rgba(239, 68, 68, 0.15)",
                                    text: "var(--color-danger)",
                                  },
                                };
                                const colors = severityColors[severity];

                                const boxStyle: CSSProperties = {
                                  left: rawX * scaleX,
                                  top: rawY * scaleY,
                                  width: rawWidth * scaleX,
                                  height: rawHeight * scaleY,
                                  border: `2px solid ${colors.border}`,
                                  boxShadow: `0 0 8px ${colors.bg}`,
                                  borderRadius: "8px",
                                  position: "absolute",
                                  background: colors.bg,
                                };

                                return (
                                  <div
                                    key={`problem-${area.x}-${area.y}-${idx}`}
                                    style={boxStyle}
                                    className="flex items-end justify-center"
                                  >
                                    <span
                                      className="mb-[-20px] rounded-md px-2 py-1 text-[9px] font-semibold shadow-sm whitespace-nowrap"
                                      style={{
                                        backgroundColor: "var(--color-card)",
                                        color: colors.text,
                                        border: `1px solid ${colors.border}`,
                                      }}
                                    >
                                      {area.label || `Area ${idx + 1}`}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Legend for problem areas */}
                    {result.problem_areas && result.problem_areas.length > 0 && (
                      <div className="flex flex-wrap gap-3 pt-2">
                        <span className="text-xs text-[var(--color-muted)]">Legend:</span>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded border-2 border-[var(--color-success)] bg-[rgba(16,185,129,0.15)]" />
                          <span className="text-xs text-[var(--color-muted)]">Mild</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded border-2 border-[var(--color-warning)] bg-[rgba(245,158,11,0.15)]" />
                          <span className="text-xs text-[var(--color-muted)]">Moderate</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded border-2 border-[var(--color-danger)] bg-[rgba(239,68,68,0.15)]" />
                          <span className="text-xs text-[var(--color-muted)]">Severe</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="border border-[var(--color-danger)] bg-[var(--color-card)]/70 px-5 py-4 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[var(--color-surface)] text-[var(--color-danger)]">
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

export default function ScanFacePage() {
  return (
    <ErrorBoundary>
      <ScanFacePageContent />
    </ErrorBoundary>
  );
}
