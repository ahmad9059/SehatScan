export default function TechBanner() {
  return (
    <section className="py-20 bg-[var(--color-surface)] border-y border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center animate-fade-in-up">
          <p className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-wider mb-6">
            ⚡ Powered by Advanced Technology
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-heading)] mb-6 leading-tight">
            Latest advanced technologies to
          </h2>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-heading)] mb-8 leading-tight">
            ensure{" "}
            <span className="text-[var(--color-primary)]">everything you need</span>
          </h2>
          <p className="text-lg md:text-xl text-[var(--color-subtle)] max-w-3xl mx-auto leading-relaxed">
            Harness the power of modern AI, computer vision, and cloud
            infrastructure to deliver accurate health insights in real-time with
            enterprise-grade security.
          </p>
        </div>
      </div>
    </section>
  );
}
