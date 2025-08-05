/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
"use client";

import { useState, useMemo, useEffect } from "react";
import { AlertTriangle, Eye } from "lucide-react";
import { api } from "~/trpc/react";

import FahndungFilter, { type FilterState } from "./FahndungFilter";
import ViewToggle from "./ViewToggle";
import FahndungskarteListFlat from "~/components/fahndungskarte/ansichten/FahndungskarteListFlat";
import { type ViewMode } from "~/types/fahndungskarte";
import dynamic from "next/dynamic";

// Dynamischer Import der FahndungskarteGrid mit SSR deaktiviert
const FahndungskarteGrid = dynamic(
  () => import("~/components/fahndungskarte/ansichten/FahndungskarteGrid"),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse">
        <div className="h-64 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
      </div>
    ),
  },
);

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
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid-3");
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    status: [],
    priority: [],
    category: [],
    timeRange: "all",
    searchTerm: "",
  });

  // Hydration-Sicherheit
  useEffect(() => {
    setMounted(true);
  }, []);

  // tRPC Queries und Mutations
  const { data: investigations, isLoading } =
    api.post.getInvestigations.useQuery(
      {
        limit: 50,
        offset: 0,
      },
      {
        staleTime: 5 * 60 * 1000, // 5 Minuten Cache
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      },
    );

  // Explizite Typisierung für investigations
  const typedInvestigations = investigations;

  // Gefilterte Fahndungen
  const filteredInvestigations = useMemo(() => {
    if (!typedInvestigations || !Array.isArray(typedInvestigations)) return [];

    return typedInvestigations.filter((investigation) => {
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

      // Zeit Filter - nur auf Client-Seite ausführen
      if (activeFilters.timeRange !== "all" && typeof window !== "undefined") {
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
  }, [typedInvestigations, activeFilters]);

  // Filter-Handler
  const handleFilterChange = (filters: FilterState) => {
    setActiveFilters(filters);
  };

  // Loading state oder nicht gemounted
  if (isLoading ?? !mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <FahndungFilter onFilterChange={handleFilterChange} />
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-lg bg-gray-200 dark:bg-gray-700"
              />
            ))}
          </div>
          <div className="h-64 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filter und Suche */}
        <div className="mb-8">
          <FahndungFilter onFilterChange={handleFilterChange} />
        </div>

        {/* Investigations List */}
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Aktuelle Fahndungen
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Eye className="h-4 w-4" />
                <span>
                  {typedInvestigations ? filteredInvestigations.length : 0} von{" "}
                  {typedInvestigations && Array.isArray(typedInvestigations)
                    ? typedInvestigations.length
                    : 0}{" "}
                  Fahndungen
                </span>
              </div>
              <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
            </div>
          </div>

          {typedInvestigations &&
          filteredInvestigations &&
          filteredInvestigations.length > 0 ? (
            viewMode === "list-flat" ? (
              <FahndungskarteListFlat investigations={filteredInvestigations} />
            ) : (
              <FahndungskarteGrid
                investigations={filteredInvestigations}
                viewMode={viewMode}
              />
            )
          ) : (
            <div className="shadow-xs rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
              <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                {typedInvestigations &&
                Array.isArray(typedInvestigations) &&
                typedInvestigations.length > 0
                  ? "Keine Fahndungen mit den aktuellen Filtern gefunden"
                  : "Keine Fahndungen gefunden"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {typedInvestigations &&
                Array.isArray(typedInvestigations) &&
                typedInvestigations.length > 0
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
