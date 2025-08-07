import { toast } from "./toast";
import {
  getErrorMessage,
  getErrorDetails,
  handleSupabaseError,
  handleStorageError,
  type AppError,
} from "~/types/errors";

// Toast error handler
export function showErrorToast(error: unknown): void {
  const message = getErrorMessage(error);
  const details = getErrorDetails(error);

  if (details) {
    toast.error(`${message} - ${details}`);
  } else {
    toast.error(message);
  }
}

// Error Handler für häufige Browser-Fehler

// 1. Message Port Error Handler
export function handleMessagePortError(error: unknown): boolean {
  if (
    error instanceof Error &&
    (error.message.includes("message port closed") ||
      error.message.includes(
        "The message port closed before a response was received",
      ))
  ) {
    console.log(
      "ℹ️ Message Port Error (normal bei Tab-Wechsel):",
      error.message,
    );
    return true; // Fehler behandelt
  }
  return false; // Fehler nicht behandelt
}

// 2. Filesystem Error Handler
export function handleFilesystemError(error: unknown): boolean {
  if (
    error instanceof Error &&
    (error.message.includes("filesystem") ||
      error.message.includes("storage") ||
      error.message.includes("localStorage"))
  ) {
    console.log("ℹ️ Filesystem Error (normal):", error.message);
    return true; // Fehler behandelt
  }
  return false; // Fehler nicht behandelt
}

// 3. 403 Auth Fehler Handler
export function handle403AuthError(error: unknown): boolean {
  if (
    error instanceof Error &&
    (error.message.includes("403") ||
      error.message.includes("Forbidden") ||
      error.message.includes("auth/v1/logout") ||
      error.message.includes("Unauthorized"))
  ) {
    console.log("ℹ️ 403 Auth-Fehler (normal bei Logout):", error.message);
    return true; // Fehler behandelt
  }
  return false; // Fehler nicht behandelt
}

// Kombinierter Error Handler für alle drei Fehler
export function handleCommonErrors(error: unknown, context?: string): boolean {
  // Prüfe alle drei spezifischen Fehler
  if (handleMessagePortError(error)) {
    return true;
  }

  if (handleFilesystemError(error)) {
    return true;
  }

  if (handle403AuthError(error)) {
    return true;
  }

  // Wenn keiner der spezifischen Fehler, logge normal
  logError(error, context);
  return false;
}

// Standard Error Logger
function logError(error: unknown, context?: string): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`❌ ${context ? `[${context}] ` : ""}Error:`, errorMessage);
}

// Global Error Handler für Browser
export function setupGlobalErrorHandlers(): void {
  if (typeof window === "undefined") return;

  const originalOnError = window.onerror;
  const originalOnUnhandledRejection = window.onunhandledrejection;

  // Error Handler
  window.onerror = function (message, source, lineno, colno, error) {
    const errorMessage =
      typeof message === "string" ? message : "Unknown error";
    if (handleCommonErrors(error ?? new Error(errorMessage), "Global")) {
      return true; // Fehler behandelt
    }

    // Fallback zu original handler
    if (originalOnError) {
      return Boolean(
        originalOnError.call(this, message, source, lineno, colno, error),
      );
    }
    return false;
  };

  // Unhandled Rejection Handler
  window.onunhandledrejection = function (event) {
    if (handleCommonErrors(event.reason, "UnhandledRejection")) {
      event.preventDefault(); // Verhindere Standard-Behandlung
      return;
    }

    // Fallback zu original handler
    if (originalOnUnhandledRejection) {
      originalOnUnhandledRejection.call(window, event);
    }
  };
}

// Cleanup Function
export function cleanupGlobalErrorHandlers(): void {
  if (typeof window === "undefined") return;

  // Restore original handlers if needed
  window.onerror = null;
  window.onunhandledrejection = null;
}

// Async error wrapper
export async function handleAsyncError<T>(
  promise: Promise<T>,
  context?: string,
): Promise<T | null> {
  try {
    return await promise;
  } catch (error: unknown) {
    logError(error, context);
    showErrorToast(error);
    return null;
  }
}

// Supabase error handler
export function handleSupabaseOperation<T>(
  operation: () => Promise<T>,
  context?: string,
): Promise<T | null> {
  return handleAsyncError(
    operation().then((result) => {
      if (result && typeof result === "object" && "error" in result) {
        const error = (result as { error: unknown }).error;
        if (error) {
          const handledError = handleSupabaseError(error);
          if (handledError instanceof Error) {
            throw handledError;
          } else {
            throw new Error(getErrorMessage(handledError));
          }
        }
      }
      return result;
    }),
    context,
  );
}

// Storage error handler
export function handleStorageOperation<T>(
  operation: () => Promise<T>,
  context?: string,
): Promise<T | null> {
  return handleAsyncError(
    operation().catch((error: unknown) => {
      const message = handleStorageError(error);
      throw new Error(message);
    }),
    context,
  );
}

// Form error handler
export function handleFormError(error: unknown, field?: string): string {
  const message = getErrorMessage(error);

  if (field) {
    return `${field}: ${message}`;
  }

  return message;
}

// API error handler
export function handleApiError(error: unknown): AppError {
  if (error instanceof Error) {
    return error;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    const appError = error as { message: string };
    return { message: appError.message } as AppError;
  }

  return new Error(getErrorMessage(error));
}

// Validation error handler
export function handleValidationError(
  error: unknown,
  fieldName?: string,
): string {
  const message = getErrorMessage(error);

  if (fieldName) {
    return `${fieldName}: ${message}`;
  }

  return message;
}

// Error boundary helper
export function isErrorBoundaryError(error: unknown): boolean {
  return error instanceof Error && error.name === "ErrorBoundary";
}

// Network error handler
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("network") ||
      error.message.includes("fetch") ||
      error.message.includes("timeout")
    );
  }

  return false;
}

// Retry helper
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000,
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error;

      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError;
}

// Global error handler
export function handleGlobalError(error: unknown, context?: string): void {
  // Prüfe zuerst die spezifischen Fehler
  if (handleCommonErrors(error, context)) {
    return; // Fehler bereits behandelt
  }

  // Dann normale Fehlerbehandlung
  const message = getErrorMessage(error);
  const details = getErrorDetails(error);

  console.error(`[${context ?? "Global Error"}]:`, {
    message,
    details,
    error,
  });

  // Zeige Toast nur für echte Fehler
  if (
    !handleMessagePortError(error) &&
    !handleFilesystemError(error) &&
    !handle403AuthError(error)
  ) {
    toast.error(message);
  }
}
