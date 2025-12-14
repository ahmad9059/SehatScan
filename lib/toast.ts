import toast from "react-hot-toast";

// Toast notification utility with consistent styling and error handling

export interface ToastOptions {
  duration?: number;
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
  style?: React.CSSProperties;
  className?: string;
  icon?: string;
  iconTheme?: {
    primary: string;
    secondary: string;
  };
}

// Default toast options
const defaultOptions: ToastOptions = {
  duration: 4000,
  position: "top-right",
};

// Success toast
export function showSuccessToast(message: string, options?: ToastOptions) {
  const mergedOptions = { ...defaultOptions, ...options };

  return toast.success(message, {
    duration: mergedOptions.duration,
    position: mergedOptions.position,
    style: {
      background: "#10B981",
      color: "#fff",
      fontWeight: "500",
      ...mergedOptions.style,
    },
    iconTheme: {
      primary: "#fff",
      secondary: "#10B981",
      ...mergedOptions.iconTheme,
    },
    className: mergedOptions.className,
  });
}

// Error toast
export function showErrorToast(message: string, options?: ToastOptions) {
  const mergedOptions = { ...defaultOptions, duration: 6000, ...options }; // Longer duration for errors

  return toast.error(message, {
    duration: mergedOptions.duration,
    position: mergedOptions.position,
    style: {
      background: "#EF4444",
      color: "#fff",
      fontWeight: "500",
      ...mergedOptions.style,
    },
    iconTheme: {
      primary: "#fff",
      secondary: "#EF4444",
      ...mergedOptions.iconTheme,
    },
    className: mergedOptions.className,
  });
}

// Warning toast
export function showWarningToast(message: string, options?: ToastOptions) {
  const mergedOptions = { ...defaultOptions, duration: 5000, ...options };

  return toast(message, {
    duration: mergedOptions.duration,
    position: mergedOptions.position,
    icon: "⚠️",
    style: {
      background: "#F59E0B",
      color: "#fff",
      fontWeight: "500",
      ...mergedOptions.style,
    },
    className: mergedOptions.className,
  });
}

// Info toast
export function showInfoToast(message: string, options?: ToastOptions) {
  const mergedOptions = { ...defaultOptions, ...options };

  return toast(message, {
    duration: mergedOptions.duration,
    position: mergedOptions.position,
    icon: "ℹ️",
    style: {
      background: "#3B82F6",
      color: "#fff",
      fontWeight: "500",
      ...mergedOptions.style,
    },
    className: mergedOptions.className,
  });
}

// Loading toast
export function showLoadingToast(message: string, options?: ToastOptions) {
  const mergedOptions = { ...defaultOptions, duration: Infinity, ...options };

  return toast.loading(message, {
    duration: mergedOptions.duration,
    position: mergedOptions.position,
    style: {
      background: "#6B7280",
      color: "#fff",
      fontWeight: "500",
      ...mergedOptions.style,
    },
    className: mergedOptions.className,
  });
}

// Promise toast - shows loading, then success/error
export function showPromiseToast<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  },
  options?: ToastOptions
) {
  const mergedOptions = { ...defaultOptions, ...options };

  return toast.promise(
    promise,
    {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    },
    {
      position: mergedOptions.position,
      style: mergedOptions.style,
      className: mergedOptions.className,
      success: {
        duration: 4000,
        style: {
          background: "#10B981",
          color: "#fff",
          fontWeight: "500",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#10B981",
        },
      },
      error: {
        duration: 6000,
        style: {
          background: "#EF4444",
          color: "#fff",
          fontWeight: "500",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#EF4444",
        },
      },
      loading: {
        style: {
          background: "#6B7280",
          color: "#fff",
          fontWeight: "500",
        },
      },
    }
  );
}

// Dismiss specific toast
export function dismissToast(toastId: string) {
  toast.dismiss(toastId);
}

// Dismiss all toasts
export function dismissAllToasts() {
  toast.dismiss();
}

// Custom toast with full control
export function showCustomToast(
  message: string,
  type:
    | "success"
    | "error"
    | "warning"
    | "info"
    | "loading"
    | "custom" = "custom",
  options?: ToastOptions
) {
  const mergedOptions = { ...defaultOptions, ...options };

  switch (type) {
    case "success":
      return showSuccessToast(message, options);
    case "error":
      return showErrorToast(message, options);
    case "warning":
      return showWarningToast(message, options);
    case "info":
      return showInfoToast(message, options);
    case "loading":
      return showLoadingToast(message, options);
    default:
      return toast(message, {
        duration: mergedOptions.duration,
        position: mergedOptions.position,
        style: mergedOptions.style,
        className: mergedOptions.className,
        icon: mergedOptions.icon,
        iconTheme: mergedOptions.iconTheme,
      });
  }
}

// Handle server action responses with automatic toast notifications
export function handleServerActionResponse(
  response: any,
  options?: {
    successMessage?: string;
    errorMessage?: string;
    showWarnings?: boolean;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
  }
) {
  const {
    successMessage = "Operation completed successfully",
    errorMessage,
    showWarnings = true,
    onSuccess,
    onError,
  } = options || {};

  if (response.success) {
    // Show success message
    showSuccessToast(successMessage);

    // Show warning if there was a save error but operation succeeded
    if (showWarnings && response.warning) {
      setTimeout(() => {
        showWarningToast(response.warning);
      }, 500);
    }

    // Call success callback
    if (onSuccess) {
      onSuccess(response.data);
    }

    return true;
  } else {
    // Determine error message
    let finalErrorMessage = errorMessage;

    if (!finalErrorMessage) {
      if (response.error) {
        finalErrorMessage = response.error;
      } else {
        finalErrorMessage = "An unexpected error occurred";
      }
    }

    // Show error toast
    showErrorToast(finalErrorMessage || "An unexpected error occurred");

    // Call error callback
    if (onError) {
      onError(response);
    }

    return false;
  }
}

// Utility to show validation errors
export function showValidationErrors(errors: Record<string, string>) {
  const errorMessages = Object.values(errors);

  if (errorMessages.length === 1) {
    showErrorToast(errorMessages[0]);
  } else if (errorMessages.length > 1) {
    showErrorToast(
      `Please fix the following errors:\n• ${errorMessages.join("\n• ")}`
    );
  }
}

// Network error handler
export function handleNetworkError(error: any) {
  console.error("Network error:", error);

  if (error.name === "AbortError") {
    showErrorToast("Request was cancelled");
  } else if (error.message?.includes("fetch")) {
    showErrorToast(
      "Unable to connect to the server. Please check your internet connection."
    );
  } else {
    showErrorToast("A network error occurred. Please try again.");
  }
}

// Rate limit error handler
export function handleRateLimitError() {
  showWarningToast(
    "Too many requests. Please wait a moment before trying again."
  );
}

// Authentication error handler
export function handleAuthError() {
  showErrorToast("Your session has expired. Please log in again.");
  // Could redirect to login page here
}

// File upload error handler
export function handleFileUploadError(error: any) {
  if (error.errorType === "validation") {
    showErrorToast(error.error);
  } else if (error.errorType === "timeout") {
    showErrorToast("Upload timed out. Please try with a smaller file.");
  } else if (error.errorType === "network") {
    showErrorToast(
      "Upload failed. Please check your connection and try again."
    );
  } else {
    showErrorToast("File upload failed. Please try again.");
  }
}

// Generic error handler for different error types
export function handleError(error: any, context?: string) {
  const timestamp = new Date().toISOString();
  console.error(
    `[${timestamp}] Error in ${context || "unknown context"}:`,
    error
  );

  if (error.errorType) {
    switch (error.errorType) {
      case "validation":
        showErrorToast(error.error);
        break;
      case "auth":
        handleAuthError();
        break;
      case "network":
        handleNetworkError(error);
        break;
      case "rate_limit":
        handleRateLimitError();
        break;
      case "timeout":
        showErrorToast("Request timed out. Please try again.");
        break;
      default:
        showErrorToast(error.error || "An unexpected error occurred");
    }
  } else if (typeof error === "string") {
    showErrorToast(error);
  } else if (error.message) {
    showErrorToast(error.message);
  } else {
    showErrorToast("An unexpected error occurred");
  }
}
