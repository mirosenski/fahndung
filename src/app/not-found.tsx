"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-8 text-8xl">404</div>
          <h1 className="mb-4 text-2xl font-bold">Seite nicht gefunden</h1>
          <p className="mb-8 text-gray-600 dark:text-gray-400">
            Die angeforderte Seite existiert nicht oder wurde verschoben.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              <Home className="h-4 w-4" />
              <span>Startseite</span>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Zurück</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
