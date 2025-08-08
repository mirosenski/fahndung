"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";

interface FahndungFilterProps {
  onFilterChange: (filters: FilterState) => void;
  className?: string;
}

export interface FilterState {
  status: string[];
  priority: string[];
  category: string[];
  timeRange: "all" | "24h" | "7d" | "30d";
  searchTerm: string;
}

const filterOptions = {
  status: [
    { value: "active", label: "Aktiv" },
    { value: "published", label: "Veröffentlicht" },
    { value: "draft", label: "Entwurf" },
  ],
  priority: [
    { value: "urgent", label: "Dringend" },
    { value: "normal", label: "Normal" },
    { value: "new", label: "Neu" },
  ],
  category: [
    { value: "WANTED_PERSON", label: "Straftäter" },
    { value: "MISSING_PERSON", label: "Vermisste" },
    { value: "UNKNOWN_DEAD", label: "unbekannte Tote" },
    { value: "STOLEN_GOODS", label: "Sachen" },
  ],
  timeRange: [
    { value: "all", label: "Alle" },
    { value: "24h", label: "Letzte 24h" },
    { value: "7d", label: "Letzte 7 Tage" },
    { value: "30d", label: "Letzte 30 Tage" },
  ],
};

export default function FahndungFilter({
  onFilterChange,
  className = "",
}: FahndungFilterProps) {
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    status: [],
    priority: [],
    category: [],
    timeRange: "all",
    searchTerm: "",
  });

  // Filter-Toggle
  const toggleFilter = (
    filterType: keyof Omit<FilterState, "timeRange" | "searchTerm">,
    value: string,
  ) => {
    const newFilters = {
      ...activeFilters,
      [filterType]: activeFilters[filterType].includes(value)
        ? activeFilters[filterType].filter((v) => v !== value)
        : [...activeFilters[filterType], value],
    };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Zeit-Filter setzen
  const setTimeFilter = (timeRange: FilterState["timeRange"]) => {
    const newFilters = { ...activeFilters, timeRange };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Suchbegriff setzen
  const setSearchTerm = (searchTerm: string) => {
    const newFilters = { ...activeFilters, searchTerm };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Filter zurücksetzen
  const resetFilters = () => {
    const newFilters: FilterState = {
      status: [],
      priority: [],
      category: [],
      timeRange: "all",
      searchTerm: "",
    };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Aktive Filter zählen
  const activeFilterCount =
    [
      ...activeFilters.status,
      ...activeFilters.priority,
      ...activeFilters.category,
    ].length +
    (activeFilters.timeRange !== "all" ? 1 : 0) +
    (activeFilters.searchTerm ? 1 : 0);

  return (
    <div className={`fahndung-filter ${className}`}>
      {/* Filter Button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          className="flex items-center space-x-2 rounded-lg bg-white px-4 py-2 shadow-sm hover:bg-muted dark:bg-muted dark:hover:bg-muted"
        >
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filter</span>
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Suchfeld */}
        <div className="relative max-w-md flex-1">
          <input
            type="text"
            placeholder="Fahndungen durchsuchen..."
            value={activeFilters.searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-border px-4 py-2 pl-10 focus:border-blue-500 focus:outline-none dark:border-border dark:bg-muted dark:text-white"
          />
          {activeFilters.searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Reset Button */}
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Zurücksetzen
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="mt-4 rounded-lg border border-border bg-white p-4 shadow-sm dark:border-border dark:bg-muted">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Status Filter */}
            <div>
              <h4 className="mb-3 text-sm font-medium">Status</h4>
              <div className="space-y-2">
                {filterOptions.status.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      checked={activeFilters.status.includes(option.value)}
                      onChange={() => toggleFilter("status", option.value)}
                      className="rounded"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Prioritäts Filter */}
            <div>
              <h4 className="mb-3 text-sm font-medium">Priorität</h4>
              <div className="space-y-2">
                {filterOptions.priority.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      checked={activeFilters.priority.includes(option.value)}
                      onChange={() => toggleFilter("priority", option.value)}
                      className="rounded"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Kategorie Filter */}
            <div>
              <h4 className="mb-3 text-sm font-medium">Kategorie</h4>
              <div className="space-y-2">
                {filterOptions.category.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      checked={activeFilters.category.includes(option.value)}
                      onChange={() => toggleFilter("category", option.value)}
                      className="rounded"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Zeit Filter */}
            <div>
              <h4 className="mb-3 text-sm font-medium">Zeitraum</h4>
              <div className="space-y-2">
                {filterOptions.timeRange.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="radio"
                      name="timeRange"
                      value={option.value}
                      checked={activeFilters.timeRange === option.value}
                      onChange={() =>
                        setTimeFilter(option.value as FilterState["timeRange"])
                      }
                      className="rounded"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Aktive Filter Anzeige */}
          {activeFilterCount > 0 && (
            <div className="mt-4 border-t pt-4">
              <div className="flex flex-wrap gap-2">
                {activeFilters.status.map((status) => (
                  <span
                    key={status}
                    className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    Status:{" "}
                    {
                      filterOptions.status.find((s) => s.value === status)
                        ?.label
                    }
                  </span>
                ))}
                {activeFilters.priority.map((priority) => (
                  <span
                    key={priority}
                    className="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                  >
                    {
                      filterOptions.priority.find((p) => p.value === priority)
                        ?.label
                    }
                  </span>
                ))}
                {activeFilters.category.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    {
                      filterOptions.category.find((c) => c.value === category)
                        ?.label
                    }
                  </span>
                ))}
                {activeFilters.timeRange !== "all" && (
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    {
                      filterOptions.timeRange.find(
                        (t) => t.value === activeFilters.timeRange,
                      )?.label
                    }
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
