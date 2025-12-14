"use client";

import { useState, useEffect } from "react";
import {
  generateRiskAssessment,
  analyzeReport,
  analyzeFace,
} from "@/app/actions/scan";
import { getUserAnalyses } from "@/lib/analysis";
import { useSession } from "next-auth/react";
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
import { DocumentTextIcon, PhotoIcon } from "@heroicons/react/24/outline";

interface Analysis {
  id: string;
  type: string;
  createdAt: Date | string;
  structuredData?: any;
  visualMetrics?: any;
  rawData?: any;
}

function RiskAssessmentPageContent() {
  const { data: session } = useSession();
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
      if (!session?.user?.id) {
        setLoadingAnalyses(false);
        return;
      }

      try {
        setLoadingAnalyses(true);
        const [reports, faces] = await Promise.all([
          getUserAnalyses(session.user.id, "report"),
          getUserAnalyses(session.user.id, "face"),
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
  }, [session]);

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
    if (!session?.user?.id) {
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
    if (!session?.user?.id) {
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
      <div className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-white font-poppins">
              Risk Assessment
            </h1>
            <p className="mt-2 text-gray-300">
              Combine your lab report and facial analysis for a comprehensive
              health risk assessment
            </p>
          </div>

          {/* Loading State */}
          <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-gray-400">
                Loading your analyses...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white font-poppins">
            Risk Assessment
          </h1>
          <p className="mt-2 text-gray-300">
            Combine your lab report and facial analysis for a comprehensive
            health risk assessment
          </p>
        </div>

        {/* Selection Form */}
        <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6 mb-6 animate-fade-in-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Analysis Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Report Selection */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Select Report Analysis
                </h3>

                {isUploadingReport ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center py-8">
                      <DocumentTextIcon className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-300">
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
                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-white mb-2">
                      No report analyses found
                    </h4>
                    <p className="text-gray-400 mb-6">
                      Upload a medical report first to generate a risk
                      assessment.
                    </p>
                    <button
                      onClick={() => handleFileSelect("report")}
                      disabled={isUploadingReport || isUploadingFace}
                      className="bg-[#037BFC] hover:bg-[#0260c9] text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Upload Report
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reportAnalyses.map((analysis) => (
                      <label
                        key={analysis.id}
                        className={`block p-3 rounded-md border cursor-pointer transition-colors ${
                          selectedReport === analysis.id
                            ? "border-[#037BFC] bg-[#037BFC]/10"
                            : "border-gray-600 hover:border-gray-500"
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
                            <p className="font-medium text-white">
                              Report Analysis
                            </p>
                            <p className="text-sm text-gray-300">
                              {getAnalysisPreview(analysis)}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {formatAnalysisDate(analysis.createdAt)}
                          </span>
                        </div>
                      </label>
                    ))}
                    <button
                      onClick={() => handleFileSelect("report")}
                      disabled={isUploadingReport || isUploadingFace}
                      className="w-full bg-[#037BFC] hover:bg-[#0260c9] text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-3"
                    >
                      Upload New Report
                    </button>
                  </div>
                )}

                {validationErrors.reportAnalysisId && (
                  <p className="mt-2 text-sm text-red-400">
                    {validationErrors.reportAnalysisId}
                  </p>
                )}
              </div>

              {/* Face Selection */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Select Face Analysis
                </h3>

                {isUploadingFace ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center py-8">
                      <PhotoIcon className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-300">
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
                    <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-white mb-2">
                      No face analyses found
                    </h4>
                    <p className="text-gray-400 mb-6">
                      Upload a photo first to generate a risk assessment.
                    </p>
                    <button
                      onClick={() => handleFileSelect("face")}
                      disabled={isUploadingReport || isUploadingFace}
                      className="bg-[#037BFC] hover:bg-[#0260c9] text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Upload Photo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {faceAnalyses.map((analysis) => (
                      <label
                        key={analysis.id}
                        className={`block p-3 rounded-md border cursor-pointer transition-colors ${
                          selectedFace === analysis.id
                            ? "border-[#037BFC] bg-[#037BFC]/10"
                            : "border-gray-600 hover:border-gray-500"
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
                            <p className="font-medium text-white">
                              Face Analysis
                            </p>
                            <p className="text-sm text-gray-300">
                              {getAnalysisPreview(analysis)}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {formatAnalysisDate(analysis.createdAt)}
                          </span>
                        </div>
                      </label>
                    ))}
                    <button
                      onClick={() => handleFileSelect("face")}
                      disabled={isUploadingReport || isUploadingFace}
                      className="w-full bg-[#037BFC] hover:bg-[#0260c9] text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-3"
                    >
                      Upload New Photo
                    </button>
                  </div>
                )}

                {validationErrors.faceAnalysisId && (
                  <p className="mt-2 text-sm text-red-400">
                    {validationErrors.faceAnalysisId}
                  </p>
                )}
              </div>
            </div>

            {/* User Information Form */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Additional Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
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
                    className={`block w-full rounded-md border-0 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#037BFC] bg-gray-800 sm:text-sm ${
                      validationErrors.age ? "ring-red-400" : "ring-gray-600"
                    }`}
                    placeholder="Enter your age"
                    required
                  />
                  {validationErrors.age && (
                    <p className="mt-1 text-sm text-red-400">
                      {validationErrors.age}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
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
                    className={`block w-full rounded-md border-0 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset focus:ring-[#037BFC] bg-gray-800 sm:text-sm ${
                      validationErrors.gender ? "ring-red-400" : "ring-gray-600"
                    }`}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {validationErrors.gender && (
                    <p className="mt-1 text-sm text-red-400">
                      {validationErrors.gender}
                    </p>
                  )}
                </div>
              </div>

              {/* Symptoms */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Symptoms (optional)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {commonSymptoms.map((symptom) => (
                    <label key={symptom} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={userFormData.symptoms.includes(symptom)}
                        onChange={(e) =>
                          handleSymptomChange(symptom, e.target.checked)
                        }
                        className="rounded border-gray-600 text-[#037BFC] focus:ring-[#037BFC] focus:ring-offset-0 bg-gray-800"
                      />
                      <span className="ml-2 text-sm text-gray-300">
                        {symptom}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Medical History */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">
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
                  rows={3}
                  className="block w-full rounded-md border-0 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#037BFC] bg-gray-800 sm:text-sm"
                  placeholder="Any relevant medical history, chronic conditions, etc."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
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
                className="rounded-md bg-[#037BFC] px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-[#0260c9] focus:outline-none focus:ring-2 focus:ring-[#037BFC] focus:ring-offset-2 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                aria-label="Generate comprehensive risk assessment"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" color="white" className="mr-2" />
                    Generating Assessment...
                  </div>
                ) : isUploadingReport || isUploadingFace ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" color="white" className="mr-2" />
                    Uploading...
                  </div>
                ) : (
                  "Generate Risk Assessment"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Risk Assessment Results */}
        {riskAssessment && (
          <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6 animate-fade-in-up">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-white font-poppins">
                Health Risk Assessment
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push("/dashboard/history")}
                  className="text-sm text-[#037BFC] hover:text-[#0260c9] font-medium"
                >
                  View in History →
                </button>
              </div>
            </div>

            <div className="prose prose-invert max-w-none">
              <div className="bg-gray-800 rounded-md p-4 border border-gray-600">
                <p className="text-white whitespace-pre-wrap leading-relaxed">
                  {riskAssessment}
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-900/20 rounded-md border border-blue-800">
              <p className="text-sm text-blue-200">
                <strong>Disclaimer:</strong> This assessment is generated by AI
                and is for informational purposes only. It should not replace
                professional medical advice, diagnosis, or treatment. Always
                consult with a qualified healthcare provider for medical
                concerns.
              </p>
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
