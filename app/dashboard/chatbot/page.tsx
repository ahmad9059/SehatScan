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
import { mutedText } from "@/app/components/dashboardStyles";
import { useSimpleLanguage } from "@/app/components/SimpleLanguageContext";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isLoading?: boolean;
}

const assistantBubble = "max-w-3xl rounded-2xl p-4";
const userBubble =
  "max-w-3xl rounded-2xl bg-[var(--color-surface)] text-[var(--color-foreground)] p-4";

function ChatbotPageContent() {
  const { user } = useUser();
  const { t } = useSimpleLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const avatarUrl =
    ((
      (user?.unsafeMetadata as Record<string, unknown> | undefined) ||
      (user?.publicMetadata as Record<string, unknown> | undefined)
    )?.avatarUrl as string | undefined) ||
    user?.imageUrl ||
    null;
  const userInitial = user?.firstName
    ? user.firstName.charAt(0).toUpperCase()
    : user?.emailAddresses?.[0]?.emailAddress?.charAt(0).toUpperCase() || "U";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Remove the welcome message initialization - start with empty chat

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
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageToSend,
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

  return (
    <div className="flex flex-col h-[calc(100dvh-80px)] bg-[var(--color-bg)] overflow-hidden">
      {/* Chat messages container with scroll - hidden scrollbar */}
      <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <SparklesIcon className="h-12 w-12 text-[var(--color-primary)] mb-4" />
              <h2 className="text-2xl font-medium text-[var(--color-heading)] mb-2">
                {t("chatbot.whatCanIHelp")}
              </h2>
              <p className="text-[var(--color-subtle)] max-w-md">
                {t("chatbot.askAnything")}
              </p>
            </div>
          )}
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
                    <span className={mutedText}>{t("chatbot.thinking")}</span>
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
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] overflow-hidden">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt="User avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-semibold">{userInitial}</span>
                  )}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom input area - always at bottom */}
      <div className="shrink-0 bg-[var(--color-bg)] py-2 px-4">
        {/* Suggested questions - only show when no messages */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto mb-3">
            {[t("chatbot.explainReport"), t("chatbot.whatTrends")].map(
              (question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => handleSendMessage(question)}
                  className="px-4 py-2 text-sm rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] transition-all duration-200"
                >
                  {question}
                </button>
              )
            )}
          </div>
        )}
        <div className="flex items-center gap-2 w-full max-w-2xl mx-auto rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 shadow-sm focus-within:border-[var(--color-primary)] focus-within:ring-1 focus-within:ring-[var(--color-primary)] transition-all">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={1}
            autoFocus
            className="flex-1 min-h-[24px] max-h-32 resize-none bg-transparent text-[var(--color-foreground)] placeholder:text-[var(--color-subtle)] focus:outline-none text-base"
            placeholder={t("chatbot.askAnythingPlaceholder")}
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
            <PaperAirplaneIcon className="h-6 w-6" />
          </button>
        </div>
        <p className="text-center text-[10px] text-[var(--color-subtle)] py-1">
          {t("chatbot.aiDisclaimer")}
        </p>
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
