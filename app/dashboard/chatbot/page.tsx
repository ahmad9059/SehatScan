"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
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
} from "@heroicons/react/24/outline";

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
  structuredData?: any;
  visualMetrics?: any;
  riskAssessment?: string | null;
}

function ChatbotPageContent() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userAnalyses, setUserAnalyses] = useState<Analysis[]>([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load user analyses for RAG context
  useEffect(() => {
    const loadUserData = async () => {
      if (!session?.user?.id) {
        setLoadingAnalyses(false);
        return;
      }

      try {
        setLoadingAnalyses(true);
        const [reports, faces, risks] = await Promise.all([
          getUserAnalyses(session.user.id, "report"),
          getUserAnalyses(session.user.id, "face"),
          getUserAnalyses(session.user.id, "risk"),
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
  }, [session]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize with welcome message
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
          conversationHistory: messages.slice(-10), // Last 10 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to get response");
      }

      // Replace loading message with actual response
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

      // Replace loading message with error message
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
      <div className="flex flex-col bg-gray-900 min-h-[calc(100vh-120px)] max-h-[calc(100vh-120px)] overflow-hidden">
        <div className="shrink-0 h-16 px-4 py-3 bg-gray-900 border-b border-gray-700 flex items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#037BFC] to-indigo-500 rounded-xl">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-poppins">
                AI Health Assistant
              </h1>
              <p className="text-sm text-gray-300">
                Loading your health data...
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center bg-gray-800">
          <div className="flex items-center">
            <LoadingSpinner size="lg" />
            <span className="ml-4 text-lg text-gray-400">
              Preparing your AI assistant...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-900 min-h-[calc(100vh-120px)] max-h-[calc(100vh-120px)] overflow-hidden">
      {/* Header Section - Fixed Height */}
      <div className="shrink-0 h-16 px-4 py-10 bg-gray-900 border-b border-gray-700 flex items-center">
        <div className="flex items-center gap-3 w-full">
          <div className="p-2 bg-gradient-to-br from-[#037BFC] to-indigo-500 rounded-xl">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white font-poppins">
              AI Health Assistant
            </h1>
            <p className="text-sm text-gray-300">
              Get personalized insights from your health data
            </p>
          </div>
          {userAnalyses.length > 0 && (
            <div className="flex gap-2">
              {["report", "face", "risk"].map((type) => {
                const count = userAnalyses.filter(
                  (a) => a.type === type
                ).length;
                const Icon = getAnalysisIcon(type);
                return (
                  <div
                    key={type}
                    className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded-lg"
                  >
                    <Icon className="h-4 w-4 text-[#037BFC]" />
                    <span className="text-xs text-gray-300">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages Area - Flexible Height */}
      <div className="flex-1 bg-[#0F172A] overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 animate-fade-in-up ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-[#037BFC] to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <SparklesIcon className="h-5 w-5 text-white" />
                </div>
              </div>
            )}

            <div
              className={`max-w-2xl ${
                message.role === "user"
                  ? "bg-gradient-to-br from-[#037BFC] to-indigo-500 text-white rounded-2xl rounded-br-md"
                  : "bg-gray-700 text-gray-100 rounded-2xl rounded-bl-md"
              } px-4 py-3`}
            >
              {message.isLoading ? (
                <div className="flex items-center gap-3">
                  <LoadingSpinner size="sm" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Thinking...
                  </span>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-xl font-bold mb-3">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-lg font-semibold mb-2">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-base font-medium mb-2">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="mb-2 leading-relaxed">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-2 space-y-1">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-2 space-y-1">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-relaxed">{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic">{children}</em>
                      ),
                      code: ({ children }) => (
                        <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">
                          {children}
                        </code>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
              <div
                className={`text-xs mt-2 ${
                  message.role === "user"
                    ? "text-blue-100"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {formatTimestamp(message.timestamp)}
              </div>
            </div>

            {message.role === "user" && (
              <div className="shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <UserIcon className="h-5 w-5 text-gray-200" />
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions - Fixed Height */}
      {messages.length <= 1 && (
        <div className="shrink-0 px-4 py-3 bg-gray-800 border-t border-gray-700">
          <p className="text-sm text-gray-400 mb-2">
            {userAnalyses.length > 0
              ? "💡 Suggested questions:"
              : "🚀 Try asking:"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {(userAnalyses.length > 0
              ? suggestedQuestions.slice(0, 4)
              : [
                  "What can you help me with?",
                  "How does this health assistant work?",
                  "What should I upload first?",
                  "Tell me about health monitoring",
                ]
            ).map((question, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(question)}
                className="text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-2 rounded-lg transition-colors text-left"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area - Fixed at Bottom */}
      <div className="shrink-0 border-t border-gray-700  p-4 bg-gray-900 min-h-20">
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask me about your health data..."
            className="flex-1 bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#037BFC] focus:border-transparent resize-none text-base"
            rows={1}
            style={{
              minHeight: "48px",
              maxHeight: "96px",
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "48px";
              target.style.height = target.scrollHeight + "px";
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-[#037BFC] hover:bg-[#0260c9] disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors flex items-center justify-center shrink-0"
            style={{ minHeight: "48px", minWidth: "48px" }}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
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
