"use client";

import React from "react";
import dynamic from "next/dynamic";

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

// Dynamischer Import von react-leaflet Komponenten
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false },
);

interface InteractiveMapProps {
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

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  locations,
  center,
  zoom,
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

  const mainLocation = locations.find((loc) => loc.type === "main");

  return (
    <div className="relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height, width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Markers für alle Locations */}
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
            eventHandlers={{
              click: () => onLocationClick?.(location),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">
                  {getLocationTypeLabel(location.type)}
                </h3>
                <p className="text-sm">{location.address}</p>
                {location.description && (
                  <p className="text-xs text-gray-600">
                    {location.description}
                  </p>
                )}
                {editable && onLocationRemove && (
                  <button
                    onClick={() => onLocationRemove(location.id)}
                    className="mt-2 text-xs text-red-500"
                  >
                    Entfernen
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Suchradius-Kreis um den Hauptstandort */}
        {showRadius && mainLocation && (
          <Circle
            center={[mainLocation.lat, mainLocation.lng]}
            radius={searchRadius * 1000} // Konvertiere km zu Meter
            pathOptions={{
              color: "#3b82f6",
              fillColor: "#3b82f6",
              fillOpacity: 0.1,
            }}
          />
        )}
      </MapContainer>

      {/* Legende */}
      <div className="absolute top-4 right-4 rounded-lg bg-white p-3 text-sm shadow-lg">
        <h4 className="mb-2 font-bold">Legende</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span>Hauptort</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <span>Tatort</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span>Wohnort</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <span>Arbeitsplatz</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-purple-500"></div>
            <span>Sichtung</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gray-500"></div>
            <span>Sonstiges</span>
          </div>
        </div>
      </div>

      {/* Suchradius-Anzeige */}
      {mainLocation && (
        <div className="absolute bottom-4 left-4 rounded-lg bg-white px-3 py-1 text-sm shadow-lg">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span>Suchradius: {searchRadius} km</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
