"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { User, Phone, MessageSquare, Clock, MapPin } from "lucide-react";
import type { FahndungsData } from "./types";
import { CATEGORY_CONFIG } from "./types";
import { getSafeImageSrc, getSafeAdditionalImageSrc } from "./utils";
import dynamic from "next/dynamic";

// Dynamischer Import der InteractiveMap mit SSR deaktiviert
const InteractiveMap = dynamic(
  () => import("@/components/shared/InteractiveMap"),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse">
        <div className="h-64 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
      </div>
    ),
  },
);

interface TabContentProps {
  activeTab: string;
  safeData: FahndungsData;
  imageError: boolean;
  handleImageError: () => void;
  investigationId?: string;
}

export const TabContent: React.FC<TabContentProps> = ({
  activeTab,
  safeData,
  imageError,
  handleImageError,
  investigationId,
}) => {
  const category = safeData?.step1?.category
    ? CATEGORY_CONFIG[safeData.step1.category]
    : CATEGORY_CONFIG.MISSING_PERSON;

  // Echte Geocoding-API für präzise Koordinaten
  const [geocodedCoordinates, setGeocodedCoordinates] = useState<
    [number, number] | null
  >(null);
  const [geocodedAddress, setGeocodedAddress] = useState<string | null>(null);

  // Geocoding-Funktion mit OpenStreetMap Nominatim API
  const geocodeAddress = async (
    address: string,
  ): Promise<[number, number] | null> => {
    try {
      // URL-encode die Adresse für die API
      const encodedAddress = encodeURIComponent(address);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&countrycodes=de&limit=1`;

      // Verwende native fetch ohne Interception für Geocoding
      const response = await fetch(url, {
        headers: {
          "User-Agent": "FahndungApp/1.0",
        },
      });

      if (!response.ok) {
        console.warn("⚠️ Geocoding API nicht verfügbar:", response.statusText);
        return null;
      }

      const data = (await response.json()) as Array<{
        lat: string;
        lon: string;
        display_name: string;
      }>;

      if (data && data.length > 0) {
        const result = data[0];
        if (result) {
          // Speichere auch die geocodierte Adresse
          setGeocodedAddress(result.display_name);
          return [parseFloat(result.lat), parseFloat(result.lon)];
        }
      }

      return null;
    } catch (error) {
      console.warn("⚠️ Geocoding fehlgeschlagen:", error);
      return null;
    }
  };

  // Geocoding beim Laden der Komponente
  useEffect(() => {
    if (safeData.step4.mainLocation?.address && !geocodedCoordinates) {
      // Verzögerung für bessere Performance
      const timeoutId = setTimeout(() => {
        void geocodeAddress(safeData.step4.mainLocation!.address).then(
          (coordinates) => {
            if (coordinates) {
              setGeocodedCoordinates(coordinates);
            }
          },
        );
      }, 1000); // 1 Sekunde Verzögerung

      return () => clearTimeout(timeoutId);
    }
    // Explizit undefined zurückgeben für den Fall, dass die Bedingung nicht erfüllt ist
    return undefined;
  }, [safeData.step4.mainLocation, geocodedCoordinates]);

  // Konvertiere FahndungsData zu MapLocation für die Karte
  const convertToMapLocation = () => {
    if (!safeData.step4.mainLocation) return [];

    const originalAddress = safeData.step4.mainLocation.address;

    // Verwende geocodierte Koordinaten oder Fallback
    const coordinates = geocodedCoordinates ?? [48.8566, 8.3522]; // Fallback: Pforzheim

    // Verwende geocodierte Adresse oder ursprüngliche Adresse
    const displayAddress = geocodedAddress ?? originalAddress;

    return [
      {
        id: investigationId ?? "main-location",
        lat: coordinates[0],
        lng: coordinates[1],
        address: displayAddress,
        type: "main" as const,
        description: safeData.step2.shortDescription,
      },
    ];
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-4">
            <div className={`rounded-xl border p-4 ${category.bg}`}>
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {category.label}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Fall #{safeData.step1.caseNumber}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                Kurzbeschreibung
              </h4>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {safeData.step2.shortDescription}
              </p>
            </div>

            {safeData.step2.tags.length > 0 && (
              <div>
                <h4 className="mb-3 font-medium text-gray-900 dark:text-white">
                  Merkmale
                </h4>
                <div className="flex flex-wrap gap-2">
                  {safeData.step2.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Kontakt-Informationen */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {safeData.step5.contactPerson}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {safeData.step5.department}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <a
                    href={`tel:${safeData.step5.contactPhone}`}
                    className="text-sm text-blue-600 hover:text-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:text-blue-400"
                    aria-label={`Anrufen: ${safeData.step5.contactPhone}`}
                    tabIndex={-1}
                  >
                    {safeData.step5.contactPhone}
                  </a>
                </div>

                {safeData.step5.contactEmail && (
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    <a
                      href={`mailto:${safeData.step5.contactEmail}`}
                      className="text-sm text-blue-600 hover:text-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:text-blue-400"
                      aria-label={`E-Mail senden an: ${safeData.step5.contactEmail}`}
                      tabIndex={-1}
                    >
                      {safeData.step5.contactEmail}
                    </a>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Erreichbarkeit
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {safeData.step5.availableHours}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "description":
        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="mb-3 font-medium text-gray-900 dark:text-white">
                Detaillierte Beschreibung
              </h4>
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {safeData.step2.description}
              </p>
            </div>

            {safeData.step2.features && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <h4 className="mb-3 font-medium text-gray-900 dark:text-white">
                  Besondere Merkmale
                </h4>
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {safeData.step2.features}
                </p>
              </div>
            )}
          </div>
        );

      case "media":
        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="mb-3 font-medium text-gray-900 dark:text-white">
                Hauptfoto
              </h4>
              <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-200">
                <Image
                  src={getSafeImageSrc(safeData, imageError)}
                  alt={`Hauptfoto von ${safeData.step1.title}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                  onError={handleImageError}
                />
              </div>
            </div>

            {((safeData.step3.additionalImageUrls &&
              safeData.step3.additionalImageUrls.length > 0) ??
              safeData.step3.additionalImages?.length > 0) && (
              <div>
                <h4 className="mb-3 font-medium text-gray-900 dark:text-white">
                  Weitere Bilder
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {/* Verwende zuerst die hochgeladenen URLs, dann die alten Bilder */}
                  {(
                    safeData.step3.additionalImageUrls ??
                    safeData.step3.additionalImages ??
                    []
                  ).map((img, index) => (
                    <div
                      key={index}
                      className="relative aspect-square overflow-hidden rounded-lg bg-gray-200"
                    >
                      <Image
                        src={getSafeAdditionalImageSrc(img)}
                        alt={`Zusatzbild ${index + 1} von ${safeData.step1.title}`}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover"
                        onError={handleImageError}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "location":
        return (
          <div className="space-y-4">
            {safeData.step4.mainLocation ? (
              <div className="space-y-4">
                {/* Erweiterte Kartenansicht */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-4 flex items-start gap-3">
                    <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900">
                      <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Letzter bekannter Aufenthaltsort
                      </h4>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        {safeData.step4.mainLocation.address}
                      </p>
                      {geocodedAddress &&
                        geocodedAddress !==
                          safeData.step4.mainLocation.address && (
                          <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                            Geocodiert: {geocodedAddress}
                          </p>
                        )}
                    </div>
                  </div>

                  {/* Interaktive Karte */}
                  <div className="h-80 w-full overflow-hidden rounded-lg">
                    {(() => {
                      const mapLocations = convertToMapLocation();
                      const firstLocation = mapLocations[0];

                      return (
                        <InteractiveMap
                          locations={mapLocations}
                          center={
                            firstLocation
                              ? [firstLocation.lat, firstLocation.lng]
                              : [48.8566, 8.3522]
                          }
                          zoom={13}
                          height="320px"
                          showRadius={true}
                          editable={false}
                        />
                      );
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800">
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-700">
                    <MapPin className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Keine Ortsdaten verfügbar
                    </h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Für diesen Fall sind noch keine Ortsinformationen
                      hinterlegt.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return <>{renderTabContent()}</>;
};
