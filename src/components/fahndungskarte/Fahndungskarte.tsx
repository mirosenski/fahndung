"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Filter,
  AlertTriangle,
  User,
  Eye,
  Clock,
  X,
  Shield,
  Search,
  FileText,
  Camera,
  Phone,
  ChevronRight,
  Info,
  Images,
  Map,
  MessageSquare,
  Edit3,
} from "lucide-react";
import InteractiveMap, {
  type MapLocation,
} from "@/components/shared/InteractiveMap";
import { CaseNumberBadge } from "~/components/ui/CaseNumberDisplay";
import { getFahndungUrl } from "~/lib/seo";
import { useInvestigationSync } from "~/hooks/useInvestigationSync";

// Typ-Definitionen für moderne Fahndungskarte

// Typ-Definitionen für moderne Fahndungskarte
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
    mainImageUrl?: string; // URL des hochgeladenen Hauptbildes
    additionalImages: string[];
    additionalImageUrls?: string[]; // URLs der hochgeladenen zusätzlichen Bilder
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
    caseNumber: "POL-2024-K-001234-A",
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
    label: "STRAFTÄTER",
    icon: Shield,
    gradient: "from-red-500 to-red-600",
    bg: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
  },
  MISSING_PERSON: {
    label: "VERMISSTE",
    icon: Search,
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
  },
  UNKNOWN_DEAD: {
    label: "UNBEKANNTE TOTE",
    icon: FileText,
    gradient: "from-gray-500 to-gray-600",
    bg: "bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800",
  },
  STOLEN_GOODS: {
    label: "SACHEN",
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
];

// Moderne Fahndungskarte Komponente
interface ModernFahndungskarteProps {
  data?: FahndungsData;
  className?: string;
  investigationId?: string;
  onAction?: () => void;
  userRole?: string;
  userPermissions?: {
    canEdit?: boolean;
    canDelete?: boolean;
    canPublish?: boolean;
  };
}

const ModernFahndungskarte: React.FC<ModernFahndungskarteProps> = ({
  data: propData,
  className = "",
  investigationId,
  userRole: _userRole,
  userPermissions,
}) => {
  const router = useRouter();
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isAnimating, setIsAnimating] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showQuickEdit, setShowQuickEdit] = useState(false);

  // Verwende die neue Synchronisations-Hook für bessere Datenaktualisierung
  const { investigation: syncInvestigation, syncAfterUpdate } =
    useInvestigationSync(investigationId!);

  // Konvertiere syncInvestigation zu FahndungsData Format
  const convertInvestigationToFahndungsData = (
    investigation: Record<string, unknown>,
  ): FahndungsData => {
    if (!investigation) return mockData;

    return {
      step1: {
        title: (investigation["title"] as string) ?? "Unbekannte Fahndung",
        category:
          (investigation["category"] as CategoryType) ?? "MISSING_PERSON",
        caseNumber: (investigation["case_number"] as string) ?? "",
      },
      step2: {
        shortDescription: (investigation["short_description"] as string) ?? "",
        description: (investigation["description"] as string) ?? "",
        priority: (investigation["priority"] as PriorityType) ?? "normal",
        tags: (investigation["tags"] as string[]) ?? [],
        features: (investigation["features"] as string) ?? "",
      },
      step3: {
        mainImage:
          (investigation["images"] as Array<{ url: string }>)?.[0]?.url ?? "",
        additionalImages:
          (investigation["images"] as Array<{ url: string }>)
            ?.slice(1)
            .map((img) => img.url) ?? [],
      },
      step4: {
        mainLocation: investigation["location"]
          ? { address: investigation["location"] as string }
          : undefined,
      },
      step5: {
        contactPerson:
          ((investigation["contact_info"] as Record<string, unknown>)?.[
            "person"
          ] as string) ?? "Polizei",
        contactPhone:
          ((investigation["contact_info"] as Record<string, unknown>)?.[
            "phone"
          ] as string) ?? "+49 711 8990-0",
        contactEmail:
          ((investigation["contact_info"] as Record<string, unknown>)?.[
            "email"
          ] as string) ?? "",
        department:
          ((investigation["contact_info"] as Record<string, unknown>)?.[
            "department"
          ] as string) ?? "Polizeipräsidium",
        availableHours:
          ((investigation["contact_info"] as Record<string, unknown>)?.[
            "hours"
          ] as string) ?? "24/7",
      },
    };
  };

  // Verwende propData als Fallback, falls keine API-Daten verfügbar sind
  const convertedData = syncInvestigation
    ? convertInvestigationToFahndungsData(
        syncInvestigation as unknown as Record<string, unknown>,
      )
    : propData;
  const data = convertedData ?? mockData;

  // Sichere Datenprüfung mit Fallback-Werten
  const safeData: FahndungsData = {
    step1: {
      title: data?.step1?.title ?? mockData.step1.title,
      category: data?.step1?.category ?? mockData.step1.category,
      caseNumber: data?.step1?.caseNumber ?? mockData.step1.caseNumber,
    },
    step2: {
      shortDescription:
        data?.step2?.shortDescription ?? mockData.step2.shortDescription,
      description: data?.step2?.description ?? mockData.step2.description,
      priority: data?.step2?.priority ?? mockData.step2.priority,
      tags: data?.step2?.tags ?? mockData.step2.tags,
      features: data?.step2?.features ?? mockData.step2.features,
    },
    step3: {
      mainImage: data?.step3?.mainImage ?? mockData.step3.mainImage,
      additionalImages:
        data?.step3?.additionalImages ?? mockData.step3.additionalImages,
    },
    step4: {
      mainLocation: data?.step4?.mainLocation ?? mockData.step4.mainLocation,
    },
    step5: {
      contactPerson: data?.step5?.contactPerson ?? mockData.step5.contactPerson,
      contactPhone: data?.step5?.contactPhone ?? mockData.step5.contactPhone,
      contactEmail: data?.step5?.contactEmail ?? mockData.step5.contactEmail,
      department: data?.step5?.department ?? mockData.step5.department,
      availableHours:
        data?.step5?.availableHours ?? mockData.step5.availableHours,
    },
  };

  // Loading State für Daten
  const isDataLoading = !syncInvestigation && !propData;

  // Hilfsfunktion für Platzhalterbild
  const getPlaceholderImage = () =>
    "/images/placeholders/fotos/platzhalterbild.svg";

  // Sichere Bildquelle-Validierung
  const getSafeImageSrc = () => {
    if (imageError) {
      return getPlaceholderImage();
    }

    const mainImageUrl = safeData.step3.mainImageUrl;
    const mainImage = safeData.step3.mainImage;

    // Prüfe ob die Bildquellen gültig sind (nicht leer, nicht undefined)
    if (mainImageUrl && mainImageUrl.trim() !== "") {
      return mainImageUrl;
    }

    if (mainImage && mainImage.trim() !== "") {
      return mainImage;
    }

    return getPlaceholderImage();
  };

  // Sichere Bildquelle-Validierung für zusätzliche Bilder
  const getSafeAdditionalImageSrc = (img: string) => {
    if (!img || img.trim() === "") {
      return getPlaceholderImage();
    }
    return img;
  };

  // Bildfehler-Handler
  const handleImageError = () => {
    setImageError(true);
  };

  // Leaflet wird nur auf Client-Seite geladen
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadLeaflet = async () => {
      try {
        const L = await import("leaflet");
        // Fix für Leaflet Icons in Next.js
        delete (L.default.Icon.Default.prototype as { _getIconUrl?: string })
          ._getIconUrl;
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl: "/leaflet/marker-icon-2x.png",
          iconUrl: "/leaflet/marker-icon.png",
          shadowUrl: "/leaflet/marker-shadow.png",
        });
      } catch (error) {
        console.warn("Leaflet konnte nicht geladen werden:", error);
      }
    };

    void loadLeaflet();
  }, []);

  // Refs und State
  const cardRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const detailsButtonRef = useRef<HTMLButtonElement>(null);

  // Sichere Datenprüfung mit Fallback-Werten
  const category = safeData?.step1?.category
    ? CATEGORY_CONFIG[safeData.step1.category]
    : CATEGORY_CONFIG.MISSING_PERSON;
  const priority = safeData?.step2?.priority
    ? PRIORITY_CONFIG[safeData.step2.priority]
    : PRIORITY_CONFIG.normal;

  // Quick Edit Handler
  const handleQuickEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (investigationId) {
      router.push(`/fahndungen/${investigationId}?edit=true`);
    }
  };

  // Manuelle Aktualisierung der Daten
  const handleDataUpdate = useCallback(() => {
    if (investigationId) {
      void syncAfterUpdate();
    }
  }, [investigationId, syncAfterUpdate]);

  // Automatische Aktualisierung alle 5 Sekunden
  useEffect(() => {
    if (!investigationId) return;

    const interval = setInterval(() => {
      void syncAfterUpdate();
    }, 5000); // Reduziert von 10 auf 5 Sekunden

    return () => clearInterval(interval);
  }, [investigationId, syncAfterUpdate]);

  // Höre auf Änderungen in der URL (z.B. nach Bearbeitung)
  useEffect(() => {
    const handlePopState = () => {
      // Aktualisiere Daten wenn zur Seite zurückgekehrt wird
      handleDataUpdate();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [handleDataUpdate]);

  // Flip-Logik
  const flipCard = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    setIsFlipped(!isFlipped);

    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  }, [isFlipped, isAnimating]);

  // Verbesserte Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Nur reagieren wenn diese Karte fokussiert ist
      if (!cardRef.current?.contains(document.activeElement)) return;

      const activeElement = document.activeElement;

      // Navigation in geschlossener Karte
      if (!isFlipped) {
        // Enter/Space auf Details-Button öffnet Karte
        if (e.key === "Enter" || e.key === " ") {
          if (activeElement === detailsButtonRef.current) {
            e.preventDefault();
            e.stopPropagation();
            flipCard();
            return;
          }
        }

        // Tab-Navigation: Karte → Details-Button → nächste Karte
        if (e.key === "Tab") {
          if (activeElement === frontRef.current && !e.shiftKey) {
            // Von Karte zu Details-Button
            e.preventDefault();
            detailsButtonRef.current?.focus();
          } else if (activeElement === detailsButtonRef.current && e.shiftKey) {
            // Von Details-Button zurück zur Karte
            e.preventDefault();
            frontRef.current?.focus();
          }
        }
      }

      // Navigation in geöffneter Karte
      if (isFlipped) {
        if (e.key === "Escape") {
          e.preventDefault();
          flipCard();
          // Fokus zurück zur Karte
          setTimeout(() => frontRef.current?.focus(), 100);
        }
      }
    };

    // Nur Event-Handler hinzufügen wenn die Karte existiert und fokussiert ist
    const cardElement = cardRef.current;
    if (cardElement) {
      // Event-Handler direkt auf das Karten-Element statt auf document
      cardElement.addEventListener("keydown", handleKeyDown);
      return () => cardElement.removeEventListener("keydown", handleKeyDown);
    }

    // Return undefined wenn kein cardElement existiert
    return undefined;
  }, [isFlipped, flipCard]);

  // Tab-Index für Rückseite-Elemente dynamisch setzen
  useEffect(() => {
    if (backRef.current) {
      const focusableElements = backRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      focusableElements.forEach((element) => {
        if (isFlipped) {
          element.setAttribute("tabindex", "0");
        } else {
          element.setAttribute("tabindex", "-1");
        }
      });
    }
  }, [isFlipped]);

  // Click Outside Handler
  useEffect(() => {
    if (!isFlipped) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        flipCard();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFlipped, flipCard]);

  // Scroll Handler
  useEffect(() => {
    if (!isFlipped) return;

    const handleScroll = () => {
      flipCard();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFlipped, flipCard]);

  // Navigation Handler
  useEffect(() => {
    if (!isFlipped) return;

    const handlePopState = () => {
      flipCard();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isFlipped, flipCard]);

  // Zeige Loading-State wenn Daten noch nicht verfügbar sind
  if (isDataLoading) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 ${className}`}
      >
        <div className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Lade Fahndungsdaten...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Tab Content Renderer
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
                  src={getSafeImageSrc()}
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
                      {safeData.step4.mainLocation.address}
                    </p>
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

  return (
    <div
      ref={cardRef}
      className={`relative mx-auto h-[513px] w-full max-w-sm ${className}`}
      style={{ perspective: "1000px" }}
      role="region"
      aria-label={`Fahndungskarte: ${safeData.step1.title}`}
      onMouseEnter={() => setShowQuickEdit(true)}
      onMouseLeave={() => setShowQuickEdit(false)}
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
          className="group absolute inset-0 flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900"
          style={{ backfaceVisibility: "hidden" }}
          onClick={() =>
            router.push(
              getFahndungUrl(safeData.step1.title, safeData.step1.caseNumber),
            )
          }
          role="button"
          aria-label={`Zur Detailseite von ${safeData.step1.title} navigieren`}
          tabIndex={isFlipped ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              router.push(
                getFahndungUrl(safeData.step1.title, safeData.step1.caseNumber),
              );
            }
          }}
        >
          {/* Image Section - 60% (5% kürzer) */}
          <div className="relative h-[60%] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
            {/* Priority Badge - nur auf Vorderseite */}
            {safeData.step2.priority !== "normal" && !isFlipped && (
              <div
                className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold text-white ${priority.color} ${priority.pulse ? "animate-pulse" : ""}`}
                style={{ zIndex: 1 }}
              >
                {priority.label}
              </div>
            )}

            {/* Quick Edit Button - nur für Editoren */}
            {userPermissions?.canEdit && showQuickEdit && (
              <button
                onClick={handleQuickEdit}
                className="absolute left-4 top-4 z-10 flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white shadow-lg transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Schnell bearbeiten"
              >
                <Edit3 className="h-3 w-3" />
                Bearbeiten
              </button>
            )}

            <Image
              src={getSafeImageSrc()}
              alt={`Hauptfoto von ${safeData.step1.title}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
              onError={handleImageError}
            />

            {/* Category Badge */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-white/90 px-3 py-1 text-xs font-medium backdrop-blur-sm dark:bg-gray-900/90">
              <span>{category.label}</span>
            </div>

            {/* Case Number Badge - horizontal alignment */}
            <div className="absolute bottom-4 right-4">
              <CaseNumberBadge caseNumber={safeData.step1.caseNumber} />
            </div>
          </div>

          {/* Info Section - 40% (5% mehr für den kürzeren Bildbereich) */}
          <div className="flex h-[40%] flex-col justify-between p-6">
            <div className="space-y-3">
              <h3 className="line-clamp-2 text-lg font-bold text-gray-900 dark:text-white">
                {safeData.step1.title}
              </h3>

              <p className="line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {safeData.step2.shortDescription}
              </p>
            </div>

            <div className="mt-auto flex items-center justify-between">
              <button
                ref={detailsButtonRef}
                className="flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
                  flipCard();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    flipCard();
                  }
                }}
                aria-label="Karte öffnen und Details anzeigen"
                tabIndex={isFlipped ? -1 : 0}
              >
                <span>Details</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              {safeData.step4.mainLocation && (
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <MapPin className="h-3 w-3" />
                  <span className="max-w-24 truncate">
                    {safeData.step4.mainLocation.address.split(",")[0]}
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
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {/* Header mit Close Button */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Details
            </h3>
            <button
              onClick={flipCard}
              className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              aria-label="Karte schließen"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {TAB_CONFIG.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-w-0 flex-1 items-center justify-center gap-1 px-2 py-3 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <tab.icon className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">{renderTabContent()}</div>

          {/* Footer mit Action Buttons */}
          <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <button
                onClick={() =>
                  router.push(
                    getFahndungUrl(
                      safeData.step1.title,
                      safeData.step1.caseNumber,
                    ),
                  )
                }
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Eye className="h-4 w-4" />
                Vollständige Ansicht
              </button>

              {userPermissions?.canEdit && (
                <button
                  onClick={handleQuickEdit}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Edit3 className="h-4 w-4" />
                  Bearbeiten
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export interface FahndungLocation extends MapLocation {
  investigationId?: string;
  investigationTitle?: string;
  priority?: "normal" | "urgent" | "new";
  category?: string;
  timestamp?: Date;
  lastSeen?: Date;
  description?: string;
  contactInfo?: {
    person?: string;
    phone?: string;
    email?: string;
  };
}

interface FahndungskarteProps {
  locations: FahndungLocation[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  searchRadius?: number;
  showRadius?: boolean;
  editable?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showLegend?: boolean;
  onLocationAdd?: (location: Omit<FahndungLocation, "id">) => void;
  onLocationUpdate?: (id: string, location: FahndungLocation) => void;
  onLocationRemove?: (id: string) => void;
  _onLocationClick?: (location: FahndungLocation) => void;
  onInvestigationClick?: (investigationId: string) => void;
  className?: string;
}

// Erweiterte Marker Icons für Fahndungen
const fahndungMarkerIcons = {
  main: { color: "#DC2626", icon: "🎯", label: "Hauptort" },
  tatort: { color: "#991B1B", icon: "⚠️", label: "Tatort" },
  wohnort: { color: "#2563EB", icon: "🏠", label: "Wohnort" },
  arbeitsplatz: { color: "#7C3AED", icon: "💼", label: "Arbeitsplatz" },
  sichtung: { color: "#F59E0B", icon: "👁️", label: "Sichtung" },
  sonstiges: { color: "#6B7280", icon: "📍", label: "Sonstiges" },
};

// Filter-Optionen
const filterOptions = {
  type: ["main", "tatort", "wohnort", "arbeitsplatz", "sichtung", "sonstiges"],
  priority: ["urgent", "normal", "new"],
  category: ["WANTED_PERSON", "MISSING_PERSON", "UNKNOWN_DEAD", "STOLEN_GOODS"],
};

// Export der modernen Komponente
export { ModernFahndungskarte };

export default function Fahndungskarte({
  locations = [],
  center = [48.8566, 8.3522], // Default: Pforzheim
  zoom = 13,
  height = "600px",
  searchRadius = 5,
  showRadius = true,
  editable = false,
  showFilters = true,
  showLegend = true,
  onLocationRemove,
  onInvestigationClick,
  className = "",
}: FahndungskarteProps) {
  const [filteredLocations, setFilteredLocations] =
    useState<FahndungLocation[]>(locations);
  const [activeFilters, setActiveFilters] = useState({
    type: [] as string[],
    priority: [] as string[],
    category: [] as string[],
    timeRange: "all" as "all" | "24h" | "7d" | "30d",
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<FahndungLocation | null>(null);
  const [mapView, setMapView] = useState<"standard" | "satellite" | "terrain">(
    "standard",
  );

  // Filter anwenden
  useEffect(() => {
    let filtered = [...locations];

    // Typ-Filter
    if (activeFilters.type.length > 0) {
      filtered = filtered.filter((loc) =>
        activeFilters.type.includes(loc.type),
      );
    }

    // Prioritäts-Filter
    if (activeFilters.priority.length > 0) {
      filtered = filtered.filter(
        (loc) => loc.priority && activeFilters.priority.includes(loc.priority),
      );
    }

    // Kategorie-Filter
    if (activeFilters.category.length > 0) {
      filtered = filtered.filter(
        (loc) => loc.category && activeFilters.category.includes(loc.category),
      );
    }

    // Zeit-Filter
    if (activeFilters.timeRange !== "all") {
      const now = new Date();
      const timeRanges = {
        "24h": 24 * 60 * 60 * 1000,
        "7d": 7 * 24 * 60 * 60 * 1000,
        "30d": 30 * 24 * 60 * 60 * 1000,
      };
      const cutoff = new Date(
        now.getTime() - timeRanges[activeFilters.timeRange],
      );

      filtered = filtered.filter((loc) => {
        const timestamp = loc.timestamp ?? loc.lastSeen;
        return timestamp && new Date(timestamp) >= cutoff;
      });
    }

    setFilteredLocations(filtered);
  }, [locations, activeFilters]);

  // Filter-Toggle
  const toggleFilter = (
    filterType: keyof typeof activeFilters,
    value: string,
  ) => {
    setActiveFilters((prev) => {
      const currentValues = prev[filterType] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      return {
        ...prev,
        [filterType]: newValues,
      };
    });
  };

  // Zeit-Filter setzen
  const setTimeFilter = (timeRange: typeof activeFilters.timeRange) => {
    setActiveFilters((prev) => ({
      ...prev,
      timeRange,
    }));
  };

  // Filter zurücksetzen
  const resetFilters = () => {
    setActiveFilters({
      type: [],
      priority: [],
      category: [],
      timeRange: "all",
    });
  };

  // Investigation Click Handler
  const handleInvestigationClick = (investigationId: string) => {
    if (onInvestigationClick) {
      onInvestigationClick(investigationId);
    }
  };

  // Kartenansicht wechseln
  const changeMapView = (view: typeof mapView) => {
    setMapView(view);
  };

  return (
    <div className={`fahndungskarte relative ${className}`}>
      {/* Filter Panel */}
      {showFilters && (
        <div className="absolute left-2 top-2 z-[1000]">
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="flex items-center space-x-2 rounded-lg bg-white p-3 shadow-lg hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filter</span>
            {Object.values(activeFilters).some((f) =>
              Array.isArray(f) ? f.length > 0 : f !== "all",
            ) && <span className="flex h-2 w-2 rounded-full bg-red-500"></span>}
          </button>

          {showFilterPanel && (
            <div className="absolute left-0 top-full mt-2 w-80 rounded-lg bg-white p-4 shadow-xl dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filter</h3>
                <button
                  onClick={resetFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Zurücksetzen
                </button>
              </div>

              {/* Typ-Filter */}
              <div className="mb-4">
                <h4 className="mb-2 text-sm font-medium">Typ</h4>
                <div className="space-y-2">
                  {filterOptions.type.map((type) => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={activeFilters.type.includes(type)}
                        onChange={() => toggleFilter("type", type)}
                        className="rounded"
                      />
                      <span className="text-sm">
                        {
                          fahndungMarkerIcons[
                            type as keyof typeof fahndungMarkerIcons
                          ].label
                        }
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Prioritäts-Filter */}
              <div className="mb-4">
                <h4 className="mb-2 text-sm font-medium">Priorität</h4>
                <div className="space-y-2">
                  {filterOptions.priority.map((priority) => (
                    <label
                      key={priority}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={activeFilters.priority.includes(priority)}
                        onChange={() => toggleFilter("priority", priority)}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{priority}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Zeit-Filter */}
              <div className="mb-4">
                <h4 className="mb-2 text-sm font-medium">Zeitraum</h4>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "Alle" },
                    { value: "24h", label: "Letzte 24h" },
                    { value: "7d", label: "Letzte 7 Tage" },
                    { value: "30d", label: "Letzte 30 Tage" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="radio"
                        name="timeRange"
                        value={option.value}
                        checked={activeFilters.timeRange === option.value}
                        onChange={() =>
                          setTimeFilter(
                            option.value as typeof activeFilters.timeRange,
                          )
                        }
                        className="rounded"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Statistiken */}
              <div className="border-t pt-4">
                <div className="text-sm text-gray-600">
                  <div>
                    Angezeigt: {filteredLocations.length} von {locations.length}
                  </div>
                  {filteredLocations.length > 0 && (
                    <div className="mt-1 text-xs">
                      {
                        filteredLocations.filter(
                          (loc) => loc.priority === "urgent",
                        ).length
                      }{" "}
                      dringend
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Kartenansicht-Selector */}
      <div className="absolute right-2 top-2 z-[1000]">
        <div className="flex space-x-1 rounded-lg bg-white p-1 shadow-lg dark:bg-gray-800">
          <button
            onClick={() => changeMapView("standard")}
            className={`rounded px-3 py-1 text-xs ${
              mapView === "standard"
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => changeMapView("satellite")}
            className={`rounded px-3 py-1 text-xs ${
              mapView === "satellite"
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Satellit
          </button>
        </div>
      </div>

      {/* Interactive Map */}
      <InteractiveMap
        locations={filteredLocations}
        center={center}
        zoom={zoom}
        height={height}
        searchRadius={searchRadius}
        showRadius={showRadius}
        editable={editable}
        onLocationRemove={onLocationRemove}
      />

      {/* Legende */}
      {showLegend && (
        <div className="absolute bottom-2 left-2 z-[1000] rounded-lg bg-white p-3 shadow-lg dark:bg-gray-800">
          <h4 className="mb-2 text-sm font-medium">Legende</h4>
          <div className="space-y-1">
            {Object.entries(fahndungMarkerIcons).map(([type, config]) => (
              <div key={type} className="flex items-center space-x-2 text-xs">
                <span className="text-lg">{config.icon}</span>
                <span>{config.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location Details Panel */}
      {selectedLocation && (
        <div className="absolute bottom-2 right-2 z-[1000] w-80 rounded-lg bg-white p-4 shadow-xl dark:bg-gray-800">
          <div className="mb-3 flex items-start justify-between">
            <h3 className="text-lg font-semibold">Details</h3>
            <button
              onClick={() => setSelectedLocation(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">
                  {fahndungMarkerIcons[selectedLocation.type].icon}
                </span>
                <span className="font-medium">{selectedLocation.address}</span>
              </div>
              {selectedLocation.description && (
                <p className="mt-1 text-sm text-gray-600">
                  {selectedLocation.description}
                </p>
              )}
            </div>

            {selectedLocation.investigationTitle && (
              <div>
                <h4 className="text-sm font-medium">Fahndung</h4>
                <button
                  onClick={() =>
                    selectedLocation.investigationId &&
                    handleInvestigationClick(selectedLocation.investigationId)
                  }
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {selectedLocation.investigationTitle}
                </button>
              </div>
            )}

            {selectedLocation.priority && (
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span
                  className={`text-sm font-medium ${
                    selectedLocation.priority === "urgent"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {selectedLocation.priority === "urgent"
                    ? "DRINGEND"
                    : selectedLocation.priority.toUpperCase()}
                </span>
              </div>
            )}

            {selectedLocation.timestamp && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>
                  {new Date(selectedLocation.timestamp).toLocaleString("de-DE")}
                </span>
              </div>
            )}

            {selectedLocation.contactInfo && (
              <div className="border-t pt-3">
                <h4 className="mb-2 text-sm font-medium">Kontakt</h4>
                <div className="space-y-1 text-sm">
                  {selectedLocation.contactInfo.person && (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{selectedLocation.contactInfo.person}</span>
                    </div>
                  )}
                  {selectedLocation.contactInfo.phone && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">📞</span>
                      <span>{selectedLocation.contactInfo.phone}</span>
                    </div>
                  )}
                  {selectedLocation.contactInfo.email && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">✉️</span>
                      <span>{selectedLocation.contactInfo.email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Statistiken */}
      <div className="absolute left-1/2 top-2 z-[1000] -translate-x-1/2 rounded-lg bg-white px-4 py-2 shadow-lg dark:bg-gray-800">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span>{filteredLocations.length} Orte</span>
          </div>
          <div className="flex items-center space-x-1">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span>
              {
                filteredLocations.filter((loc) => loc.priority === "urgent")
                  .length
              }{" "}
              dringend
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4 text-green-500" />
            <span>
              {
                filteredLocations.filter((loc) => loc.type === "sichtung")
                  .length
              }{" "}
              Sichtungen
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
