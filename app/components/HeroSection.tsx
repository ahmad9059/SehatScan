import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative isolate h-screen flex flex-col justify-center overflow-hidden bg-[var(--color-bg)] text-[var(--color-foreground)]">
      {/* Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundColor: "var(--color-bg)",
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--hero-grid-dot) 1.2px, transparent 0)",
          backgroundSize: "16px 16px",
        }}
      >
        {/* Primary glow - left side */}
        <div className="absolute left-[20%] top-[30%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--hero-grid-accent),transparent_60%)] blur-3xl opacity-50" />
        {/* Secondary glow - right side */}
        <div className="absolute right-[10%] top-[50%] h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--hero-grid-accent),transparent_70%)] blur-3xl opacity-30" />
      </div>

      <div className="mx-auto w-full max-w-[1700px] px-6 sm:px-10 lg:px-24 xl:px-32 pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-20 items-center">
          {/* Left - Text Content */}
          <div className="animate-fade-in-up">
            {/* Badge */}
            <div className="mb-6 sm:mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-soft)]">
              <svg
                className="w-4 h-4 text-[var(--color-primary)]"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                />
              </svg>
              <span className="text-[var(--color-subtle)]">
                AI-Powered Health Analysis
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.08] text-[var(--color-heading)]">
              Your Health,
              <br />
              <span className="text-[var(--color-primary)]">Decoded</span>
              <br />
              with AI Precision
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg sm:text-xl text-[var(--color-subtle)] leading-relaxed max-w-xl">
              Transform medical reports and facial photos into actionable
              health insights. Scan, analyze, and understand your wellness
              with advanced computer vision.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-7 py-3.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] hover:bg-[var(--color-primary-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] transition-all hover:shadow-[var(--shadow-strong)] hover:-translate-y-0.5"
              >
                Get Started
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-7 py-3.5 text-sm font-semibold text-[var(--color-foreground)] shadow-[var(--shadow-soft)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all hover:-translate-y-0.5"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z"
                  />
                </svg>
                See How It Works
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
              {/* User Avatars */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[
                    "bg-[#037BFC]",
                    "bg-[#0260c9]",
                    "bg-[#3d9dfd]",
                    "bg-[#0b1220]",
                  ].map((bg, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full ${bg} border-2 border-[var(--color-bg)] flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {["A", "S", "M", "R"][i]}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-[var(--color-subtle)]">
                  Trusted by users
                </span>
              </div>

              <div className="hidden sm:block h-4 w-px bg-[var(--color-border)]" />

              <span className="text-sm text-[var(--color-subtle)]">
                Free forever &bull; No credit card
              </span>
            </div>
          </div>

          {/* Right - Illustration with Floating Cards */}
          <div className="relative flex items-center justify-center lg:justify-end">
            {/* Main SVG Illustration */}
            <div className="relative w-full max-w-lg lg:max-w-xl">
              <img
                src="/hero-section.svg"
                alt="SehatScan AI Health Analysis"
                className="w-full h-auto animate-float drop-shadow-lg"
                style={{ animationDuration: "5s" }}
              />

              {/* Floating Card - Top Left: Report Accuracy */}
              <div
                className="absolute -top-2 -left-4 sm:top-0 sm:-left-6 animate-float"
                style={{ animationDuration: "4s" }}
              >
                <div className="flex items-center gap-2.5 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] px-4 py-3 shadow-[var(--shadow-strong)]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary-soft)]">
                    <svg
                      className="w-5 h-5 text-[var(--color-primary)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-base font-bold text-[var(--color-primary)]">
                      98%
                    </div>
                    <div className="text-xs text-[var(--color-subtle)]">
                      Accuracy Rate
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Card - Top Right: Conditions */}
              <div
                className="absolute -top-4 -right-2 sm:-top-2 sm:-right-4 animate-float"
                style={{ animationDuration: "5s", animationDelay: "1s" }}
              >
                <div className="flex items-center gap-2.5 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] px-4 py-3 shadow-[var(--shadow-strong)]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary-soft)]">
                    <svg
                      className="w-5 h-5 text-[var(--color-primary)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-base font-bold text-[var(--color-heading)]">
                      15+
                    </div>
                    <div className="text-xs text-[var(--color-subtle)]">
                      Conditions Detected
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Card - Bottom Right: Instant Analysis */}
              <div
                className="absolute -bottom-2 -right-2 sm:bottom-4 sm:-right-6 animate-float"
                style={{ animationDuration: "4.5s", animationDelay: "0.5s" }}
              >
                <div className="flex items-center gap-2.5 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] px-4 py-3 shadow-[var(--shadow-strong)]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary-soft)]">
                    <svg
                      className="w-5 h-5 text-[var(--color-primary)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-base font-bold text-[var(--color-heading)]">
                      Instant
                    </div>
                    <div className="text-xs text-[var(--color-subtle)]">
                      AI Analysis
                    </div>
                  </div>
                </div>
              </div>

              {/* Blue glow behind illustration */}
              <div
                aria-hidden="true"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] -z-10 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(3,123,252,0.2) 0%, rgba(3,123,252,0.08) 40%, transparent 65%)" }}
              />
              {/* Decorative rings */}
              <div aria-hidden="true" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] -z-10 rounded-full border border-[var(--color-border)] opacity-40" />
              <div aria-hidden="true" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] -z-10 rounded-full border border-dashed border-[var(--color-border)] opacity-20 animate-spin-slow" />
            </div>
          </div>
        </div>

      </div>

      {/* Scroll Indicator - pinned to bottom */}
      <div className="hidden lg:flex flex-col items-center pb-8 animate-fade-in" style={{ animationDelay: "0.8s" }}>
        <span className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] mb-3">
          Scroll to Explore
        </span>
        <div className="w-5 h-9 rounded-full border-2 border-[var(--color-border)] flex justify-center pt-2">
          <div className="w-1 h-2 rounded-full bg-[var(--color-primary)] animate-bounce-slow" />
        </div>
      </div>
    </section>
  );
}
