"use client";

import React, { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
// Import nur die benötigten Icons, damit Tree‑Shaking wirkt. Bei Bedarf weitere Icons ergänzen.
import UserIcon from "@lucide-react/user";
import AlertTriangleIcon from "@lucide-react/alert-triangle";
import ShieldIcon from "@lucide-react/shield";
import ZapIcon from "@lucide-react/zap";
import CalendarIcon from "@lucide-react/calendar";
import EyeIcon from "@lucide-react/eye";
import UsersIcon from "@lucide-react/users";
import MapPinIcon from "@lucide-react/map-pin";

// Optional: Dynamische Karte wird nur geladen, wenn der Nutzer sie anzeigen möchte.
const MapPreview = dynamic(() => import("../../map/MapPreview"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-full items-center justify-center rounded-xl bg-muted/50 dark:bg-muted/20">
      <span className="text-sm text-muted-foreground">Karte wird geladen…</span>
    </div>
  ),
});

interface ModernOverviewCategoryProps {
  /**
   * Strukturierte Daten der Fahndung (mehrstufiges Wizard‑Objekt).
   * Die Datenstruktur wird hier nicht strikt typisiert, um flexibel zu bleiben.
   */
  data: any;
  /**
   * Schaltet den Edit‑Modus ein. Im Edit‑Modus können Felder inline bearbeitet werden.
   */
  isEditMode: boolean;
  /**
   * Callback zum Aktualisieren eines Feldes im übergeordneten Wizard.
   */
  updateField: (step: string, field: string, value: unknown) => void;
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
  isEditMode,
  updateField,
}: ModernOverviewCategoryProps) {
  // Aktueller Index für die Bildgalerie (nicht automatisch gedreht, um CPU zu schonen)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  // Steuert, ob die Karte angezeigt wird
  const [showMap, setShowMap] = useState(false);

  // Erzeuge die Bildliste (Hauptbild + weitere Bilder). Fallback auf Unsplash‑Bilder.
  const images: string[] = useMemo(() => {
    const list: string[] = [];
    if (data?.step3?.mainImage) list.push(data.step3.mainImage);
    if (Array.isArray(data?.step3?.additionalImages)) {
      list.push(...data.step3.additionalImages.filter(Boolean));
    }
    // Fallback‑Bilder, falls keine Bilder vorhanden sind
    if (list.length === 0) {
      return [
        "https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=800",
        "https://images.unsplash.com/photo-1589391886645-d51941baf7fb?w=800",
        "https://images.unsplash.com/photo-1574482620811-1aa16ffe3c82?w=800",
      ];
    }
    return list;
  }, [data]);

  // Hilfsfunktionen zur Formatierung
  const priorityColor = useCallback((priority?: string) => {
    switch (priority) {
      case "urgent":
        return "bg-gradient-to-r from-red-500 to-orange-500";
      case "new":
        return "bg-gradient-to-r from-green-500 to-emerald-500";
      default:
        return "bg-gradient-to-r from-blue-500 to-indigo-500";
    }
  }, []);

  const categoryIcon = useCallback((category?: string) => {
    switch (category) {
      case "MISSING_PERSON":
        return <UserIcon className="h-4 w-4" />;
      case "WANTED_PERSON":
        return <AlertTriangleIcon className="h-4 w-4" />;
      default:
        return <ShieldIcon className="h-4 w-4" />;
    }
  }, []);

  // Daten aus dem Wizard auslesen
  const title = data?.step1?.title || "Unbekannte Fahndung";
  const caseNumber = data?.step1?.caseNumber || "–";
  const category = data?.step1?.category || "UNKNOWN";
  const priority = data?.step2?.priority || "normal";
  const shortDescription = data?.step2?.shortDescription || "Keine Beschreibung verfügbar";
  const address = data?.step4?.mainLocation?.address || "";

  // Main render
  return (
    <section className="space-y-8">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden rounded-3xl bg-gray-200 dark:bg-gray-800">
        {/* Hauptbild */}
        <Image
          src={images[selectedImageIndex]}
          alt="Fahndungsbild"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 60vw"
        />
        {/* Gradient Overlays zur besseren Lesbarkeit */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />

        {/* Badges */}
        <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
          <span className="flex items-center gap-1 rounded-full bg-red-500/80 px-3 py-1 text-xs font-medium text-white">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> LIVE
          </span>
          <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            {categoryIcon(category)}
            {category === "MISSING_PERSON" ? "Vermisste Person" : category}
          </span>
          <span
            className={`relative flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white backdrop-blur ${priorityColor(
              priority,
            )}`}
          >
            <ZapIcon className="h-3.5 w-3.5" />
            {priority === "urgent" ? "DRINGEND" : priority.toUpperCase()}
          </span>
        </div>

        {/* Case Number & Date */}
        <div className="absolute right-4 top-4 z-10 rounded-xl bg-black/40 px-3 py-2 text-right text-xs text-white backdrop-blur">
          <div>Fallnummer</div>
          <div className="font-mono text-lg font-semibold">#{caseNumber}</div>
          <div className="mt-1 flex items-center justify-end gap-1">
            <CalendarIcon className="h-3 w-3" />
            <span>{new Date().toLocaleString("de-DE")}</span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-6">
          {isEditMode ? (
            <input
              value={title}
              onChange={(e) => updateField("step1", "title", e.target.value)}
              className="mb-2 w-full bg-transparent text-3xl font-bold text-white placeholder-gray-200 outline-none"
              placeholder="Titel eingeben…"
            />
          ) : (
            <h1 className="mb-2 text-3xl font-bold text-white md:text-5xl">{title}</h1>
          )}
          <p className="max-w-2xl text-sm text-white/90 md:text-base">{shortDescription}</p>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-muted/20 p-4 dark:bg-muted/10">
          <p className="mb-1 text-xs text-muted-foreground">Status</p>
          <p className="text-base font-semibold text-foreground">Aktiv</p>
        </div>
        <div className="rounded-xl bg-muted/20 p-4 dark:bg-muted/10">
          <p className="mb-1 text-xs text-muted-foreground">Priorität</p>
          <p className="text-base font-semibold capitalize text-foreground">{priority}</p>
        </div>
        <div className="rounded-xl bg-muted/20 p-4 dark:bg-muted/10">
          <p className="mb-1 text-xs text-muted-foreground">Kategorie</p>
          <p className="text-base font-semibold text-foreground">{category}</p>
        </div>
        <div className="rounded-xl bg-muted/20 p-4 dark:bg-muted/10">
          <p className="mb-1 text-xs text-muted-foreground">Bereich</p>
          <p className="text-base font-semibold text-foreground">Bundesweit</p>
        </div>
      </div>

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
        <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-4 dark:from-purple-900/20 dark:to-pink-900/20">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Kontakt</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Ansprechpartner:</span> {data?.step5?.contactPerson || "Kriminalpolizei Stuttgart"}
            </div>
            <div>
              <span className="font-medium">Telefon:</span> {data?.step5?.contactPhone || "0711 8990-1234"}
            </div>
            <div>
              <span className="font-medium">E‑Mail:</span> {data?.step5?.contactEmail || "fahndung@polizei-bw.de"}
            </div>
          </div>
          <button className="mt-3 w-full rounded-md bg-gradient-to-r from-purple-600 to-pink-600 py-2 text-sm font-medium text-white transition-colors hover:shadow-md">
            Hinweis geben
          </button>
        </div>
        {/* Statistik */}
        <div className="rounded-xl bg-gradient-to-br from-orange-50 to-red-50 p-4 dark:from-orange-900/20 dark:to-red-900/20">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Statistiken</h2>
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
    </section>
  );
}