export default function ScanReportLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl animate-pulse">
        <div className="space-y-2 mb-8">
          <div className="h-8 w-48 rounded bg-[var(--color-surface)]" />
          <div className="h-4 w-80 rounded bg-[var(--color-surface)]" />
        </div>
        <div className="bg-[var(--color-card)] rounded-xl p-8 border border-[var(--color-border)]">
          <div className="h-64 rounded-xl bg-[var(--color-surface)] mb-6" />
          <div className="h-12 w-full rounded-xl bg-[var(--color-surface)]" />
        </div>
      </div>
    </div>
  );
}
