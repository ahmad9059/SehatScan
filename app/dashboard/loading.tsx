export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl animate-pulse">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)]"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="h-14 w-14 rounded-xl bg-[var(--color-surface)]" />
                <div className="text-right space-y-2">
                  <div className="h-8 w-12 rounded bg-[var(--color-surface)] ml-auto" />
                  <div className="h-3 w-16 rounded bg-[var(--color-surface)]" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-4 w-28 rounded bg-[var(--color-surface)]" />
                <div className="w-full bg-[var(--color-surface)] rounded-full h-2" />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="mb-8">
          <div className="h-6 w-40 rounded bg-[var(--color-surface)] mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)]">
              <div className="flex justify-between mb-6">
                <div className="h-5 w-32 rounded bg-[var(--color-surface)]" />
                <div className="h-5 w-36 rounded bg-[var(--color-surface)]" />
              </div>
              <div className="h-48 rounded bg-[var(--color-surface)]" />
            </div>
            <div className="bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)]">
              <div className="flex justify-between mb-6">
                <div className="h-5 w-40 rounded bg-[var(--color-surface)]" />
                <div className="h-5 w-36 rounded bg-[var(--color-surface)]" />
              </div>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--color-surface)]" />
                    <div className="flex-1 h-9 rounded-lg bg-[var(--color-surface)]" />
                    <div className="w-8 h-4 rounded bg-[var(--color-surface)]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Analyses Skeleton */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-40 rounded bg-[var(--color-surface)]" />
            <div className="h-4 w-20 rounded bg-[var(--color-surface)]" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)]"
              >
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-[var(--color-surface)]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-40 rounded bg-[var(--color-surface)]" />
                    <div className="h-4 w-64 rounded bg-[var(--color-surface)]" />
                    <div className="h-3 w-24 rounded bg-[var(--color-surface)]" />
                  </div>
                  <div className="h-9 w-28 rounded-xl bg-[var(--color-surface)]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
