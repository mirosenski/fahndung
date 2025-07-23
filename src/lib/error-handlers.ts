import { toast } from "sonner";
import {
  getErrorMessage,
  getErrorCode,
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

// Console error logger
export function logError(error: unknown, context?: string): void {
  const message = getErrorMessage(error);
  const code = getErrorCode(error);
  const details = getErrorDetails(error);

  console.error(`[${context ?? "Error"}]:`, {
    message,
    code,
    details,
    error,
  });
}

// Spezifische Handler für die drei Fehler

// 1. Message Port Fehler Handler
export function handleMessagePortError(error: unknown): boolean {
  if (error instanceof Error && error.message.includes("message port closed")) {
    console.log(
      "ℹ️ Message Port Fehler (normal bei Auth-Listener):",
      error.message,
    );
    return true; // Fehler behandelt
  }
  return false; // Fehler nicht behandelt
}

// 2. Filesystem Fehler Handler
export function handleFilesystemError(error: unknown): boolean {
  if (error instanceof Error && error.message.includes("illegal path")) {
    console.log(
      "ℹ️ Filesystem Pfad-Fehler (normal bei Next.js):",
      error.message,
    );
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
      error.message.includes("auth/v1/logout"))
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

  if (typeof error === "object" && error !== null) {
    return error as AppError;
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
