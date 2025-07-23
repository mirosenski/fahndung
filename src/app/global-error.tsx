"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error("Global Error:", error);

    // Optional: Send error to monitoring service
    // if (typeof window !== 'undefined') {
    //   // Hier könnte ein Error-Tracking-Service aufgerufen werden
    // }
  }, [error]);

  const handleReset = () => {
    try {
      reset();
    } catch (resetError) {
      console.error("Reset failed:", resetError);
      // Fallback: Reload the page
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      <div className="text-center">
        <div className="mb-8 text-6xl">⚠️</div>
        <h1 className="mb-4 text-2xl font-bold">Ein Fehler ist aufgetreten</h1>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          Es ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es
          erneut.
        </p>
        <div className="space-x-4">
          <button
            onClick={handleReset}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Erneut versuchen
          </button>
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.reload();
              }
            }}
            className="rounded-lg bg-gray-600 px-6 py-3 text-white transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Seite neu laden
          </button>
        </div>
      </div>
    </div>
  );
}
