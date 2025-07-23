"use client";

import { RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
  type?: "loading" | "error" | "timeout";
  onRetry?: () => void;
  showRetry?: boolean;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({
  message = "Lade...",
  subMessage,
  type = "loading",
  onRetry,
  showRetry = false,
  size = "md",
}: LoadingSpinnerProps) {
  const [isClient, setIsClient] = useState(false);

  // Client-seitige Hydration-Behandlung
  useEffect(() => {
    setIsClient(true);
  }, []);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const containerClasses = {
    sm: "p-4",
    md: "p-8",
    lg: "p-12",
  };

  // Server-seitiges Rendering - einfache Version ohne Animation
  if (!isClient) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center ${containerClasses[size]}`}
      >
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div
              className={`${sizeClasses[size]} rounded-full border-2 border-gray-300 border-t-blue-500`}
            />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            {message}
          </h2>
          {subMessage && (
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              {subMessage}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Client-seitiges Rendering - vollständige Version mit Animation
  return (
    <div
      className={`flex min-h-screen items-center justify-center ${containerClasses[size]}`}
    >
      <div className="text-center">
        {/* Optimierter Spinner mit CSS-Animation */}
        <div className="mb-4 flex justify-center">
          {type === "loading" ? (
            <div
              className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-500`}
            />
          ) : type === "error" ? (
            <div className={`${sizeClasses[size]} text-red-500`}>
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          ) : (
            <div className={`${sizeClasses[size]} text-yellow-500`}>
              <RefreshCw className="h-full w-full animate-spin" />
            </div>
          )}
        </div>

        {/* Message */}
        <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          {message}
        </h2>

        {/* Sub Message */}
        {subMessage && (
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {subMessage}
          </p>
        )}

        {/* Retry Button */}
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Erneut versuchen</span>
          </button>
        )}

        {/* Progress Bar für bessere UX - nur client-seitig */}
        {type === "loading" && isClient && (
          <div className="mt-4 w-48 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-1 animate-pulse bg-blue-500 transition-all duration-1000 ease-out"
              style={{ transitionDuration: "1000ms" }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}
