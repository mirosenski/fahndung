"use client";

import React from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";

export interface MapLocation {
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

interface SimpleMapProps {
  locations: MapLocation[];
  center: [number, number];
  zoom: number;
  height: string;
  searchRadius?: number;
  showRadius?: boolean;
  editable?: boolean;
  onLocationClick?: (location: MapLocation) => void;
  onLocationRemove?: (id: string) => void;
}

const SimpleMap: React.FC<SimpleMapProps> = ({
  locations,
  center,
  height,
  searchRadius = 5,
  showRadius = true,
  editable = false,
  onLocationClick,
  onLocationRemove,
}) => {
  const getLocationTypeLabel = (type: MapLocation["type"]) => {
    const labels = {
      main: "Hauptort",
      tatort: "Tatort",
      wohnort: "Wohnort",
      arbeitsplatz: "Arbeitsplatz",
      sichtung: "Sichtung",
      sonstiges: "Sonstiges",
    };
    return labels[type] ?? "Sonstiges";
  };

  const getLocationTypeColor = (type: MapLocation["type"]) => {
    const colors = {
      main: "bg-blue-500",
      tatort: "bg-red-500",
      wohnort: "bg-green-500",
      arbeitsplatz: "bg-yellow-500",
      sichtung: "bg-orange-500",
      sonstiges: "bg-gray-500",
    };
    return colors[type] ?? "bg-gray-500";
  };

  const mainLocation = locations.find((loc) => loc.type === "main");

  // Erstelle OpenStreetMap URL für statische Karte
  const createMapUrl = () => {
    const [lat, lng] = center;
    const zoom = 13;
    const width = 800;
    const height = 600;

    return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&maptype=mapnik&markers=${lat},${lng},red`;
  };

  return (
    <div className="relative" style={{ height }}>
      {/* Statische Karte */}
      <div className="relative h-full w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-800">
        <Image src={createMapUrl()} alt="Karte" fill className="object-cover" />

        {/* Overlay für Markierungen */}
        <div className="absolute inset-0">
          {locations.map((location, index) => (
            <div
              key={location.id}
              className="absolute -translate-x-1/2 -translate-y-full transform cursor-pointer"
              style={{
                left: `${50 + index * 10}%`,
                top: `${30 + index * 15}%`,
              }}
              onClick={() => onLocationClick?.(location)}
            >
              <div
                className={`relative ${getLocationTypeColor(location.type)} rounded-full p-2 text-white shadow-lg`}
              >
                <MapPin className="h-4 w-4" />
                <div className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 transform rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {getLocationTypeLabel(location.type)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Suchradius-Indikator */}
        {showRadius && mainLocation && (
          <div
            className="absolute rounded-full border-2 border-blue-500 border-opacity-50 bg-blue-500 bg-opacity-10"
            style={{
              left: "50%",
              top: "50%",
              width: `${searchRadius * 20}px`,
              height: `${searchRadius * 20}px`,
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
      </div>

      {/* Legende */}
      <div className="mt-2 rounded-lg bg-white p-3 shadow-lg dark:bg-gray-800">
        <h4 className="mb-2 text-sm font-medium">Standorte</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {locations.map((location) => (
            <div key={location.id} className="flex items-center space-x-2">
              <div
                className={`h-3 w-3 rounded-full ${getLocationTypeColor(location.type)}`}
              />
              <span>{getLocationTypeLabel(location.type)}</span>
              {editable && onLocationRemove && (
                <button
                  onClick={() => onLocationRemove(location.id)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimpleMap;
