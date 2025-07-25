"use client";

import { useEffect, useState } from "react";
import { AlertCircle, FileText, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { api } from "~/trpc/react";
import PageLayout from "~/components/layout/PageLayout";

interface Investigation {
  id: string;
  title: string;
  case_number: string;
  category: string;
  status: string;
  created_at: string;
}

export default function FahndungenPage() {
  const [error, setError] = useState<string | null>(null);

  // tRPC Query für Fahndungen
  const { data: investigations = [], isLoading: loading, error: queryError } = api.post.getInvestigations.useQuery(
    {
      limit: 50,
      offset: 0,
    },
    {
      onError: (error) => {
        console.error("❌ Fehler beim Laden der Fahndungen:", error);
        setError(`Fehler beim Laden der Fahndungen: ${error.message}`);
      },
      onSuccess: (data) => {
        console.log("✅ Geladene Fahndungen:", data);
        console.log("📊 Anzahl Fahndungen:", data.length);
      },
      retry: 3,
      retryDelay: 1000,
    }
  );

  // Loading State
  if (loading) {
    return (
      <PageLayout variant="dashboard">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Fahndungen werden geladen...
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Error State
  if (error) {
    return (
      <PageLayout variant="dashboard">
        <div className="flex min-h-screen items-center justify-center">
          <div className="max-w-md text-center">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Fehler beim Laden
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Success State
  return (
    <PageLayout variant="dashboard">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-lg bg-white shadow dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Fahndungen
              </h1>
              <Link
                href="/fahndungen/neu"
                className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <Plus className="h-4 w-4" />
                <span>Neue Fahndung</span>
              </Link>
            </div>

            <div className="p-6">
              {investigations.length === 0 ? (
                // Empty State
                <div className="py-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <p className="mt-4 text-gray-500 dark:text-gray-400">
                    Keine Fahndungen vorhanden.
                  </p>
                  <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                    Erstellen Sie Ihre erste Fahndung, um zu beginnen.
                  </p>
                </div>
              ) : (
                // Data List
                <div className="space-y-4">
                  {investigations.map((inv) => (
                    <div
                      key={inv.id}
                      className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {inv.title}
                          </h3>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>#{inv.case_number}</span>
                            <span>•</span>
                            <span>{getCategoryLabel(inv.category)}</span>
                            <span>•</span>
                            <span className={getStatusColor(inv.status)}>
                              {getStatusLabel(inv.status)}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(inv.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

// Helper Funktionen
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    WANTED_PERSON: "Straftäter",
    MISSING_PERSON: "Vermisste Person",
    UNKNOWN_DEAD: "Unbekannte Tote",
    STOLEN_GOODS: "Sachen",
  };
  return labels[category] ?? category;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: "Entwurf",
    active: "Aktiv",
    published: "Veröffentlicht",
    closed: "Geschlossen",
  };
  return labels[status] ?? status;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: "text-gray-500 dark:text-gray-400",
    active: "text-green-600 dark:text-green-400",
    published: "text-blue-600 dark:text-blue-400",
    closed: "text-red-600 dark:text-red-400",
  };
  return colors[status] ?? "text-gray-500 dark:text-gray-400";
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}
