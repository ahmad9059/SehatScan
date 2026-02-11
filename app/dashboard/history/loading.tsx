export default function HistoryLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl animate-pulse">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-[var(--color-border)] pb-6 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="space-y-2">
            <div className="h-8 w-48 rounded bg-[var(--color-surface)]" />
            <div className="h-4 w-72 rounded bg-[var(--color-surface)]" />
          </div>
          <div className="flex gap-2">
            <div className="h-7 w-16 rounded-full bg-[var(--color-surface)]" />
            <div className="h-7 w-24 rounded-full bg-[var(--color-surface)]" />
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-20 rounded-full bg-[var(--color-surface)]"
            />
          ))}
        </div>

        {/* Analysis rows */}
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="border border-[var(--color-border)] bg-[var(--color-card)] px-5 py-4 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-[var(--color-surface)]" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-36 rounded bg-[var(--color-surface)]" />
                  <div className="h-4 w-56 rounded bg-[var(--color-surface)]" />
                  <div className="h-3 w-28 rounded bg-[var(--color-surface)]" />
                </div>
                <div className="h-9 w-28 rounded-lg bg-[var(--color-surface)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
