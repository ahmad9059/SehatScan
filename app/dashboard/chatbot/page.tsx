"use client";

import { useState, useEffect, useRef } from "react";
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
  HeartIcon,
  ChartBarIcon,
  LightBulbIcon,
  RocketLaunchIcon,
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
  const { user } = useUser();
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 flex flex-col animate-fade-in-up">
        {/* Header */}
        <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700/50 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>

          <div className="relative z-10 px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-poppins">
                  AI Health Assistant
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Loading your health data...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-12 border border-gray-100 dark:border-gray-700/50 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-xl -translate-y-12 translate-x-12"></div>

            <div className="relative z-10 text-center">
              <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl mx-auto w-fit mb-6">
                <LoadingSpinner size="lg" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Preparing your AI assistant...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Setting up personalized health insights
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 flex flex-col animate-fade-in-up">
      {/* Header Section */}
      <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700/50 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-300/10 to-blue-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

        <div className="relative z-10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-poppins group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  AI Health Assistant
                </h1>
                <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                  Get personalized insights from your health data
                </p>
              </div>
            </div>

            {userAnalyses.length > 0 && (
              <div className="flex gap-3">
                {["report", "face", "risk"].map((type) => {
                  const count = userAnalyses.filter(
                    (a) => a.type === type
                  ).length;
                  const Icon = getAnalysisIcon(type);
                  return (
                    <div
                      key={type}
                      className="group/stat relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 dark:border-gray-700/50 overflow-hidden"
                    >
                      {/* Animated Background Elements */}
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-green-500/5"></div>

                      <div className="relative z-10 flex items-center gap-2">
                        <div className="p-1 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-lg group-hover/stat:scale-110 transition-transform duration-300">
                          <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover/stat:text-emerald-600 dark:group-hover/stat:text-emerald-400 transition-colors duration-300">
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex gap-4 animate-fade-in-up ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {message.role === "assistant" && (
              <div className="shrink-0">
                <div className="group relative w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:rotate-3 overflow-hidden">
                  {/* Animated Background Elements */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

                  <div className="relative z-10">
                    <SparklesIcon className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            )}

            <div
              className={`group relative max-w-2xl backdrop-blur-sm border overflow-hidden ${
                message.role === "user"
                  ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-3xl rounded-br-lg border-blue-400/20 shadow-lg hover:shadow-xl"
                  : "bg-white dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 rounded-3xl rounded-bl-lg border-gray-100 dark:border-gray-700/50 shadow-lg hover:shadow-xl"
              } px-6 py-4 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1`}
            >
              {/* Animated Background Elements for Assistant Messages */}
              {message.role === "assistant" && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5"></div>
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-400/10 to-pink-500/10 rounded-full blur-lg -translate-y-8 translate-x-8 group-hover:scale-125 transition-transform duration-500"></div>
                </>
              )}

              <div className="relative z-10">
                {message.isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
                      <LoadingSpinner size="sm" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                      Analyzing your health data...
                    </span>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-base font-medium mb-2 text-gray-900 dark:text-white">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="mb-2 leading-relaxed text-gray-800 dark:text-gray-200">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside mb-2 space-y-1 text-gray-800 dark:text-gray-200">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside mb-2 space-y-1 text-gray-800 dark:text-gray-200">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="leading-relaxed">{children}</li>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-gray-900 dark:text-white">
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic">{children}</em>
                        ),
                        code: ({ children }) => (
                          <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono">
                            {children}
                          </code>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-blue-500 pl-4 italic bg-blue-50 dark:bg-blue-900/20 py-2 rounded-r-lg">
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
                  className={`text-xs mt-3 flex items-center gap-1 ${
                    message.role === "user"
                      ? "text-blue-100"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <div className="w-1 h-1 bg-current rounded-full"></div>
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>

            {message.role === "user" && (
              <div className="shrink-0">
                <div className="group relative w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:rotate-3 overflow-hidden">
                  {/* Animated Background Elements */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-500/20 to-gray-600/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

                  <div className="relative z-10">
                    <UserIcon className="h-6 w-6 text-gray-200 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm border-t border-gray-100 dark:border-gray-700/50 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-green-500/5"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-green-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>

          <div className="relative z-10 px-6 py-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-lg">
                {userAnalyses.length > 0 ? (
                  <LightBulbIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <RocketLaunchIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {userAnalyses.length > 0
                  ? "💡 Suggested questions:"
                  : "🚀 Try asking:"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  className="group/question relative bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-xl transition-all duration-300 text-left text-sm font-medium transform hover:scale-105 hover:-translate-y-1 border border-gray-200 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-600 overflow-hidden"
                >
                  {/* Animated Background Elements */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-green-500/5 opacity-0 group-hover/question:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full opacity-0 group-hover/question:opacity-100 transition-opacity duration-300"></div>
                    {question}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm border-t border-gray-100 dark:border-gray-700/50 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5"></div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/15 to-indigo-500/15 rounded-full blur-xl -translate-y-12 translate-x-12 group-hover:scale-125 transition-transform duration-500"></div>

        <div className="relative z-10 p-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me about your health data..."
                className="w-full bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-600 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                rows={1}
                style={{
                  minHeight: "56px",
                  maxHeight: "120px",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "56px";
                  target.style.height = target.scrollHeight + "px";
                }}
              />
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="group/send relative bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white p-4 rounded-2xl transition-all duration-300 flex items-center justify-center shrink-0 transform hover:scale-110 hover:rotate-3 disabled:transform-none shadow-lg hover:shadow-xl overflow-hidden"
              style={{ minHeight: "56px", minWidth: "56px" }}
            >
              {/* Button Background Animation */}
              {!(!inputMessage.trim() || isLoading) && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 translate-x-[-100%] group-hover/send:translate-x-[100%] transition-transform duration-700"></div>
              )}

              <div className="relative z-10">
                <PaperAirplaneIcon className="h-6 w-6 group-hover/send:scale-110 transition-transform duration-300" />
              </div>
            </button>
          </div>

          {/* Input Helper Text */}
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Press Enter to send, Shift+Enter for new line
            </p>
            {userAnalyses.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <HeartIcon className="h-3 w-3" />
                <span>Personalized insights ready</span>
              </div>
            )}
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
