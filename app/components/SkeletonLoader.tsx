interface SkeletonLoaderProps {
  className?: string;
  variant?: "text" | "rectangular" | "circular" | "card";
  width?: string | number;
  height?: string | number;
  lines?: number; // For text variant
}

export default function SkeletonLoader({
  className = "",
  variant = "rectangular",
  width,
  height,
  lines = 1,
}: SkeletonLoaderProps) {
  const baseClasses = "animate-pulse bg-gray-200 dark:bg-gray-700";

  const getVariantClasses = () => {
    switch (variant) {
      case "text":
        return "rounded h-4";
      case "circular":
        return "rounded-full";
      case "card":
        return "rounded-lg";
      case "rectangular":
      default:
        return "rounded";
    }
  };

  const getStyle = () => {
    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === "number" ? `${width}px` : width;
    if (height)
      style.height = typeof height === "number" ? `${height}px` : height;
    return style;
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${getVariantClasses()}`}
            style={getStyle()}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${getVariantClasses()} ${className}`}
      style={getStyle()}
    />
  );
}

// Pre-built skeleton components for common use cases
export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <div className="animate-pulse">
        <div className="flex items-center space-x-4 mb-4">
          <SkeletonLoader variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <SkeletonLoader variant="text" width="60%" />
            <SkeletonLoader variant="text" width="40%" />
          </div>
        </div>
        <SkeletonLoader variant="text" lines={3} className="mb-4" />
        <div className="flex justify-between items-center">
          <SkeletonLoader variant="text" width="30%" />
          <SkeletonLoader variant="rectangular" width={80} height={32} />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <div className="animate-pulse">
        <div className="flex items-center">
          <SkeletonLoader
            variant="circular"
            width={32}
            height={32}
            className="mr-4"
          />
          <div className="flex-1">
            <SkeletonLoader variant="text" width="70%" className="mb-2" />
            <SkeletonLoader variant="text" width="40%" height={24} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableRowSkeleton({
  columns = 4,
  className = "",
}: {
  columns?: number;
  className?: string;
}) {
  return (
    <div
      className={`p-4 border-b border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div
        className="animate-pulse grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <SkeletonLoader key={index} variant="text" />
        ))}
      </div>
    </div>
  );
}
