import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface NetworkErrorDiagnosticProps {
  error: Error | string;
  onRetry: () => void;
  className?: string;
}

export const NetworkErrorDiagnostic: React.FC<NetworkErrorDiagnosticProps> = ({
  error,
  onRetry,
  className = "",
}) => {
  const errorMessage = typeof error === "string" ? error : error.message;

  return (
    <div
      className={`flex flex-col items-center justify-center p-6 text-center ${className}`}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-muted-foreground dark:text-white">
        Netzwerkfehler
      </h3>

      <p className="mb-4 max-w-sm text-sm text-muted-foreground dark:text-muted-foreground">
        {errorMessage || "Ein Fehler ist beim Laden der Daten aufgetreten."}
      </p>

      <button
        onClick={onRetry}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      >
        <RefreshCw className="h-4 w-4" />
        Erneut versuchen
      </button>
    </div>
  );
};
