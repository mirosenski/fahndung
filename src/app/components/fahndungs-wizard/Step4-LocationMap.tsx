"use client";

import { useState } from "react";
import { MapPin, Plus, Search } from "lucide-react";
import dynamic from "next/dynamic";
import type { MapLocation } from "@/components/shared/InteractiveMap";
import type { Step4Data } from "@/types/fahndung-wizard";

// Dynamischer Import für die Karte (Client-Side only)
const InteractiveMap = dynamic(
  () => import("@/components/shared/InteractiveMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 items-center justify-center rounded-lg bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Karte wird geladen...</p>
        </div>
      </div>
    ),
  },
);

interface Step4Props {
  data: Step4Data;
  onUpdate: (data: Step4Data) => void;
  onNext: () => void;
  onBack: () => void;
}

const locationTypes = [
  { value: "main", label: "Hauptort / Zuletzt gesehen", icon: "🎯" },
  { value: "tatort", label: "Tatort", icon: "⚠️" },
  { value: "wohnort", label: "Wohnort", icon: "🏠" },
  { value: "arbeitsplatz", label: "Arbeitsplatz", icon: "💼" },
  { value: "sichtung", label: "Sichtung", icon: "👁️" },
  { value: "sonstiges", label: "Sonstiges", icon: "📍" },
];

export default function Step4LocationMap({
  data,
  onUpdate,
  onNext,
  onBack,
}: Step4Props) {
  const [mainAddress, setMainAddress] = useState("");
  const [additionalAddress, setAdditionalAddress] = useState("");
  const [locationType, setLocationType] =
    useState<MapLocation["type"]>("sichtung");
  const [searchRadius, setSearchRadius] = useState(data.searchRadius || 5);
  const [description, setDescription] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Alle Locations für die Karte (MapLocation Format für InteractiveMap)
  const allLocations: MapLocation[] = [
    ...(data.mainLocation ? [data.mainLocation as MapLocation] : []),
    ...data.additionalLocations.map((loc) => ({
      ...loc,
      type: loc.type as MapLocation["type"],
    })),
  ];

  // Adresse suchen und zur Karte hinzufügen
  const searchAndAddLocation = async (
    address: string,
    type: MapLocation["type"],
    isMain = false,
  ) => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      );
      const results = (await response.json()) as Array<{
        lat: string;
        lon: string;
        display_name: string;
      }>;

      if (results[0]) {
        const { lat, lon, display_name } = results[0];
        const newLocation: MapLocation = {
          id: `loc-${Date.now()}`,
          lat: parseFloat(lat),
          lng: parseFloat(lon),
          address: display_name,
          type: isMain ? "main" : type,
          description: description || undefined,
          timestamp: new Date(),
        };

        if (isMain) {
          onUpdate({
            ...data,
            mainLocation: newLocation,
            searchRadius,
          });
          setMainAddress("");
        } else {
          // Für additionalLocations darf der Typ nicht "main" sein
          const additionalLocation = {
            ...newLocation,
            type: type as
              | "tatort"
              | "wohnort"
              | "arbeitsplatz"
              | "sichtung"
              | "sonstiges",
          };
          onUpdate({
            ...data,
            additionalLocations: [
              ...data.additionalLocations,
              additionalLocation,
            ],
            searchRadius,
          });
          setAdditionalAddress("");
          setDescription("");
        }
      } else {
        alert(
          "Adresse nicht gefunden. Bitte versuchen Sie es mit einer anderen Adresse.",
        );
      }
    } catch (error) {
      console.error("Fehler bei der Adresssuche:", error);
      alert("Fehler bei der Suche. Bitte versuchen Sie es erneut.");
    } finally {
      setIsSearching(false);
    }
  };

  // Location von Karte hinzufügen
  const handleLocationAdd = (location: Omit<MapLocation, "id">) => {
    const newLocation = {
      ...location,
      id: `loc-${Date.now()}`,
      type: location.type as
        | "tatort"
        | "wohnort"
        | "arbeitsplatz"
        | "sichtung"
        | "sonstiges",
    };

    onUpdate({
      ...data,
      additionalLocations: [...data.additionalLocations, newLocation],
      searchRadius,
    });
  };

  // Location entfernen
  const handleLocationRemove = (id: string) => {
    if (data.mainLocation?.id === id) {
      onUpdate({
        ...data,
        mainLocation: null,
      });
    } else {
      onUpdate({
        ...data,
        additionalLocations: data.additionalLocations.filter(
          (loc) => loc.id !== id,
        ),
      });
    }
  };

  const handleNext = () => {
    onUpdate({
      ...data,
      searchRadius,
    });
    onNext();
  };

  const isValid = data.mainLocation !== null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Ort & Karte</h2>

      {/* Hauptort eingeben */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Hauptort / Zuletzt gesehen *
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={mainAddress}
            onChange={(e) => setMainAddress(e.target.value)}
            placeholder="Adresse eingeben (z.B. Marktplatz 1, Stuttgart)"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === "Enter" && mainAddress) {
                e.preventDefault();
                void searchAndAddLocation(mainAddress, "main", true);
              }
            }}
          />
          <button
            onClick={() => searchAndAddLocation(mainAddress, "main", true)}
            disabled={!mainAddress || isSearching}
            className="flex items-center rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSearching ? (
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Suchen
              </>
            )}
          </button>
        </div>
        {data.mainLocation && (
          <p className="mt-2 flex items-center text-sm text-green-600">
            <MapPin className="mr-1 h-4 w-4" />
            Hauptort gesetzt: {data.mainLocation.address.split(",")[0]}
          </p>
        )}
      </div>

      {/* Suchradius */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Suchradius
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="range"
            min="1"
            max="50"
            value={searchRadius}
            onChange={(e) => setSearchRadius(parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="w-20 text-lg font-medium">{searchRadius} km</span>
        </div>
      </div>

      {/* Karte */}
      <div className="overflow-hidden rounded-lg border border-gray-300">
        <InteractiveMap
          locations={allLocations}
          height="500px"
          onLocationAdd={handleLocationAdd}
          onLocationRemove={handleLocationRemove}
          searchRadius={searchRadius}
          showRadius={!!data.mainLocation}
          editable={true}
          showSearch={true}
        />
      </div>

      {/* Weitere Orte hinzufügen */}
      <div>
        <h3 className="mb-3 text-lg font-medium">
          Weitere relevante Orte hinzufügen
        </h3>

        <div className="space-y-3 rounded-lg bg-gray-50 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Ortstyp
              </label>
              <select
                value={locationType}
                onChange={(e) =>
                  setLocationType(e.target.value as MapLocation["type"])
                }
                className="select-dark-mode-sm"
              >
                {locationTypes
                  .filter((t) => t.value !== "main")
                  .map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Beschreibung (optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="z.B. Letzter bekannter Aufenthaltsort"
                className="input-dark-mode-sm"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              value={additionalAddress}
              onChange={(e) => setAdditionalAddress(e.target.value)}
              placeholder="Adresse eingeben oder auf Karte klicken"
              className="input-dark-mode-sm flex-1"
              onKeyPress={(e) => {
                if (e.key === "Enter" && additionalAddress) {
                  e.preventDefault();
                  void searchAndAddLocation(additionalAddress, locationType);
                }
              }}
            />
            <button
              onClick={() =>
                searchAndAddLocation(additionalAddress, locationType)
              }
              disabled={!additionalAddress || isSearching}
              className="flex items-center rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="mr-2 h-4 w-4" />
              Hinzufügen
            </button>
          </div>

          <p className="text-xs italic text-gray-500">
            Tipp: Sie können auch direkt auf die Karte klicken, um Orte
            hinzuzufügen
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="rounded bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
        >
          Zurück
        </button>
        <button
          onClick={handleNext}
          disabled={!isValid}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Weiter
        </button>
      </div>
    </div>
  );
}
