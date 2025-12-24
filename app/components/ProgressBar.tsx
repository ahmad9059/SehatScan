interface ProgressBarProps {
  progress: number; // 0-100
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "success" | "warning" | "error";
  className?: string;
  label?: string;
}

export default function ProgressBar({
  progress,
  showPercentage = true,
  size = "md",
  color = "primary",
  className = "",
  label,
}: ProgressBarProps) {
  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const colorClasses = {
    primary: "bg-[var(--color-primary)]",
    success: "bg-[var(--color-success)]",
    warning: "bg-[var(--color-warning)]",
    error: "bg-[var(--color-danger)]",
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-[var(--color-foreground)]">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm text-[var(--color-subtle)]">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-[var(--color-surface)] rounded-full ${sizeClasses[size]}`}
      >
        <div
          className={`${sizeClasses[size]} rounded-full transition-all duration-300 ease-out ${colorClasses[color]}`}
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label || `Progress: ${Math.round(clampedProgress)}%`}
        />
      </div>
    </div>
  );
}
