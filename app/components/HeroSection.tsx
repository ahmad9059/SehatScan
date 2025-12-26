import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative isolate px-6 pt-14 lg:px-8 min-h-screen flex items-center overflow-hidden bg-[var(--color-bg)] text-[var(--color-foreground)]">
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
        <div className="absolute left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--hero-grid-accent),transparent_60%)] blur-3xl opacity-60" />
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-3xl py-32 sm:py-48 lg:py-56">
        {/* Announcement Badge */}
        <div className="hidden sm:mb-8 sm:flex sm:justify-center animate-fade-in">
          <div className="relative rounded-full px-3 py-1 text-sm/6 text-[var(--color-subtle)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-soft)]">
            <svg
              className="w-3 h-3 text-[var(--color-primary)] inline mr-1.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            AI-Powered Health Analysis Platform.{" "}
            <a
              href="#features"
              className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-strong)]"
            >
              <span aria-hidden="true" className="absolute inset-0" />
              Read more <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-balance text-[var(--color-heading)]">
            One Tool To Manage{" "}
            <span className="text-[var(--color-primary)]">Health Reports</span>{" "}
            And Your Wellness
          </h1>
          <p className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl font-medium text-pretty text-[var(--color-subtle)] px-4 sm:px-0">
            Transform your medical reports and photos into actionable health
            insights using advanced AI and computer vision technology.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6">
            <Link
              href="/register"
              className="w-full sm:w-auto rounded-md bg-[var(--color-primary)] px-6 sm:px-3.5 py-3 sm:py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[var(--color-primary-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] transition-all transform hover:scale-105 text-center"
            >
              Get started
            </Link>
            <a
              href="#demo"
              className="text-sm sm:text-sm/6 font-semibold text-[var(--color-foreground)] hover:text-[var(--color-primary)]"
            >
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {/* Tech Icons */}
        <div className="mt-12 sm:mt-16 flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 opacity-80 animate-fade-in -ml-6">
          <div className="relative group">
            <div className="w-8 h-8 flex items-center justify-center">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg"
                alt="Python"
                className="w-full h-full object-contain group-hover:opacity-100 transition-opacity cursor-pointer"
              />
            </div>
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-[var(--color-foreground)] text-[var(--color-bg)] text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg z-10">
              Python
            </div>
          </div>

          <div className="relative group">
            <div className="w-8 h-8 flex items-center justify-center">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/opencv/opencv-original.svg"
                alt="OpenCV"
                className="w-full h-full object-contain group-hover:opacity-100 transition-opacity cursor-pointer"
              />
            </div>
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-[var(--color-foreground)] text-[var(--color-bg)] text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg z-10">
              OpenCV
            </div>
          </div>

          <div className="relative group">
            <div className="w-8 h-8 flex items-center justify-center">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg"
                alt="Next.js"
                className="w-full h-full object-contain group-hover:opacity-100 transition-opacity cursor-pointer dark:invert"
              />
            </div>
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-[var(--color-foreground)] text-[var(--color-bg)] text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg z-10">
              Next.js
            </div>
          </div>

          <div className="relative group">
            <div className="w-8 h-8 flex items-center justify-center">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg"
                alt="PostgreSQL"
                className="w-full h-full object-contain group-hover:opacity-100 transition-opacity cursor-pointer"
              />
            </div>
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-[var(--color-foreground)] text-[var(--color-bg)] text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg z-10">
              PostgreSQL
            </div>
          </div>

          <div className="relative group">
            <div className="w-8 h-8 flex items-center justify-center">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/supabase/supabase-original.svg"
                alt="Supabase"
                className="w-full h-full object-contain group-hover:opacity-100 transition-opacity cursor-pointer"
              />
            </div>
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-[var(--color-foreground)] text-[var(--color-bg)] text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg z-10">
              Supabase
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
