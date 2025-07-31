"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Eye, Clock, Edit3 } from "lucide-react";
import { type Fahndungskarte } from "~/types/fahndungskarte";
import { CaseNumberBadge } from "~/components/ui/CaseNumberDisplay";
import { getFahndungUrl } from "~/lib/seo";

interface FahndungskarteListFlatProps {
  investigations: Fahndungskarte[];
  className?: string;
  onAction?: () => void;
  userRole?: string;
  userPermissions?: {
    canEdit?: boolean;
    canDelete?: boolean;
    canPublish?: boolean;
  };
}

export default function FahndungskarteListFlat({
  investigations,
  className = "",
  onAction: _onAction,
  userRole: _userRole,
  userPermissions,
}: FahndungskarteListFlatProps) {
  const router = useRouter();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Hilfsfunktion für Platzhalterbild
  const getPlaceholderImage = () =>
    "/images/placeholders/fotos/platzhalterbild.svg";

  // Sichere Bildquelle-Validierung
  const getSafeImageSrc = (investigation: Fahndungskarte) => {
    if (imageErrors[investigation.id]) {
      return getPlaceholderImage();
    }

    const mainImage = investigation.images?.[0]?.url;
    if (mainImage && mainImage.trim() !== "") {
      return mainImage;
    }

    return getPlaceholderImage();
  };

  // Bildfehler-Handler
  const handleImageError = (investigationId: string) => {
    setImageErrors((prev) => ({ ...prev, [investigationId]: true }));
  };

  // Priority Badge
  const getPriorityBadge = (priority: string) => {
    const config = {
      urgent: { label: "DRINGEND", color: "bg-red-600", pulse: true },
      new: { label: "NEU", color: "bg-blue-600", pulse: false },
      normal: { label: "STANDARD", color: "bg-gray-500", pulse: false },
    };

    const priorityConfig =
      config[priority as keyof typeof config] || config.normal;

    return (
      <div
        className={`rounded-full px-2 py-1 text-xs font-bold text-white ${priorityConfig.color} ${priorityConfig.pulse ? "animate-pulse" : ""}`}
      >
        {priorityConfig.label}
      </div>
    );
  };

  // Category Badge
  const getCategoryBadge = (category: string) => {
    const config = {
      WANTED_PERSON: {
        label: "STRAFTÄTER",
        color: "bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200",
      },
      MISSING_PERSON: {
        label: "VERMISSTE",
        color: "bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      },
      UNKNOWN_DEAD: {
        label: "UNBEKANNTE TOTE",
        color: "bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      },
      STOLEN_GOODS: {
        label: "SACHEN",
        color:
          "bg-orange-50 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      },
    };

    const categoryConfig =
      config[category as keyof typeof config] || config.MISSING_PERSON;

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryConfig.color}`}
      >
        {categoryConfig.label}
      </span>
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {investigations.map((investigation) => (
        <div
          key={investigation.id}
          className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center">
            {/* Bild-Sektion - kleiner auf großen Bildschirmen */}
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-700 sm:h-20 sm:w-20 lg:h-12 lg:w-12">
              <Image
                src={getSafeImageSrc(investigation)}
                alt={`Hauptfoto von ${investigation.title}`}
                fill
                sizes="(max-width: 640px) 64px, (max-width: 1024px) 80px, 48px"
                className="object-cover"
                onError={() => handleImageError(investigation.id)}
              />

              {/* Priority Badge */}
              {investigation.priority !== "normal" && (
                <div className="absolute right-1 top-1">
                  {getPriorityBadge(investigation.priority)}
                </div>
              )}
            </div>

            {/* Content-Sektion - flach und kompakt */}
            <div className="flex flex-1 items-center justify-between p-3 lg:p-2">
              {/* Linke Seite - Hauptinformationen */}
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {/* Titel und Badges */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white lg:text-xs">
                      {investigation.title}
                    </h3>
                    {getCategoryBadge(investigation.category)}
                  </div>
                  <div className="flex items-center gap-2">
                    <CaseNumberBadge caseNumber={investigation.case_number} />
                    {/* Standort - nur auf größeren Bildschirmen */}
                    {investigation.location && (
                      <div className="hidden items-center gap-1 text-xs text-gray-500 dark:text-gray-400 md:flex">
                        <MapPin className="h-3 w-3" />
                        <span className="max-w-24 truncate">
                          {investigation.location.split(",")[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Beschreibung - nur auf mittleren Bildschirmen */}
                <div className="hidden max-w-xs flex-1 lg:block">
                  <p className="line-clamp-1 text-xs text-gray-600 dark:text-gray-400">
                    {investigation.short_description ||
                      investigation.description?.substring(0, 80) + "..."}
                  </p>
                </div>

                {/* Tags - nur auf großen Bildschirmen */}
                {investigation.tags && investigation.tags.length > 0 && (
                  <div className="hidden max-w-48 flex-wrap gap-1 xl:flex">
                    {investigation.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {tag}
                      </span>
                    ))}
                    {investigation.tags.length > 2 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{investigation.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Rechte Seite - Metadaten und Actions */}
              <div className="ml-3 flex items-center gap-2">
                {/* Erstellungsdatum - nur auf größeren Bildschirmen */}
                <div className="hidden items-center gap-1 text-xs text-gray-500 dark:text-gray-400 sm:flex">
                  <Clock className="h-3 w-3" />
                  <span>
                    {new Date(investigation.created_at).toLocaleDateString(
                      "de-DE",
                    )}
                  </span>
                </div>

                {/* Quick Edit Button - nur für Editoren */}
                {userPermissions?.canEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/fahndungen/${investigation.id}?edit=true`);
                    }}
                    className="flex items-center gap-1 rounded-full bg-blue-600 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group-hover:opacity-100"
                    aria-label="Schnell bearbeiten"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span className="hidden sm:inline">Bearbeiten</span>
                  </button>
                )}

                {/* Action Button */}
                <button
                  onClick={() =>
                    router.push(
                      getFahndungUrl(
                        investigation.title,
                        investigation.case_number,
                      ),
                    )
                  }
                  className="flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  <Eye className="h-3 w-3" />
                  <span className="hidden sm:inline">Details</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
