"use client";

import { useEffect, useState } from "react";
import {
  generateRiskAssessment,
  analyzeReport,
  analyzeFace,
} from "@/app/actions/scan";
import { getUserAnalyses } from "@/lib/analysis";
import { useUser } from "@clerk/nextjs";
import { validateRiskAssessmentForm } from "@/lib/validation";
import {
  showErrorToast,
  showValidationErrors,
  handleServerActionResponse,
} from "@/lib/toast";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import ProgressBar from "@/app/components/ProgressBar";
import { useRouter } from "next/navigation";
import {
  DocumentTextIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  HeartIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import {
  card,
  chip,
  contentWidth,
  heading,
  interactiveCard,
  mutedText,
  pageContainer,
  pill,
  primaryButton,
  secondaryButton,
  sectionTitle,
  subheading,
} from "@/app/components/dashboardStyles";

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
  createdAt: Date | string;
  structuredData?: StructuredData;
  visualMetrics?: VisualMetric[];
  rawData?: unknown;
}

const commonSymptoms = [
  "Fatigue",
  "Headache",
  "Nausea",
  "Dizziness",
  "Fever",
  "Joint pain",
  "Muscle weakness",
  "Sleep issues",
  "Appetite changes",
];

function RiskAssessmentPageContent() {
  const { user } = useUser();
  const router = useRouter();
  const [reportAnalyses, setReportAnalyses] = useState<Analysis[]>([]);
  const [faceAnalyses, setFaceAnalyses] = useState<Analysis[]>([]);
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [selectedFace, setSelectedFace] = useState<string>("");
  const [userFormData, setUserFormData] = useState({
    age: "",
    gender: "",
    symptoms: [] as string[],
    medicalHistory: "",
    currentMedications: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAnalyses, setLoadingAnalyses] = useState(true);
  const [riskAssessment, setRiskAssessment] = useState<string>("");
  const [analysisId, setAnalysisId] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const [reportFile, setReportFile] = useState<File | null>(null);
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [reportUploadProgress, setReportUploadProgress] = useState(0);
  const [faceUploadProgress, setFaceUploadProgress] = useState(0);
  const [isUploadingReport, setIsUploadingReport] = useState(false);
  const [isUploadingFace, setIsUploadingFace] = useState(false);

  useEffect(() => {
    const loadAnalyses = async () => {
      if (!user?.id) {
        setLoadingAnalyses(false);
        return;
      }

      try {
        setLoadingAnalyses(true);
        const [reports, faces] = await Promise.all([
          getUserAnalyses(user.id, "report"),
          getUserAnalyses(user.id, "face"),
        ]);

        setReportAnalyses(reports);
        setFaceAnalyses(faces);
      } catch (error) {
        console.error("Failed to load analyses:", error);
        showErrorToast(
          "Failed to load your past analyses. Please refresh the page."
        );
      } finally {
        setLoadingAnalyses(false);
      }
    };

    loadAnalyses();
  }, [user]);

  const handleSymptomChange = (symptom: string, checked: boolean) => {
    setUserFormData((prev) => ({
      ...prev,
      symptoms: checked
        ? [...prev.symptoms, symptom]
        : prev.symptoms.filter((s) => s !== symptom),
    }));
  };

  const handleReportUpload = async (file: File) => {
    if (!user?.id) {
      showErrorToast("Please log in to upload files");
      return;
    }

    setReportFile(file);
    setIsUploadingReport(true);
    setReportUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setReportUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append("file", file);
      const result = await analyzeReport(formData);
      clearInterval(progressInterval);
      setReportUploadProgress(100);

      const success = handleServerActionResponse(result, {
        successMessage: "Report uploaded and analyzed successfully!",
        onSuccess: (data) => {
          const newAnalysis: Analysis = {
            id: data.analysisId,
            type: "report",
            createdAt: new Date(),
            structuredData: data.structuredData,
          };
          setReportAnalyses((prev) => [newAnalysis, ...prev]);
          setSelectedReport(data.analysisId);
        },
      });

      if (!success) {
        setReportFile(null);
      }
    } catch (error) {
      console.error("Report upload error:", error);
      showErrorToast("Failed to upload and analyze report");
      setReportFile(null);
    } finally {
      setIsUploadingReport(false);
      setTimeout(() => setReportUploadProgress(0), 800);
    }
  };

  const handleFaceUpload = async (file: File) => {
    if (!user?.id) {
      showErrorToast("Please log in to upload files");
      return;
    }

    setFaceFile(file);
    setIsUploadingFace(true);
    setFaceUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setFaceUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append("file", file);
      const result = await analyzeFace(formData);
      clearInterval(progressInterval);
      setFaceUploadProgress(100);

      const success = handleServerActionResponse(result, {
        successMessage: "Photo uploaded and analyzed successfully!",
        onSuccess: (data) => {
          const newAnalysis: Analysis = {
            id: data.analysisId,
            type: "face",
            createdAt: new Date(),
            visualMetrics: data.visualMetrics,
          };
          setFaceAnalyses((prev) => [newAnalysis, ...prev]);
          setSelectedFace(data.analysisId);
        },
      });

      if (!success) {
        setFaceFile(null);
      }
    } catch (error) {
      console.error("Face upload error:", error);
      showErrorToast("Failed to upload and analyze photo");
      setFaceFile(null);
    } finally {
      setIsUploadingFace(false);
      setTimeout(() => setFaceUploadProgress(0), 800);
    }
  };

  const handleFileSelect = (type: "report" | "face") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept =
      type === "report" ? ".pdf,.jpg,.jpeg,.png" : ".jpg,.jpeg,.png";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (type === "report") {
          handleReportUpload(file);
        } else {
          handleFaceUpload(file);
        }
      }
    };
    input.click();
  };

  const formatAnalysisDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAnalysisPreview = (analysis: Analysis) => {
    if (analysis.type === "report" && analysis.structuredData?.metrics) {
      const metricCount = analysis.structuredData.metrics.length;
      return `${metricCount} health metrics detected`;
    } else if (analysis.type === "face" && analysis.visualMetrics) {
      const metrics = analysis.visualMetrics[0] || {};
      return `Redness: ${metrics.redness_percentage || 0}%, Yellowness: ${
        metrics.yellowness_percentage || 0
      }%`;
    }
    return "Analysis completed";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setValidationErrors({});

    const formValidation = validateRiskAssessmentForm({
      reportAnalysisId: selectedReport,
      faceAnalysisId: selectedFace,
      age: userFormData.age,
      gender: userFormData.gender,
      symptoms: userFormData.symptoms.join(", "),
    });

    if (!formValidation.isValid) {
      setValidationErrors(formValidation.errors);
      showValidationErrors(formValidation.errors);
      return;
    }

    setIsLoading(true);
    setRiskAssessment("");
    setAnalysisId("");

    try {
      const result = await generateRiskAssessment(
        selectedReport,
        selectedFace,
        {
          ...userFormData,
          age: parseInt(userFormData.age),
        }
      );

      const success = handleServerActionResponse(result, {
        successMessage:
          "Risk assessment generated successfully! You can view this in your history.",
        onSuccess: (data) => {
          setRiskAssessment(data.risk_assessment);
          setAnalysisId(result.analysisId || "");
        },
      });

      if (!success && result.error) {
        console.error("Risk assessment error:", result);
      }
    } catch (error) {
      console.error("Risk assessment unexpected error:", error);
      showErrorToast(
        "An unexpected error occurred during risk assessment generation"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingAnalyses) {
    return (
      <div className={pageContainer}>
        <div className={`${contentWidth} space-y-6`}>
          <div className={`${card} p-6 lg:p-7 flex items-center gap-3`}>
            <LoadingSpinner size="lg" />
            <p className={`${mutedText} text-sm`}>
              Loading your report and face analyses...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={pageContainer}>
      <div className={`${contentWidth} space-y-6`}>
        <div className={`${card} p-6 lg:p-7`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                <ExclamationTriangleIcon className="h-7 w-7" />
              </div>
              <div>
                <h1 className={heading}>Risk Assessment</h1>
                <p className={`${subheading} mt-2 text-sm sm:text-base`}>
                  Combine lab reports and facial analysis to generate a
                  comprehensive health risk profile with consistent dashboard
                  styling.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={pill}>Report + Face required</span>
                  <span className={pill}>Save to history</span>
                  <span className={pill}>Adaptive recommendations</span>
                </div>
              </div>
            </div>
            {analysisId && (
              <span className={chip}>Saved ID: {analysisId}</span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Report selection */}
            <div className={`${interactiveCard} p-6 lg:p-7 space-y-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                    <DocumentTextIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className={sectionTitle}>Select report analysis</h3>
                    <p className={`${subheading} text-sm`}>
                      Choose an existing report or upload a new one.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleFileSelect("report")}
                  disabled={isUploadingReport || isUploadingFace || isLoading}
                  className={secondaryButton}
                >
                  <CloudArrowUpIcon className="h-4 w-4" />
                  Upload report
                </button>
              </div>

              {isUploadingReport ? (
                <div className="space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <p className="text-sm font-semibold text-[var(--color-heading)]">
                      Uploading {reportFile?.name}
                    </p>
                  </div>
                  <ProgressBar
                    progress={reportUploadProgress}
                    label="Analyzing report"
                    size="sm"
                  />
                </div>
              ) : reportAnalyses.length === 0 ? (
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
                  <p className="text-sm font-semibold text-[var(--color-heading)]">
                    No report analyses yet
                  </p>
                  <p className={`${subheading} mt-1 text-sm`}>
                    Upload a medical report to begin a risk assessment.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reportAnalyses.map((analysis) => (
                    <label
                      key={analysis.id}
                      className={`flex cursor-pointer items-start justify-between rounded-xl border p-4 transition-all duration-200 ${
                        selectedReport === analysis.id
                          ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                          : "border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-primary)]"
                      }`}
                    >
                      <div className="flex flex-1 items-start gap-3">
                        <input
                          type="radio"
                          name="report"
                          value={analysis.id}
                          checked={selectedReport === analysis.id}
                          onChange={(e) => {
                            setSelectedReport(e.target.value);
                            if (validationErrors.reportAnalysisId) {
                              setValidationErrors((prev) => {
                                const { reportAnalysisId: _reportAnalysisId, ...rest } =
                                  prev;
                                return rest;
                              });
                            }
                          }}
                          className="mt-1 h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                        />
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-heading)]">
                            Report analysis
                          </p>
                          <p className={`${subheading} text-sm`}>
                            {getAnalysisPreview(analysis)}
                          </p>
                        </div>
                      </div>
                      <span className={`${chip} whitespace-nowrap`}>
                        {formatAnalysisDate(analysis.createdAt)}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {validationErrors.reportAnalysisId && (
                <p className="text-sm text-[var(--color-danger)]">
                  {validationErrors.reportAnalysisId}
                </p>
              )}
            </div>

            {/* Face selection */}
            <div className={`${interactiveCard} p-6 lg:p-7 space-y-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                    <PhotoIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className={sectionTitle}>Select face analysis</h3>
                    <p className={`${subheading} text-sm`}>
                      Pair a facial analysis with your report.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleFileSelect("face")}
                  disabled={isUploadingReport || isUploadingFace || isLoading}
                  className={secondaryButton}
                >
                  <CloudArrowUpIcon className="h-4 w-4" />
                  Upload photo
                </button>
              </div>

              {isUploadingFace ? (
                <div className="space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <p className="text-sm font-semibold text-[var(--color-heading)]">
                      Uploading {faceFile?.name}
                    </p>
                  </div>
                  <ProgressBar
                    progress={faceUploadProgress}
                    label="Analyzing photo"
                    size="sm"
                  />
                </div>
              ) : faceAnalyses.length === 0 ? (
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
                  <p className="text-sm font-semibold text-[var(--color-heading)]">
                    No face analyses yet
                  </p>
                  <p className={`${subheading} mt-1 text-sm`}>
                    Upload a clear portrait to generate a risk assessment.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {faceAnalyses.map((analysis) => (
                    <label
                      key={analysis.id}
                      className={`flex cursor-pointer items-start justify-between rounded-xl border p-4 transition-all duration-200 ${
                        selectedFace === analysis.id
                          ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                          : "border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-primary)]"
                      }`}
                    >
                      <div className="flex flex-1 items-start gap-3">
                        <input
                          type="radio"
                          name="face"
                          value={analysis.id}
                          checked={selectedFace === analysis.id}
                          onChange={(e) => {
                            setSelectedFace(e.target.value);
                            if (validationErrors.faceAnalysisId) {
                              setValidationErrors((prev) => {
                                const { faceAnalysisId: _faceAnalysisId, ...rest } =
                                  prev;
                                return rest;
                              });
                            }
                          }}
                          className="mt-1 h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                        />
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-heading)]">
                            Face analysis
                          </p>
                          <p className={`${subheading} text-sm`}>
                            {getAnalysisPreview(analysis)}
                          </p>
                        </div>
                      </div>
                      <span className={`${chip} whitespace-nowrap`}>
                        {formatAnalysisDate(analysis.createdAt)}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {validationErrors.faceAnalysisId && (
                <p className="text-sm text-[var(--color-danger)]">
                  {validationErrors.faceAnalysisId}
                </p>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className={`${card} p-6 lg:p-7 space-y-6`}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                <HeartIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className={sectionTitle}>Additional information</h3>
                <p className={`${subheading} text-sm`}>
                  Provide optional context to refine your assessment.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">
                  Age *
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={userFormData.age}
                  onChange={(e) => {
                    setUserFormData((prev) => ({
                      ...prev,
                      age: e.target.value,
                    }));
                    if (validationErrors.age) {
                      setValidationErrors((prev) => {
                        const { age: _age, ...rest } = prev;
                        return rest;
                      });
                    }
                  }}
                  className={`w-full rounded-xl border px-4 py-3 text-[var(--color-foreground)] placeholder:text-[var(--color-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-card)] border-[var(--color-border)] ${
                    validationErrors.age ? "ring-[var(--color-danger)]" : ""
                  }`}
                  placeholder="Enter your age"
                  required
                />
                {validationErrors.age && (
                  <p className="mt-2 text-sm text-[var(--color-danger)]">
                    {validationErrors.age}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">
                  Gender *
                </label>
                <select
                  value={userFormData.gender}
                  onChange={(e) => {
                    setUserFormData((prev) => ({
                      ...prev,
                      gender: e.target.value,
                    }));
                    if (validationErrors.gender) {
                      setValidationErrors((prev) => {
                        const { gender: _gender, ...rest } = prev;
                        return rest;
                      });
                    }
                  }}
                  className={`w-full rounded-xl border px-4 py-3 text-[var(--color-foreground)] placeholder:text-[var(--color-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-card)] border-[var(--color-border)] ${
                    validationErrors.gender ? "ring-[var(--color-danger)]" : ""
                  }`}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {validationErrors.gender && (
                  <p className="mt-2 text-sm text-[var(--color-danger)]">
                    {validationErrors.gender}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-[var(--color-foreground)]">
                Current symptoms (optional)
              </label>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {commonSymptoms.map((symptom) => (
                  <label
                    key={symptom}
                    className="flex cursor-pointer items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 transition-colors duration-200 hover:border-[var(--color-primary)]"
                  >
                    <input
                      type="checkbox"
                      checked={userFormData.symptoms.includes(symptom)}
                      onChange={(e) =>
                        handleSymptomChange(symptom, e.target.checked)
                      }
                      className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    <span className="ml-3 text-sm font-medium text-[var(--color-foreground)]">
                      {symptom}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[var(--color-foreground)]">
                  Medical history (optional)
                </label>
                <textarea
                  value={userFormData.medicalHistory}
                  onChange={(e) =>
                    setUserFormData((prev) => ({
                      ...prev,
                      medicalHistory: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 text-[var(--color-foreground)] placeholder:text-[var(--color-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="Conditions, surgeries, or ongoing treatments."
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[var(--color-foreground)]">
                  Current medications (optional)
                </label>
                <textarea
                  value={userFormData.currentMedications}
                  onChange={(e) =>
                    setUserFormData((prev) => ({
                      ...prev,
                      currentMedications: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 text-[var(--color-foreground)] placeholder:text-[var(--color-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="List medication names and dosages if relevant."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={
                isLoading ||
                isUploadingReport ||
                isUploadingFace ||
                !selectedReport ||
                !selectedFace ||
                !userFormData.age ||
                !userFormData.gender
              }
              className={primaryButton}
              aria-label="Generate comprehensive risk assessment"
            >
              {isLoading || isUploadingReport || isUploadingFace ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  Processing...
                </>
              ) : (
                <>
                  <ExclamationTriangleIcon className="h-5 w-5" />
                  Generate risk assessment
                </>
              )}
            </button>
          </div>
        </form>

        {riskAssessment && (
          <div className={`${interactiveCard} p-6 lg:p-7`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                  <ChartBarIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className={sectionTitle}>Health risk assessment</h2>
                  <p className={`${subheading} text-sm`}>
                    Generated from your selected analyses and additional
                    details.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => router.push("/dashboard/history")}
                className={secondaryButton}
              >
                View in history
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-foreground)]">
                {riskAssessment}
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-[var(--color-warning)]" />
                <div>
                  <p className="text-sm font-semibold text-[var(--color-heading)]">
                    Important medical disclaimer
                  </p>
                  <p className={`${mutedText} mt-1 text-xs`}>
                    This assessment is generated by AI and is for informational
                    purposes only. It should not replace professional medical
                    advice, diagnosis, or treatment. Always consult with a
                    qualified healthcare provider for medical concerns.
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

export default function RiskAssessmentPage() {
  return (
    <ErrorBoundary>
      <RiskAssessmentPageContent />
    </ErrorBoundary>
  );
}
