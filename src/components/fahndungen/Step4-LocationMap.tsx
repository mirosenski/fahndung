"use client";

import React, { useState, useCallback } from "react";
import { MapPin, Search, Navigation, AlertCircle, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { NominatimService } from "~/services/geocoding";

// Dynamic import für Leaflet (SSR-safe)
const InteractiveMap = dynamic(
  () => import("~/components/shared/InteractiveMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[400px] animate-pulse items-center justify-center rounded-lg bg-gray-100">
        <MapPin className="h-8 w-8 text-gray-400" />
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

interface Step4Data {
  mainLocation: MapLocation | null;
  additionalLocations: MapLocation[];
  searchRadius: number;
}

interface Step4Props {
  data: Step4Data;
  onChange: (data: Step4Data) => void;
}

const Step4LocationMap: React.FC<Step4Props> = ({ data, onChange }) => {
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
    { value: "sonstiges", label: "Sonstiges", color: "bg-gray-500" },
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
  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      try {
        const result = await NominatimService.reverse(lat, lng);
        const newLocation: MapLocation = {
          id: generateId(),
          address: result.display_name,
          lat,
          lng,
          type: data.mainLocation ? "sichtung" : "main",
          timestamp: new Date(),
        };

        if (!data.mainLocation) {
          onChange({ ...data, mainLocation: newLocation });
        } else {
          onChange({
            ...data,
            additionalLocations: [...data.additionalLocations, newLocation],
          });
        }
      } catch (error) {
        console.error("Fehler beim Reverse Geocoding:", error);
      }
    },
    [data, onChange],
  );

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
      description: "",
      timestamp: new Date(),
    };

    if (type === "main" || !data.mainLocation) {
      onChange({ ...data, mainLocation: newLocation });
    } else {
      onChange({
        ...data,
        additionalLocations: [...data.additionalLocations, newLocation],
      });
    }

    setSearchQuery("");
    setSearchResults([]);
  };

  const removeLocation = (id: string) => {
    if (data.mainLocation?.id === id) {
      onChange({ ...data, mainLocation: null });
    } else {
      const filteredLocations = data.additionalLocations.filter(
        (loc) => loc.id !== id,
      );
      onChange({ ...data, additionalLocations: filteredLocations });
    }
  };

  const getLocationTypeColor = (type: MapLocation["type"]) => {
    return locationTypes.find((t) => t.value === type)?.color ?? "bg-gray-500";
  };

  const getLocationTypeLabel = (type: MapLocation["type"]) => {
    return locationTypes.find((t) => t.value === type)?.label ?? "Sonstiges";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Schritt 4: Geografische Analyse
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Markieren Sie relevante Orte und definieren Sie den Suchradius
        </p>
      </div>

      {/* Standortsuche */}
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Standort suchen
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && searchLocation(searchQuery)
                }
                placeholder="Adresse oder Ort eingeben..."
                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <button
              onClick={() => searchLocation(searchQuery)}
              disabled={isSearching || !searchQuery.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSearching ? "Suche..." : "Suchen"}
            </button>
          </div>
        </div>

        {/* Suchergebnisse */}
        {searchResults.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-600 dark:bg-gray-700">
            <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
              Suchergebnisse
            </h4>
            <div className="space-y-2">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-600"
                >
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {result.address}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      onChange={(e) =>
                        addLocation(
                          result.address,
                          result.lat,
                          result.lng,
                          e.target.value as MapLocation["type"],
                        )
                      }
                      className="rounded border border-gray-300 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      {locationTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() =>
                        addLocation(result.address, result.lat, result.lng)
                      }
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Hinzufügen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hauptort */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Hauptort
        </h3>

        {data.mainLocation ? (
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-600 dark:bg-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center space-x-2">
                  <div
                    className={`h-3 w-3 rounded-full ${getLocationTypeColor(data.mainLocation.type)}`}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {getLocationTypeLabel(data.mainLocation.type)}
                  </span>
                </div>
                <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  {data.mainLocation.address}
                </p>
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div>Lat: {data.mainLocation.lat.toFixed(6)}</div>
                  <div>Lng: {data.mainLocation.lng.toFixed(6)}</div>
                </div>
                {data.mainLocation.description && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {data.mainLocation.description}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => removeLocation(data.mainLocation!.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-600">
            <MapPin className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Kein Hauptort festgelegt
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Suchen Sie nach einem Ort und markieren Sie ihn als Hauptort
            </p>
          </div>
        )}
      </div>

      {/* Weitere Orte */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Weitere Orte ({data.additionalLocations.length})
          </h3>
          {data.additionalLocations.length > 0 && (
            <button
              onClick={() => onChange({ ...data, additionalLocations: [] })}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Alle entfernen
            </button>
          )}
        </div>

        {data.additionalLocations.length > 0 ? (
          <div className="space-y-3">
            {data.additionalLocations.map((location) => (
              <div
                key={location.id}
                className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-600 dark:bg-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-2">
                      <div
                        className={`h-3 w-3 rounded-full ${getLocationTypeColor(location.type)}`}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {getLocationTypeLabel(location.type)}
                      </span>
                    </div>
                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                      {location.address}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div>Lat: {location.lat.toFixed(6)}</div>
                      <div>Lng: {location.lng.toFixed(6)}</div>
                    </div>
                    {location.description && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {location.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => removeLocation(location.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-600">
            <Navigation className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Keine weiteren Orte hinzugefügt
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Fügen Sie weitere relevante Orte hinzu
            </p>
          </div>
        )}
      </div>

      {/* Suchradius */}
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Suchradius (km)
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="1"
              max="100"
              value={data.searchRadius}
              onChange={(e) =>
                onChange({ ...data, searchRadius: parseInt(e.target.value) })
              }
              className="flex-1"
            />
            <span className="min-w-[3rem] text-sm font-medium text-gray-900 dark:text-white">
              {data.searchRadius} km
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Definiert den Radius um den Hauptort für die Fahndung
          </p>
        </div>
      </div>

      {/* Interaktive Karte */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Interaktive Karte
        </h3>

        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
          <InteractiveMap
            locations={[
              ...(data.mainLocation ? [data.mainLocation] : []),
              ...data.additionalLocations,
            ]}
            center={
              data.mainLocation
                ? [data.mainLocation.lat, data.mainLocation.lng]
                : [48.7758, 9.1829]
            }
            zoom={13}
            height="400px"
            searchRadius={data.searchRadius}
            showRadius={true}
            editable={true}
            onLocationClick={(location) => {
              // Optional: Show location details
              console.log("Location clicked:", location);
            }}
            onMapClick={handleMapClick}
            onLocationRemove={removeLocation}
          />
        </div>

        {/* Map Instructions */}
        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 Klicken Sie auf die Karte, um einen neuen Ort hinzuzufügen
          </p>
        </div>
      </div>

      {/* Hilfe & Tipps */}
      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h4 className="mb-1 text-sm font-medium text-blue-800 dark:text-blue-200">
              Tipps für die Standortauswahl
            </h4>
            <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
              <li>
                • Markieren Sie mindestens einen Hauptort für die Fahndung
              </li>
              <li>• Weitere Orte helfen bei der geografischen Analyse</li>
              <li>• Der Suchradius definiert den Aktionsbereich</li>
              <li>• Verwenden Sie präzise Adressen für bessere Ergebnisse</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4LocationMap;
