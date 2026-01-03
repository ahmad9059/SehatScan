"use client";

import { useState } from "react";
import {
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  BookOpenIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon,
  CameraIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  pageContainer,
  contentWidth,
  fullWidthSection,
  heading,
  subheading,
  sectionTitle,
} from "@/app/components/dashboardStyles";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: "Getting Started",
    question: "How do I scan my face for health analysis?",
    answer:
      "Navigate to 'Scan Face' from the sidebar or dashboard. Click 'Upload Photo' or use your camera to take a picture. Our AI will analyze facial features for potential health indicators like skin tone, redness, and other visual markers.",
  },
  {
    category: "Getting Started",
    question: "How do I upload a medical report?",
    answer:
      "Go to 'Scan Report' from the sidebar. You can upload PDF, JPG, or PNG files of your medical reports. Our OCR technology will extract the data and provide insights about your health metrics.",
  },
  {
    category: "Features",
    question: "What is the Risk Assessment feature?",
    answer:
      "Risk Assessment combines your face analysis and medical report data with additional health information you provide (age, symptoms, medical history) to generate a comprehensive health risk profile using AI.",
  },
  {
    category: "Features",
    question: "How does the AI Health Assistant work?",
    answer:
      "The AI Health Assistant is a chatbot that can answer your health-related questions based on your uploaded data. It uses your analysis history to provide personalized responses and recommendations.",
  },
  {
    category: "Privacy & Security",
    question: "Is my health data secure?",
    answer:
      "Yes, we take your privacy seriously. All data is encrypted in transit and at rest. We use industry-standard security practices and never share your personal health information with third parties without your consent.",
  },
  {
    category: "Privacy & Security",
    question: "Can I delete my data?",
    answer:
      "Yes, you can delete individual analyses from your History page, or contact support to request complete data deletion. We comply with data protection regulations.",
  },
  {
    category: "Account",
    question: "How do I update my profile information?",
    answer:
      "Go to your Profile page from the sidebar or the profile dropdown menu. You can update your name, upload a profile picture, and manage your account settings.",
  },
  {
    category: "Troubleshooting",
    question: "Why is my face scan not working?",
    answer:
      "Ensure you have good lighting and your face is clearly visible in the photo. The image should be in focus and not blurry. Try using a front-facing photo with neutral expression for best results.",
  },
];

const quickLinks = [
  {
    icon: CameraIcon,
    title: "Scan Face Guide",
    description: "Learn how to get the best face analysis results",
    href: "/dashboard/scan-face",
  },
  {
    icon: DocumentTextIcon,
    title: "Report Upload Guide",
    description: "Tips for uploading medical reports",
    href: "/dashboard/scan-report",
  },
  {
    icon: ExclamationTriangleIcon,
    title: "Risk Assessment",
    description: "Understanding your health risk profile",
    href: "/dashboard/risk-assessment",
  },
  {
    icon: SparklesIcon,
    title: "AI Assistant",
    description: "Get help from our AI health chatbot",
    href: "/dashboard/chatbot",
  },
];

export default function HelpPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", ...new Set(faqs.map((faq) => faq.category))];
  const filteredFAQs =
    selectedCategory === "All"
      ? faqs
      : faqs.filter((faq) => faq.category === selectedCategory);

  return (
    <div className={pageContainer}>
      <div className={contentWidth}>
        <section className={`${fullWidthSection} space-y-8`}>
          {/* Header */}
          <div className="flex items-start gap-4 border-b border-[var(--color-border)] pb-6">
            <div className="p-3 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
              <QuestionMarkCircleIcon className="h-7 w-7" />
            </div>
            <div>
              <h1 className={heading}>Help & Support</h1>
              <p className={`${subheading} mt-2`}>
                Find answers to common questions and get support for SehatScan
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h2 className={sectionTitle}>Quick Links</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((link) => (
                <a
                  key={link.title}
                  href={link.href}
                  className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-primary)] hover:shadow-md transition-all duration-200 group"
                >
                  <div className="p-2 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)] w-fit mb-3 group-hover:scale-110 transition-transform">
                    <link.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-[var(--color-heading)] mb-1">
                    {link.title}
                  </h3>
                  <p className="text-sm text-[var(--color-muted)]">
                    {link.description}
                  </p>
                </a>
              ))}
            </div>
          </div>

          {/* Contact Options */}
          <div className="space-y-4">
            <h2 className={sectionTitle}>Contact Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                    <EnvelopeIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-heading)] mb-1">
                      Email Support
                    </h3>
                    <p className="text-sm text-[var(--color-muted)] mb-3">
                      Get help via email within 24 hours
                    </p>
                    <a
                      href="mailto:support@sehatscan.com"
                      className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                    >
                      support@sehatscan.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                    <ChatBubbleLeftRightIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-heading)] mb-1">
                      AI Assistant
                    </h3>
                    <p className="text-sm text-[var(--color-muted)] mb-3">
                      Chat with our AI for instant help
                    </p>
                    <a
                      href="/dashboard/chatbot"
                      className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                    >
                      Start chatting →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className={sectionTitle}>Frequently Asked Questions</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[var(--color-surface)] text-[var(--color-muted)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredFAQs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[var(--color-surface)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium px-2 py-1 rounded-md bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                        {faq.category}
                      </span>
                      <span className="font-medium text-[var(--color-heading)]">
                        {faq.question}
                      </span>
                    </div>
                    {openFAQ === index ? (
                      <ChevronUpIcon className="h-5 w-5 text-[var(--color-muted)] flex-shrink-0" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-[var(--color-muted)] flex-shrink-0" />
                    )}
                  </button>
                  {openFAQ === index && (
                    <div className="px-6 pb-4 pt-0">
                      <p className="text-[var(--color-muted)] leading-relaxed pl-[calc(0.5rem+0.5rem+theme(spacing.3))]">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Documentation */}
          <div className="p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                <BookOpenIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-heading)] mb-1">
                  Need more help?
                </h3>
                <p className="text-sm text-[var(--color-muted)] mb-3">
                  Check out our comprehensive documentation for detailed guides
                  and tutorials on using SehatScan effectively.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="/dashboard/chatbot"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-strong)] transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    Ask AI Assistant
                  </a>
                  <a
                    href="mailto:support@sehatscan.com"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)] text-sm font-medium hover:border-[var(--color-primary)] transition-colors"
                  >
                    <EnvelopeIcon className="h-4 w-4" />
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[var(--color-heading)]">
                  Medical Disclaimer
                </p>
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  SehatScan is designed for informational purposes only and
                  should not replace professional medical advice, diagnosis, or
                  treatment. Always consult with a qualified healthcare provider
                  for medical concerns.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
