/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, User, MapPin, Eye } from "lucide-react";
import { api } from "~/trpc/react";
import StatusBadge from "@/components/ui/StatusBadge";
import FahndungFilter, { type FilterState } from "./FahndungFilter";

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
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    status: [],
    priority: [],
    category: [],
    timeRange: "all",
    searchTerm: "",
  });

  // tRPC Queries und Mutations
  const { data: investigations } = api.post.getInvestigations.useQuery({
    limit: 50,
    offset: 0,
  });

  // Gefilterte Fahndungen
  const filteredInvestigations = useMemo(() => {
    if (!investigations) return [];

    return investigations.filter((investigation) => {
      const inv = investigation as Investigation;

      // Suchbegriff Filter
      if (activeFilters.searchTerm) {
        const searchLower = activeFilters.searchTerm.toLowerCase();
        const matchesSearch =
          inv.title.toLowerCase().includes(searchLower) ||
          inv.description?.toLowerCase().includes(searchLower) ||
          inv.location?.toLowerCase().includes(searchLower) ||
          inv.tags?.some((tag) => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Status Filter
      if (
        activeFilters.status.length > 0 &&
        !activeFilters.status.includes(inv.status)
      ) {
        return false;
      }

      // Prioritäts Filter
      if (
        activeFilters.priority.length > 0 &&
        !activeFilters.priority.includes(inv.priority)
      ) {
        return false;
      }

      // Kategorie Filter (über Tags)
      if (activeFilters.category.length > 0) {
        const hasMatchingCategory = activeFilters.category.some((category) => {
          const categoryLower = category.toLowerCase();
          return inv.tags?.some((tag) =>
            tag.toLowerCase().includes(categoryLower),
          );
        });
        if (!hasMatchingCategory) return false;
      }

      // Zeit Filter
      if (activeFilters.timeRange !== "all") {
        const now = new Date();
        const timeRanges = {
          "24h": 24 * 60 * 60 * 1000,
          "7d": 7 * 24 * 60 * 60 * 1000,
          "30d": 30 * 24 * 60 * 60 * 1000,
        };
        const cutoff = new Date(
          now.getTime() - timeRanges[activeFilters.timeRange],
        );
        const investigationDate = new Date(inv.created_at);
        if (investigationDate < cutoff) return false;
      }

      return true;
    });
  }, [investigations, activeFilters]);

  // Filter-Handler
  const handleFilterChange = (filters: FilterState) => {
    setActiveFilters(filters);
  };

  return (
    <>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filter und Suche */}
        <div className="mb-8">
          <FahndungFilter onFilterChange={handleFilterChange} />
        </div>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gefilterte Fahndungen
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredInvestigations.length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Dringende Fälle
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {
                    filteredInvestigations.filter(
                      (i) => (i as Investigation).priority === "urgent",
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Vermisste Personen
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {
                    filteredInvestigations.filter((i) =>
                      (i as Investigation).tags?.includes("vermisst"),
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <MapPin className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Mit Standort
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {
                    filteredInvestigations.filter(
                      (i) => (i as Investigation).location,
                    ).length
                  }
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
              <span>
                {filteredInvestigations.length} von{" "}
                {investigations?.length ?? 0} Fahndungen
              </span>
            </div>
          </div>

          {filteredInvestigations && filteredInvestigations.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredInvestigations.map((investigation) => {
                const inv = investigation as Investigation;
                return (
                  <div
                    key={inv.id}
                    className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-xs transition-colors hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
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
                        <StatusBadge
                          content={inv.priority}
                          className={`${
                            inv.priority === "urgent"
                              ? "bg-red-500/20 text-red-600 dark:text-red-400"
                              : inv.priority === "new"
                                ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                                : "bg-gray-500/20 text-gray-600 dark:text-gray-400"
                          }`}
                        />
                        <StatusBadge
                          content={inv.status}
                          className={`${
                            inv.status === "published"
                              ? "bg-green-500/20 text-green-600 dark:text-green-400"
                              : inv.status === "active"
                                ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                                : inv.status === "draft"
                                  ? "bg-gray-500/20 text-gray-600 dark:text-gray-400"
                                  : "bg-gray-500/20 text-gray-600 dark:text-gray-400"
                          }`}
                        />
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
                          <StatusBadge
                            key={index}
                            content={tag}
                            className="bg-blue-500/20 text-blue-600 dark:text-blue-400"
                          />
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
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-xs dark:border-gray-700 dark:bg-gray-800">
              <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                {investigations && investigations.length > 0
                  ? "Keine Fahndungen mit den aktuellen Filtern gefunden"
                  : "Keine Fahndungen gefunden"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {investigations && investigations.length > 0
                  ? "Versuchen Sie andere Filter-Einstellungen oder löschen Sie die Filter."
                  : "Es sind noch keine Fahndungen in der Datenbank vorhanden."}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
