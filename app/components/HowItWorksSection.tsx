export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Upload Your Data",
      description:
        "Upload medical reports or facial photos securely through our encrypted platform.",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      ),
    },
    {
      number: "02",
      title: "AI Analysis",
      description:
        "Our advanced AI processes your data using computer vision and machine learning algorithms.",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Get Insights",
      description:
        "Receive comprehensive health insights and risk assessments instantly in an easy-to-understand format.",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-20 relative overflow-hidden bg-[var(--color-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-heading)] mb-4 px-4">
            How It Works
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-[var(--color-subtle)] max-w-3xl mx-auto px-4">
            Get started in three simple steps and receive your health insights
            within minutes
          </p>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-[var(--color-border)]"></div>

          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Step Card */}
              <div className="bg-[var(--color-card)] rounded-2xl p-6 sm:p-8 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-strong)] transition-all duration-300 group relative z-10 border border-[var(--color-border)]">
                {/* Number Badge */}
                <div className="absolute -top-4 sm:-top-6 left-6 sm:left-8 w-12 h-12 sm:w-16 sm:h-16 bg-[var(--color-primary)] rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-[var(--shadow-soft)] group-hover:scale-110 transition-transform">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="mt-6 sm:mt-8 mb-4 sm:mb-6 w-12 h-12 sm:w-16 sm:h-16 bg-[var(--color-surface)] rounded-xl flex items-center justify-center text-[var(--color-primary)] shadow-md group-hover:scale-110 transition-transform border border-[var(--color-border)]">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl sm:text-2xl font-bold text-[var(--color-heading)] mb-3 sm:mb-4">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-[var(--color-subtle)] leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Arrow (except for last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-24 -right-6 z-20">
                  <svg
                    className="w-12 h-12 text-[var(--color-primary)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
