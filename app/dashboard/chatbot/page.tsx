"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { showErrorToast } from "@/lib/toast";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  PaperAirplaneIcon,
  UserIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  mutedText,
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
  "max-w-3xl rounded-2xl p-4";
const userBubble =
  "max-w-3xl rounded-2xl bg-[var(--color-surface)] text-[var(--color-foreground)] p-4";

function ChatbotPageContent() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userAnalyses, setUserAnalyses] = useState<Analysis[]>([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(true);
  const [hasStartedChat, setHasStartedChat] = useState(false);
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
        // Fetch analyses via API route (server-side)
        const response = await fetch("/api/analyses/user");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUserAnalyses(data.analyses as Analysis[]);
          }
        }
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

  // Remove the welcome message initialization - start with empty chat

  const handleSendMessage = async (overrideMessage?: string) => {
    const messageToSend = (overrideMessage ?? inputMessage).trim();
    if (!messageToSend || isLoading) return;

    // Trigger the animation to move input to bottom
    if (!hasStartedChat) {
      setHasStartedChat(true);
    }

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

  if (loadingAnalyses) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center bg-[var(--color-bg)]">
        <div className="flex items-center gap-3">
          <LoadingSpinner size="lg" />
          <p className={`${mutedText} text-sm`}>
            Preparing your AI health assistant...
          </p>
        </div>
      </div>
    );
  }

  const inputAreaClasses = "w-full min-h-12 max-h-40 resize-none bg-transparent border-b border-[var(--color-border)] px-2 py-3 text-[var(--color-foreground)] text-lg placeholder:text-[var(--color-subtle)] focus:outline-none focus:border-[var(--color-primary)] transition-colors duration-300";

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-[var(--color-bg)] relative overflow-hidden">
      {/* Centered state - before chat starts */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center px-4 transition-all duration-500 ease-in-out ${
          hasStartedChat
            ? "opacity-0 pointer-events-none translate-y-20"
            : "opacity-100"
        }`}
      >
        <h1 className="text-3xl sm:text-4xl font-medium text-[var(--color-heading)] mb-8">
          What can I help with?
        </h1>
        {!hasStartedChat && (
          <div className="flex items-center gap-3 w-full max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                rows={1}
                autoFocus
                className={inputAreaClasses}
                placeholder="Ask anything..."
              />
            </div>
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                inputMessage.trim()
                  ? "bg-[var(--color-foreground)] text-[var(--color-bg)]"
                  : "bg-transparent text-[var(--color-subtle)]"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label="Send message"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Chat state - after first message */}
      <div
        className={`flex flex-col h-full transition-all duration-500 ease-in-out ${
          hasStartedChat
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Chat messages container with scroll */}
        <div className="flex-1 overflow-y-auto">
          <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                    <SparklesIcon className="h-4 w-4" />
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
                      <span className={mutedText}>Thinking...</span>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none text-[var(--color-foreground)] dark:prose-invert">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => (
                            <p className="text-[var(--color-foreground)] leading-relaxed mb-2 last:mb-0">
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
                            <code className="rounded-md bg-[var(--color-surface)] px-1.5 py-0.5 text-sm text-[var(--color-heading)]">
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
                </div>

                {message.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-foreground)]">
                    <UserIcon className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Bottom input area */}
        <div className="bg-[var(--color-bg)] py-4 px-4">
          <div className="flex items-center gap-2 w-full max-w-2xl mx-auto rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 shadow-sm focus-within:border-[var(--color-primary)] focus-within:ring-1 focus-within:ring-[var(--color-primary)] transition-all">
            <textarea
              ref={hasStartedChat ? inputRef : undefined}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={1}
              autoFocus={hasStartedChat}
              className="flex-1 min-h-[24px] max-h-32 resize-none bg-transparent text-[var(--color-foreground)] placeholder:text-[var(--color-subtle)] focus:outline-none text-base"
              placeholder="Ask anything..."
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                inputMessage.trim()
                  ? "bg-[var(--color-foreground)] text-[var(--color-bg)]"
                  : "bg-transparent text-[var(--color-subtle)]"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label="Send message"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
            </button>
          </div>
          <p className="text-center text-xs text-[var(--color-subtle)] mt-3">
            AI can make mistakes. Verify important health information with a professional.
          </p>
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
