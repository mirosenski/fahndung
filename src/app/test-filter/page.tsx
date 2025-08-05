"use client";

import React, { useState, useMemo } from "react";
import { CompactFilter } from "@/components/fahndungen/CompactFilter";
import type { CompactFilterState } from "@/components/fahndungen/CompactFilter";
import AdaptiveHeaderOptimized from "@/components/layout/AdaptiveHeaderOptimized";
import Footer from "@/components/layout/Footer";
import { ChevronRight, Search } from "lucide-react";
import { api } from "~/trpc/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Fahndungskarte } from "@/types/fahndungskarte";

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
// Hilfsfunktion für Kategorie-Mapping
const mapCategoryToFilter = (category: string): string => {
  switch (category) {
    case "WANTED_PERSON":
      return "straftaeter";
    case "MISSING_PERSON":
      return "vermisste";
    case "UNKNOWN_DEAD":
      return "unbekannte";
    case "STOLEN_GOODS":
      return "sachen";
    default:
      return "all";
  }
};

// Hilfsfunktion für Region-Extraktion
const extractRegionFromLocation = (location: string): string => {
  // Einfache Region-Extraktion basierend auf bekannten Regionen
  const regions = [
    "Bodensee",
    "Donau-Iller",
    "Heilbronn-Franken",
    "Hochrhein",
    "Karlsruhe",
    "Neckar-Alb",
    "Nordschwarzwald",
    "Ostwürttemberg",
    "Rhein-Neckar",
    "Schwarzwald-Baar",
    "Stuttgart",
    "Südlicher Oberrhein",
  ];

  for (const region of regions) {
    if (location.toLowerCase().includes(region.toLowerCase())) {
      return region;
    }
  }

  // Fallback: Erste Stadt/Ort aus der Location extrahieren
  const parts = location.split(",");
  return parts[0]?.trim() ?? "Unbekannt";
};

export default function TestFilterPage() {
  const [currentFilters, setCurrentFilters] = useState<CompactFilterState>({
    searchTerm: "",
    dienststelle: "Alle Dienststellen",
    fahndungstyp: "all",
    neue: false,
    eilfahndung: false,
    region: [],
  });

  // tRPC Query für echte Fahndungen
  const { data: investigations = [], isLoading } =
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

  // Gefilterte Fahndungen basierend auf CompactFilter
  const filteredInvestigations = useMemo(() => {
    let filtered = investigations as Fahndungskarte[];

    // Suchterm
    if (currentFilters.searchTerm) {
      const searchLower = currentFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          (f.title?.toLowerCase() ?? "").includes(searchLower) ||
          (f.description?.toLowerCase() ?? "").includes(searchLower) ||
          (f.station?.toLowerCase() ?? "").includes(searchLower) ||
          (f.case_number?.toLowerCase() ?? "").includes(searchLower),
      );
    }

    // Dienststelle
    if (currentFilters.dienststelle !== "Alle Dienststellen") {
      filtered = filtered.filter(
        (f) => f.station === currentFilters.dienststelle,
      );
    }

    // Fahndungstyp
    if (currentFilters.fahndungstyp !== "all") {
      filtered = filtered.filter(
        (f) =>
          mapCategoryToFilter(f.category ?? "") === currentFilters.fahndungstyp,
      );
    }

    // Neue Fahndungen (basierend auf created_at)
    if (currentFilters.neue) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(
        (f) => f.created_at && new Date(f.created_at) > oneWeekAgo,
      );
    }

    // Eilfahndungen (basierend auf priority)
    if (currentFilters.eilfahndung) {
      filtered = filtered.filter((f) => f.priority === "urgent");
    }

    // Regionen
    if (currentFilters.region.length > 0) {
      filtered = filtered.filter((f) => {
        const region = extractRegionFromLocation(f.location ?? "");
        return currentFilters.region.includes(region);
      });
    }

    return filtered;
  }, [investigations, currentFilters]);

  const handleFilterChange = (filters: CompactFilterState) => {
    setCurrentFilters(filters);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <AdaptiveHeaderOptimized />

      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 py-4 text-sm">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Startseite
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-white">
              Filter Test
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold">Filter-Komponente Test</h1>
            <p className="mx-auto max-w-3xl text-xl text-blue-100">
              Testen Sie die neue CompactFilter-Komponente mit verschiedenen
              Filteroptionen und sehen Sie die Ergebnisse in Echtzeit.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filter Section */}
        <div className="mb-8">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
              Filter-Einstellungen
            </h2>
            <CompactFilter
              onFilterChange={handleFilterChange}
              showRegionFilter={true}
              defaultValues={{
                searchTerm: "",
                dienststelle: "Alle Dienststellen",
                fahndungstyp: "all",
                neue: false,
                eilfahndung: false,
                region: [],
              }}
            />
          </div>
        </div>

        {/* Filter Status */}
        <div className="mb-6">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <h3 className="mb-2 text-lg font-medium text-blue-900 dark:text-blue-100">
              Aktive Filter
            </h3>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p>
                <strong>Suchterm:</strong>{" "}
                {currentFilters.searchTerm ?? "Keiner"}
              </p>
              <p>
                <strong>Dienststelle:</strong> {currentFilters.dienststelle}
              </p>
              <p>
                <strong>Fahndungstyp:</strong> {currentFilters.fahndungstyp}
              </p>
              <p>
                <strong>Neue Fahndungen:</strong>{" "}
                {currentFilters.neue ? "Ja" : "Nein"}
              </p>
              <p>
                <strong>Eilfahndungen:</strong>{" "}
                {currentFilters.eilfahndung ? "Ja" : "Nein"}
              </p>
              <p>
                <strong>Regionen:</strong>{" "}
                {currentFilters.region.length > 0
                  ? currentFilters.region.join(", ")
                  : "Alle"}
              </p>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Fahndungsergebnisse
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {isLoading ? (
                <span>Lade Fahndungen...</span>
              ) : (
                `${filteredInvestigations.length} von ${investigations.length} Fahndungen`
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-64 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                </div>
              ))}
            </div>
          ) : filteredInvestigations.length === 0 ? (
            <div className="py-12 text-center">
              <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                Keine Ergebnisse gefunden
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Versuchen Sie andere Filtereinstellungen oder einen anderen
                Suchbegriff.
              </p>
            </div>
          ) : (
            <FahndungskarteGrid
              investigations={filteredInvestigations}
              viewMode="grid-3"
              className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
