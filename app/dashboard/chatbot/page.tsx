"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getUserAnalyses } from "@/lib/analysis";
import { showErrorToast } from "@/lib/toast";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  PaperAirplaneIcon,
  UserIcon,
  SparklesIcon,
  DocumentTextIcon,
  CameraIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  RocketLaunchIcon,
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
  subheading,
} from "@/app/components/dashboardStyles";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isLoading?: boolean;
}

interface Analysis {
  id: string;
  type: string;
  createdAt: Date | string;
  structuredData?: Record<string, unknown>;
  visualMetrics?: Array<Record<string, unknown>>;
  riskAssessment?: string | null;
}

const assistantBubble =
  "max-w-3xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-[var(--shadow-soft)]";
const userBubble =
  "max-w-3xl rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] p-4 shadow-[var(--shadow-soft)]";

function ChatbotPageContent() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userAnalyses, setUserAnalyses] = useState<Analysis[]>([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) {
        setLoadingAnalyses(false);
        return;
      }

      try {
        setLoadingAnalyses(true);
        const [reports, faces, risks] = await Promise.all([
          getUserAnalyses(user.id, "report"),
          getUserAnalyses(user.id, "face"),
          getUserAnalyses(user.id, "risk"),
        ]);

        setUserAnalyses([...reports, ...faces, ...risks]);
      } catch (error) {
        console.error("Failed to load user analyses:", error);
        showErrorToast("Failed to load your health data");
      } finally {
        setLoadingAnalyses(false);
      }
    };

    loadUserData();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!loadingAnalyses && messages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome",
        content: `Hello! I'm your AI health assistant. I can help you understand your health data, provide insights about your analyses, and answer questions about your health reports.

${
  userAnalyses.length > 0
    ? `I have access to your ${userAnalyses.length} health analyses and can provide personalized insights based on your data.`
    : "Once you upload some health reports or photos, I'll be able to provide personalized insights based on your data."
}

How can I help you today?`,
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [loadingAnalyses, userAnalyses.length, messages.length]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      role: "user",
      timestamp: new Date(),
    };

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: "",
      role: "assistant",
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage.trim(),
          userAnalyses,
          conversationHistory: messages.slice(-10),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to get response");
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessage.id
            ? {
                ...msg,
                content: data.response,
                isLoading: false,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessage.id
            ? {
                ...msg,
                content:
                  "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
                isLoading: false,
              }
            : msg
        )
      );

      showErrorToast("Failed to get response from AI assistant");
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case "report":
        return DocumentTextIcon;
      case "face":
        return CameraIcon;
      case "risk":
        return ExclamationTriangleIcon;
      default:
        return DocumentTextIcon;
    }
  };

  const suggestedQuestions = [
    "What insights can you provide from my latest health report?",
    "How are my health metrics trending over time?",
    "What should I be concerned about in my recent analyses?",
    "Can you explain my risk assessment results?",
    "What recommendations do you have based on my data?",
    "Are there any patterns in my health data I should know about?",
    "What do my facial analysis results indicate about my health?",
    "How can I improve my health based on my current data?",
  ];

  if (loadingAnalyses) {
    return (
      <div className={pageContainer}>
        <div className={`${contentWidth} space-y-6`}>
          <div className={`${card} p-6 flex items-center gap-3`}>
            <LoadingSpinner size="lg" />
            <p className={`${mutedText} text-sm`}>
              Preparing your AI health assistant...
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
                <ChatBubbleLeftRightIcon className="h-7 w-7" />
              </div>
              <div>
                <h1 className={heading}>AI Health Assistant</h1>
                <p className={`${subheading} mt-2 text-sm sm:text-base`}>
                  Ask questions, explore insights, and stay aligned with the
                  main dashboard experience.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={pill}>Uses your analyses</span>
                  <span className={pill}>Context-aware answers</span>
                  <span className={pill}>Markdown supported</span>
                </div>
              </div>
            </div>
            {userAnalyses.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {["report", "face", "risk"].map((type) => {
                  const count = userAnalyses.filter(
                    (analysis) => analysis.type === type
                  ).length;
                  const Icon = getAnalysisIcon(type);
                  return (
                    <span key={type} className={chip}>
                      <Icon className="h-4 w-4" />
                      {count} {type}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {messages.length <= 1 && (
          <div className={`${card} p-4 space-y-3`}>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                {userAnalyses.length > 0 ? (
                  <LightBulbIcon className="h-5 w-5" />
                ) : (
                  <RocketLaunchIcon className="h-5 w-5" />
                )}
              </div>
              <p className="text-sm font-semibold text-[var(--color-heading)]">
                {userAnalyses.length > 0
                  ? "Suggested questions to get started"
                  : "Try one of these questions"}
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {(userAnalyses.length > 0
                ? suggestedQuestions.slice(0, 4)
                : [
                    "What can you help me with?",
                    "How does this health assistant work?",
                    "What should I upload first?",
                    "Tell me about health monitoring",
                  ]
              ).map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => setInputMessage(question)}
                  className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-left text-sm font-semibold text-[var(--color-heading)] transition-colors duration-200 hover:border-[var(--color-primary)]"
                >
                  <div className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                  <span>{question}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={`${interactiveCard} p-0`}>
          <div className="flex flex-col gap-4 p-4 sm:p-6 min-h-[60vh]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                    <SparklesIcon className="h-5 w-5" />
                  </div>
                )}

                <div
                  className={
                    message.role === "user" ? userBubble : assistantBubble
                  }
                >
                  {message.isLoading ? (
                    <div className="flex items-center gap-3">
                      <LoadingSpinner size="sm" />
                      <span
                        className={
                          message.role === "user"
                            ? "text-[var(--color-on-primary)]"
                            : mutedText
                        }
                      >
                        Analyzing your health data...
                      </span>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none text-[var(--color-foreground)] prose-p:mb-3 prose-li:mb-1 dark:prose-invert">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => (
                            <p className="text-[var(--color-foreground)]">
                              {children}
                            </p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-[var(--color-heading)]">
                              {children}
                            </strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic text-[var(--color-foreground)]">
                              {children}
                            </em>
                          ),
                          code: ({ children }) => (
                            <code className="rounded bg-[var(--color-surface)] px-2 py-1 text-[var(--color-heading)]">
                              {children}
                            </code>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-4 text-[var(--color-foreground)]">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-4 text-[var(--color-foreground)]">
                              {children}
                            </ol>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-2 text-xs text-[var(--color-subtle)]">
                    <span className="h-1 w-1 rounded-full bg-current" />
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>

                {message.role === "user" && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)]">
                    <UserIcon className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-[var(--color-border)] bg-[var(--color-card)] p-4 sm:p-5">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="min-h-[80px] flex-1 resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-[var(--color-foreground)] placeholder:text-[var(--color-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder={
                    userAnalyses.length > 0
                      ? "Ask about your reports, facial analyses, or risk assessments..."
                      : "Upload a report or photo for deeper insights..."
                  }
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className={`${primaryButton} shrink-0 px-4 py-3`}
                  aria-label="Send message"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-[var(--color-subtle)]">
                <SparklesIcon className="h-4 w-4" />
                Powered by your saved analyses for context-rich answers.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatbotPage() {
  return (
    <ErrorBoundary>
      <ChatbotPageContent />
    </ErrorBoundary>
  );
}
