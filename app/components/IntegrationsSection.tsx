export default function IntegrationsSection() {
  const integrations = [
    {
      name: "Next.js",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg",
    },
    {
      name: "TypeScript",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg",
    },
    {
      name: "TailwindCSS",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg",
    },
    {
      name: "Vercel",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vercel/vercel-original.svg",
    },
    {
      name: "AWS",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg",
    },
    {
      name: "Docker",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg",
    },
    {
      name: "Python",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg",
    },
    {
      name: "FastAPI",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg",
    },
    {
      name: "OpenCV",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/opencv/opencv-original.svg",
    },
    {
      name: "Supabase",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/supabase/supabase-original.svg",
    },
    {
      name: "PostgreSQL",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg",
    },
    {
      name: "Prisma",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/prisma/prisma-original.svg",
    },
  ];

  return (
    <section
      id="integrations"
      className="py-24 text-[var(--color-foreground)] relative overflow-hidden bg-[var(--color-bg)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-4 text-[var(--color-heading)]">
            Don&apos;t Replace.{" "}
            <span className="text-[var(--color-primary)]">Integrate.</span>
          </h2>
          <p className="text-base sm:text-lg text-[var(--color-subtle)] max-w-2xl mx-auto px-4">
            Built with industry-leading technologies for reliability and
            performance.
          </p>
        </div>

        {/* Integration Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8 md:gap-12 max-w-4xl mx-auto">
          {integrations.map((integration, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center space-y-3 group relative"
            >
              {/* Tooltip */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-[var(--color-foreground)] text-[var(--color-bg)] text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg z-10">
                {integration.name}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="border-4 border-transparent border-t-[var(--color-foreground)]"></div>
                </div>
              </div>

              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <img
                  src={integration.icon}
                  alt={integration.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xs font-medium text-[var(--color-subtle)] group-hover:text-[var(--color-foreground)] transition-colors text-center hidden sm:block">
                {integration.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
