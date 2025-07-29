"use client";

import React, { useEffect, useRef, useState } from "react";

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

interface InteractiveMapProps {
  locations: MapLocation[];
  center: [number, number];
  zoom: number;
  height: string;
  searchRadius?: number;
  showRadius?: boolean;
  editable?: boolean;
  onLocationClick?: (location: MapLocation) => void;
  onMapClick?: (lat: number, lng: number) => void;
  onLocationRemove?: (id: string) => void;
}

interface LeafletMap {
  setView: (center: [number, number], zoom: number) => LeafletMap;
  remove: () => void;
  on: (event: string, handler: (e: LeafletEvent) => void) => void;
  off: (event: string, handler: (e: LeafletEvent) => void) => void;
  removeLayer: (layer: object) => void;
  addTo: (map: LeafletMap) => object;
}

interface LeafletMarker {
  addTo: (map: LeafletMap) => LeafletMarker;
  bindPopup: (content: string) => LeafletMarker;
  on: (event: string, handler: () => void) => void;
}

interface LeafletCircle {
  addTo: (map: LeafletMap) => LeafletCircle;
}

interface LeafletTileLayer {
  addTo: (map: LeafletMap) => LeafletTileLayer;
}

interface LeafletEvent {
  latlng: { lat: number; lng: number };
}

interface LeafletIconOptions {
  className?: string;
  html?: string;
  iconSize?: [number, number];
  iconAnchor?: [number, number];
}

interface LeafletStatic {
  map: (element: HTMLElement) => LeafletMap;
  tileLayer: (
    url: string,
    options: Record<string, unknown>,
  ) => LeafletTileLayer;
  marker: (
    latlng: [number, number],
    options: Record<string, unknown>,
  ) => LeafletMarker;
  circle: (
    latlng: [number, number],
    options: Record<string, unknown>,
  ) => LeafletCircle;
  divIcon: (options: LeafletIconOptions) => object;
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
  onMapClick,
  onLocationRemove,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [markers, setMarkers] = useState<LeafletMarker[]>([]);
  const [circle, setCircle] = useState<LeafletCircle | null>(null);

  // Dynamischer Import von Leaflet
  const [leaflet, setLeaflet] = useState<LeafletStatic | null>(null);

  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        const L = await import("leaflet");
        // CSS-Import entfernen, da es in Next.js anders gehandhabt wird
        setLeaflet(L as unknown as LeafletStatic);
      } catch (error) {
        console.error("Fehler beim Laden von Leaflet:", error);
      }
    };

    void loadLeaflet();
  }, []);

  // Map initialisieren
  useEffect(() => {
    if (!leaflet || !mapRef.current || map) return;

    const L = leaflet;
    const newMap = L.map(mapRef.current).setView(center, zoom);

    // OpenStreetMap Tile Layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(newMap);

    setMap(newMap);

    return () => {
      if (newMap) {
        newMap.remove();
      }
    };
  }, [leaflet, center, zoom, map]);

  // Markers aktualisieren
  useEffect(() => {
    if (!map || !leaflet) return;

    const L = leaflet;

    // Alte Markers entfernen
    markers.forEach((marker) => {
      map.removeLayer(marker);
    });

    // Neue Markers erstellen
    const newMarkers = locations.map((location) => {
      const markerColor = getMarkerColor(location.type);
      const icon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            width: 20px;
            height: 20px;
            background-color: ${markerColor};
            border: 2px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            cursor: pointer;
          ">
            <div style="
              width: 8px;
              height: 8px;
              background-color: white;
              border-radius: 50%;
            "></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([location.lat, location.lng], { icon }).addTo(map)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h4 style="margin: 0 0 8px 0; font-weight: bold;">${getLocationTypeLabel(location.type)}</h4>
            <p style="margin: 0 0 8px 0; font-size: 14px;">${location.address}</p>
            <div style="font-size: 12px; color: #666;">
              <div>Lat: ${location.lat.toFixed(6)}</div>
              <div>Lng: ${location.lng.toFixed(6)}</div>
              ${location.description ? `<div style="margin-top: 4px;">${location.description}</div>` : ""}
            </div>
            ${
              editable && onLocationRemove
                ? `
              <div style="margin-top: 8px; text-align: right;">
                <button onclick="window.removeLocation('${location.id}')" style="
                  background: #ef4444;
                  color: white;
                  border: none;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 12px;
                  cursor: pointer;
                ">Entfernen</button>
              </div>
            `
                : ""
            }
          </div>
        `);

      marker.on("click", () => {
        if (onLocationClick) {
          onLocationClick(location);
        }
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Global function für Popup-Buttons
    (
      window as Window & { removeLocation?: (id: string) => void }
    ).removeLocation = (id: string) => {
      if (onLocationRemove) {
        onLocationRemove(id);
      }
    };
  }, [
    map,
    leaflet,
    locations,
    editable,
    onLocationClick,
    onLocationRemove,
    markers,
  ]);

  // Suchradius-Kreis
  useEffect(() => {
    if (!map || !leaflet || !showRadius || !locations.length) return;

    const L = leaflet;
    const mainLocation =
      locations.find((loc) => loc.type === "main") ?? locations[0];

    if (circle) {
      map.removeLayer(circle);
    }

    if (mainLocation) {
      const newCircle = L.circle([mainLocation.lat, mainLocation.lng], {
        color: "#3b82f6",
        fillColor: "#3b82f6",
        fillOpacity: 0.1,
        radius: searchRadius * 1000, // Konvertiere km zu Meter
      }).addTo(map);

      setCircle(newCircle);
    }
  }, [map, leaflet, locations, searchRadius, showRadius, circle]);

  // Map Click Handler
  useEffect(() => {
    if (!map || !onMapClick) return;

    const handleMapClick = (e: LeafletEvent) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    };

    map.on("click", handleMapClick);

    return () => {
      map.off("click", handleMapClick);
    };
  }, [map, onMapClick]);

  const getMarkerColor = (type: MapLocation["type"]) => {
    const colors = {
      main: "#3b82f6", // blue
      tatort: "#ef4444", // red
      wohnort: "#10b981", // green
      arbeitsplatz: "#f59e0b", // yellow
      sichtung: "#8b5cf6", // purple
      sonstiges: "#6b7280", // gray
    };
    return colors[type] ?? colors.sonstiges;
  };

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

  return (
    <div className="relative">
      <div ref={mapRef} style={{ height }} className="w-full rounded-lg" />

      {/* Legende */}
      <div className="absolute top-4 right-4 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-600 dark:bg-gray-800">
        <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Legende
        </h4>
        <div className="space-y-1">
          {[
            { type: "main", label: "Hauptort" },
            { type: "tatort", label: "Tatort" },
            { type: "wohnort", label: "Wohnort" },
            { type: "arbeitsplatz", label: "Arbeitsplatz" },
            { type: "sichtung", label: "Sichtung" },
            { type: "sonstiges", label: "Sonstiges" },
          ].map((item) => (
            <div key={item.type} className="flex items-center space-x-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: getMarkerColor(
                    item.type as MapLocation["type"],
                  ),
                }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Suchradius Info */}
      {showRadius && searchRadius && (
        <div className="absolute bottom-4 left-4 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-600 dark:bg-gray-800">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Suchradius: {searchRadius} km
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
