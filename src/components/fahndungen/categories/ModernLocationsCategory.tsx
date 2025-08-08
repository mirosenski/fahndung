"use client";

import React, { useState } from "react";
import {
  Clock,
  AlertCircle,
  Download,
  Navigation2,
  Target,
  Shield,
  Eye,
  Home,
  Briefcase,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import type { UIInvestigationData } from "~/lib/types/investigation.types";

interface LocationsCategoryProps {
  data: UIInvestigationData;
  isEditMode: boolean;
  updateField: (
    step: keyof UIInvestigationData,
    field: string,
    value: unknown,
  ) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface Location {
  id: string;
  type: "main" | "sighting" | "residence" | "work" | "incident" | "other";
  address: string;
  coordinates: { lat: number; lng: number };
  timestamp: Date;
  description?: string;
  radius?: number;
  confidence?: number;
  witnesses?: number;
  verified?: boolean;
  notes?: string;
}

export default function ModernLocationsCategory({
  data,
  isEditMode: _isEditMode,
  updateField: _updateField,
  onNext: _onNext,
  onPrevious: _onPrevious,
}: LocationsCategoryProps) {
  const [locations] = useState<Location[]>([
    {
      id: "1",
      type: "main",
      address:
        (data?.step4?.mainLocation as { address?: string } | null)?.address ??
        "Königstraße 28, 70173 Stuttgart",
      coordinates: { lat: 48.7758, lng: 9.1829 },
      timestamp: new Date(),
      description: "Letzter bekannter Aufenthaltsort",
      radius: 500,
      confidence: 95,
      verified: true,
      witnesses: 3,
    },
    {
      id: "2",
      type: "sighting",
      address: "Schlossplatz, 70173 Stuttgart",
      coordinates: { lat: 48.7785, lng: 9.18 },
      timestamp: new Date(Date.now() - 3600000),
      description: "Mögliche Sichtung",
      confidence: 60,
      witnesses: 1,
    },
    {
      id: "3",
      type: "residence",
      address: "Marienstraße 15, 70178 Stuttgart",
      coordinates: { lat: 48.7765, lng: 9.1815 },
      timestamp: new Date(Date.now() - 7200000),
      description: "Wohnadresse",
      confidence: 80,
      verified: true,
    },
  ]);

  const [selectedTab, setSelectedTab] = useState<"main" | "sighting" | "other">(
    "main",
  );
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    () => {
      // Standardmäßig den ersten Hauptstandort auswählen
      const mainLocation = locations.find((loc) => loc.type === "main");
      return mainLocation ?? locations[0] ?? null;
    },
  );

  const openInMaps = (platform: "google" | "apple" | "osm") => {
    const loc = locations.find((l) => l.type === "main") ?? locations[0];
    if (!loc) return;
    const urls = {
      google: `https://www.google.com/maps/search/?api=1&query=${loc.coordinates.lat},${loc.coordinates.lng}`,
      apple: `https://maps.apple.com/?q=${loc.coordinates.lat},${loc.coordinates.lng}`,
      osm: `https://www.openstreetmap.org/?mlat=${loc.coordinates.lat}&mlon=${loc.coordinates.lng}&zoom=15`,
    };
    window.open(urls[platform], "_blank");
  };

  const getLocationIcon = (type: string) => {
    const icons = {
      main: Target,
      sighting: Eye,
      residence: Home,
      work: Briefcase,
      incident: AlertTriangle,
      other: MapPin,
    };
    return icons[type as keyof typeof icons] || MapPin;
  };

  return (
    <div className="w-full space-y-6">
      {/* Location Details */}
      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-muted">
        {/* Tab Navigation */}
        <div className="mb-6 flex gap-2 border-b border-border dark:border-border">
          {(
            [
              {
                key: "main" as const,
                icon: Target,
                label: "Hauptstandorte",
                count: locations.filter((loc) => loc.type === "main").length,
              },
              {
                key: "sighting" as const,
                icon: Eye,
                label: "Sichtungen",
                count: locations.filter((loc) => loc.type === "sighting")
                  .length,
              },
              {
                key: "other" as const,
                icon: MapPin,
                label: "Sonstige",
                count: locations.filter(
                  (loc) => !["main", "sighting"].includes(loc.type),
                ).length,
              },
            ] as const
          ).map(({ key, icon: Icon, label, count }) => (
            <button
              key={key}
              onClick={() => {
                setSelectedTab(key);
                // Automatisch den ersten Standort aus dem Tab auswählen
                const firstLocation = locations.find((location) => {
                  if (key === "main") return location.type === "main";
                  if (key === "sighting") return location.type === "sighting";
                  return !["main", "sighting"].includes(location.type);
                });
                if (firstLocation) {
                  setSelectedLocation(firstLocation);
                }
              }}
              className={`flex items-center gap-2 rounded-t-lg px-4 py-2 font-medium transition-colors ${
                selectedTab === key
                  ? "bg-emerald-600 text-white"
                  : "text-muted-foreground hover:bg-muted dark:text-muted-foreground dark:hover:bg-muted"
              }`}
            >
              <Icon className="h-4 w-4" /> {label} ({count})
            </button>
          ))}
        </div>

        {/* Selected Location Details */}
        {selectedLocation && (
          <div className="mt-6 space-y-6">
            {/* Location Info Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                {React.createElement(getLocationIcon(selectedLocation.type), {
                  className: "h-6 w-6 text-emerald-600 dark:text-emerald-400",
                })}
              </div>
              <div>
                <h4 className="text-lg font-semibold text-muted-foreground dark:text-white">
                  {selectedLocation.address}
                </h4>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                  {selectedLocation.description}
                </p>
                <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground dark:text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />{" "}
                    {selectedLocation.timestamp.toLocaleString("de-DE")}
                  </span>
                  {selectedLocation.confidence && (
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />{" "}
                      {selectedLocation.confidence}% sicher
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="h-80 overflow-hidden rounded-lg">
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedLocation.coordinates.lng - 0.005},${selectedLocation.coordinates.lat - 0.005},${selectedLocation.coordinates.lng + 0.005},${selectedLocation.coordinates.lat + 0.005}&layer=mapnik&marker=${selectedLocation.coordinates.lat},${selectedLocation.coordinates.lng}`}
                className="h-full w-full border-0"
                title="Standort Detail"
                loading="lazy"
              />
            </div>

            {/* Compact Action Bar */}
            <div className="flex items-center justify-between rounded-lg bg-muted p-2 dark:bg-muted">
              {/* Maps Buttons - Links */}
              <div className="flex gap-1">
                <button
                  onClick={() => openInMaps("google")}
                  className="flex items-center gap-1 rounded bg-emerald-100 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-300"
                >
                  <Navigation2 className="h-3 w-3" /> Google
                </button>
                <button
                  onClick={() => openInMaps("apple")}
                  className="flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs text-muted-foreground hover:bg-muted dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted"
                >
                  <Navigation2 className="h-3 w-3" /> Apple
                </button>
                <button
                  onClick={() => openInMaps("osm")}
                  className="flex items-center gap-1 rounded bg-orange-100 px-2 py-1 text-xs text-orange-700 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300"
                >
                  <Navigation2 className="h-3 w-3" /> OSM
                </button>
              </div>

              {/* Export Buttons - Rechts */}
              <div className="flex gap-1">
                <button
                  onClick={() => console.log("Teilen")}
                  className="flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
                >
                  <Download className="h-3 w-3" /> Teilen
                </button>
                <button
                  onClick={() => console.log("Excel Export")}
                  className="flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-xs text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
                >
                  <Download className="h-3 w-3" /> Excel
                </button>
                <button
                  onClick={() => console.log("PDF Export")}
                  className="flex items-center gap-1 rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
                >
                  <Download className="h-3 w-3" /> PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Validation */}
      {!(data?.step4?.mainLocation as { address?: string } | null)?.address && (
        <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Hauptstandort fehlt
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Ein Hauptstandort ist wichtig für die Fahndung.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
