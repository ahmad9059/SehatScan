export default function StatsSection() {
  const stats = [
    {
      value: "2025",
      label: "Founded",
    },
    {
      value: "1K+",
      label: "Reports Analyzed",
    },
    {
      value: "500+",
      label: "Active Users",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-[var(--color-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 text-center">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="space-y-2 sm:space-y-3 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-5xl sm:text-6xl md:text-7xl font-bold text-[var(--color-primary)]">
                {stat.value}
              </div>
              <div className="text-base sm:text-lg font-semibold text-[var(--color-subtle)]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
