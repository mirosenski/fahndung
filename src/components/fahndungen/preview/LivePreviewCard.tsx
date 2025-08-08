"use client";

import React, { useEffect, useMemo } from "react";
import Image from "next/image";
import { Eye, ArrowLeft } from "lucide-react";
import { CATEGORY_CONFIG, PRIORITY_CONFIG } from "../../fahndungskarte/types";
import type { WizardData } from "../types/WizardTypes";

interface LivePreviewCardProps {
  data: Partial<WizardData>;
}

const LivePreviewCard: React.FC<LivePreviewCardProps> = ({ data }) => {
  const [state, setState] = React.useState({
    isFlipped: false,
    activeTab: "overview",
    isAnimating: false,
    imageError: false,
    showQuickEdit: false,
  });

  // Konvertiere WizardData zu FahndungsData Format
  const fahndungsData = useMemo(
    () => ({
      step1: {
        title: data.step1?.title ?? "Titel der Fahndung",
        category: data.step1?.category ?? "MISSING_PERSON",
        caseNumber: data.step1?.caseNumber ?? "",
      },
      step2: {
        shortDescription:
          data.step2?.shortDescription ??
          "Kurzbeschreibung wird hier angezeigt...",
        description: data.step2?.description ?? "",
        priority: data.step2?.priority ?? "normal",
        tags: data.step2?.tags ?? [],
        features: data.step2?.features ?? "",
      },
      step3: {
        mainImage:
          data.step3?.mainImageUrl ??
          (data.step3?.mainImage
            ? data.step3.mainImage instanceof File
              ? URL.createObjectURL(data.step3.mainImage)
              : data.step3.mainImage
            : "/images/placeholders/fotos/platzhalterbild.svg"),
        mainImageUrl: data.step3?.mainImageUrl ?? undefined,
        additionalImages:
          data.step3?.additionalImageUrls &&
          data.step3.additionalImageUrls.length > 0
            ? data.step3.additionalImageUrls
            : (data.step3?.additionalImages?.map((img) =>
                img instanceof File ? URL.createObjectURL(img) : img,
              ) ?? []),
        additionalImageUrls: data.step3?.additionalImageUrls,
      },
      step4: {
        mainLocation: data.step4?.mainLocation
          ? { address: data.step4.mainLocation.address }
          : undefined,
      },
      step5: {
        contactPerson: data.step5?.contactPerson ?? "",
        contactPhone: data.step5?.contactPhone ?? "",
        contactEmail: data.step5?.contactEmail ?? "",
        department: data.step5?.department ?? "",
        availableHours: data.step5?.availableHours ?? "",
      },
    }),
    [data],
  );

  // Cleanup für File URLs
  useEffect(() => {
    return () => {
      if (data.step3?.mainImage instanceof File) {
        const url = URL.createObjectURL(data.step3.mainImage);
        URL.revokeObjectURL(url);
      }
      data.step3?.additionalImages?.forEach((img) => {
        if (img instanceof File) {
          URL.revokeObjectURL(URL.createObjectURL(img));
        }
      });
    };
  }, [data.step3]);

  const category = useMemo(() => {
    const categoryKey = fahndungsData.step1
      .category as keyof typeof CATEGORY_CONFIG;
    return CATEGORY_CONFIG[categoryKey] ?? CATEGORY_CONFIG.MISSING_PERSON;
  }, [fahndungsData.step1.category]);

  const priority = useMemo(() => {
    const priorityKey = fahndungsData.step2
      .priority as keyof typeof PRIORITY_CONFIG;
    return PRIORITY_CONFIG[priorityKey] ?? PRIORITY_CONFIG.normal;
  }, [fahndungsData.step2.priority]);

  // Event-Handler
  const updateState = React.useCallback(
    (updates: Partial<typeof state>) =>
      setState((prev) => ({ ...prev, ...updates })),
    [],
  );

  const handleImageError = () => updateState({ imageError: true });

  const flipCard = React.useCallback((): void => {
    if (state.isAnimating) return;
    updateState({ isAnimating: true, isFlipped: !state.isFlipped });
    setTimeout(() => updateState({ isAnimating: false }), 500);
  }, [state.isFlipped, state.isAnimating, updateState]);

  return (
    <div className="flex w-full justify-center">
      <div
        className="relative mx-auto h-[513px] w-full max-w-sm scale-90"
        style={{ perspective: "1000px" }}
        role="region"
        aria-label={`Fahndungskarte: ${fahndungsData.step1.title}`}
        onMouseEnter={() => updateState({ showQuickEdit: false })}
        onMouseLeave={() => updateState({ showQuickEdit: false })}
      >
        <div
          className="relative h-full w-full transition-transform duration-500 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: state.isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* FRONT SIDE */}
          <div
            className="group absolute inset-0 flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900"
            style={{ backfaceVisibility: "hidden" }}
            onClick={flipCard}
            role="button"
            aria-label={`Fahndungskarte umdrehen`}
            tabIndex={state.isFlipped ? -1 : 0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                flipCard();
              }
            }}
          >
            {/* Image Section */}
            <div
              className="relative w-full overflow-hidden bg-gray-100 dark:bg-gray-800"
              style={{ height: "60%" }}
            >
              <Image
                src={
                  fahndungsData.step3?.mainImage ||
                  "/images/placeholders/fotos/platzhalterbild.svg"
                }
                alt={`Hauptfoto von ${fahndungsData.step1.title}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority={true}
                loading="eager"
                onError={handleImageError}
              />

              {fahndungsData.step2.priority !== "normal" &&
                !state.isFlipped && (
                  <div
                    className={`absolute right-4 top-4 rounded px-2 py-0.5 text-xs font-bold text-white ${priority.color} ${priority.pulse ? "animate-pulse" : ""}`}
                    style={{ zIndex: 1 }}
                    role="status"
                    aria-label={`Priority: ${priority.label}`}
                  >
                    {priority.label}
                  </div>
                )}

              {/* Category Badge */}
              <div
                className="absolute left-4 top-4 rounded bg-blue-600 px-2 py-0.5 text-xs font-bold text-white"
                style={{ zIndex: 1 }}
                role="status"
                aria-label={`Kategorie: ${category.label}`}
              >
                {category.label}
              </div>
            </div>

            {/* Info Section */}
            <div className="flex flex-1 flex-col justify-between p-4">
              <div className="space-y-2">
                <h3 className="line-clamp-2 text-lg font-bold text-gray-900 dark:text-white">
                  {fahndungsData.step1.title}
                </h3>
                <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                  {fahndungsData.step2.shortDescription}
                </p>
              </div>

              {/* Bottom Section */}
              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-500">Vorschau</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    flipCard();
                  }}
                  className="flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                  aria-label="Karte umdrehen"
                >
                  <Eye className="h-3 w-3" />
                  Details
                </button>
              </div>
            </div>
          </div>

          {/* BACK SIDE */}
          <div
            className="absolute inset-0 flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
            role="button"
            aria-label="Rückseite der Fahndungskarte"
            tabIndex={state.isFlipped ? 0 : -1}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                flipCard();
              }
            }}
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Details
                </h3>
                <button
                  onClick={flipCard}
                  className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  aria-label="Zurück zur Vorderseite"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Zurück
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {/* Beschreibung */}
                  {fahndungsData.step2.description && (
                    <div>
                      <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                        Beschreibung
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {fahndungsData.step2.description}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {fahndungsData.step2.tags &&
                    fahndungsData.step2.tags.length > 0 && (
                      <div>
                        <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                          Schlagwörter
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {fahndungsData.step2.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Kontakt */}
                  {fahndungsData.step5.contactPerson && (
                    <div>
                      <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                        Kontakt
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {fahndungsData.step5.contactPerson}
                        {fahndungsData.step5.department && (
                          <span className="block text-xs text-gray-500">
                            {fahndungsData.step5.department}
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePreviewCard;
