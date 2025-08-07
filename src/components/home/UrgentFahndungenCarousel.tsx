"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Square } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import dynamic from "next/dynamic";

// Dynamischer Import der Fahndungskarte
const Fahndungskarte = dynamic(
  () =>
    import("../fahndungskarte/Fahndungskarte").then((mod) => ({
      default: mod.default,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
    ),
  },
);

interface Investigation {
  id: string;
  title: string;
  description?: string;
  short_description?: string;
  status: string;
  priority: string;
  category: string;
  case_number: string;
  tags?: string[];
  location?: string;
  station?: string;
  features?: string;
  created_at: string;
  updated_at: string;
  contact_info?: Record<string, unknown>;
  images?: Array<{
    id: string;
    url: string;
    alt_text?: string;
    caption?: string;
  }>;
}

interface UrgentFahndungenCarouselProps {
  investigations: Investigation[];
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showNavigation?: boolean;
  showDots?: boolean;
  showControls?: boolean;
}

export default function UrgentFahndungenCarousel({
  investigations,
  className = "",
  autoPlay = false, // Standardmäßig deaktiviert
  autoPlayInterval = 5000,
  showNavigation = true,
  showDots = true,
  showControls = true,
}: UrgentFahndungenCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false); // Standardmäßig pausiert

  const carouselRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Konvertierung von Datenbank-Daten zu FahndungsData Format
  const convertInvestigationToFahndungsData = (
    investigation: Investigation,
  ) => {
    const getDefaultImage = (category: string) => {
      switch (category) {
        case "MISSING_PERSON":
          return "/images/placeholders/fotos/platzhalterbild.svg";
        case "WANTED_PERSON":
          return "/images/placeholders/fotos/platzhalterbild.svg";
        case "STOLEN_GOODS":
          return "/images/placeholders/fotos/platzhalterbild.svg";
        case "UNKNOWN_DEAD":
          return "/images/placeholders/fotos/platzhalterbild.svg";
        default:
          return "/images/placeholders/fotos/platzhalterbild.svg";
      }
    };

    const hasRealImage = (
      images?: Array<{
        id: string;
        url: string;
        alt_text?: string;
        caption?: string;
      }>,
    ) => {
      return (
        images &&
        images.length > 0 &&
        images[0]?.url &&
        images[0].url.trim() !== ""
      );
    };

    return {
      step1: {
        title: investigation.title,
        category: investigation.category as
          | "WANTED_PERSON"
          | "MISSING_PERSON"
          | "UNKNOWN_DEAD"
          | "STOLEN_GOODS",
        caseNumber: investigation.case_number,
      },
      step2: {
        shortDescription:
          investigation.short_description ??
          (investigation.description
            ? investigation.description.substring(0, 100) + "..."
            : null) ??
          "",
        description: investigation.description ?? "",
        priority:
          (investigation.priority as "urgent" | "new" | "normal") ?? "normal",
        tags: investigation.tags ?? [],
        features: investigation.features ?? "",
      },
      step3: {
        mainImage: hasRealImage(investigation.images)
          ? investigation.images![0]!.url
          : getDefaultImage(investigation.category),
        additionalImages:
          investigation.images?.slice(1).map((img) => img.url) ?? [],
      },
      step4: {
        mainLocation: investigation.location
          ? { address: investigation.location }
          : undefined,
      },
      step5: {
        contactPerson:
          (investigation.contact_info?.["person"] as string) ?? "Polizei",
        contactPhone:
          (investigation.contact_info?.["phone"] as string) ?? "+49 711 8990-0",
        contactEmail: (investigation.contact_info?.["email"] as string) ?? "",
        department: investigation.station ?? "Polizeipräsidium",
        availableHours: "Mo-Fr 08:00-18:00, Sa-So Bereitschaftsdienst",
      },
    };
  };

  // Auto-Play Funktionalität mit Benutzerkontrolle
  const startAutoPlay = useCallback(() => {
    if (!autoPlay || investigations.length <= 1) return;

    setIsAutoPlaying(true);

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % investigations.length);
    }, autoPlayInterval);
  }, [autoPlay, autoPlayInterval, investigations.length]);

  const stopAutoPlay = useCallback(() => {
    setIsAutoPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const toggleAutoPlay = useCallback(() => {
    if (isAutoPlaying) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  }, [isAutoPlaying, startAutoPlay, stopAutoPlay]);

  // Navigation
  const goToPrevious = useCallback(() => {
    setCurrentIndex(
      (prev) => (prev - 1 + investigations.length) % investigations.length,
    );
  }, [investigations.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % investigations.length);
  }, [investigations.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Tastatursteuerung
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!carouselRef.current?.contains(e.target as Node)) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          goToPrevious();
          break;
        case "ArrowRight":
          e.preventDefault();
          goToNext();
          break;
        case " ":
          e.preventDefault();
          toggleAutoPlay();
          break;
        case "Home":
          e.preventDefault();
          goToSlide(0);
          break;
        case "End":
          e.preventDefault();
          goToSlide(investigations.length - 1);
          break;
      }
    },
    [investigations.length, goToPrevious, goToNext, toggleAutoPlay, goToSlide],
  );

  // Event-Listener für Tastatursteuerung
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Cleanup bei Unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (!investigations || investigations.length === 0) {
    return (
      <Card className={`w-full max-w-sm rounded-2xl shadow-xl ${className}`}>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Keine dringenden Fahndungen verfügbar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      ref={carouselRef}
      className={`relative h-[525px] w-full max-w-sm ${className}`}
      style={{ zIndex: 25 }}
      role="region"
      aria-label="Dringende Fahndungen Karussell"
      tabIndex={0}
    >
      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        <div className="flex transition-transform duration-700 ease-out">
          {investigations.map((investigation) => (
            <div
              key={investigation.id}
              className="w-full flex-shrink-0"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              <Fahndungskarte
                data={convertInvestigationToFahndungsData(investigation)}
                investigationId={investigation.id}
                className="w-full"
              />
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        {showNavigation && investigations.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevious}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800"
              aria-label="Vorherige Fahndung"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800"
              aria-label="Nächste Fahndung"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>

      {/* Kontrollleiste */}
      {showControls && investigations.length > 1 && (
        <div className="mt-6 flex flex-col items-center gap-4">
          {/* Dots Navigation - Zentriert */}
          {showDots && (
            <div className="flex justify-center space-x-2">
              {investigations.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-3 w-3 rounded-full transition-all duration-200 hover:scale-125 ${
                    index === currentIndex
                      ? "scale-125 bg-blue-600 dark:bg-blue-400"
                      : "bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
                  }`}
                  aria-label={`Gehe zu Fahndung ${index + 1} von ${investigations.length}`}
                  aria-current={index === currentIndex ? "true" : "false"}
                />
              ))}
            </div>
          )}

          {/* Auto-Play Controls - Optional, falls benötigt */}
          {autoPlay && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAutoPlay}
                className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105"
                aria-label={
                  isAutoPlaying ? "Auto-Play pausieren" : "Auto-Play starten"
                }
              >
                {isAutoPlaying ? (
                  <Pause className="mr-2 h-4 w-4" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                {isAutoPlaying ? "Pause" : "Start"}
              </Button>

              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Square className="h-3 w-3" />
                  <span>Leertaste zum Pausieren/Starten</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
