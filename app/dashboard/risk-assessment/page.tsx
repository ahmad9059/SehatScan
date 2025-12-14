"use client";

import { useState, useEffect } from "react";
import { generateRiskAssessment } from "@/app/actions/scan";
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
              Risk Assessment
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Combine your lab report and facial analysis for a comprehensive
              health risk assessment
            </p>
          </div>

          {/* Loading State */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">
                Loading your analyses...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
            Risk Assessment
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Combine your lab report and facial analysis for a comprehensive
            health risk assessment
          </p>
        </div>

        {/* Selection Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 animate-fade-in-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Analysis Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Report Selection */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-3 ${
                    validationErrors.reportAnalysisId
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  Select Report Analysis{" "}
                  {validationErrors.reportAnalysisId && "*"}
                </label>
                {validationErrors.reportAnalysisId && (
                  <p className="mb-2 text-sm text-red-600 dark:text-red-400">
                    {validationErrors.reportAnalysisId}
                  </p>
                )}
                {reportAnalyses.length === 0 ? (
                  <EmptyState
                    icon={
                      <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                    }
                    title="No report analyses found"
                    description="Upload a medical report first to generate a risk assessment."
                    action={{
                      label: "Upload Report",
                      onClick: () => router.push("/dashboard/scan-report"),
                    }}
                    className="py-8"
                  />
                ) : (
                  <div className="space-y-2">
                    {reportAnalyses.map((analysis) => (
                      <label
                        key={analysis.id}
                        className={`block p-3 rounded-md border cursor-pointer transition-colors ${
                          selectedReport === analysis.id
                            ? "border-[#037BFC] bg-[#037BFC]/5 dark:bg-[#037BFC]/10"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <input
                          type="radio"
                          name="report"
                          value={analysis.id}
                          checked={selectedReport === analysis.id}
                          onChange={(e) => {
                            setSelectedReport(e.target.value);
                            // Clear validation error when user makes selection
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
                            <p className="font-medium text-gray-900 dark:text-white">
                              Report Analysis
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {getAnalysisPreview(analysis)}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatAnalysisDate(analysis.createdAt)}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Face Selection */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-3 ${
                    validationErrors.faceAnalysisId
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  Select Face Analysis {validationErrors.faceAnalysisId && "*"}
                </label>
                {validationErrors.faceAnalysisId && (
                  <p className="mb-2 text-sm text-red-600 dark:text-red-400">
                    {validationErrors.faceAnalysisId}
                  </p>
                )}
                {faceAnalyses.length === 0 ? (
                  <EmptyState
                    icon={<PhotoIcon className="h-8 w-8 text-gray-400" />}
                    title="No face analyses found"
                    description="Upload a photo first to generate a risk assessment."
                    action={{
                      label: "Upload Photo",
                      onClick: () => router.push("/dashboard/scan-face"),
                    }}
                    className="py-8"
                  />
                ) : (
                  <div className="space-y-2">
                    {faceAnalyses.map((analysis) => (
                      <label
                        key={analysis.id}
                        className={`block p-3 rounded-md border cursor-pointer transition-colors ${
                          selectedFace === analysis.id
                            ? "border-[#037BFC] bg-[#037BFC]/5 dark:bg-[#037BFC]/10"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <input
                          type="radio"
                          name="face"
                          value={analysis.id}
                          checked={selectedFace === analysis.id}
                          onChange={(e) => {
                            setSelectedFace(e.target.value);
                            // Clear validation error when user makes selection
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
                            <p className="font-medium text-gray-900 dark:text-white">
                              Face Analysis
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {getAnalysisPreview(analysis)}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatAnalysisDate(analysis.createdAt)}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* User Information Form */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Additional Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                      // Clear validation error when user starts typing
                      if (validationErrors.age) {
                        setValidationErrors((prev) => {
                          const { age, ...rest } = prev;
                          return rest;
                        });
                      }
                    }}
                    className={`block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#037BFC] bg-white dark:bg-gray-800 sm:text-sm ${
                      validationErrors.age
                        ? "ring-red-500 dark:ring-red-400"
                        : "ring-gray-300 dark:ring-gray-700"
                    }`}
                    placeholder="Enter your age"
                    required
                  />
                  {validationErrors.age && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {validationErrors.age}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gender *
                  </label>
                  <select
                    value={userFormData.gender}
                    onChange={(e) => {
                      setUserFormData((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }));
                      // Clear validation error when user makes selection
                      if (validationErrors.gender) {
                        setValidationErrors((prev) => {
                          const { gender, ...rest } = prev;
                          return rest;
                        });
                      }
                    }}
                    className={`block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset focus:ring-[#037BFC] bg-white dark:bg-gray-800 sm:text-sm ${
                      validationErrors.gender
                        ? "ring-red-500 dark:ring-red-400"
                        : "ring-gray-300 dark:ring-gray-700"
                    }`}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {validationErrors.gender && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {validationErrors.gender}
                    </p>
                  )}
                </div>
              </div>

              {/* Symptoms */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                        className="rounded border-gray-300 dark:border-gray-700 text-[#037BFC] focus:ring-[#037BFC] focus:ring-offset-0"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {symptom}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Medical History */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#037BFC] bg-white dark:bg-gray-800 sm:text-sm"
                  placeholder="Any relevant medical history, chronic conditions, etc."
                />
              </div>

              {/* Current Medications */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Medications (optional)
                </label>
                <textarea
                  value={userFormData.currentMedications}
                  onChange={(e) =>
                    setUserFormData((prev) => ({
                      ...prev,
                      currentMedications: e.target.value,
                    }))
                  }
                  rows={2}
                  className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#037BFC] bg-white dark:bg-gray-800 sm:text-sm"
                  placeholder="List any medications you're currently taking"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={
                  isLoading ||
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
                ) : (
                  "Generate Risk Assessment"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Risk Assessment Results */}
        {riskAssessment && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-fade-in-up">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white font-poppins">
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

            <div className="prose dark:prose-invert max-w-none">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                  {riskAssessment}
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
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
