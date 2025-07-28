"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Plus, Minus, Crosshair } from "lucide-react";

// Fix für Leaflet Icons in Next.js - wird in useEffect ausgeführt
let leafletInitialized = false;

export interface MapLocation {
  id: string;
  lat: number;
  lng: number;
  address: string;
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

interface InteractiveMapProps {
  locations: MapLocation[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  searchRadius?: number;
  showRadius?: boolean;
  editable?: boolean;
  showSearch?: boolean;
  onLocationAdd?: (location: Omit<MapLocation, "id">) => void;
  onLocationUpdate?: (id: string, location: MapLocation) => void;
  onLocationRemove?: (id: string) => void;
  onLocationClick?: (location: MapLocation) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

// Custom Marker Icons - werden in useEffect erstellt
let markerIcons: Record<string, L.DivIcon> | null = null;

const createMarkerIcon = (emoji: string, size = 24) => {
  return L.divIcon({
    html: `<div style="font-size: ${size}px; text-align: center; line-height: 1;">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
    className: "custom-div-icon",
  });
};

// Map Click Handler Component
const MapClickHandler: React.FC<{
  onMapClick?: (lat: number, lng: number) => void;
  editable?: boolean;
}> = ({ onMapClick, editable }) => {
  useMapEvents({
    click: (e) => {
      if (editable && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

// Mobile Touch Controls
const MobileMapControls: React.FC<{
  map: L.Map | null;
  onLocate?: () => void;
}> = ({ map, onLocate }) => {
  const handleZoomIn = () => map?.zoomIn();
  const handleZoomOut = () => map?.zoomOut();

  return (
    <div className="absolute top-4 right-4 z-[1000] space-y-2">
      <button
        onClick={handleZoomIn}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        aria-label="Zoom In"
      >
        <Plus className="h-6 w-6" />
      </button>
      <button
        onClick={handleZoomOut}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        aria-label="Zoom Out"
      >
        <Minus className="h-6 w-6" />
      </button>
      <button
        onClick={onLocate}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        aria-label="Meine Position"
      >
        <Crosshair className="h-6 w-6" />
      </button>
    </div>
  );
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  locations = [],
  center = [48.7758, 9.1829], // Stuttgart
  zoom = 13,
  height = "400px",
  searchRadius = 5,
  showRadius = true,
  editable = false,
  showSearch: _showSearch = true,
  onLocationAdd: _onLocationAdd,
  onLocationUpdate: _onLocationUpdate,
  onLocationRemove: _onLocationRemove,
  onLocationClick,
  onMapClick,
}) => {
  const [map, setMap] = useState<L.Map | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Initialize Leaflet icons on client side
  useEffect(() => {
    if (!leafletInitialized && typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        iconUrl: "/leaflet/marker-icon.png",
        shadowUrl: "/leaflet/marker-shadow.png",
      });

      // Initialize marker icons
      markerIcons = {
        main: createMarkerIcon("🎯", 28),
        tatort: createMarkerIcon("⚠️", 28),
        wohnort: createMarkerIcon("🏠", 24),
        arbeitsplatz: createMarkerIcon("💼", 24),
        sichtung: createMarkerIcon("👁️", 20),
        sonstiges: createMarkerIcon("📍", 20),
      };

      leafletInitialized = true;
    }
  }, []);

  // Geolocation
  const handleLocate = () => {
    if (!map) return;

    map.locate({ setView: true, maxZoom: 16 });

    map.on("locationfound", (e) => {
      const radius = e.accuracy;
      const latlng = e.latlng;

      L.marker(latlng)
        .addTo(map)
        .bindPopup(
          `Sie befinden sich innerhalb von ${radius} Metern von diesem Punkt`,
        )
        .openPopup();

      L.circle(latlng, radius).addTo(map);
    });

    map.on("locationerror", () => {
      alert("Standort konnte nicht ermittelt werden");
    });
  };

  return (
    <div className="relative" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        ref={(ref) => {
          if (ref) {
            setMap(ref);
            mapRef.current = ref;
          }
        }}
        className="h-full w-full rounded-lg"
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        zoomControl={false} // We'll use custom controls
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapClickHandler onMapClick={onMapClick} editable={editable} />

        {/* Markers */}
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
            icon={markerIcons?.[location.type]}
            eventHandlers={{
              click: () => onLocationClick?.(location),
            }}
          >
            <Popup>
              <div className="min-w-[200px] p-2">
                <h3 className="font-semibold text-gray-900">
                  {location.address}
                </h3>
                <p className="text-sm text-gray-600 capitalize">
                  {location.type.replace("_", " ")}
                </p>
                {location.description && (
                  <p className="mt-1 text-sm">{location.description}</p>
                )}
                {location.timestamp && (
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(location.timestamp).toLocaleString("de-DE")}
                  </p>
                )}
                {editable && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => _onLocationRemove?.(location.id)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Entfernen
                    </button>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Search Radius Circle */}
        {showRadius &&
          locations.length > 0 &&
          searchRadius > 0 &&
          locations[0] && (
            <Circle
              center={[locations[0].lat, locations[0].lng]}
              radius={searchRadius * 1000}
              pathOptions={{
                color: "red",
                fillColor: "red",
                fillOpacity: 0.1,
                weight: 2,
              }}
            />
          )}
      </MapContainer>

      {/* Mobile Controls */}
      <MobileMapControls map={map} onLocate={handleLocate} />
    </div>
  );
};

export default InteractiveMap;
