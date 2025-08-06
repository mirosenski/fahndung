"use client";

import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import UrgentFahndungenCarousel from "./UrgentFahndungenCarousel";

interface HeroSectionProps {
  // Alert-Einstellungen
  showAlert?: boolean;
  alertText?: string;

  // Hauptinhalt
  title?: string;
  subtitle?: string;

  // Buttons
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;

  // Dringende Fahndungen
  showUrgentFahndungen?: boolean;
  urgentInvestigations?: Array<{
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    tags?: string[];
    location?: string;
    created_at: string;
    updated_at: string;
    category: string;
    case_number: string;
    short_description?: string;
    station?: string;
    features?: string;
    contact_info?: Record<string, unknown>;
    images?: Array<{
      id: string;
      url: string;
      alt_text?: string;
      caption?: string;
    }>;
  }>;

  // Hintergrund
  showBackgroundSphere?: boolean;
  backgroundSphereColor?: string;
}

export default function HeroSection({
  showAlert = true,
  alertText = "EILMELDUNG! Polizei sucht Zeugen zu aktuellem Fall",

  title = "Hinweise helfen",
  subtitle = "Unterstützen Sie die Polizei bei Ermittlungen!",

  primaryButtonText = "Fahndungen ansehen",
  secondaryButtonText = "Hinweis abgeben",
  onPrimaryClick,
  onSecondaryClick,

  showUrgentFahndungen = true,
  urgentInvestigations = [],

  showBackgroundSphere = true,
  backgroundSphereColor = "bg-gray-100",
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Hintergrund-Sphäre */}
      {showBackgroundSphere && (
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={`absolute -right-1/2 -top-1/2 h-full w-full rounded-full opacity-20 blur-3xl ${backgroundSphereColor} dark:bg-background`}
            style={{
              background: `radial-gradient(circle, ${backgroundSphereColor} 0%, transparent 70%)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/50 to-transparent dark:bg-background" />
        </div>
      )}

      <div className="container relative mx-auto px-4 py-12 lg:py-16">
        {/* Hauptinhalt - Zwei separate Container */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12">
          {/* Linker Container */}
          <div className="flex-1 space-y-6 lg:flex lg:items-center lg:justify-center">
            <div className="space-y-6 lg:max-w-md">
              {/* Alert Banner - Kompakt im linken Container */}
              {showAlert && (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">{alertText}</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              )}

              {/* Haupttitel */}
              <div className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight text-gray-900 dark:text-white lg:text-5xl">
                  {title}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {subtitle}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onSecondaryClick}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {secondaryButtonText}
                </Button>
                <Button
                  size="lg"
                  onClick={onPrimaryClick}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {primaryButtonText}
                </Button>
              </div>
            </div>
          </div>

          {/* Rechter Container */}
          {showUrgentFahndungen && (
            <div className="flex flex-1 justify-center lg:justify-center">
              <div className="w-full max-w-sm">
                <UrgentFahndungenCarousel
                  investigations={urgentInvestigations}
                  autoPlay={false}
                  autoPlayInterval={6000}
                  showNavigation={true}
                  showDots={true}
                  showControls={true}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 