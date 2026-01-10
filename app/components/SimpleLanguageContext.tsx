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
    "nav.scan": "Scan",
    "nav.scanReport": "Scan Report",
    "nav.scanFace": "Scan Face",
    "nav.riskAssessment": "Health Check",
    "nav.chatbot": "AI Assistant",
    "nav.history": "History",
    "nav.profile": "Profile",
    "nav.helpSupport": "Help & Support",
    "nav.logout": "Logout",
    "nav.search": "Search",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.subtitle": "Welcome to your health analytics platform",
    "dashboard.welcome": "Welcome back, {{name}}!",
    "dashboard.welcomeSubtitle": "Your health analysis platform powered by AI",
    "dashboard.loadingDashboard": "Loading dashboard...",

    // Page Subtitles
    "page.scanFaceSubtitle": "Analyze your face for health insights",
    "page.scanReportSubtitle": "Upload and analyze medical reports",
    "page.riskAssessmentSubtitle": "Evaluate your health risks",
    "page.chatbotSubtitle": "Get AI-powered health advice",
    "page.historySubtitle": "View your past analyses",
    "page.profileSubtitle": "Manage your account settings",
    "page.helpSubtitle": "Get help and contact support",

    // Analytics Overview
    "analytics.overview": "Analytics Overview",
    "analytics.totalAnalyses": "Total Analyses",
    "analytics.reportsScanned": "Reports Scanned",
    "analytics.facesAnalyzed": "Faces Analyzed",
    "analytics.riskAssessments": "Health Checks",
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
    "charts.riskAssessment": "Health Check",
    "charts.totalAnalyses": "Total analyses:",
    "charts.faces": "Faces",
    "charts.risks": "Risks",

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
    "actions.riskAssessment": "Health Check",
    "actions.riskAssessmentDesc": "Quick health evaluation",
    "actions.viewHistory": "View History",
    "actions.viewHistoryDesc": "See all your analyses",

    // Language Selector
    "language.select": "Select Language",
    "language.choose": "Choose your preferred language",
    "language.saved": "Language settings are saved locally",

    // Notifications
    "notifications.title": "Notifications",
    "notifications.markAllRead": "Mark all read",
    "notifications.unreadCount": "You have {{count}} unread notification",
    "notifications.unreadCountPlural":
      "You have {{count}} unread notifications",
    "notifications.allCaughtUp": "All caught up!",
    "notifications.noNotifications": "No notifications yet",
    "notifications.viewAll": "View all notifications",
    "notifications.analysisComplete": "Analysis Complete",
    "notifications.newFeature": "New Feature Available",
    "notifications.profileIncomplete": "Profile Incomplete",

    // Sidebar Card
    "sidebar.new": "New",
    "sidebar.aiHealthInsights": "AI Health Insights",
    "sidebar.aiHealthInsightsDesc":
      "Get personalized health recommendations powered by AI",
    "sidebar.tryItOut": "Try it out",

    // Chatbot
    "chatbot.whatCanIHelp": "What can I help with?",
    "chatbot.askAnything":
      "Ask me anything about your health data, reports, or general health questions.",
    "chatbot.thinking": "Thinking...",
    "chatbot.askAnythingPlaceholder": "Ask anything...",
    "chatbot.aiDisclaimer":
      "AI can make mistakes. Verify important health information with a professional.",
    "chatbot.explainReport": "Explain my latest health report",
    "chatbot.whatTrends": "What trends do you see in my data?",
    "chatbot.preparingAssistant": "Preparing your AI health assistant...",

    // Common
    "common.today": "today",
    "common.thisWeek": "this week",
    "common.thisMonth": "this month",
    "common.startScanning": "Start scanning",
    "common.online": "Online",
    "common.analyses": "analyses",
    "common.ofTotal": "of total",

    // Authentication & Errors
    "auth.required": "Authentication Required",
    "auth.pleaseLogin": "Please log in to access your dashboard",
    "common.viewDetails": "View Details",
    "common.noDataAvailable": "No Data Available",
    "common.startAnalyzing": "Start analyzing to see your data visualized here",

    // Stats Cards
    "stats.thisMonth": "+12% this month",
    "stats.thisWeek": "+8% this week",
    "stats.today": "+15% today",
    "stats.startAssessing": "Start assessing",
    "stats.progress": "Progress",
    "stats.accuracy": "Accuracy",
    "stats.detectionRate": "Detection Rate",
    "stats.completion": "Completion",

    // Recent Analyses
    "recent.reportAnalysis": "Report Analysis",
    "recent.faceAnalysis": "Face Analysis",
    "recent.riskAssessment": "Risk Assessment",
    "recent.analysis": "Analysis",
    "recent.analysisCompleted": "Analysis completed",

    // Empty State
    "empty.noAnalysesYet": "No analyses yet",
    "empty.getStartedDesc":
      "Get started by uploading a medical report or taking a photo for analysis. Our AI will help you understand your health data better.",
    "empty.uploadFirstReport": "Upload Your First Report",
    "empty.takePhoto": "Take a Photo",

    // Error Messages
    "error.unableToLoad": "Unable to load dashboard data",
    "error.notUpToDate":
      "Some information may not be up to date. Please refresh the page or try again later.",
  },
  ur: {
    // Navigation
    "nav.dashboard": "ڈیش بورڈ",
    "nav.scan": "اسکین",
    "nav.scanReport": "رپورٹ اسکین",
    "nav.scanFace": "چہرہ اسکین",
    "nav.riskAssessment": "صحت کی جانچ",
    "nav.chatbot": "AI اسسٹنٹ",
    "nav.history": "تاریخ",
    "nav.profile": "پروفائل",
    "nav.helpSupport": "مدد اور سپورٹ",
    "nav.logout": "لاگ آؤٹ",
    "nav.search": "تلاش",

    // Dashboard
    "dashboard.title": "ڈیش بورڈ",
    "dashboard.subtitle": "آپ کے صحت کے تجزیاتی پلیٹ فارم میں خوش آمدید",
    "dashboard.welcome": "واپس آئیے، {{name}}!",
    "dashboard.welcomeSubtitle": "آپ کا صحت کا تجزیاتی پلیٹ فارم AI سے طاقتور",
    "dashboard.loadingDashboard": "ڈیش بورڈ لوڈ ہو رہا ہے...",

    // Page Subtitles
    "page.scanFaceSubtitle": "صحت کی بصیرت کے لیے اپنے چہرے کا تجزیہ کریں",
    "page.scanReportSubtitle": "طبی رپورٹس اپ لوڈ اور تجزیہ کریں",
    "page.riskAssessmentSubtitle": "اپنے صحت کے خطرات کا جائزہ لیں",
    "page.chatbotSubtitle": "AI سے صحت کے مشورے حاصل کریں",
    "page.historySubtitle": "اپنے پچھلے تجزیے دیکھیں",
    "page.profileSubtitle": "اپنے اکاؤنٹ کی ترتیبات کا انتظام کریں",
    "page.helpSubtitle": "مدد حاصل کریں اور سپورٹ سے رابطہ کریں",

    // Analytics Overview
    "analytics.overview": "تجزیاتی جائزہ",
    "analytics.totalAnalyses": "کل تجزیے",
    "analytics.reportsScanned": "اسکین شدہ رپورٹس",
    "analytics.facesAnalyzed": "تجزیہ شدہ چہرے",
    "analytics.riskAssessments": "صحت کی جانچ",
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
    "charts.riskAssessment": "صحت کی جانچ",
    "charts.totalAnalyses": "کل تجزیے:",
    "charts.faces": "چہرے",
    "charts.risks": "خطرات",

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
    "actions.riskAssessment": "صحت کی جانچ",
    "actions.riskAssessmentDesc": "فوری صحت کا جائزہ",
    "actions.viewHistory": "تاریخ دیکھیں",
    "actions.viewHistoryDesc": "اپنے تمام تجزیے دیکھیں",

    // Language Selector
    "language.select": "زبان منتخب کریں",
    "language.choose": "اپنی پسندیدہ زبان منتخب کریں",
    "language.saved": "زبان کی ترتیبات مقامی طور پر محفوظ ہیں",

    // Notifications
    "notifications.title": "اطلاعات",
    "notifications.markAllRead": "سب پڑھی ہوئی",
    "notifications.unreadCount": "آپ کے پاس {{count}} نہ پڑھی ہوئی اطلاع ہے",
    "notifications.unreadCountPlural":
      "آپ کے پاس {{count}} نہ پڑھی ہوئی اطلاعات ہیں",
    "notifications.allCaughtUp": "سب پڑھ لیا!",
    "notifications.noNotifications": "ابھی تک کوئی اطلاع نہیں",
    "notifications.viewAll": "تمام اطلاعات دیکھیں",
    "notifications.analysisComplete": "تجزیہ مکمل",
    "notifications.newFeature": "نئی خصوصیت دستیاب",
    "notifications.profileIncomplete": "پروفائل نامکمل",

    // Sidebar Card
    "sidebar.new": "نیا",
    "sidebar.aiHealthInsights": "AI صحت کی بصیرت",
    "sidebar.aiHealthInsightsDesc": "AI سے ذاتی صحت کی سفارشات حاصل کریں",
    "sidebar.tryItOut": "آزمائیں",

    // Chatbot
    "chatbot.whatCanIHelp": "میں کس طرح مدد کر سکتا ہوں؟",
    "chatbot.askAnything":
      "اپنے صحت کے ڈیٹا، رپورٹس، یا عام صحت کے سوالات کے بارے میں کچھ بھی پوچھیں۔",
    "chatbot.thinking": "سوچ رہا ہوں...",
    "chatbot.askAnythingPlaceholder": "کچھ بھی پوچھیں...",
    "chatbot.aiDisclaimer":
      "AI غلطیاں کر سکتا ہے۔ اہم صحت کی معلومات کی تصدیق کسی پیشہ ور سے کریں۔",
    "chatbot.explainReport": "میری تازہ ترین صحت کی رپورٹ کی وضاحت کریں",
    "chatbot.whatTrends": "آپ میرے ڈیٹا میں کیا رجحانات دیکھتے ہیں؟",
    "chatbot.preparingAssistant": "آپ کا AI صحت اسسٹنٹ تیار ہو رہا ہے...",

    // Common
    "common.today": "آج",
    "common.thisWeek": "اس ہفتے",
    "common.thisMonth": "اس مہینے",
    "common.startScanning": "اسکیننگ شروع کریں",
    "common.online": "آن لائن",
    "common.analyses": "تجزیے",
    "common.ofTotal": "کل کا",

    // Authentication & Errors
    "auth.required": "تصدیق درکار",
    "auth.pleaseLogin": "اپنے ڈیش بورڈ تک رسائی کے لیے لاگ ان کریں",
    "common.viewDetails": "تفصیلات دیکھیں",
    "common.noDataAvailable": "کوئی ڈیٹا دستیاب نہیں",
    "common.startAnalyzing": "یہاں اپنا ڈیٹا دیکھنے کے لیے تجزیہ شروع کریں",

    // Stats Cards
    "stats.thisMonth": "+12% اس مہینے",
    "stats.thisWeek": "+8% اس ہفتے",
    "stats.today": "+15% آج",
    "stats.startAssessing": "جانچ شروع کریں",
    "stats.progress": "پیش قدمی",
    "stats.accuracy": "درستگی",
    "stats.detectionRate": "شناخت کی شرح",
    "stats.completion": "تکمیل",

    // Recent Analyses
    "recent.reportAnalysis": "رپورٹ کا تجزیہ",
    "recent.faceAnalysis": "چہرے کا تجزیہ",
    "recent.riskAssessment": "خطرے کا جائزہ",
    "recent.analysis": "تجزیہ",
    "recent.analysisCompleted": "تجزیہ مکمل",

    // Empty State
    "empty.noAnalysesYet": "ابھی تک کوئی تجزیہ نہیں",
    "empty.getStartedDesc":
      "طبی رپورٹ اپ لوڈ کرکے یا تصویر لے کر شروع کریں۔ ہماری AI آپ کے صحت کے ڈیٹا کو بہتر سمجھنے میں مدد کرے گی۔",
    "empty.uploadFirstReport": "اپنی پہلی رپورٹ اپ لوڈ کریں",
    "empty.takePhoto": "تصویر لیں",

    // Error Messages
    "error.unableToLoad": "ڈیش بورڈ ڈیٹا لوڈ کرنے میں ناکام",
    "error.notUpToDate":
      "کچھ معلومات تازہ ترین نہیں ہو سکتیں۔ براہ کرم صفحہ ریفریش کریں یا بعد میں دوبارہ کوشش کریں۔",
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
