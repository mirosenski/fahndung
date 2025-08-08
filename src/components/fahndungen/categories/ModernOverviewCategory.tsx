"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import type { UIInvestigationData } from "~/lib/types/investigation.types";
// Importiere Lucide-Icons korrekt als Named-Imports
import { MapPin as MapPinIcon } from "lucide-react";

// Optional: Dynamische Karte wird nur geladen, wenn der Nutzer sie anzeigen möchte.
const MapPreview = dynamic(() => import("../../map/MapPreview"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-full items-center justify-center rounded-lg bg-muted/50 dark:bg-muted/20">
      <span className="text-sm text-muted-foreground">Karte wird geladen…</span>
    </div>
  ),
});

interface ModernOverviewCategoryProps {
  /**
   * Strukturierte Daten der Fahndung (mehrstufiges Wizard‑Objekt).
   * Die Datenstruktur wird hier nicht strikt typisiert, um flexibel zu bleiben.
   */
  data: UIInvestigationData;
  onNext?: () => void;
}

/**
 * Eine moderne, performante Übersichts‑Kategorie für eine Fahndungs‑Detailseite.
 *
 * Diese Komponente ist bewusst modular aufgebaut: Das Hauptbild wird über
 * `next/image` geladen und nutzt einen Blur‑Placeholder. Die Karte wird
 * erst bei Interaktion des Nutzers per dynamic import nachgeladen. Icons
 * stammen aus Lucide, werden aber einzeln importiert, um den Bundle zu
 * verkleinern. State‑Updates sind memoisiert, um Re‑Renders zu minimieren.
 */
export default function ModernOverviewCategory({
  data,
}: ModernOverviewCategoryProps) {
  // Steuert, ob die Karte angezeigt wird
  const [showMap, setShowMap] = useState(false);

  // Daten aus dem Wizard auslesen
  const address = data.step4?.mainLocation?.address ?? "";

  // Main render
  return (
    <>
      {/* Karte & Adresse */}
      <div className="space-y-4">
        {address && (
          <div className="flex items-center gap-2 text-sm">
            <MapPinIcon className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">{address}</span>
          </div>
        )}
        {showMap ? (
          // Die Karte wird nur geladen, wenn der Nutzer sie anfordert
          <MapPreview longitude={10.0} latitude={48.0} />
        ) : (
          <button
            onClick={() => setShowMap(true)}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Interaktive Karte anzeigen
          </button>
        )}
      </div>

      {/* Kontakt & Statistiken */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Kontaktkarte */}
        <div className="rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 p-4 dark:from-purple-900/20 dark:to-pink-900/20">
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Kontakt
          </h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Ansprechpartner:</span>{" "}
              {data?.step5?.contactPerson || "Kriminalpolizei Stuttgart"}
            </div>
            <div>
              <span className="font-medium">Telefon:</span>{" "}
              {data?.step5?.contactPhone || "0711 8990-1234"}
            </div>
            <div>
              <span className="font-medium">E‑Mail:</span>{" "}
              {data?.step5?.contactEmail || "fahndung@polizei-bw.de"}
            </div>
          </div>
          <button className="mt-3 w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 py-2 text-sm font-medium text-white transition-colors hover:shadow-sm">
            Hinweis geben
          </button>
        </div>
        {/* Statistik */}
        <div className="rounded-lg bg-gradient-to-br from-orange-50 to-red-50 p-4 dark:from-orange-900/20 dark:to-red-900/20">
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Statistiken
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Aufrufe heute</span>
              <span className="font-semibold">+2 348</span>
            </div>
            <div className="flex justify-between">
              <span>Neue Hinweise</span>
              <span className="font-semibold">8</span>
            </div>
            <div className="flex justify-between">
              <span>Geteilt</span>
              <span className="font-semibold">127×</span>
            </div>
            <div className="flex justify-between">
              <span>Reichweite</span>
              <span className="font-semibold">45 000+</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
