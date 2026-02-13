export default function ChatbotLoading() {
  return (
    <div className="flex flex-col h-[calc(100dvh-80px)] bg-[var(--color-bg)] items-center justify-center">
      <div className="h-12 w-12 rounded-full bg-[var(--color-primary-soft)] animate-pulse mb-4" />
      <div className="h-6 w-48 rounded-lg bg-[var(--color-surface)] animate-pulse mb-2" />
      <div className="h-4 w-64 rounded-lg bg-[var(--color-surface)] animate-pulse" />
    </div>
  );
}
