"use client";

import React from "react";
import Image from "next/image";
import type { UIInvestigationData } from "~/lib/types/investigation.types";

interface CommonHeroSectionProps {
  data: UIInvestigationData;
}

export default function CommonHeroSection({ data }: CommonHeroSectionProps) {
  const title = data.step1?.title ?? "Fahndung";
  const shortDescription =
    data.step2?.shortDescription ?? "Keine Beschreibung verfügbar";
  const caseNumber = data.step1?.caseNumber ?? "UNKNOWN";
  const category = data.step1?.category ?? "UNKNOWN";
  const priority = data.step2?.priority ?? "normal";

  // Verwende das originale Hauptbild der Fahndung
  const mainImageUrl =
    data.step3?.mainImage ??
    "https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=800";

  return (
    <>
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden rounded-3xl bg-gray-200 dark:bg-gray-800">
        {/* Hauptbild - Originales Fahndungsbild */}
        <Image
          src={mainImageUrl}
          alt="Fahndungsbild"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 60vw"
          onError={(e) => {
            // Fallback zu einem lokalen Platzhalterbild
            const target = e.target as HTMLImageElement;
            target.src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23374151'/%3E%3Ctext x='400' y='300' font-family='Arial' font-size='48' fill='white' text-anchor='middle' dominant-baseline='middle'%3EFahndungsbild%3C/text%3E%3C/svg%3E";
          }}
        />
        {/* Gradient Overlays zur besseren Lesbarkeit */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />

        {/* Badges */}
        <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
          <span className="flex items-center gap-1 rounded-full bg-red-500/80 px-3 py-1 text-xs font-medium text-white">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />{" "}
            LIVE
          </span>
          <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            📝 {category}
          </span>
          {priority === "urgent" && (
            <span className="relative flex items-center gap-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              ⚡ DRINGEND
            </span>
          )}
        </div>

        {/* Fallnummer */}
        <div className="absolute right-4 top-4 z-10 rounded-xl bg-black/40 px-3 py-2 text-right text-xs text-white backdrop-blur">
          <div>Fallnummer</div>
          <div className="font-mono text-lg font-semibold">{caseNumber}</div>
          <div className="mt-1 flex items-center justify-end gap-1">
            📅 {new Date().toLocaleDateString("de-DE")}
          </div>
        </div>

        {/* Title & Description */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-6">
          <h1 className="mb-2 text-3xl font-bold text-white md:text-5xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm text-white/90 md:text-base">
            {shortDescription}
          </p>
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
          <p className="text-base font-semibold capitalize text-foreground">
            {priority}
          </p>
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
    </>
  );
}
