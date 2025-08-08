"use client";

import React from "react";
// Verwenden Sie die vorhandene SimpleMap‑Komponente als leichten Kartenersatz.
// SimpleMap erstellt eine statische OpenStreetMap‑Karte mit Markern ohne schwere JS‑Bibliotheken.
import SimpleMap, { MapLocation } from "~/components/shared/SimpleMap";

interface MapPreviewProps {
  /**
   * Geografische Länge in Dezimalgrad
   */
  longitude: number;
  /**
   * Geografische Breite in Dezimalgrad
   */
  latitude: number;
}

/**
 * Eine schlanke Karten‑Vorschau, die das bestehende SimpleMap‑Modul nutzt.
 *
 * Statt Mapbox oder Leaflet zu laden, verwendet diese Komponente eine statische
 * OpenStreetMap‑Abbildung. Dies hält das Bundle klein und vermeidet unnötigen
 * JavaScript‑Overhead. Die Karte wird innerhalb eines Containers dargestellt
 * und zeigt lediglich den Hauptstandort als Marker an. Für interaktive
 * Funktionen kann später ein dynamischer Import von Mapbox/Leaflet genutzt
 * werden.
 */
const MapPreview: React.FC<MapPreviewProps> = ({ longitude, latitude }) => {
  // Erstelle einen Marker für den Hauptstandort.
  const locations: MapLocation[] = [
    {
      id: "main",
      address: "",
      lat: latitude,
      lng: longitude,
      type: "main",
    },
  ];

  return (
    <div className="relative h-64 w-full rounded-xl overflow-hidden">
      <SimpleMap
        locations={locations}
        center={[latitude, longitude]}
        zoom={13}
        height="100%"
        showRadius={false}
      />
    </div>
  );
};

export default MapPreview;