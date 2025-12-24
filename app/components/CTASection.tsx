import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-24 text-[var(--color-foreground)] relative overflow-hidden bg-[var(--color-bg)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight px-4 text-[var(--color-heading)]">
            Discover the full scale of{" "}
            <span className="text-[var(--color-primary)]">SehatScan</span>{" "}
            capabilities
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-[var(--color-subtle)] mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
            Start analyzing your health data today with our AI-powered platform.
            Get instant insights and take control of your wellness journey with
            cutting-edge technology.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <Link
              href="/register"
              className="px-8 sm:px-10 py-3 sm:py-4 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-strong)] transition-all transform hover:scale-105 text-center font-bold shadow-xl text-base sm:text-lg"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-8 sm:px-10 py-3 sm:py-4 bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-foreground)] rounded-xl hover:bg-[var(--color-surface)] transition-all transform hover:scale-105 text-center font-bold shadow-xl text-base sm:text-lg"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
