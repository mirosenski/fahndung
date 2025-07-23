"use client";

import { Search, AlertTriangle, User, MapPin, Eye } from "lucide-react";
import { api } from "~/trpc/react";

// Typen für Fahndungen
interface Investigation {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  tags?: string[];
  location?: string;
  created_at: string;
  updated_at: string;
}

export default function HomeContent() {
  // tRPC Queries und Mutations
  const { data: investigations } = api.post.getInvestigations.useQuery({
    limit: 10,
    offset: 0,
  });

  return (
    <>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Fahndungen durchsuchen..."
              className="input-dark-mode px-10 py-3"
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Aktive Fahndungen
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {investigations?.filter(
                    (i) => (i as Investigation).status === "active",
                  ).length ?? 0}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Vermisste Personen
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {investigations?.filter((i) =>
                    (i as Investigation).tags?.includes("vermisst"),
                  ).length ?? 0}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <MapPin className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Standorte
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {investigations?.filter((i) => (i as Investigation).location)
                    .length ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Investigations List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Aktuelle Fahndungen
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Eye className="h-4 w-4" />
              <span>{investigations?.length ?? 0} Fahndungen</span>
            </div>
          </div>

          {investigations && investigations.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {investigations.map((investigation) => {
                const inv = investigation as Investigation;
                return (
                  <div
                    key={inv.id}
                    className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                          {inv.title}
                        </h3>
                        <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                          {inv.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            inv.priority === "high"
                              ? "bg-red-500/20 text-red-600 dark:text-red-400"
                              : inv.priority === "medium"
                                ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                                : "bg-green-500/20 text-green-600 dark:text-green-400"
                          }`}
                        >
                          {inv.priority}
                        </span>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            inv.status === "active"
                              ? "bg-green-500/20 text-green-600 dark:text-green-400"
                              : "bg-gray-500/20 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                    </div>

                    {inv.location && (
                      <div className="mb-3 flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {inv.location}
                        </span>
                      </div>
                    )}

                    {inv.tags && inv.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {inv.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-600 dark:text-blue-400"
                          >
                            {tag}
                          </span>
                        ))}
                        {inv.tags.length > 3 && (
                          <span className="rounded-full bg-gray-500/20 px-2 py-1 text-xs text-gray-600 dark:text-gray-400">
                            +{inv.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Keine Fahndungen gefunden
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Es sind noch keine Fahndungen in der Datenbank vorhanden.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
