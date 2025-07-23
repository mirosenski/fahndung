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
    console.error("Global Error:", error);
  }, [error]);

  return (
    <html lang="de">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
          <div className="text-center">
            <div className="mb-8 text-6xl">⚠️</div>
            <h1 className="mb-4 text-2xl font-bold">
              Ein Fehler ist aufgetreten
            </h1>
            <p className="mb-8 text-gray-600 dark:text-gray-400">
              Es ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es
              erneut.
            </p>
            <button
              onClick={reset}
              className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
