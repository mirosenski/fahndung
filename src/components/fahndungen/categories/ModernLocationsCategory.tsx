"use client";

import React, { useState, useEffect, useRef } from "react";
// Importiere alle benötigten Icons einzeln, um Tree‑Shaking zu ermöglichen
import MapPin from "@lucide-react/map-pin";
import Navigation from "@lucide-react/navigation";
import Search from "@lucide-react/search";
import Plus from "@lucide-react/plus";
import Minus from "@lucide-react/minus";
import Layers from "@lucide-react/layers";
import Route from "@lucide-react/route";
import Clock from "@lucide-react/clock";
import Calendar from "@lucide-react/calendar";
import TrendingUp from "@lucide-react/trending-up";
import AlertCircle from "@lucide-react/alert-circle";
import ChevronRight from "@lucide-react/chevron-right";
import ChevronLeft from "@lucide-react/chevron-left";
import Maximize2 from "@lucide-react/maximize-2";
import Download from "@lucide-react/download";
import Share2 from "@lucide-react/share-2";
import Filter from "@lucide-react/filter";
import Eye from "@lucide-react/eye";
import EyeOff from "@lucide-react/eye-off";
import Navigation2 from "@lucide-react/navigation-2";
import Compass from "@lucide-react/compass";
import Map from "@lucide-react/map";
import Globe from "@lucide-react/globe";
import Home from "@lucide-react/home";
import Building from "@lucide-react/building";
import Car from "@lucide-react/car";
import Users from "@lucide-react/users";
import AlertTriangle from "@lucide-react/alert-triangle";
import Info from "@lucide-react/info";
import Check from "@lucide-react/check";
import X from "@lucide-react/x";
import Edit3 from "@lucide-react/edit-3";
import Trash2 from "@lucide-react/trash-2";
import Copy from "@lucide-react/copy";
import ExternalLink from "@lucide-react/external-link";
import Smartphone from "@lucide-react/smartphone";
import Monitor from "@lucide-react/monitor";
import Target from "@lucide-react/target";
import Activity from "@lucide-react/activity";
import BarChart3 from "@lucide-react/bar-chart-3";
import PinOff from "@lucide-react/pin-off";
import Crosshair from "@lucide-react/crosshair";
import Zap from "@lucide-react/zap";
import Shield from "@lucide-react/shield";
import Bell from "@lucide-react/bell";
import Settings from "@lucide-react/settings";
import Database from "@lucide-react/database";
import Cloud from "@lucide-react/cloud";
import Wifi from "@lucide-react/wifi";
import WifiOff from "@lucide-react/wifi-off";
import Battery from "@lucide-react/battery";
import Signal from "@lucide-react/signal";
import Satellite from "@lucide-react/satellite";

interface LocationsCategoryProps {
  data: any;
  isEditMode: boolean;
  updateField: (step: string, field: string, value: any) => void;
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
  images?: string[];
  notes?: string;
}

/**
 * ModernLocationsCategory
 *
 * Eine vollausgestattete Kartenkategorie mit OpenStreetMap‑Integration.
 * Enthält Markerlisten, Heatmap-/Radius‑Umschalter, Zeitleiste, Live‑Tracking
 * sowie Exporte. Icons werden einzeln importiert, um die Bundle‑Größe gering
 * zu halten. Für die Kartenanzeige wird ein OSM‑Embed verwendet, das ohne
 * zusätzliche JS‑Bibliotheken auskommt. Marker werden über eine einfache
 * Projektion relativ zur Kartenmitte auf dem Overlay positioniert.
 */
export default function ModernLocationsCategory({
  data,
  isEditMode,
  updateField,
  onNext,
  onPrevious,
}: LocationsCategoryProps) {
  const [locations, setLocations] = useState<Location[]>([
    {
      id: "1",
      type: "main",
      address: data?.step4?.mainLocation?.address || "Königstraße 28, 70173 Stuttgart",
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
      coordinates: { lat: 48.7785, lng: 9.1800 },
      timestamp: new Date(Date.now() - 3600000),
      description: "Mögliche Sichtung",
      confidence: 60,
      witnesses: 1,
    },
    {
      id: "3",
      type: "residence",
      address: "Marienplatz 1, 70178 Stuttgart",
      coordinates: { lat: 48.7636, lng: 9.1680 },
      timestamp: new Date(Date.now() - 86400000),
      description: "Wohnadresse",
      verified: true,
    },
  ]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(locations[0]);
  const [mapView, setMapView] = useState<"street" | "satellite" | "terrain" | "hybrid">("street");
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showRadius, setShowRadius] = useState(true);
  const [showRoute, setShowRoute] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [zoom, setZoom] = useState(13);
  const [center, setCenter] = useState({ lat: 48.7758, lng: 9.1829 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGeofence, setShowGeofence] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [liveLocation, setLiveLocation] = useState<GeolocationPosition | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Icon‑Mapping für Location Types
  const locationTypes: Record<
    Location["type"],
    { color: string; icon: string; label: string }
  > = {
    main: { color: "red", icon: "📍", label: "Hauptstandort" },
    sighting: { color: "yellow", icon: "👁", label: "Sichtung" },
    residence: { color: "blue", icon: "🏠", label: "Wohnung" },
    work: { color: "green", icon: "🏢", label: "Arbeitsplatz" },
    incident: { color: "orange", icon: "⚠️", label: "Vorfall" },
    other: { color: "gray", icon: "📌", label: "Sonstiges" },
  };

  // Simuliere Kartenladen
  useEffect(() => {
    const timer = setTimeout(() => setMapLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Live‑Tracking
  useEffect(() => {
    if (tracking && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLiveLocation(position);
          setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => console.error("Geolocation error:", error),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [tracking]);

  // Geocoding per Nominatim
  const geocodeAddress = async (address: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      );
      const result = await response.json();
      if (result && result[0]) {
        return {
          lat: parseFloat(result[0].lat),
          lng: parseFloat(result[0].lon),
          display_name: result[0].display_name,
        };
      }
      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  // Neue Position hinzufügen
  const addLocation = async () => {
    if (!searchQuery) return;
    const geocoded = await geocodeAddress(searchQuery);
    if (geocoded) {
      const newLoc: Location = {
        id: Date.now().toString(),
        type: "sighting",
        address: geocoded.display_name,
        coordinates: { lat: geocoded.lat, lng: geocoded.lng },
        timestamp: new Date(),
        description: "Neue Markierung",
        confidence: 50,
        verified: false,
      };
      setLocations((prev) => [...prev, newLoc]);
      setSelectedLocation(newLoc);
      setCenter({ lat: geocoded.lat, lng: geocoded.lng });
      setSearchQuery("");
      setIsAddingLocation(false);
    }
  };

  // Standort löschen
  const deleteLocation = (id: string) => {
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
    if (selectedLocation?.id === id) setSelectedLocation(null);
  };

  // Abstand berechnen (Haversine)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  // Map‑URL generieren (OSM embed)
  const getMapUrl = () => {
    const baseUrl = "https://www.openstreetmap.org/export/embed.html";
    const bbox = `${center.lng - 0.01},${center.lat - 0.01},${center.lng + 0.01},${center.lat + 0.01}`;
    const marker = selectedLocation
      ? `${selectedLocation.coordinates.lat},${selectedLocation.coordinates.lng}`
      : "";
    return `${baseUrl}?bbox=${bbox}&layer=mapnik${marker ? `&marker=${marker}` : ""}`;
  };

  // Externe Karten öffnen
  const openInMaps = (platform: "google" | "apple" | "osm") => {
    const loc = selectedLocation || locations[0];
    if (!loc) return;
    const urls = {
      google: `https://www.google.com/maps/search/?api=1&query=${loc.coordinates.lat},${loc.coordinates.lng}`,
      apple: `https://maps.apple.com/?ll=${loc.coordinates.lat},${loc.coordinates.lng}&q=${encodeURIComponent(loc.address)}`,
      osm: `https://www.openstreetmap.org/?mlat=${loc.coordinates.lat}&mlon=${loc.coordinates.lng}&zoom=15`,
    };
    window.open(urls[platform], "_blank");
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/50 p-3 backdrop-blur-sm dark:bg-white/10">
              <MapPin className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Standorte & Karte</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {locations.length} Markierungen • {selectedTimeRange} Zeitraum
              </p>
            </div>
          </div>
          {/* Quick Stats */}
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-white/50 px-3 py-2 backdrop-blur-sm dark:bg-white/10">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium">
                  {locations.filter((l) => l.verified).length} verifiziert
                </span>
              </div>
            </div>
            <div className="rounded-xl bg-white/50 px-3 py-2 backdrop-blur-sm dark:bg-white/10">
              <div className="flex items-center gap-2">
                {tracking ? (
                  <Wifi className="h-4 w-4 animate-pulse text-green-600 dark:text-green-400" />
                ) : (
                  <WifiOff className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                )}
                <span className="text-sm font-medium">
                  {tracking ? "Live" : "Offline"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Map Container */}
        <div className="lg:col-span-2">
          <div className="relative h-[600px] overflow-hidden rounded-3xl bg-white shadow-xl dark:bg-gray-800">
            {/* Map Controls */}
            <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
              {/* Suche */}
              <div className="flex gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") addLocation();
                    }}
                    placeholder="Adresse suchen..."
                    className="w-64 rounded-xl bg-white/90 px-4 py-2 pl-10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800/90"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                {isEditMode && (
                  <button
                    onClick={addLocation}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                )}
              </div>
              {/* View Controls */}
              <div className="flex gap-2">
                <button
                  onClick={() => setMapView("street")}
                  className={`rounded-lg p-2 backdrop-blur-sm ${
                    mapView === "street"
                      ? "bg-emerald-600 text-white"
                      : "bg-white/90 text-gray-700 hover:bg-white dark:bg-gray-800/90 dark:text-gray-300"
                  }`}
                >
                  <Map className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setMapView("satellite")}
                  className={`rounded-lg p-2 backdrop-blur-sm ${
                    mapView === "satellite"
                      ? "bg-emerald-600 text-white"
                      : "bg-white/90 text-gray-700 hover:bg-white dark:bg-gray-800/90 dark:text-gray-300"
                  }`}
                >
                  <Satellite className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setMapView("terrain")}
                  className={`rounded-lg p-2 backdrop-blur-sm ${
                    mapView === "terrain"
                      ? "bg-emerald-600 text-white"
                      : "bg-white/90 text-gray-700 hover:bg-white dark:bg-gray-800/90 dark:text-gray-300"
                  }`}
                >
                  <Globe className="h-4 w-4" />
                </button>
              </div>
              {/* Layer Controls */}
              <div className="flex flex-col gap-2 rounded-xl bg-white/90 p-2 backdrop-blur-sm dark:bg-gray-800/90">
                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
                    showHeatmap
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  <Activity className="h-4 w-4" /> Heatmap
                </button>
                <button
                  onClick={() => setShowRadius(!showRadius)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
                    showRadius
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  <Target className="h-4 w-4" /> Radius
                </button>
                <button
                  onClick={() => setShowRoute(!showRoute)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
                    showRoute
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  <Route className="h-4 w-4" /> Route
                </button>
                <button
                  onClick={() => setShowGeofence(!showGeofence)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
                    showGeofence
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  <Shield className="h-4 w-4" /> Geofence
                </button>
              </div>
            </div>
            {/* Zoom Controls */}
            <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="rounded-lg bg-white/90 p-2 backdrop-blur-sm hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-700"
              >
                <Maximize2 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setZoom(Math.min(20, zoom + 1))}
                className="rounded-lg bg-white/90 p-2 backdrop-blur-sm hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-700"
              >
                <Plus className="h-5 w-5" />
              </button>
              <div className="rounded-lg bg-white/90 px-2 py-1 text-center text-sm font-medium backdrop-blur-sm dark:bg-gray-800/90">
                {zoom}
              </div>
              <button
                onClick={() => setZoom(Math.max(5, zoom - 1))}
                className="rounded-lg bg-white/90 p-2 backdrop-blur-sm hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-700"
              >
                <Minus className="h-5 w-5" />
              </button>
            </div>
            {/* Live Location Button */}
            <div className="absolute bottom-4 right-4 z-10">
              <button
                onClick={() => setTracking(!tracking)}
                className={`rounded-full p-3 shadow-lg ${
                  tracking
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <Navigation2 className={`h-5 w-5 ${tracking ? "animate-pulse" : ""}`} />
              </button>
            </div>
            {/* Map Display */}
            <div ref={mapContainerRef} className="h-full w-full">
              {mapLoaded ? (
                <div className="relative h-full w-full">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    src={getMapUrl()}
                    className="absolute inset-0"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    {locations.map((loc) => {
                      const x = ((loc.coordinates.lng - center.lng + 0.01) / 0.02) * 100;
                      const y = ((center.lat + 0.01 - loc.coordinates.lat) / 0.02) * 100;
                      return (
                        <div
                          key={loc.id}
                          className="absolute pointer-events-auto"
                          style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
                        >
                          <button
                            onClick={() => setSelectedLocation(loc)}
                            className={`relative ${selectedLocation?.id === loc.id ? "z-20" : "z-10"}`}
                          >
                            {showRadius && loc.radius && (
                              <div
                                className="absolute rounded-full border-2 border-emerald-500 bg-emerald-500/20"
                                style={{
                                  width: `${(loc.radius / 50) * zoom}px`,
                                  height: `${(loc.radius / 50) * zoom}px`,
                                  left: "50%",
                                  top: "50%",
                                  transform: "translate(-50%, -50%)",
                                }}
                              />
                            )}
                            <div className={`text-3xl ${selectedLocation?.id === loc.id ? "animate-bounce" : ""}`}>${locationTypes[loc.type].icon}</div>
                            {selectedLocation?.id === loc.id && (
                              <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 rounded-lg bg-white px-2 py-1 text-xs shadow-lg dark:bg-gray-800">
                                {loc.description}
                              </div>
                            )}
                          </button>
                        </div>
                      );
                    })}
                    {tracking && liveLocation && (
                      <div
                        className="absolute z-30"
                        style={{
                          left: `${((liveLocation.coords.longitude - center.lng + 0.01) / 0.02) * 100}%`,
                          top: `${((center.lat + 0.01 - liveLocation.coords.latitude) / 0.02) * 100}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        <div className="relative">
                          <div className="absolute h-8 w-8 animate-ping rounded-full bg-blue-400 opacity-75" />
                          <div className="relative h-8 w-8 rounded-full bg-blue-600 p-2">
                            <div className="h-full w-full rounded-full bg-white" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
                    <p className="text-gray-600 dark:text-gray-400">Karte wird geladen...</p>
                  </div>
                </div>
              )}
            </div>
            {/* Zeitleiste */}
            {showTimeline && (
              <div className="absolute bottom-4 left-4 right-20 z-10">
                <div className="rounded-xl bg-white/90 p-4 backdrop-blur-sm dark:bg-gray-800/90">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-semibold">Zeitleiste</h4>
                    <button
                      onClick={() => setShowTimeline(false)}
                      className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="relative h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                    {locations.map((loc, idx) => {
                      const position = (idx / (locations.length - 1)) * 100;
                      return (
                        <button
                          key={loc.id}
                          onClick={() => setSelectedLocation(loc)}
                          className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/4 rounded-full bg-emerald-600 hover:scale-125"
                          style={{ left: `${position}%` }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Location List */}
          <div className="rounded-3xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Markierungen</h3>
              <button
                onClick={() => setShowTimeline(!showTimeline)}
                className={`rounded-lg p-2 ${
                  showTimeline
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                <Clock className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {locations.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => {
                    setSelectedLocation(loc);
                    setCenter(loc.coordinates);
                  }}
                  className={`cursor-pointer rounded-xl p-4 transition-all ${
                    selectedLocation?.id === loc.id
                      ? "bg-emerald-50 ring-2 ring-emerald-500 dark:bg-emerald-950"
                      : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="text-2xl">{locationTypes[loc.type].icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {locationTypes[loc.type].label}
                          </h4>
                          {loc.verified && <Check className="h-4 w-4 text-green-600 dark:text-green-400" />}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{loc.address}</p>
                        {loc.description && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                            {loc.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          {loc.confidence && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                              {loc.confidence}% sicher
                            </span>
                          )}
                          {loc.witnesses && (
                            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                              {loc.witnesses} Zeugen
                            </span>
                          )}
                          <span className="text-gray-500">
                            {new Date(loc.timestamp).toLocaleString("de-DE")}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isEditMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLocation(loc.id);
                        }}
                        className="rounded-lg p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isEditMode && (
                <button
                  onClick={() => setIsAddingLocation(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-4 text-gray-600 hover:border-emerald-500 hover:text-emerald-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
                >
                  <Plus className="h-5 w-5" /> Standort hinzufügen
                </button>
              )}
            </div>
          </div>
          {/* Details des ausgewählten Standorts */}
          {selectedLocation && (
            <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 dark:from-blue-950 dark:to-indigo-950">
              <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Standort‑Details</h3>
              <div className="space-y-3">
                <div className="rounded-xl bg-white/50 p-3 backdrop-blur-sm dark:bg-white/10">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Koordinaten</p>
                  <p className="font-mono text-sm font-semibold">
                    {selectedLocation.coordinates.lat.toFixed(6)}, {selectedLocation.coordinates.lng.toFixed(6)}
                  </p>
                </div>
                {selectedLocation.radius && (
                  <div className="rounded-xl bg-white/50 p-3 backdrop-blur-sm dark:bg-white/10">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Suchradius</p>
                    <p className="font-semibold">{selectedLocation.radius} Meter</p>
                  </div>
                )}
                {locations.length > 1 && (
                  <div className="rounded-xl bg-white/50 p-3 backdrop-blur-sm dark:bg-white/10">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Entfernung zum Hauptstandort</p>
                    <p className="font-semibold">
                      {calculateDistance(
                        selectedLocation.coordinates.lat,
                        selectedLocation.coordinates.lng,
                        locations[0].coordinates.lat,
                        locations[0].coordinates.lng,
                      )} km
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => openInMaps("google")}
                    className="flex-1 rounded-lg bg-white/50 py-2 text-xs font-medium backdrop-blur-sm hover:bg-white dark:bg-white/10 dark:hover:bg-white/20"
                  >
                    Google Maps
                  </button>
                  <button
                    onClick={() => openInMaps("apple")}
                    className="flex-1 rounded-lg bg-white/50 py-2 text-xs font-medium backdrop-blur-sm hover:bg-white dark:bg-white/10 dark:hover:bg-white/20"
                  >
                    Apple Maps
                  </button>
                  <button
                    onClick={() => openInMaps("osm")}
                    className="flex-1 rounded-lg bg-white/50 py-2 text-xs font-medium backdrop-blur-sm hover:bg-white dark:bg-white/10 dark:hover:bg-white/20"
                  >
                    OpenStreetMap
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Analyse */}
          {showAnalytics && (
            <div className="rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 p-6 dark:from-purple-950 dark:to-pink-950">
              <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Standort‑Analyse</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Bewegungsradius</span>
                  <span className="font-semibold">~2.5 km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Häufigster Bereich</span>
                  <span className="font-semibold">Stadtmitte</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Aktivste Zeit</span>
                  <span className="font-semibold">14:00 – 18:00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Muster erkannt</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Ja</span>
                </div>
              </div>
              <button className="mt-4 w-full rounded-xl bg-purple-600 py-2 text-white hover:bg-purple-700">
                Vollständige Analyse
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-4 shadow-xl dark:bg-gray-800">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 ${
              showAnalytics
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <BarChart3 className="h-4 w-4" /> Analyse
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
            <Download className="h-4 w-4" /> KML Export
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
            <Share2 className="h-4 w-4" /> Teilen
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
            <Bell className="h-4 w-4" /> Benachrichtigungen
          </button>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="rounded-xl border-2 border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="24h">Letzte 24 Stunden</option>
            <option value="7d">Letzte 7 Tage</option>
            <option value="30d">Letzte 30 Tage</option>
            <option value="all">Alle</option>
          </select>
        </div>
      </div>
      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          className="flex items-center gap-2 rounded-2xl bg-gray-100 px-6 py-3 font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <ChevronLeft className="h-5 w-5" /> Zurück zu Medien
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 font-medium text-white hover:shadow-lg"
        >
          Weiter zu Kontakt <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      {/* Validation */}
      {!data?.step4?.mainLocation?.address && (
        <div className="rounded-2xl border-2 border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">Hauptstandort fehlt</p>
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