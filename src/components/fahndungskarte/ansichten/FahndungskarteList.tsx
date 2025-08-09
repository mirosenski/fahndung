"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Eye, Edit3 } from "lucide-react";
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
      normal: { label: "STANDARD", color: "bg-muted", pulse: false },
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

  // Kompakter Kategorie/Variante-Text statt Badge
  const getCategoryVariantText = (
    category: string,
    variant?: string,
  ): string => {
    const labels = {
      WANTED_PERSON: "Straftäter",
      MISSING_PERSON: "Vermisste",
      UNKNOWN_DEAD: "Unbekannte Tote",
      STOLEN_GOODS: "Sachen",
    } as const;
    const catLabel = labels[(category as keyof typeof labels)] ?? labels.MISSING_PERSON;
    if (variant && variant.trim().length > 0) {
      return `${catLabel} · ${variant}`;
    }
    return catLabel;
  };

  const getVariantFromMetadata = (metadata: unknown): string | undefined => {
    if (metadata && typeof metadata === "object" && "variant" in metadata) {
      const v = (metadata as { variant?: unknown }).variant;
      return typeof v === "string" ? v : undefined;
    }
    return undefined;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {investigations.map((investigation, index) => (
        <div
          key={investigation.id}
          className="group relative overflow-hidden rounded-lg border border-border bg-white shadow-sm transition-all duration-200 hover:shadow-sm dark:border-border dark:bg-muted"
        >
          <div className="flex">
            {/* Bild-Sektion */}
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden bg-muted dark:bg-muted">
              <Image
                src={getSafeImageSrc(investigation)}
                alt={`Hauptfoto von ${investigation.title}`}
                fill
                sizes="96px"
                className="object-cover"
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
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
                    <h3 className="truncate text-lg font-semibold text-muted-foreground dark:text-white">
                      {investigation.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <CaseNumberBadge caseNumber={investigation.case_number} />
                      <span>
                        {getCategoryVariantText(
                          investigation.category,
                          // Variante steckt in metadata? fallback leer
                          getVariantFromMetadata(investigation.metadata),
                        )}
                      </span>
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
                      className="flex items-center gap-1 rounded-full bg-blue-600 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group-hover:opacity-100"
                      aria-label="Schnell bearbeiten"
                    >
                      <Edit3 className="h-3 w-3" />
                      Bearbeiten
                    </button>
                  )}
                </div>

                {/* Beschreibung */}
                <p className="line-clamp-2 text-sm text-muted-foreground dark:text-muted-foreground">
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
                      <span className="text-xs text-muted-foreground dark:text-muted-foreground">
                        +{investigation.tags.length - 3} weitere
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Footer mit kompakten Metadaten */}
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground dark:text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>{investigation.station || "Dienststelle"}</span>
                  <span>|</span>
                  <span>
                    {new Date(
                      investigation.date || investigation.created_at,
                    ).toLocaleDateString("de-DE")}
                  </span>
                  {investigation.location && (
                    <>
                      <span>|</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="max-w-32 truncate">
                          {investigation.location.split(",")[0]}
                        </span>
                      </div>
                    </>
                  )}
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
                    className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted"
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
