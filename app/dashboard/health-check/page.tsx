"use client";

import { useEffect, useState, useRef } from "react";
import {
  generateRiskAssessment,
  analyzeReport,
  analyzeFace,
} from "@/app/actions/scan";
import { useUser } from "@clerk/nextjs";
import { validateRiskAssessmentForm } from "@/lib/validation";
import {
  showErrorToast,
  showValidationErrors,
  handleServerActionResponse,
} from "@/lib/toast";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import LogoSpinner from "@/app/components/LogoSpinner";
import ProgressBar from "@/app/components/ProgressBar";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
  DocumentTextIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  HeartIcon,
  CloudArrowUpIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
import { useSimpleLanguage } from "@/app/components/SimpleLanguageContext";

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
  structuredData?: StructuredData | null;
  visualMetrics?: VisualMetric[] | null;
  rawData?: unknown;
}

function RiskAssessmentPageContent() {
  const { language } = useSimpleLanguage();
  const isUrdu = language === "ur";
  const commonSymptoms = isUrdu
    ? [
        "مہاسوں میں اضافہ",
        "مسلسل سرخی",
        "خارش",
        "خشک یا چھلکے دار جلد",
        "چکنی جلد",
        "جلن یا چبھن",
        "سیاہ دھبے",
        "خارش دانے",
        "جلد اترنا",
      ]
    : [
        "Acne flare-ups",
        "Persistent redness",
        "Itching",
        "Dry or flaky skin",
        "Oily skin",
        "Burning or stinging",
        "Dark spots",
        "Rash",
        "Skin peeling",
      ];
  const { user } = useUser();
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);
  const sourceMenuRef = useRef<HTMLDivElement>(null);
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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [reportFile, setReportFile] = useState<File | null>(null);
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [reportUploadProgress, setReportUploadProgress] = useState(0);
  const [faceUploadProgress, setFaceUploadProgress] = useState(0);
  const [isUploadingReport, setIsUploadingReport] = useState(false);
  const [isUploadingFace, setIsUploadingFace] = useState(false);
  const [includeReport, setIncludeReport] = useState(false);
  const [includeFace, setIncludeFace] = useState(false);
  const [sourceMenuOpen, setSourceMenuOpen] = useState(false);

  useEffect(() => {
    const loadAnalyses = async () => {
      if (!user?.id) {
        setLoadingAnalyses(false);
        return;
      }

      const fetchAnalyses = async (type: "report" | "face") => {
        const params = new URLSearchParams({
          page: "1",
          limit: "100",
          type,
        });

        const res = await fetch(`/api/analyses?${params.toString()}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch ${type} analyses`);
        }
        const data = await res.json();
        if (!Array.isArray(data?.analyses)) {
          throw new Error(data?.error || `Failed to fetch ${type} analyses`);
        }
        return data.analyses as Analysis[];
      };

      try {
        setLoadingAnalyses(true);
        const [reports, faces] = await Promise.all([
          fetchAnalyses("report"),
          fetchAnalyses("face"),
        ]);

        setReportAnalyses(reports);
        setFaceAnalyses(faces);
      } catch (error) {
        console.error("Failed to load analyses:", error);
        showErrorToast(
          isUrdu
            ? "پچھلے تجزیے لوڈ کرنے میں ناکامی۔ براہ کرم صفحہ ریفریش کریں۔"
            : "Failed to load your past analyses. Please refresh the page."
        );
      } finally {
        setLoadingAnalyses(false);
      }
    };

    loadAnalyses();
  }, [isUrdu, user]);

  // Close source menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sourceMenuRef.current &&
        !sourceMenuRef.current.contains(event.target as Node)
      ) {
        setSourceMenuOpen(false);
      }
    }

    if (sourceMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [sourceMenuOpen]);

  // No auto-selection; user may optionally pick from dropdowns

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
      showErrorToast(
        isUrdu ? "فائل اپ لوڈ کرنے کے لیے لاگ ان کریں" : "Please log in to upload files"
      );
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
        successMessage: isUrdu
          ? "رپورٹ کامیابی سے اپ لوڈ اور تجزیہ ہو گئی!"
          : "Report uploaded and analyzed successfully!",
        onSuccess: (data) => {
          const newAnalysis: Analysis = {
            id: data.analysisId,
            type: "report",
            createdAt: new Date(),
            structuredData: data.data?.structured_data || data.structuredData,
          };
          setReportAnalyses((prev) => [newAnalysis, ...prev]);
          setSelectedReport(data.analysisId);
          setIncludeReport(true);
        },
      });

      if (!success) {
        setReportFile(null);
      }
    } catch (error) {
      console.error("Report upload error:", error);
      showErrorToast(
        isUrdu
          ? "رپورٹ اپ لوڈ اور تجزیہ کرنے میں ناکامی"
          : "Failed to upload and analyze report"
      );
      setReportFile(null);
    } finally {
      setIsUploadingReport(false);
      setTimeout(() => setReportUploadProgress(0), 800);
    }
  };

  const handleFaceUpload = async (file: File) => {
    if (!user?.id) {
      showErrorToast(
        isUrdu ? "فائل اپ لوڈ کرنے کے لیے لاگ ان کریں" : "Please log in to upload files"
      );
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
        successMessage: isUrdu
          ? "تصویر کامیابی سے اپ لوڈ اور تجزیہ ہو گئی!"
          : "Photo uploaded and analyzed successfully!",
        onSuccess: (data) => {
          const newAnalysis: Analysis = {
            id: data.analysisId,
            type: "face",
            createdAt: new Date(),
            visualMetrics: data.data?.visual_metrics || data.visualMetrics,
          };
          setFaceAnalyses((prev) => [newAnalysis, ...prev]);
          setSelectedFace(data.analysisId);
          setIncludeFace(true);
        },
      });

      if (!success) {
        setFaceFile(null);
      }
    } catch (error) {
      console.error("Face upload error:", error);
      showErrorToast(
        isUrdu
          ? "تصویر اپ لوڈ اور تجزیہ کرنے میں ناکامی"
          : "Failed to upload and analyze photo"
      );
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
    return dateObj.toLocaleDateString(isUrdu ? "ur-PK" : "en-US", {
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
      return isUrdu
        ? `${metricCount} رپورٹ میٹرکس اخذ کیے گئے`
        : `${metricCount} report metrics extracted`;
    } else if (analysis.type === "face" && analysis.visualMetrics) {
      const metrics = analysis.visualMetrics[0] || {};
      return isUrdu
        ? `سرخی: ${metrics.redness_percentage || 0}٪، زردی: ${
            metrics.yellowness_percentage || 0
          }٪`
        : `Redness: ${metrics.redness_percentage || 0}%, Yellowness: ${
            metrics.yellowness_percentage || 0
          }%`;
    }
    return isUrdu ? "تجزیہ مکمل" : "Analysis completed";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setValidationErrors({});

    const formValidation = validateRiskAssessmentForm({
      reportAnalysisId: includeReport ? selectedReport : "",
      faceAnalysisId: includeFace ? selectedFace : "",
      age: userFormData.age,
      gender: userFormData.gender,
      symptoms: userFormData.symptoms.join(", "),
      includeReport,
      includeFace,
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
        includeReport ? selectedReport : "",
        includeFace ? selectedFace : "",
        {
          ...userFormData,
          age: parseInt(userFormData.age),
        }
      );

      const success = handleServerActionResponse(result, {
        successMessage:
          isUrdu
            ? "جلدی صحت جانچ کامیابی سے تیار ہو گئی! آپ اسے تاریخ میں دیکھ سکتے ہیں۔"
            : "Dermatology health check generated successfully! You can view this in your history.",
        onSuccess: (data) => {
          setRiskAssessment(data.risk_assessment);
          setAnalysisId(result.analysisId || "");
        },
      });

      if (!success && result.error) {
        console.error("Risk assessment error:", result.error, result);
      } else if (!success) {
        console.error("Risk assessment failed with unknown error:", result);
      }
    } catch (error) {
      console.error("Risk assessment unexpected error:", error);
      showErrorToast(
        isUrdu
          ? "جلدی صحت جانچ تیار کرتے وقت غیر متوقع خرابی پیش آئی"
          : "An unexpected error occurred during dermatology health check generation"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current || !riskAssessment) return;

    setIsGeneratingPdf(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        scale: 2, // Higher quality
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const headerHeight = 35; // Space for title and date
      const footerHeight = 20; // Space for disclaimer
      const availableHeight = pdfHeight - headerHeight - footerHeight;

      // Calculate scaled dimensions for the content
      const contentWidth = pdfWidth - margin * 2;
      const scaledHeight = (canvas.height * contentWidth) / canvas.width;

      // Add title
      pdf.setFontSize(18);
      pdf.setTextColor(33, 33, 33);
      pdf.text("Dermatology Health Check Report", pdfWidth / 2, 15, {
        align: "center",
      });

      // Add date
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        `Generated on: ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        pdfWidth / 2,
        22,
        { align: "center" }
      );

      // Handle multi-page content
      if (scaledHeight <= availableHeight) {
        // Single page - content fits
        pdf.addImage(imgData, "PNG", margin, headerHeight, contentWidth, scaledHeight);

        // Add disclaimer at the bottom
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          "Disclaimer: This dermatology assessment is AI-generated for informational purposes only. Consult a dermatologist for diagnosis and treatment.",
          pdfWidth / 2,
          pdfHeight - 10,
          { align: "center", maxWidth: pdfWidth - 20 }
        );
      } else {
        // Multi-page - content needs to be split
        const pageContentHeight = availableHeight;
        const totalPages = Math.ceil(scaledHeight / pageContentHeight);

        for (let page = 0; page < totalPages; page++) {
          if (page > 0) {
            pdf.addPage();
            // Add page number header for subsequent pages
            pdf.setFontSize(10);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`Dermatology Health Check - Page ${page + 1} of ${totalPages}`, pdfWidth / 2, 15, {
              align: "center",
            });
          }

          // Calculate the source and destination coordinates for this page slice
          const sourceY = page * (canvas.height * pageContentHeight / scaledHeight);
          const sourceHeight = Math.min(
            canvas.height * pageContentHeight / scaledHeight,
            canvas.height - sourceY
          );

          // Create a temporary canvas for this page slice
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = canvas.width;
          tempCanvas.height = sourceHeight;
          const ctx = tempCanvas.getContext("2d");

          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            ctx.drawImage(
              canvas,
              0, sourceY, canvas.width, sourceHeight,
              0, 0, canvas.width, sourceHeight
            );

            const pageImgData = tempCanvas.toDataURL("image/png");
            const destHeight = (sourceHeight * contentWidth) / canvas.width;
            const yPosition = page === 0 ? headerHeight : 20;

            pdf.addImage(pageImgData, "PNG", margin, yPosition, contentWidth, destHeight);
          }

          // Add disclaimer on last page
          if (page === totalPages - 1) {
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text(
              "Disclaimer: This dermatology assessment is AI-generated for informational purposes only. Consult a dermatologist for diagnosis and treatment.",
              pdfWidth / 2,
              pdfHeight - 10,
              { align: "center", maxWidth: pdfWidth - 20 }
            );
          }
        }
      }

      pdf.save(
        `dermatology-health-check-${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (error) {
      console.error("PDF generation error:", error);
      showErrorToast(
        isUrdu
          ? "PDF بنانے میں ناکامی۔ براہ کرم دوبارہ کوشش کریں۔"
          : "Failed to generate PDF. Please try again."
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const hasAtLeastOneSource =
    (includeReport && !!selectedReport) || (includeFace && !!selectedFace);
  const canSubmit =
    !isLoading &&
    !isUploadingReport &&
    !isUploadingFace &&
    hasAtLeastOneSource &&
    !!userFormData.age.trim() &&
    !!userFormData.gender.trim();

  if (loadingAnalyses) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pb-[10%]">
        <LogoSpinner
          message={
            isUrdu
              ? "آپ کے جلدی ذرائع لوڈ ہو رہے ہیں..."
              : "Loading your dermatology sources..."
          }
        />
      </div>
    );
  }

  return (
    <div className={pageContainer}>
      <div className={contentWidth}>
        <section className={`${fullWidthSection} space-y-10`}>
          <div className="flex flex-col gap-4 border-b border-[var(--color-border)] pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                <ExclamationTriangleIcon className="h-7 w-7" />
              </div>
              <div>
                <h1 className={heading}>
                  {isUrdu ? "جلدی صحت جانچ" : "Dermatology Health Check"}
                </h1>
                <p className={`${subheading} mt-2 text-sm sm:text-base`}>
                  {isUrdu
                    ? "جلدی تصویر کے تجزیے اور اختیاری رپورٹ ڈیٹا کے ساتھ جلد پر مرکوز صحت جانچ تیار کریں۔"
                    : "Generate a dermatologist-focused skin health check using skin photo analysis and optional report data."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={pill}>
                    {isUrdu ? "جلد پر مرکوز نتیجہ" : "Skin-focused output"}
                  </span>
                  <span className={pill}>
                    {isUrdu ? "جلدی تصویر اور/یا رپورٹ منتخب کریں" : "Pick skin photo and/or report"}
                  </span>
                  <span className={pill}>{isUrdu ? "تاریخ میں محفوظ" : "Save to history"}</span>
                  <span className={pill}>
                    {isUrdu ? "جلدی سفارشات" : "Dermatology recommendations"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <div className="relative" ref={sourceMenuRef}>
                <button
                  type="button"
                  onClick={() => setSourceMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm font-semibold text-[var(--color-heading)] hover:border-[var(--color-primary)]"
                >
                  {isUrdu ? "ذرائع" : "Sources"}
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      includeFace && includeReport
                        ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                        : "bg-[var(--color-surface)] text-[var(--color-foreground)]"
                    }`}
                  >
                    {includeFace && includeReport
                      ? isUrdu
                        ? "جلدی تصویر + رپورٹ"
                        : "Skin photo + Report"
                      : includeFace
                      ? isUrdu
                        ? "صرف جلدی تصویر"
                        : "Skin photo only"
                      : includeReport
                      ? isUrdu
                        ? "صرف رپورٹ"
                        : "Report only"
                      : isUrdu
                        ? "کوئی انتخاب نہیں"
                        : "None selected"}
                  </span>
                </button>
                {sourceMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-soft)] z-20">
                    <div className="p-3 space-y-2 text-sm">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                          checked={includeFace}
                          onChange={(e) => setIncludeFace(e.target.checked)}
                        />
                        <span className="text-[var(--color-foreground)]">
                          {isUrdu ? "جلدی تصویر کا تجزیہ استعمال کریں" : "Use skin photo analysis"}
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                          checked={includeReport}
                          onChange={(e) => setIncludeReport(e.target.checked)}
                        />
                        <span className="text-[var(--color-foreground)]">
                          {isUrdu ? "رپورٹ تجزیہ استعمال کریں" : "Use report analysis"}
                        </span>
                      </label>
                      {!hasAtLeastOneSource && (
                        <p className="text-xs text-[var(--color-danger)]">
                          {isUrdu ? "کم از کم ایک ذریعہ منتخب کریں" : "Select at least one source"}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {analysisId && (
                <span className={chip}>
                  {isUrdu ? "محفوظ آئی ڈی" : "Saved ID"}: {analysisId}
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Face selection (left) */}
              <div className="space-y-4">
                <div className="flex min-h-[64px] items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="p-3 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                      <PhotoIcon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className={sectionTitle}>
                        {isUrdu ? "جلدی تصویر تجزیہ منتخب کریں" : "Select skin photo analysis"}
                      </h3>
                      <p className={`${subheading} text-sm`}>
                        {isUrdu
                          ? "تاریخ سے منتخب کریں یا نئی تصویر اپ لوڈ کریں۔ اختیاری۔"
                          : "Choose from history or upload new photo. Optional."}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFileSelect("face")}
                    disabled={isUploadingReport || isUploadingFace || isLoading}
                    className={`${secondaryButton} self-start shrink-0 whitespace-nowrap`}
                  >
                    <CloudArrowUpIcon className="h-4 w-4" />
                    {isUrdu ? "تصویر اپ لوڈ کریں" : "Upload photo"}
                  </button>
                </div>

                {isUploadingFace ? (
                  <div className="space-y-3 border border-[var(--color-border)] bg-[var(--color-card)]/70 px-4 py-4 rounded-xl">
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      <p className="text-sm font-semibold text-[var(--color-heading)]">
                        {isUrdu ? "اپ لوڈ ہو رہا ہے" : "Uploading"} {faceFile?.name}
                      </p>
                    </div>
                    <ProgressBar
                      progress={faceUploadProgress}
                      label={isUrdu ? "تصویر کا تجزیہ" : "Analyzing photo"}
                      size="sm"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-[var(--color-foreground)]">
                      {isUrdu
                        ? "تاریخ سے جلدی تصویر تجزیہ (اختیاری)"
                        : "Skin photo analysis from history (optional)"}
                    </label>
                    <select
                      value={selectedFace}
                      onChange={(e) => {
                        setSelectedFace(e.target.value);
                        setIncludeFace(!!e.target.value);
                        if (validationErrors.faceAnalysisId) {
                          setValidationErrors((prev) => {
                            const { faceAnalysisId: _f, ...rest } = prev;
                            return rest;
                          });
                        }
                      }}
                      className="w-full rounded-xl border px-4 py-3 text-[var(--color-foreground)] bg-[var(--color-card)] border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    >
                      <option value="">
                        {isUrdu
                          ? "جلدی تصویر تجزیہ منتخب کریں (اختیاری)"
                          : "Select skin photo analysis (optional)"}
                      </option>
                      {faceAnalyses.map((analysis, index) => (
                        <option
                          key={analysis.id || `face-${index}`}
                          value={analysis.id}
                        >
                          {`${isUrdu ? "چہرہ" : "Face"}: ${getAnalysisPreview(
                            analysis
                          )} — ${formatAnalysisDate(analysis.createdAt)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {validationErrors.faceAnalysisId && (
                  <p className="text-sm text-[var(--color-danger)]">
                    {validationErrors.faceAnalysisId}
                  </p>
                )}

                {faceAnalyses.length === 0 && !isUploadingFace && (
                  <p className="text-sm text-[var(--color-subtle)] italic">
                    {isUrdu
                      ? "ابھی جلدی تصاویر کے تجزیے موجود نہیں۔ آغاز کے لیے تصویر اپ لوڈ کریں۔"
                      : "No skin photo analyses yet. Upload a photo to get started."}
                  </p>
                )}
              </div>

              {/* Report selection (right) */}
              <div className="space-y-4">
                <div className="flex min-h-[64px] items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="p-3 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                      <DocumentTextIcon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className={sectionTitle}>
                        {isUrdu ? "رپورٹ تجزیہ منتخب کریں" : "Select report analysis"}
                      </h3>
                      <p className={`${subheading} text-sm`}>
                        {isUrdu
                          ? "تاریخ سے منتخب کریں یا نئی رپورٹ اپ لوڈ کریں۔ اختیاری۔"
                          : "Choose from history or upload new report. Optional."}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFileSelect("report")}
                    disabled={isUploadingReport || isUploadingFace || isLoading}
                    className={`${secondaryButton} self-start shrink-0 whitespace-nowrap`}
                  >
                    <CloudArrowUpIcon className="h-4 w-4" />
                    {isUrdu ? "رپورٹ اپ لوڈ کریں" : "Upload report"}
                  </button>
                </div>

                {isUploadingReport ? (
                  <div className="space-y-3 border border-[var(--color-border)] bg-[var(--color-card)]/70 px-4 py-4 rounded-xl">
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      <p className="text-sm font-semibold text-[var(--color-heading)]">
                        {isUrdu ? "اپ لوڈ ہو رہا ہے" : "Uploading"} {reportFile?.name}
                      </p>
                    </div>
                    <ProgressBar
                      progress={reportUploadProgress}
                      label={isUrdu ? "رپورٹ کا تجزیہ" : "Analyzing report"}
                      size="sm"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-[var(--color-foreground)]">
                      {isUrdu
                        ? "تاریخ سے رپورٹ تجزیہ (اختیاری)"
                        : "Report analysis from history (optional)"}
                    </label>
                    <select
                      value={selectedReport}
                      onChange={(e) => {
                        setSelectedReport(e.target.value);
                        setIncludeReport(!!e.target.value);
                        if (validationErrors.reportAnalysisId) {
                          setValidationErrors((prev) => {
                            const { reportAnalysisId: _r, ...rest } = prev;
                            return rest;
                          });
                        }
                      }}
                      className="w-full rounded-xl border px-4 py-3 text-[var(--color-foreground)] bg-[var(--color-card)] border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    >
                      <option value="">
                        {isUrdu
                          ? "رپورٹ تجزیہ منتخب کریں (اختیاری)"
                          : "Select report analysis (optional)"}
                      </option>
                      {reportAnalyses.map((analysis, index) => (
                        <option
                          key={analysis.id || `report-${index}`}
                          value={analysis.id}
                        >
                          {`${isUrdu ? "رپورٹ" : "Report"}: ${getAnalysisPreview(
                            analysis
                          )} — ${formatAnalysisDate(analysis.createdAt)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {validationErrors.reportAnalysisId && (
                  <p className="text-sm text-[var(--color-danger)]">
                    {validationErrors.reportAnalysisId}
                  </p>
                )}

                {reportAnalyses.length === 0 && !isUploadingReport && (
                  <p className="text-sm text-[var(--color-subtle)] italic">
                    {isUrdu
                      ? "ابھی رپورٹ تجزیے موجود نہیں۔ آغاز کے لیے جلد سے متعلق رپورٹ اپ لوڈ کریں۔"
                      : "No report analyses yet. Upload a dermatology-relevant report to get started."}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6 border-t border-[var(--color-border)] pt-8">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                  <HeartIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className={sectionTitle}>
                    {isUrdu ? "اضافی معلومات" : "Additional information"}
                  </h3>
                  <p className={`${subheading} text-sm`}>
                    {isUrdu
                      ? "اپنی جانچ بہتر بنانے کے لیے اختیاری جلدی معلومات فراہم کریں۔"
                      : "Provide optional dermatology context to refine your assessment."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">
                    {isUrdu ? "عمر *" : "Age *"}
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
                    placeholder={isUrdu ? "اپنی عمر درج کریں" : "Enter your age"}
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
                    {isUrdu ? "جنس *" : "Gender *"}
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
                      validationErrors.gender
                        ? "ring-[var(--color-danger)]"
                        : ""
                    }`}
                    required
                  >
                    <option value="">{isUrdu ? "جنس منتخب کریں" : "Select gender"}</option>
                    <option value="male">{isUrdu ? "مرد" : "Male"}</option>
                    <option value="female">{isUrdu ? "خاتون" : "Female"}</option>
                    <option value="other">{isUrdu ? "دیگر" : "Other"}</option>
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
                  {isUrdu ? "موجودہ جلدی علامات (اختیاری)" : "Current skin symptoms (optional)"}
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
                    {isUrdu ? "جلدی طبی تاریخ (اختیاری)" : "Dermatology history (optional)"}
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
                    placeholder={
                      isUrdu
                        ? "مثالیں: ایگزیما، سوریاسس، روزیشیا، الرجی، سابقہ جلدی طریقہ کار۔"
                        : "Examples: eczema, psoriasis, rosacea, allergies, prior skin procedures."
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[var(--color-foreground)]">
                    {isUrdu
                      ? "موجودہ جلدی ادویات (اختیاری)"
                      : "Current skin medications (optional)"}
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
                    placeholder={
                      isUrdu
                        ? "مثالیں: tretinoin، benzoyl peroxide، topical steroids، oral isotretinoin۔"
                        : "Examples: tretinoin, benzoyl peroxide, topical steroids, oral isotretinoin."
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center border-t border-[var(--color-border)] pt-6">
              <button
                type="submit"
                disabled={!canSubmit}
                className={primaryButton}
                aria-label={
                  isUrdu ? "جلدی صحت جانچ تیار کریں" : "Generate dermatology health check"
                }
              >
                {isLoading || isUploadingReport || isUploadingFace ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    {isUrdu ? "پروسیسنگ..." : "Processing..."}
                  </>
                ) : (
                  <>
                    <ExclamationTriangleIcon className="h-5 w-5" />
                    {isUrdu ? "صحت جانچ تیار کریں" : "Generate health check"}
                  </>
                )}
              </button>
            </div>
          </form>

          {riskAssessment && (
            <div className="space-y-4 border-t border-[var(--color-border)] pt-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                    <ChartBarIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className={sectionTitle}>
                      {isUrdu ? "جلدی صحت جانچ" : "Dermatology health check"}
                    </h2>
                    <p className={`${subheading} text-sm`}>
                      {isUrdu
                        ? "آپ کے منتخب تجزیوں اور اضافی معلومات سے تیار شدہ۔"
                        : "Generated from your selected analyses and additional details."}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className={secondaryButton}
                  >
                    {isGeneratingPdf ? (
                      <>
                        <LoadingSpinner size="sm" />
                        {isUrdu ? "تیار ہو رہا ہے..." : "Generating..."}
                      </>
                    ) : (
                      <>
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        {isUrdu ? "PDF ڈاؤن لوڈ کریں" : "Download PDF"}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/history")}
                    className={secondaryButton}
                  >
                    {isUrdu ? "تاریخ میں دیکھیں" : "View in history"}
                  </button>
                </div>
              </div>

              <div
                ref={reportRef}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 prose prose-sm max-w-none text-[var(--color-foreground)] dark:prose-invert"
              >
                <ReactMarkdown>{riskAssessment}</ReactMarkdown>
              </div>

              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
                <div className="flex items-start gap-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-[var(--color-warning)]" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-heading)]">
                      {isUrdu
                        ? "اہم جلدی طبی انتباہ"
                        : "Important dermatology disclaimer"}
                    </p>
                    <p className={`${mutedText} mt-1 text-xs`}>
                      {isUrdu
                        ? "یہ جانچ AI کے ذریعے صرف معلوماتی مقصد کے لیے تیار کی گئی ہے۔ یہ پیشہ ور جلدی مشورے، تشخیص یا علاج کا متبادل نہیں۔ جلد سے متعلق مسائل کے لیے ہمیشہ مستند ڈرماٹولوجسٹ سے رجوع کریں۔"
                        : "This assessment is generated by AI for informational purposes only. It should not replace professional dermatology advice, diagnosis, or treatment. Always consult a qualified dermatologist for skin-related concerns."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
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
