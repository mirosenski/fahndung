"use client";

import { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Filter, AlertTriangle, User, Eye, Clock } from "lucide-react";
import InteractiveMap, {
  type MapLocation,
} from "@/components/shared/InteractiveMap";

// Fix für Leaflet Icons in Next.js
delete (L.Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

export interface FahndungLocation extends MapLocation {
  investigationId?: string;
  investigationTitle?: string;
  priority?: "normal" | "urgent" | "new";
  category?: string;
  timestamp?: Date;
  lastSeen?: Date;
  description?: string;
  contactInfo?: {
    person?: string;
    phone?: string;
    email?: string;
  };
}

interface FahndungskarteProps {
  locations: FahndungLocation[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  searchRadius?: number;
  showRadius?: boolean;
  editable?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showLegend?: boolean;
  onLocationAdd?: (location: Omit<FahndungLocation, "id">) => void;
  onLocationUpdate?: (id: string, location: FahndungLocation) => void;
  onLocationRemove?: (id: string) => void;
  _onLocationClick?: (location: FahndungLocation) => void;
  onInvestigationClick?: (investigationId: string) => void;
  className?: string;
}

// Erweiterte Marker Icons für Fahndungen
const fahndungMarkerIcons = {
  main: { color: "#DC2626", icon: "🎯", label: "Hauptort" },
  tatort: { color: "#991B1B", icon: "⚠️", label: "Tatort" },
  wohnort: { color: "#2563EB", icon: "🏠", label: "Wohnort" },
  arbeitsplatz: { color: "#7C3AED", icon: "💼", label: "Arbeitsplatz" },
  sichtung: { color: "#F59E0B", icon: "👁️", label: "Sichtung" },
  sonstiges: { color: "#6B7280", icon: "📍", label: "Sonstiges" },
};

// Filter-Optionen
const filterOptions = {
  type: ["main", "tatort", "wohnort", "arbeitsplatz", "sichtung", "sonstiges"],
  priority: ["urgent", "normal", "new"],
  category: ["WANTED_PERSON", "MISSING_PERSON", "UNKNOWN_DEAD", "STOLEN_GOODS"],
};

export default function Fahndungskarte({
  locations = [],
  center = [48.8566, 8.3522], // Default: Pforzheim
  zoom = 13,
  height = "600px",
  searchRadius = 5,
  showRadius = true,
  editable = false,
  showSearch = true,
  showFilters = true,
  showLegend = true,
  onLocationAdd,
  onLocationUpdate,
  onLocationRemove,
  onInvestigationClick,
  className = "",
}: FahndungskarteProps) {
  const [filteredLocations, setFilteredLocations] =
    useState<FahndungLocation[]>(locations);
  const [activeFilters, setActiveFilters] = useState({
    type: [] as string[],
    priority: [] as string[],
    category: [] as string[],
    timeRange: "all" as "all" | "24h" | "7d" | "30d",
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<FahndungLocation | null>(null);
  const [mapView, setMapView] = useState<"standard" | "satellite" | "terrain">(
    "standard",
  );

  // Filter anwenden
  useEffect(() => {
    let filtered = [...locations];

    // Typ-Filter
    if (activeFilters.type.length > 0) {
      filtered = filtered.filter((loc) =>
        activeFilters.type.includes(loc.type),
      );
    }

    // Prioritäts-Filter
    if (activeFilters.priority.length > 0) {
      filtered = filtered.filter(
        (loc) => loc.priority && activeFilters.priority.includes(loc.priority),
      );
    }

    // Kategorie-Filter
    if (activeFilters.category.length > 0) {
      filtered = filtered.filter(
        (loc) => loc.category && activeFilters.category.includes(loc.category),
      );
    }

    // Zeit-Filter
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

      filtered = filtered.filter((loc) => {
        const timestamp = loc.timestamp ?? loc.lastSeen;
        return timestamp && new Date(timestamp) >= cutoff;
      });
    }

    setFilteredLocations(filtered);
  }, [locations, activeFilters]);

  // Filter-Toggle
  const toggleFilter = (
    filterType: keyof typeof activeFilters,
    value: string,
  ) => {
    setActiveFilters((prev) => {
      const currentValues = prev[filterType] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      return {
        ...prev,
        [filterType]: newValues,
      };
    });
  };

  // Zeit-Filter setzen
  const setTimeFilter = (timeRange: typeof activeFilters.timeRange) => {
    setActiveFilters((prev) => ({
      ...prev,
      timeRange,
    }));
  };

  // Filter zurücksetzen
  const resetFilters = () => {
    setActiveFilters({
      type: [],
      priority: [],
      category: [],
      timeRange: "all",
    });
  };

  // Investigation Click Handler
  const handleInvestigationClick = (investigationId: string) => {
    if (onInvestigationClick) {
      onInvestigationClick(investigationId);
    }
  };

  // Kartenansicht wechseln
  const changeMapView = (view: typeof mapView) => {
    setMapView(view);
  };

  return (
    <div className={`fahndungskarte relative ${className}`}>
      {/* Filter Panel */}
      {showFilters && (
        <div className="absolute top-2 left-2 z-[1000]">
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="flex items-center space-x-2 rounded-lg bg-white p-3 shadow-lg hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filter</span>
            {Object.values(activeFilters).some((f) =>
              Array.isArray(f) ? f.length > 0 : f !== "all",
            ) && <span className="flex h-2 w-2 rounded-full bg-red-500"></span>}
          </button>

          {showFilterPanel && (
            <div className="absolute top-full left-0 mt-2 w-80 rounded-lg bg-white p-4 shadow-xl dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filter</h3>
                <button
                  onClick={resetFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Zurücksetzen
                </button>
              </div>

              {/* Typ-Filter */}
              <div className="mb-4">
                <h4 className="mb-2 text-sm font-medium">Typ</h4>
                <div className="space-y-2">
                  {filterOptions.type.map((type) => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={activeFilters.type.includes(type)}
                        onChange={() => toggleFilter("type", type)}
                        className="rounded"
                      />
                      <span className="text-sm">
                        {
                          fahndungMarkerIcons[
                            type as keyof typeof fahndungMarkerIcons
                          ].label
                        }
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Prioritäts-Filter */}
              <div className="mb-4">
                <h4 className="mb-2 text-sm font-medium">Priorität</h4>
                <div className="space-y-2">
                  {filterOptions.priority.map((priority) => (
                    <label
                      key={priority}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={activeFilters.priority.includes(priority)}
                        onChange={() => toggleFilter("priority", priority)}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{priority}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Zeit-Filter */}
              <div className="mb-4">
                <h4 className="mb-2 text-sm font-medium">Zeitraum</h4>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "Alle" },
                    { value: "24h", label: "Letzte 24h" },
                    { value: "7d", label: "Letzte 7 Tage" },
                    { value: "30d", label: "Letzte 30 Tage" },
                  ].map((option) => (
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
                          setTimeFilter(
                            option.value as typeof activeFilters.timeRange,
                          )
                        }
                        className="rounded"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Statistiken */}
              <div className="border-t pt-4">
                <div className="text-sm text-gray-600">
                  <div>
                    Angezeigt: {filteredLocations.length} von {locations.length}
                  </div>
                  {filteredLocations.length > 0 && (
                    <div className="mt-1 text-xs">
                      {
                        filteredLocations.filter(
                          (loc) => loc.priority === "urgent",
                        ).length
                      }{" "}
                      dringend
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Kartenansicht-Selector */}
      <div className="absolute top-2 right-2 z-[1000]">
        <div className="flex space-x-1 rounded-lg bg-white p-1 shadow-lg dark:bg-gray-800">
          <button
            onClick={() => changeMapView("standard")}
            className={`rounded px-3 py-1 text-xs ${
              mapView === "standard"
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => changeMapView("satellite")}
            className={`rounded px-3 py-1 text-xs ${
              mapView === "satellite"
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Satellit
          </button>
        </div>
      </div>

      {/* Interactive Map */}
      <InteractiveMap
        locations={filteredLocations}
        center={center}
        zoom={zoom}
        height={height}
        searchRadius={searchRadius}
        showRadius={showRadius}
        editable={editable}
        showSearch={showSearch}
        onLocationAdd={onLocationAdd}
        onLocationUpdate={onLocationUpdate}
        onLocationRemove={onLocationRemove}
      />

      {/* Legende */}
      {showLegend && (
        <div className="absolute bottom-2 left-2 z-[1000] rounded-lg bg-white p-3 shadow-lg dark:bg-gray-800">
          <h4 className="mb-2 text-sm font-medium">Legende</h4>
          <div className="space-y-1">
            {Object.entries(fahndungMarkerIcons).map(([type, config]) => (
              <div key={type} className="flex items-center space-x-2 text-xs">
                <span className="text-lg">{config.icon}</span>
                <span>{config.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location Details Panel */}
      {selectedLocation && (
        <div className="absolute right-2 bottom-2 z-[1000] w-80 rounded-lg bg-white p-4 shadow-xl dark:bg-gray-800">
          <div className="mb-3 flex items-start justify-between">
            <h3 className="text-lg font-semibold">Details</h3>
            <button
              onClick={() => setSelectedLocation(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">
                  {fahndungMarkerIcons[selectedLocation.type].icon}
                </span>
                <span className="font-medium">{selectedLocation.address}</span>
              </div>
              {selectedLocation.description && (
                <p className="mt-1 text-sm text-gray-600">
                  {selectedLocation.description}
                </p>
              )}
            </div>

            {selectedLocation.investigationTitle && (
              <div>
                <h4 className="text-sm font-medium">Fahndung</h4>
                <button
                  onClick={() =>
                    selectedLocation.investigationId &&
                    handleInvestigationClick(selectedLocation.investigationId)
                  }
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {selectedLocation.investigationTitle}
                </button>
              </div>
            )}

            {selectedLocation.priority && (
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span
                  className={`text-sm font-medium ${
                    selectedLocation.priority === "urgent"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {selectedLocation.priority === "urgent"
                    ? "DRINGEND"
                    : selectedLocation.priority.toUpperCase()}
                </span>
              </div>
            )}

            {selectedLocation.timestamp && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>
                  {new Date(selectedLocation.timestamp).toLocaleString("de-DE")}
                </span>
              </div>
            )}

            {selectedLocation.contactInfo && (
              <div className="border-t pt-3">
                <h4 className="mb-2 text-sm font-medium">Kontakt</h4>
                <div className="space-y-1 text-sm">
                  {selectedLocation.contactInfo.person && (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{selectedLocation.contactInfo.person}</span>
                    </div>
                  )}
                  {selectedLocation.contactInfo.phone && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">📞</span>
                      <span>{selectedLocation.contactInfo.phone}</span>
                    </div>
                  )}
                  {selectedLocation.contactInfo.email && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">✉️</span>
                      <span>{selectedLocation.contactInfo.email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Statistiken */}
      <div className="absolute top-2 left-1/2 z-[1000] -translate-x-1/2 rounded-lg bg-white px-4 py-2 shadow-lg dark:bg-gray-800">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span>{filteredLocations.length} Orte</span>
          </div>
          <div className="flex items-center space-x-1">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span>
              {
                filteredLocations.filter((loc) => loc.priority === "urgent")
                  .length
              }{" "}
              dringend
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4 text-green-500" />
            <span>
              {
                filteredLocations.filter((loc) => loc.type === "sichtung")
                  .length
              }{" "}
              Sichtungen
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
