interface LogoSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export default function LogoSpinner({
  message = "Loading...",
  size = "md",
}: LogoSpinnerProps) {
  const sizeClasses = {
    sm: { container: "h-10 w-10", logo: "h-6 w-6", ring: "h-14 w-14 -m-2" },
    md: { container: "h-16 w-16", logo: "h-10 w-10", ring: "h-20 w-20 -m-2" },
    lg: { container: "h-20 w-20", logo: "h-12 w-12", ring: "h-24 w-24 -m-2" },
  };

  const sizes = sizeClasses[size];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div
          className={`${sizes.container} rounded-2xl  flex items-center justify-center`}
        >
          <img src="/logo.svg" alt="SehatScan" className={sizes.logo} />
        </div>
        <div className={`absolute inset-0 ${sizes.ring}`}>
          <div className="h-full w-full rounded-full border-4 border-transparent border-t-[var(--color-primary)] animate-spin" />
        </div>
      </div>
      {message && (
        <p className="text-sm text-[var(--color-muted)]">{message}</p>
      )}
    </div>
  );
}
