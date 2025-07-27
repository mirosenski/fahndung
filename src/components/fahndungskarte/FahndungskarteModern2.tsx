"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  X,
  Shield,
  Search,
  FileText,
  Camera,
  MapPin,
  Phone,
  Clock,
  Share2,
  ChevronRight,
  Info,
  User,
  Images,
  Map,
  MessageSquare,
} from "lucide-react";

// Typ-Definitionen
type CategoryType =
  | "WANTED_PERSON"
  | "MISSING_PERSON"
  | "UNKNOWN_DEAD"
  | "STOLEN_GOODS";
type PriorityType = "urgent" | "new" | "normal";

interface FahndungsData {
  step1: {
    title: string;
    category: CategoryType;
    caseNumber: string;
  };
  step2: {
    shortDescription: string;
    description: string;
    priority: PriorityType;
    tags: string[];
    features: string;
  };
  step3: {
    mainImage: string;
    additionalImages: string[];
  };
  step4: {
    mainLocation?: { address: string };
  };
  step5: {
    contactPerson: string;
    contactPhone: string;
    contactEmail?: string;
    department: string;
    availableHours: string;
  };
}

// Mock data für Demo
const mockData: FahndungsData = {
  step1: {
    title: "Torben Seiler",
    category: "MISSING_PERSON",
    caseNumber: "MP-2025-001",
  },
  step2: {
    shortDescription:
      "Vermisst seit 15.07.2025 in München. Zuletzt gesehen am Marienplatz.",
    description:
      "Torben Seiler wurde zuletzt am 15. Juli 2025 gegen 14:30 Uhr am Münchener Marienplatz gesehen. Er trug eine blaue Jeans und ein weißes T-Shirt. Torben ist 1,78m groß und hat blonde Haare.",
    priority: "urgent",
    tags: ["München", "Marienplatz", "Blonde Haare", "1,78m"],
    features:
      "Auffälliges Tattoo am rechten Unterarm (Adler), trägt meist eine schwarze Armbanduhr",
  },
  step3: {
    mainImage: "/images/torben_seiler.png",
    additionalImages: [
      "/images/platzhalterbild.png",
      "/images/unbekannt_mann.png",
    ],
  },
  step4: {
    mainLocation: { address: "Marienplatz 1, 80331 München" },
  },
  step5: {
    contactPerson: "Kommissar Weber",
    contactPhone: "+49 89 2910-0",
    contactEmail: "weber@polizei.muenchen.de",
    department: "Polizeipräsidium München",
    availableHours: "Mo-Fr 08:00-18:00, Sa-So Bereitschaftsdienst",
  },
};

const CATEGORY_CONFIG: Record<
  CategoryType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    bg: string;
  }
> = {
  WANTED_PERSON: {
    label: "GESUCHTE PERSON",
    icon: Shield,
    gradient: "from-red-500 to-red-600",
    bg: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
  },
  MISSING_PERSON: {
    label: "VERMISSTE PERSON",
    icon: Search,
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
  },
  UNKNOWN_DEAD: {
    label: "UNBEKANNTE PERSON",
    icon: FileText,
    gradient: "from-gray-500 to-gray-600",
    bg: "bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800",
  },
  STOLEN_GOODS: {
    label: "GESTOHLENE GEGENSTÄNDE",
    icon: Camera,
    gradient: "from-orange-500 to-orange-600",
    bg: "bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800",
  },
};

const PRIORITY_CONFIG: Record<
  PriorityType,
  {
    label: string;
    color: string;
    pulse: boolean;
  }
> = {
  urgent: { label: "DRINGEND", color: "bg-red-600", pulse: true },
  new: { label: "NEU", color: "bg-blue-600", pulse: false },
  normal: { label: "STANDARD", color: "bg-gray-500", pulse: false },
};

const TAB_CONFIG = [
  { id: "overview", label: "Übersicht", icon: Info },
  { id: "description", label: "Details", icon: FileText },
  { id: "media", label: "Medien", icon: Images },
  { id: "location", label: "Ort", icon: Map },
  { id: "contact", label: "Kontakt", icon: MessageSquare },
];

interface FahndungskarteProps {
  data?: FahndungsData;
  className?: string;
}

const Fahndungskarte: React.FC<FahndungskarteProps> = ({
  data: propData,
  className = "",
}) => {
  const router = useRouter();
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isAnimating, setIsAnimating] = useState(false);

  // Refs und State
  const cardRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const detailsButtonRef = useRef<HTMLButtonElement>(null);

  const data = propData ?? mockData;
  const category = CATEGORY_CONFIG[data.step1.category];
  const priority = PRIORITY_CONFIG[data.step2.priority];

  // Flip-Logik
  const flipCard = useCallback(
    (forceState?: boolean) => {
      if (isAnimating) return;
      setIsAnimating(true);
      const newState = forceState ?? !isFlipped;
      setIsFlipped(newState);

      if (newState) {
        setActiveTab("overview");
        setTimeout(() => backRef.current?.focus(), 300);
      } else {
        setTimeout(() => detailsButtonRef.current?.focus(), 300);
      }

      setTimeout(() => setIsAnimating(false), 400);
    },
    [isAnimating, isFlipped],
  );

  // Verbesserte Share-Funktion
  const handleShare = async () => {
    const detailUrl = `${window.location.origin}/fahndungen/${data.step1.caseNumber}`;

    try {
      await navigator.share({
        title: `Fahndung: ${data.step1.title}`,
        text: data.step2.shortDescription,
        url: detailUrl,
      });
    } catch (error) {
      try {
        await navigator.clipboard.writeText(detailUrl);
      } catch (clipboardError) {
        console.error("Share/Clipboard Fehler:", error, clipboardError);
      }
    }
  };

  // Verbesserte Barrierefreiheit
  const getAriaLabel = (tabId: string) => {
    const labels: Record<string, string> = {
      overview: "Übersicht anzeigen",
      description: "Details anzeigen",
      media: "Medien anzeigen",
      location: "Standort anzeigen",
      contact: "Kontaktinformationen anzeigen",
    };
    return labels[tabId];
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFlipped) return;

      if (e.key === "Escape") {
        e.preventDefault();
        flipCard(false);
      }

      if (e.key === "Tab") {
        const focusableElements = backRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );

        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[
            focusableElements.length - 1
          ] as HTMLElement;

          if (e.shiftKey && document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, flipCard]);

  // Click Outside Handler
  useEffect(() => {
    if (!isFlipped) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        flipCard(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFlipped, flipCard]);

  // Scroll Handler
  useEffect(() => {
    if (!isFlipped) return;

    const handleScroll = () => {
      flipCard(false);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFlipped, flipCard]);

  // Navigation Handler
  useEffect(() => {
    if (!isFlipped) return;

    const handlePopState = () => {
      flipCard(false);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isFlipped, flipCard]);

  // Tab Content Renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-4">
            <div className={`rounded-xl border p-4 ${category.bg}`}>
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-lg bg-gradient-to-r ${category.gradient} p-2`}
                >
                  <category.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {category.label}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Fall #{data.step1.caseNumber}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                Kurzbeschreibung
              </h4>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {data.step2.shortDescription}
              </p>
            </div>

            {data.step2.tags.length > 0 && (
              <div>
                <h4 className="mb-3 font-medium text-gray-900 dark:text-white">
                  Merkmale
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.step2.tags.map((tag, index) => (
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
          </div>
        );

      case "description":
        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="mb-3 font-medium text-gray-900 dark:text-white">
                Detaillierte Beschreibung
              </h4>
              <p className="text-sm leading-relaxed whitespace-pre-line text-gray-700 dark:text-gray-300">
                {data.step2.description}
              </p>
            </div>

            {data.step2.features && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <h4 className="mb-3 font-medium text-gray-900 dark:text-white">
                  Besondere Merkmale
                </h4>
                <p className="text-sm leading-relaxed whitespace-pre-line text-gray-700 dark:text-gray-300">
                  {data.step2.features}
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
                  src={data.step3.mainImage}
                  alt={`Hauptfoto von ${data.step1.title}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {data.step3.additionalImages?.length > 0 && (
              <div>
                <h4 className="mb-3 font-medium text-gray-900 dark:text-white">
                  Weitere Bilder
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {data.step3.additionalImages.map((img, index) => (
                    <div
                      key={index}
                      className="relative aspect-square overflow-hidden rounded-lg bg-gray-200"
                    >
                      <Image
                        src={img}
                        alt={`Zusatzbild ${index + 1} von ${data.step1.title}`}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover"
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
            {data.step4.mainLocation && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900">
                    <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Letzter bekannter Aufenthaltsort
                    </h4>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {data.step4.mainLocation.address}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "contact":
        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {data.step5.contactPerson}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {data.step5.department}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <a
                    href={`tel:${data.step5.contactPhone}`}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    aria-label={`Anrufen: ${data.step5.contactPhone}`}
                  >
                    {data.step5.contactPhone}
                  </a>
                </div>

                {data.step5.contactEmail && (
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    <a
                      href={`mailto:${data.step5.contactEmail}`}
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                      aria-label={`E-Mail senden an: ${data.step5.contactEmail}`}
                    >
                      {data.step5.contactEmail}
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
                      {data.step5.availableHours}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={cardRef}
      className={`relative mx-auto h-[600px] w-full max-w-sm ${className}`}
      style={{ perspective: "1000px" }}
      role="region"
      aria-label={`Fahndungskarte: ${data.step1.title}`}
    >
      <div
        className="relative h-full w-full transition-transform duration-500 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* FRONT SIDE */}
        <div
          ref={frontRef}
          className="group absolute inset-0 flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-900"
          style={{ backfaceVisibility: "hidden" }}
          onClick={() => router.push(`/fahndungen/${data.step1.caseNumber}`)}
          role="link"
          aria-label={`Detailansicht für ${data.step1.title}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              router.push(`/fahndungen/${data.step1.caseNumber}`);
            }
          }}
        >
          {/* Image Section - 60% */}
          <div className="relative h-[60%] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
            {/* Priority Badge - nur auf Vorderseite */}
            {data.step2.priority !== "normal" && !isFlipped && (
              <div
                className={`absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-bold text-white ${priority.color} ${priority.pulse ? "animate-pulse" : ""}`}
                style={{ zIndex: 1 }}
              >
                {priority.label}
              </div>
            )}
            <Image
              src={data.step3.mainImage}
              alt={`Hauptfoto von ${data.step1.title}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />

            {/* Case Number */}
            <div className="absolute right-4 bottom-4 rounded-lg bg-black/80 px-3 py-1 font-mono text-xs text-white backdrop-blur-sm">
              #{data.step1.caseNumber}
            </div>

            {/* Category Badge */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-white/90 px-3 py-1 text-xs font-medium backdrop-blur-sm dark:bg-gray-900/90">
              <category.icon className="h-3 w-3" />
              <span>{category.label}</span>
            </div>
          </div>

          {/* Info Section - 40% */}
          <div className="flex h-[40%] flex-col justify-between p-6">
            <div className="space-y-3">
              <h3 className="line-clamp-2 text-lg font-bold text-gray-900 dark:text-white">
                {data.step1.title}
              </h3>

              <p className="line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {data.step2.shortDescription}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                ref={detailsButtonRef}
                className="flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
                  flipCard(true);
                }}
                aria-label="Details anzeigen"
              >
                <span>Details</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              {data.step4.mainLocation && (
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <MapPin className="h-3 w-3" />
                  <span className="max-w-24 truncate">
                    {data.step4.mainLocation.address.split(",")[0]}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BACK SIDE */}
        <div
          ref={backRef}
          className="absolute inset-0 flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
          role="dialog"
          aria-modal="true"
          tabIndex={0}
        >
          {/* Header mit verbesserten Buttons */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">
                {data.step1.title}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Fall #{data.step1.caseNumber}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                aria-label="Fahndung teilen"
              >
                <Share2 className="h-4 w-4" />
              </button>

              <button
                onClick={() => flipCard(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                aria-label="Schließen"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tab-Navigation mit ARIA-Attributen */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex overflow-x-auto">
              {TAB_CONFIG.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex min-w-0 flex-1 items-center justify-center gap-2 px-3 py-3 text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                  aria-label={getAriaLabel(tab.id)}
                  aria-pressed={activeTab === tab.id}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Inhalt mit responsivem Grid */}
          <div className="flex-1 overflow-y-auto p-4">{renderTabContent()}</div>

          {/* Footer-Button mit besserer Zugänglichkeit */}
          <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            <button
              onClick={() =>
                router.push(`/fahndungen/${data.step1.caseNumber}`)
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              aria-label={`Zur Detailseite von ${data.step1.title}`}
            >
              Zur Detailseite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fahndungskarte;
