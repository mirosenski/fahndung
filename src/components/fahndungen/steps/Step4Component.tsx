"use client";

import React, { useState, useCallback } from "react";
import { MapPin, Search, AlertCircle, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { NominatimService } from "~/services/geocoding";
import type { Step4Data } from "../types/WizardTypes";

// Dynamic import für Leaflet (SSR-safe)
const InteractiveMap = dynamic(
  () => import("~/components/shared/InteractiveMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[400px] animate-pulse items-center justify-center rounded-lg bg-muted">
        <MapPin className="h-8 w-8 text-muted-foreground" />
      </div>
    ),
  },
);

interface MapLocation {
  id: string;
  address: string;
  lat: number;
  lng: number;
  type:
    | "main"
    | "tatort"
    | "wohnort"
    | "arbeitsplatz"
    | "sichtung"
    | "sonstiges";
  description?: string;
  timestamp?: Date;
}

interface Step4ComponentProps {
  data: Step4Data;
  onChange: (data: Step4Data) => void;
}

const Step4Component: React.FC<Step4ComponentProps> = ({ data, onChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<
    Array<{
      address: string;
      lat: number;
      lng: number;
    }>
  >([]);

  const locationTypes = [
    { value: "main", label: "Hauptort", color: "bg-blue-500" },
    { value: "tatort", label: "Tatort", color: "bg-red-500" },
    { value: "wohnort", label: "Wohnort", color: "bg-green-500" },
    { value: "arbeitsplatz", label: "Arbeitsplatz", color: "bg-yellow-500" },
    { value: "sichtung", label: "Sichtung", color: "bg-purple-500" },
    { value: "sonstiges", label: "Sonstiges", color: "bg-muted" },
  ];

  const generateId = () =>
    `location-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Echtes Geocoding mit Nominatim
  const searchLocation = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const results = await NominatimService.search(query, {
        limit: 5,
        countrycodes: "de",
        viewbox: [5.8, 47.2, 15.0, 55.1], // Deutschland Bounding Box
        bounded: true,
      });

      setSearchResults(
        results.map((result) => ({
          address: result.display_name,
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
        })),
      );
    } catch (error) {
      console.error("Fehler bei der Standortsuche:", error);
      // Fallback auf lokale Suche oder Fehlermeldung
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Map Click Handler
  const addLocation = (
    address: string,
    lat: number,
    lng: number,
    type: MapLocation["type"] = "main",
  ) => {
    const newLocation: MapLocation = {
      id: generateId(),
      address,
      lat,
      lng,
      type,
      timestamp: new Date(),
    };

    if (type === "main") {
      onChange({
        ...data,
        mainLocation: newLocation,
      });
    } else {
      onChange({
        ...data,
        additionalLocations: [...data.additionalLocations, newLocation],
      });
    }
  };

  const removeLocation = (id: string) => {
    if (data.mainLocation?.id === id) {
      onChange({
        ...data,
        mainLocation: null,
      });
    } else {
      onChange({
        ...data,
        additionalLocations: data.additionalLocations.filter(
          (loc) => loc.id !== id,
        ),
      });
    }
  };

  const getLocationTypeColor = (type: MapLocation["type"]) => {
    return locationTypes.find((t) => t.value === type)?.color ?? "bg-muted";
  };

  const getLocationTypeLabel = (type: MapLocation["type"]) => {
    return locationTypes.find((t) => t.value === type)?.label ?? "Sonstiges";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-muted-foreground dark:text-white">
          Schritt 4: Standort & Karte
        </h2>
        <p className="text-muted-foreground dark:text-muted-foreground">
          Legen Sie den Hauptstandort und weitere relevante Orte fest
        </p>
      </div>

      {/* Suchleiste */}
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
            Standort suchen
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && searchLocation(searchQuery)
                }
                placeholder="Adresse oder Ort eingeben..."
                className="w-full rounded-lg border border-border py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white"
              />
            </div>
            <button
              onClick={() => searchLocation(searchQuery)}
              disabled={isSearching}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSearching ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Suchen
            </button>
          </div>
        </div>

        {/* Suchergebnisse */}
        {searchResults.length > 0 && (
          <div className="rounded-lg border border-border bg-white dark:border-border dark:bg-muted">
            <div className="p-4">
              <h4 className="mb-2 text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                Suchergebnisse
              </h4>
              <div className="space-y-2">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      addLocation(
                        result.address,
                        result.lat,
                        result.lng,
                        "main",
                      );
                      setSearchResults([]);
                      setSearchQuery("");
                    }}
                    className="flex w-full items-center justify-between rounded-lg p-3 text-left hover:bg-muted dark:hover:bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground dark:text-white">
                        {result.address}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground dark:text-muted-foreground">
                      {result.lat.toFixed(6)}, {result.lng.toFixed(6)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interaktive Karte */}
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
            Interaktive Karte
          </label>
          <p className="mb-4 text-xs text-muted-foreground dark:text-muted-foreground">
            Klicken Sie auf die Karte, um einen Standort hinzuzufügen
          </p>
        </div>

        <div className="rounded-lg border border-border dark:border-border">
          <InteractiveMap
            locations={[
              ...(data.mainLocation ? [data.mainLocation] : []),
              ...data.additionalLocations,
            ]}
            height="400px"
            center={
              data.mainLocation
                ? [data.mainLocation.lat, data.mainLocation.lng]
                : [51.1657, 10.4515]
            }
            zoom={data.mainLocation ? 12 : 6}
          />
        </div>
      </div>

      {/* Standort-Liste */}
      <div className="space-y-4">
        <div>
          <h4 className="mb-2 text-sm font-medium text-muted-foreground dark:text-muted-foreground">
            Festgelegte Standorte
          </h4>
        </div>

        {/* Hauptstandort */}
        {data.mainLocation && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`h-3 w-3 rounded-full ${getLocationTypeColor(data.mainLocation.type)}`}
                />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Hauptstandort
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {data.mainLocation.address}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {data.mainLocation.lat.toFixed(6)},{" "}
                    {data.mainLocation.lng.toFixed(6)}
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  data.mainLocation && removeLocation(data.mainLocation.id)
                }
                className="rounded p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Weitere Standorte */}
        {data.additionalLocations.length > 0 && (
          <div className="space-y-2">
            {data.additionalLocations.map((location) => (
              <div
                key={location.id}
                className="flex items-center justify-between rounded-lg border border-border p-3 dark:border-border"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded-full ${getLocationTypeColor(location.type)}`}
                  />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground dark:text-white">
                      {getLocationTypeLabel(location.type)}
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                      {location.address}
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeLocation(location.id)}
                  className="rounded p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {!data.mainLocation && data.additionalLocations.length === 0 && (
          <div className="rounded-lg border border-border bg-muted p-4 text-center dark:border-border dark:bg-muted">
            <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground dark:text-muted-foreground">
              Noch keine Standorte festgelegt
            </p>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground">
              Suchen Sie nach einem Ort oder klicken Sie auf die Karte
            </p>
          </div>
        )}
      </div>

      {/* Suchradius */}
      <div>
        <label className="mb-2 block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
          Suchradius (km)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="50"
            value={data.searchRadius}
            onChange={(e) =>
              onChange({ ...data, searchRadius: parseInt(e.target.value) })
            }
            className="flex-1"
          />
          <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
            {data.searchRadius} km
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground dark:text-muted-foreground">
          Bestimmt den Radius für die Standortsuche und -anzeige
        </p>
      </div>

      {/* Info-Box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-500" />
          <div className="text-sm">
            <h4 className="font-medium text-blue-900 dark:text-blue-100">
              Standort-Tipps
            </h4>
            <ul className="mt-2 space-y-1 text-blue-800 dark:text-blue-200">
              <li>• Hauptstandort: Der wichtigste Ort der Fahndung</li>
              <li>• Tatort: Wo das Ereignis stattgefunden hat</li>
              <li>• Wohnort: Bekannter Wohnort der gesuchten Person</li>
              <li>• Sichtungen: Wo die Person zuletzt gesehen wurde</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4Component;
