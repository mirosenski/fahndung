export interface ApiError {
  message: string;
  code?: string;
  details?: string;
  status?: number;
}

// Spezifische Fahndungs-API-Fehler
export interface FahndungsApiError {
  title: string;
  case_number: string;
  description: string;
  short_description: string;
  status: string;
  priority: string;
  category: string;
  location: string;
  station: string;
  contact_info: string;
  features: string;
  date: string;
}

export function isFahndungsApiError(
  error: unknown,
): error is FahndungsApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "title" in error &&
    "case_number" in error
  );
}

export interface DatabaseError {
  message: string;
  code: string;
  details?: string;
  hint?: string;
}

export interface ValidationError {
  message: string;
  field?: string;
  value?: unknown;
}

export interface AuthError {
  message: string;
  code: string;
  status?: number;
}

export interface StorageError {
  message: string;
  code: string;
  statusCode?: string;
  error?: string;
}

export type AppError =
  | ApiError
  | DatabaseError
  | ValidationError
  | AuthError
  | StorageError
  | Error;

// Type Guards
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as ApiError).message === "string"
  );
}

export function isDatabaseError(error: unknown): error is DatabaseError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "code" in error &&
    typeof (error as DatabaseError).message === "string" &&
    typeof (error as DatabaseError).code === "string"
  );
}

export function isValidationError(error: unknown): error is ValidationError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as ValidationError).message === "string"
  );
}

export function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "code" in error &&
    typeof (error as AuthError).message === "string" &&
    typeof (error as AuthError).code === "string"
  );
}

export function isStorageError(error: unknown): error is StorageError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "code" in error &&
    typeof (error as StorageError).message === "string" &&
    typeof (error as StorageError).code === "string"
  );
}

// Error message helper
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    isApiError(error) ||
    isDatabaseError(error) ||
    isValidationError(error) ||
    isAuthError(error) ||
    isStorageError(error)
  ) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Ein unbekannter Fehler ist aufgetreten";
}

// Error detail helper
export function getErrorDetails(error: unknown): string | undefined {
  if (isDatabaseError(error)) {
    return error.details ?? error.hint;
  }

  if (isApiError(error)) {
    return error.details;
  }

  if (isValidationError(error) && error.field) {
    return `Feld: ${error.field}`;
  }

  return undefined;
}

// Error code helper
export function getErrorCode(error: unknown): string | undefined {
  if (isDatabaseError(error) || isAuthError(error) || isStorageError(error)) {
    return error.code;
  }

  if (isApiError(error)) {
    return error.code;
  }

  return undefined;
}

// Create error helpers
export function createApiError(
  message: string,
  code?: string,
  details?: string,
  status?: number,
): ApiError {
  return { message, code, details, status };
}

export function createDatabaseError(
  message: string,
  code: string,
  details?: string,
  hint?: string,
): DatabaseError {
  return { message, code, details, hint };
}

export function createValidationError(
  message: string,
  field?: string,
  value?: unknown,
): ValidationError {
  return { message, field, value };
}

export function createAuthError(
  message: string,
  code: string,
  status?: number,
): AuthError {
  return { message, code, status };
}

// Supabase error handler
export function handleSupabaseError(error: unknown): AppError {
  if (isDatabaseError(error)) {
    // Handle specific Supabase error codes
    switch (error.code) {
      case "23505": // unique_violation
        return createDatabaseError(
          "Dieser Wert existiert bereits",
          error.code,
          error.details,
        );
      case "23503": // foreign_key_violation
        return createDatabaseError(
          "Referenzierter Datensatz existiert nicht",
          error.code,
          error.details,
        );
      case "42501": // insufficient_privilege
        return createDatabaseError(
          "Keine Berechtigung für diese Aktion",
          error.code,
          error.details,
        );
      default:
        return error;
    }
  }

  if (isAuthError(error)) {
    switch (error.code) {
      case "invalid_credentials":
        return createAuthError("Ungültige Anmeldedaten", error.code, 401);
      case "user_not_found":
        return createAuthError("Benutzer nicht gefunden", error.code, 404);
      case "email_not_confirmed":
        return createAuthError(
          "E-Mail-Adresse noch nicht bestätigt",
          error.code,
          403,
        );
      default:
        return error;
    }
  }

  return error as AppError;
}

// Storage error handler
export function handleStorageError(error: unknown): string {
  if (isStorageError(error)) {
    switch (error.statusCode) {
      case "413":
        return "Datei ist zu groß";
      case "415":
        return "Dateityp wird nicht unterstützt";
      case "403":
        return "Keine Berechtigung zum Hochladen";
      default:
        return error.message;
    }
  }

  return getErrorMessage(error);
}
