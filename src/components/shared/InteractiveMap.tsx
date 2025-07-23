"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Search } from "lucide-react";

// Fix für Leaflet Icons in Next.js
delete (L.Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

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
  onLocationAdd?: (location: Omit<MapLocation, "id">) => void;
  onLocationUpdate?: (id: string, location: MapLocation) => void;
  onLocationRemove?: (id: string) => void;
  searchRadius?: number; // in km
  showRadius?: boolean;
  editable?: boolean;
  showSearch?: boolean;
  offlineMode?: boolean;
}

// Marker Icons nach Typ
const markerIcons = {
  main: { color: "#DC2626", icon: "🎯" },
  tatort: { color: "#991B1B", icon: "⚠️" },
  wohnort: { color: "#2563EB", icon: "🏠" },
  arbeitsplatz: { color: "#7C3AED", icon: "💼" },
  sichtung: { color: "#F59E0B", icon: "👁️" },
  sonstiges: { color: "#6B7280", icon: "📍" },
};

export default function InteractiveMap({
  locations = [],
  center = [48.8566, 8.3522], // Default: Pforzheim
  zoom = 13,
  height = "400px",
  onLocationAdd,
  onLocationRemove,
  searchRadius = 5,
  showRadius = false,
  editable = false,
  showSearch = true,
  offlineMode = false,
}: InteractiveMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const radiusCircleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      // Map initialisieren
      const map = L.map("interactive-map").setView(center, zoom);

      // Tile Layer (OpenStreetMap für Offline-Fähigkeit)
      if (offlineMode) {
        // Für Offline: Lokale Tiles verwenden
        L.tileLayer("/offline-tiles/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors (Offline)",
          maxZoom: 18,
        }).addTo(map);
      } else {
        // Online: OpenStreetMap
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);
      }

      // Klick-Handler für neue Locations
      if (editable && onLocationAdd) {
        map.on("click", (e) => {
          const { lat, lng } = e.latlng;

          // Reverse Geocoding für Adresse
          void (async () => {
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
              );
              const data = (await response.json()) as { display_name?: string };

              onLocationAdd({
                lat,
                lng,
                address: data.display_name ?? "Unbekannte Adresse",
                type: "sichtung",
                timestamp: new Date(),
              });
            } catch {
              onLocationAdd({
                lat,
                lng,
                address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                type: "sichtung",
                timestamp: new Date(),
              });
            }
          })();
        });
      }

      mapRef.current = map;
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom, offlineMode, editable, onLocationAdd]);

  // Locations aktualisieren
  useEffect(() => {
    if (!mapRef.current) return;

    // Alte Marker entfernen
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Neue Marker hinzufügen
    locations.forEach((location) => {
      const iconConfig = markerIcons[location.type];

      // Custom Icon
      const customIcon = L.divIcon({
        html: `
          <div style="
            background-color: ${iconConfig.color};
            width: 36px;
            height: 36px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            position: relative;
          ">
            <span style="transform: rotate(45deg); font-size: 18px;">
              ${iconConfig.icon}
            </span>
          </div>
        `,
        className: "custom-marker",
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const marker = L.marker([location.lat, location.lng], {
        icon: customIcon,
      }).addTo(mapRef.current!);

      // Popup
      const popupContent = `
        <div style="min-width: 200px;">
          <h4 style="margin: 0 0 8px 0; font-weight: bold;">${location.type}</h4>
          <p style="margin: 0 0 4px 0; font-size: 14px;">${location.address}</p>
          ${location.description ? `<p style="margin: 0; font-size: 12px; color: #666;">${location.description}</p>` : ""}
          ${
            location.timestamp
              ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #999;">
            ${new Date(location.timestamp).toLocaleString("de-DE")}
          </p>`
              : ""
          }
          ${
            editable && onLocationRemove
              ? `
            <button 
              onclick="window.removeMapLocation('${location.id}')"
              style="
                margin-top: 8px;
                padding: 4px 8px;
                background: #dc2626;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
              "
            >
              Entfernen
            </button>
          `
              : ""
          }
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.set(location.id, marker);
    });

    // Hauptlocation mit Radius
    const mainLocation = locations.find((l) => l.type === "main");
    if (mainLocation && showRadius) {
      if (radiusCircleRef.current) {
        radiusCircleRef.current.remove();
      }

      radiusCircleRef.current = L.circle([mainLocation.lat, mainLocation.lng], {
        color: "#DC2626",
        fillColor: "#DC2626",
        fillOpacity: 0.1,
        radius: searchRadius * 1000, // km zu meter
      }).addTo(mapRef.current);
    }

    // Karte auf alle Marker zentrieren
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    // Global function für Remove-Button
    (window as { removeMapLocation?: (id: string) => void }).removeMapLocation =
      (id: string) => {
        if (onLocationRemove) {
          onLocationRemove(id);
        }
      };
  }, [
    locations,
    showRadius,
    searchRadius,
    editable,
    onLocationRemove,
    center,
    zoom,
    offlineMode,
    onLocationAdd,
  ]);

  return (
    <div className="relative">
      {showSearch && (
        <div className="absolute top-2 left-2 z-[1000] rounded-lg bg-white p-2 shadow-lg">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Adresse suchen..."
              className="rounded border px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  const query = (e.target as HTMLInputElement).value;
                  void (async () => {
                    try {
                      const response = await fetch(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
                      );
                      const data = (await response.json()) as Array<{
                        lat: string;
                        lon: string;
                      }>;
                      if (data[0]) {
                        const { lat, lon } = data[0];
                        mapRef.current?.setView(
                          [parseFloat(lat), parseFloat(lon)],
                          16,
                        );
                      }
                    } catch (error) {
                      console.error("Suche fehlgeschlagen:", error);
                    }
                  })();
                }
              }}
            />
          </div>
        </div>
      )}

      {editable && (
        <div className="absolute top-2 right-2 z-[1000] rounded-lg bg-white p-3 shadow-lg">
          <div className="text-xs text-gray-600">
            <MapPin className="mr-1 inline h-3 w-3" />
            Klicken Sie auf die Karte für neue Orte
          </div>
        </div>
      )}

      <div id="interactive-map" style={{ height, width: "100%" }} />

      {locations.length > 0 && (
        <div className="mt-2 rounded bg-gray-50 p-2 text-sm">
          <div className="mb-1 font-medium">Markierte Orte:</div>
          <div className="space-y-1">
            {locations.map((loc) => (
              <div key={loc.id} className="flex items-center space-x-2">
                <span>{markerIcons[loc.type].icon}</span>
                <span className="text-gray-700">{loc.type}:</span>
                <span className="text-xs text-gray-600">
                  {loc.address.split(",")[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
