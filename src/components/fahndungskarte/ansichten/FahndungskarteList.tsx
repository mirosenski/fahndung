"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Eye, Clock, Edit3 } from "lucide-react";
import { type Fahndungskarte } from "~/types/fahndungskarte";
import { CaseNumberBadge } from "~/components/ui/CaseNumberDisplay";
import { getFahndungUrl } from "~/lib/seo";

interface FahndungskarteListProps {
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

export default function FahndungskarteList({
  investigations,
  className = "",
  onAction: _onAction,
  userRole: _userRole,
  userPermissions,
}: FahndungskarteListProps) {
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
    <div className={`space-y-3 ${className}`}>
      {investigations.map((investigation) => (
        <div
          key={investigation.id}
          className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex">
            {/* Bild-Sektion */}
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-700">
              <Image
                src={getSafeImageSrc(investigation)}
                alt={`Hauptfoto von ${investigation.title}`}
                fill
                sizes="96px"
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

            {/* Content-Sektion */}
            <div className="flex flex-1 flex-col justify-between p-4">
              <div className="space-y-2">
                {/* Header mit Titel und Badges */}
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
                      {investigation.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      <CaseNumberBadge caseNumber={investigation.case_number} />
                      {getCategoryBadge(investigation.category)}
                    </div>
                  </div>

                  {/* Quick Edit Button - nur für Editoren */}
                  {userPermissions?.canEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(
                          `/fahndungen/${investigation.id}?edit=true`,
                        );
                      }}
                      className="flex items-center gap-1 rounded-full bg-blue-600 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group-hover:opacity-100"
                      aria-label="Schnell bearbeiten"
                    >
                      <Edit3 className="h-3 w-3" />
                      Bearbeiten
                    </button>
                  )}
                </div>

                {/* Beschreibung */}
                <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                  {investigation.short_description ||
                    investigation.description?.substring(0, 150) + "..."}
                </p>

                {/* Tags */}
                {investigation.tags && investigation.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {investigation.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {tag}
                      </span>
                    ))}
                    {investigation.tags.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{investigation.tags.length - 3} weitere
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Footer mit Metadaten */}
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  {/* Standort */}
                  {investigation.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="max-w-32 truncate">
                        {investigation.location.split(",")[0]}
                      </span>
                    </div>
                  )}

                  {/* Erstellungsdatum */}
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(investigation.created_at).toLocaleDateString(
                        "de-DE",
                      )}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      router.push(
                        getFahndungUrl(
                          investigation.title,
                          investigation.case_number,
                        ),
                      )
                    }
                    className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    <Eye className="h-3 w-3" />
                    Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
