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
  chip,
  contentWidth,
  fullWidthSection,
  heading,
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
  structuredData?: Record<string, unknown> | null;
  visualMetrics?: Array<Record<string, unknown>> | null;
  riskAssessment?: string | null;
}

const assistantBubble =
  "max-w-4xl rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]/80 p-4";
const userBubble =
  "max-w-4xl rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] p-4";

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

        setUserAnalyses([...reports, ...faces, ...risks] as Analysis[]);
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

  const hasUserMessage = messages.some((m) => m.role === "user");
  const showSuggestions = !hasUserMessage;

  const handleSendMessage = async (overrideMessage?: string) => {
    const messageToSend = (overrideMessage ?? inputMessage).trim();
    if (!messageToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageToSend,
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
    setInputMessage(overrideMessage ? "" : "");
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
        <div className={contentWidth}>
          <section className={`${fullWidthSection} space-y-4`}>
            <div className="flex items-center gap-3">
              <LoadingSpinner size="lg" />
              <p className={`${mutedText} text-sm`}>
                Preparing your AI health assistant...
              </p>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-[var(--color-bg)]">
      {/* Chat messages container with scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
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
                    <span className={mutedText}>
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
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white">
                  <UserIcon className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested questions - shown inline below messages */}
        {showSuggestions && (
          <div className="max-w-4xl mx-auto px-4 pb-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {(userAnalyses.length > 0
                ? suggestedQuestions.slice(0, 3)
                : [
                    "What can you help me with?",
                    "How does this health assistant work?",
                    "What should I upload first?",
                  ]
              ).map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => handleSendMessage(question)}
                  className="rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-2 text-sm font-medium text-[var(--color-heading)] transition-all duration-200 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed input area at bottom */}
      <div className="border-t border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                rows={1}
                className="w-full min-h-12 max-h-40 resize-none rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-foreground)] placeholder:text-[var(--color-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                placeholder={
                  userAnalyses.length > 0
                    ? "Ask about your health reports..."
                    : "Type your message..."
                }
              />
            </div>
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              aria-label="Send message"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
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
