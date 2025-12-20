"use client";

import { useState, useEffect } from "react";
import {
  generateRiskAssessment,
  analyzeReport,
  analyzeFace,
} from "@/app/actions/scan";
import { getUserAnalyses } from "@/lib/analysis";
import { useUser } from "@clerk/nextjs";
import { validateRiskAssessmentForm } from "@/lib/validation";
import {
  showSuccessToast,
  showErrorToast,
  showValidationErrors,
  handleServerActionResponse,
} from "@/lib/toast";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import EmptyState from "@/app/components/EmptyState";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import ProgressBar from "@/app/components/ProgressBar";
import { useRouter } from "next/navigation";
import {
  DocumentTextIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  HeartIcon,
  EyeIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";

interface Analysis {
  id: string;
  type: string;
  createdAt: Date | string;
  structuredData?: any;
  visualMetrics?: any;
  rawData?: any;
}

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

  // File upload states
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [reportUploadProgress, setReportUploadProgress] = useState(0);
  const [faceUploadProgress, setFaceUploadProgress] = useState(0);
  const [isUploadingReport, setIsUploadingReport] = useState(false);
  const [isUploadingFace, setIsUploadingFace] = useState(false);

  // Load user's past analyses
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

  // File upload handlers
  const handleReportUpload = async (file: File) => {
    if (!user?.id) {
      showErrorToast("Please log in to upload files");
      return;
    }

    setReportFile(file);
    setIsUploadingReport(true);
    setReportUploadProgress(0);

    try {
      // Simulate progress
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
          // Add the new analysis to the list and select it
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
      setTimeout(() => setReportUploadProgress(0), 1000);
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
      // Simulate progress
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
          // Add the new analysis to the list and select it
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
      setTimeout(() => setFaceUploadProgress(0), 1000);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous validation errors
    setValidationErrors({});

    // Validate form data
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
        onError: (error) => {
          console.error("Risk assessment generation failed:", error);
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

  if (loadingAnalyses) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 px-4 py-10 sm:px-6 lg:px-8 animate-fade-in-up">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
              Risk Assessment
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Combine your lab report and facial analysis for a comprehensive
              health risk assessment
            </p>
          </div>

          {/* Loading State */}
          <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700/50 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">
                  Loading your analyses...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 px-4 py-10 sm:px-6 lg:px-8 animate-fade-in-up">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
            Risk Assessment
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Combine your lab report and facial analysis for a comprehensive
            health risk assessment
          </p>
        </div>

        {/* Selection Form */}
        <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden mb-8">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-300/10 to-amber-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

          <div className="relative z-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Analysis Selection */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Report Selection */}
                <div className="group/report relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                  {/* Animated Background Elements */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5"></div>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/15 to-indigo-500/15 rounded-full blur-xl -translate-y-10 translate-x-10 group-hover/report:scale-125 transition-transform duration-500"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl group-hover/report:scale-110 transition-transform duration-300 group-hover/report:rotate-3">
                        <DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover/report:text-blue-600 dark:group-hover/report:text-blue-400 transition-colors duration-300">
                        Select Report Analysis
                      </h3>
                    </div>

                    {isUploadingReport ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center py-8">
                          <div className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl">
                            <DocumentTextIcon className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Uploading: {reportFile?.name}
                          </p>
                          <ProgressBar
                            progress={reportUploadProgress}
                            label="Analyzing report..."
                            size="sm"
                          />
                        </div>
                      </div>
                    ) : reportAnalyses.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="p-4 bg-gradient-to-br from-gray-500/10 to-slate-500/10 rounded-2xl mx-auto w-fit mb-4">
                          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          No report analyses found
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Upload a medical report first to generate a risk
                          assessment.
                        </p>
                        <button
                          onClick={() => handleFileSelect("report")}
                          disabled={isUploadingReport || isUploadingFace}
                          className="group relative inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CloudArrowUpIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                          Upload Report
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {reportAnalyses.map((analysis) => (
                          <label
                            key={analysis.id}
                            className={`block p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${
                              selectedReport === analysis.id
                                ? "border-[#037BFC] bg-[#037BFC]/10 shadow-lg"
                                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                            }`}
                          >
                            <input
                              type="radio"
                              name="report"
                              value={analysis.id}
                              checked={selectedReport === analysis.id}
                              onChange={(e) => {
                                setSelectedReport(e.target.value);
                                if (validationErrors.reportAnalysisId) {
                                  setValidationErrors((prev) => {
                                    const { reportAnalysisId, ...rest } = prev;
                                    return rest;
                                  });
                                }
                              }}
                              className="sr-only"
                            />
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  Report Analysis
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {getAnalysisPreview(analysis)}
                                </p>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                {formatAnalysisDate(analysis.createdAt)}
                              </span>
                            </div>
                          </label>
                        ))}
                        <button
                          onClick={() => handleFileSelect("report")}
                          disabled={isUploadingReport || isUploadingFace}
                          className="w-full group relative inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-3"
                        >
                          <CloudArrowUpIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                          Upload New Report
                        </button>
                      </div>
                    )}

                    {validationErrors.reportAnalysisId && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-400">
                          {validationErrors.reportAnalysisId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Face Selection */}
                <div className="group/face relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                  {/* Animated Background Elements */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5"></div>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/15 to-pink-500/15 rounded-full blur-xl -translate-y-10 translate-x-10 group-hover/face:scale-125 transition-transform duration-500"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl group-hover/face:scale-110 transition-transform duration-300 group-hover/face:rotate-3">
                        <PhotoIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover/face:text-purple-600 dark:group-hover/face:text-purple-400 transition-colors duration-300">
                        Select Face Analysis
                      </h3>
                    </div>

                    {isUploadingFace ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center py-8">
                          <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl">
                            <PhotoIcon className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Uploading: {faceFile?.name}
                          </p>
                          <ProgressBar
                            progress={faceUploadProgress}
                            label="Analyzing photo..."
                            size="sm"
                          />
                        </div>
                      </div>
                    ) : faceAnalyses.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="p-4 bg-gradient-to-br from-gray-500/10 to-slate-500/10 rounded-2xl mx-auto w-fit mb-4">
                          <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          No face analyses found
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Upload a photo first to generate a risk assessment.
                        </p>
                        <button
                          onClick={() => handleFileSelect("face")}
                          disabled={isUploadingReport || isUploadingFace}
                          className="group relative inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-2xl overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CloudArrowUpIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                          Upload Photo
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {faceAnalyses.map((analysis) => (
                          <label
                            key={analysis.id}
                            className={`block p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${
                              selectedFace === analysis.id
                                ? "border-[#037BFC] bg-[#037BFC]/10 shadow-lg"
                                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                            }`}
                          >
                            <input
                              type="radio"
                              name="face"
                              value={analysis.id}
                              checked={selectedFace === analysis.id}
                              onChange={(e) => {
                                setSelectedFace(e.target.value);
                                if (validationErrors.faceAnalysisId) {
                                  setValidationErrors((prev) => {
                                    const { faceAnalysisId, ...rest } = prev;
                                    return rest;
                                  });
                                }
                              }}
                              className="sr-only"
                            />
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  Face Analysis
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {getAnalysisPreview(analysis)}
                                </p>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                {formatAnalysisDate(analysis.createdAt)}
                              </span>
                            </div>
                          </label>
                        ))}
                        <button
                          onClick={() => handleFileSelect("face")}
                          disabled={isUploadingReport || isUploadingFace}
                          className="w-full group relative inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-xl overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-3"
                        >
                          <CloudArrowUpIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                          Upload New Photo
                        </button>
                      </div>
                    )}

                    {validationErrors.faceAnalysisId && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-400">
                          {validationErrors.faceAnalysisId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* User Information Form */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl">
                    <HeartIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Additional Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
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
                            const { age, ...rest } = prev;
                            return rest;
                          });
                        }
                      }}
                      className={`block w-full rounded-xl border-0 px-4 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#037BFC] bg-white dark:bg-gray-800 sm:text-sm transition-all duration-300 ${
                        validationErrors.age
                          ? "ring-red-400"
                          : "ring-gray-300 dark:ring-gray-600"
                      }`}
                      placeholder="Enter your age"
                      required
                    />
                    {validationErrors.age && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        {validationErrors.age}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
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
                            const { gender, ...rest } = prev;
                            return rest;
                          });
                        }
                      }}
                      className={`block w-full rounded-xl border-0 px-4 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset focus:ring-[#037BFC] bg-white dark:bg-gray-800 sm:text-sm transition-all duration-300 ${
                        validationErrors.gender
                          ? "ring-red-400"
                          : "ring-gray-300 dark:ring-gray-600"
                      }`}
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {validationErrors.gender && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        {validationErrors.gender}
                      </p>
                    )}
                  </div>
                </div>

                {/* Symptoms */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Current Symptoms (optional)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {commonSymptoms.map((symptom) => (
                      <label
                        key={symptom}
                        className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={userFormData.symptoms.includes(symptom)}
                          onChange={(e) =>
                            handleSymptomChange(symptom, e.target.checked)
                          }
                          className="rounded border-gray-300 dark:border-gray-600 text-[#037BFC] focus:ring-[#037BFC] focus:ring-offset-0 bg-white dark:bg-gray-800"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {symptom}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Medical History */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Medical History (optional)
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
                    className="block w-full rounded-xl border-0 px-4 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#037BFC] bg-white dark:bg-gray-800 sm:text-sm transition-all duration-300"
                    placeholder="Any relevant medical history, chronic conditions, etc."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
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
                  className="group relative inline-flex items-center gap-3 px-8 py-4 text-base font-semibold text-white transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-2xl overflow-hidden bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  aria-label="Generate comprehensive risk assessment"
                >
                  {/* Button Background Animation */}
                  {!(
                    isLoading ||
                    isUploadingReport ||
                    isUploadingFace ||
                    !selectedReport ||
                    !selectedFace ||
                    !userFormData.age ||
                    !userFormData.gender
                  ) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  )}

                  <div className="relative z-10 flex items-center gap-3">
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" color="white" />
                        <span>Generating Assessment...</span>
                      </>
                    ) : isUploadingReport || isUploadingFace ? (
                      <>
                        <LoadingSpinner size="sm" color="white" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <ExclamationTriangleIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                        <span>Generate Risk Assessment</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Risk Assessment Results */}
        {riskAssessment && (
          <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in border border-gray-100 dark:border-gray-700/50 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-300/10 to-green-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                    <ChartBarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                    Health Risk Assessment
                  </h2>
                </div>
                <button
                  onClick={() => router.push("/dashboard/history")}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#037BFC] hover:text-[#0260c9] transition-colors duration-300"
                >
                  View in History
                  <svg
                    className="h-4 w-4"
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
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600 mb-6">
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                  {riskAssessment}
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Important Medical Disclaimer
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      This assessment is generated by AI and is for
                      informational purposes only. It should not replace
                      professional medical advice, diagnosis, or treatment.
                      Always consult with a qualified healthcare provider for
                      medical concerns.
                    </p>
                  </div>
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
