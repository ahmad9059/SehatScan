export default function RiskAssessmentLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl animate-pulse">
        <div className="space-y-2 mb-8">
          <div className="h-8 w-56 rounded bg-[var(--color-surface)]" />
          <div className="h-4 w-80 rounded bg-[var(--color-surface)]" />
        </div>
        <div className="bg-[var(--color-card)] rounded-xl p-8 border border-[var(--color-border)]">
          <div className="space-y-4 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-[var(--color-surface)]" />
            ))}
          </div>
          <div className="h-12 w-full rounded-xl bg-[var(--color-surface)]" />
        </div>
      </div>
    </div>
  );
}
