"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  getTextClass: (additionalClasses?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Simple translations object
const translations = {
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.scanReport": "Scan Report",
    "nav.scanFace": "Scan Face",
    "nav.riskAssessment": "Risk Assessment",
    "nav.chatbot": "AI Assistant",
    "nav.history": "History",
    "nav.profile": "Profile",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.subtitle": "Welcome to your health analytics platform",
    "dashboard.welcome": "Welcome back, {{name}}!",
    "dashboard.welcomeSubtitle": "Your health analysis platform powered by AI",

    // Analytics Overview
    "analytics.overview": "Analytics Overview",
    "analytics.totalAnalyses": "Total Analyses",
    "analytics.reportsScanned": "Reports Scanned",
    "analytics.facesAnalyzed": "Faces Analyzed",
    "analytics.riskAssessments": "Risk Assessments",
    "analytics.progress": "Progress",
    "analytics.accuracy": "Accuracy",
    "analytics.detectionRate": "Detection Rate",
    "analytics.completion": "Completion",

    // Charts
    "charts.analysisDistribution": "Analysis Distribution",
    "charts.analysisTypes": "Analysis Types",
    "charts.activityLast7Days": "Activity (Last 7 Days)",
    "charts.faceAnalysis": "Face Analysis",
    "charts.reports": "Reports",
    "charts.riskAssessment": "Risk Assessment",

    // Recent Analyses
    "recent.analyses": "Recent Analyses",
    "recent.viewAll": "View all",
    "recent.noAnalyses": "No analyses yet",
    "recent.getStarted":
      "Get started by uploading a report or scanning your face",

    // Quick Actions
    "actions.quickActions": "Quick Actions",
    "actions.uploadReport": "Upload Report",
    "actions.uploadReportDesc": "Analyze medical documents",
    "actions.scanFace": "Scan Face",
    "actions.scanFaceDesc": "AI-powered facial analysis",
    "actions.riskAssessment": "Risk Assessment",
    "actions.riskAssessmentDesc": "Comprehensive health evaluation",
    "actions.viewHistory": "View History",
    "actions.viewHistoryDesc": "See all your analyses",

    // Language Selector
    "language.select": "Select Language",
    "language.choose": "Choose your preferred language",
    "language.saved": "Language settings are saved locally",

    // Common
    "common.today": "today",
    "common.thisWeek": "this week",
    "common.thisMonth": "this month",
    "common.startScanning": "Start scanning",

    // Authentication & Errors
    "auth.required": "Authentication Required",
    "auth.pleaseLogin": "Please log in to access your dashboard",
    "common.viewDetails": "View Details",
    "common.noDataAvailable": "No Data Available",
    "common.startAnalyzing": "Start analyzing to see your data visualized here",
  },
  ur: {
    // Navigation
    "nav.dashboard": "ڈیش بورڈ",
    "nav.scanReport": "رپورٹ اسکین",
    "nav.scanFace": "چہرہ اسکین",
    "nav.riskAssessment": "خطرے کا جائزہ",
    "nav.chatbot": "AI اسسٹنٹ",
    "nav.history": "تاریخ",
    "nav.profile": "پروفائل",

    // Dashboard
    "dashboard.title": "ڈیش بورڈ",
    "dashboard.subtitle": "آپ کے صحت کے تجزیاتی پلیٹ فارم میں خوش آمدید",
    "dashboard.welcome": "واپس آئیے، {{name}}!",
    "dashboard.welcomeSubtitle": "آپ کا صحت کا تجزیاتی پلیٹ فارم AI سے طاقتور",

    // Analytics Overview
    "analytics.overview": "تجزیاتی جائزہ",
    "analytics.totalAnalyses": "کل تجزیے",
    "analytics.reportsScanned": "اسکین شدہ رپورٹس",
    "analytics.facesAnalyzed": "تجزیہ شدہ چہرے",
    "analytics.riskAssessments": "خطرے کے جائزے",
    "analytics.progress": "پیش قدمی",
    "analytics.accuracy": "درستگی",
    "analytics.detectionRate": "شناخت کی شرح",
    "analytics.completion": "تکمیل",

    // Charts
    "charts.analysisDistribution": "تجزیے کی تقسیم",
    "charts.analysisTypes": "تجزیے کی اقسام",
    "charts.activityLast7Days": "سرگرمی (پچھلے 7 دن)",
    "charts.faceAnalysis": "چہرے کا تجزیہ",
    "charts.reports": "رپورٹس",
    "charts.riskAssessment": "خطرے کا جائزہ",

    // Recent Analyses
    "recent.analyses": "حالیہ تجزیے",
    "recent.viewAll": "سب دیکھیں",
    "recent.noAnalyses": "ابھی تک کوئی تجزیہ نہیں",
    "recent.getStarted": "رپورٹ اپ لوڈ کرکے یا اپنا چہرہ اسکین کرکے شروع کریں",

    // Quick Actions
    "actions.quickActions": "فوری اعمال",
    "actions.uploadReport": "رپورٹ اپ لوڈ",
    "actions.uploadReportDesc": "طبی دستاویزات کا تجزیہ",
    "actions.scanFace": "چہرہ اسکین",
    "actions.scanFaceDesc": "AI سے چہرے کا تجزیہ",
    "actions.riskAssessment": "خطرے کا جائزہ",
    "actions.riskAssessmentDesc": "جامع صحت کا جائزہ",
    "actions.viewHistory": "تاریخ دیکھیں",
    "actions.viewHistoryDesc": "اپنے تمام تجزیے دیکھیں",

    // Language Selector
    "language.select": "زبان منتخب کریں",
    "language.choose": "اپنی پسندیدہ زبان منتخب کریں",
    "language.saved": "زبان کی ترتیبات مقامی طور پر محفوظ ہیں",

    // Common
    "common.today": "آج",
    "common.thisWeek": "اس ہفتے",
    "common.thisMonth": "اس مہینے",
    "common.startScanning": "اسکیننگ شروع کریں",

    // Authentication & Errors
    "auth.required": "تصدیق درکار",
    "auth.pleaseLogin": "اپنے ڈیش بورڈ تک رسائی کے لیے لاگ ان کریں",
    "common.viewDetails": "تفصیلات دیکھیں",
    "common.noDataAvailable": "کوئی ڈیٹا دستیاب نہیں",
    "common.startAnalyzing": "یہاں اپنا ڈیٹا دیکھنے کے لیے تجزیہ شروع کریں",
  },
};

export function SimpleLanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguageState] = useState("en");

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem("selectedLanguage") || "en";
    setLanguageState(savedLanguage);
  }, []);

  useEffect(() => {
    // Apply language attribute to document body for font styling
    document.body.setAttribute("data-language", language);

    // Apply font class based on language
    if (language === "ur") {
      document.body.classList.add("font-urdu");
    } else {
      document.body.classList.remove("font-urdu");
    }
  }, [language]);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem("selectedLanguage", lang);
  };

  const t = (key: string): string => {
    const langTranslations =
      translations[language as keyof typeof translations] || translations.en;
    return langTranslations[key as keyof typeof langTranslations] || key;
  };

  const getTextClass = (additionalClasses = "") => {
    const baseClasses = language === "ur" ? "font-urdu" : "";
    return `${baseClasses} ${additionalClasses}`.trim();
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t, getTextClass }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useSimpleLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error(
      "useSimpleLanguage must be used within a SimpleLanguageProvider"
    );
  }
  return context;
}

// Utility component for text that should use language-specific fonts
export function LanguageText({
  children,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) {
  const { language } = useSimpleLanguage();
  const fontClass = language === "ur" ? "font-urdu" : "";

  return (
    <span className={`${fontClass} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}
