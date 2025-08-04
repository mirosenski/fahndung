"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, X, ChevronRight, Edit3 } from "lucide-react";
import { getFahndungUrl } from "~/lib/seo";
import { useInvestigationSync } from "~/hooks/useInvestigationSync";
import { NetworkErrorDiagnostic } from "~/components/NetworkErrorDiagnostic";
import type { ModernFahndungskarteProps, FahndungsData } from "./types";
import { CATEGORY_CONFIG, PRIORITY_CONFIG, TAB_CONFIG } from "./types";
import { mockData } from "./mockData";
import {
  convertInvestigationToFahndungsData,
  createSafeData,
  getSafeImageSrc,
} from "./utils";
import { TabContent } from "./TabContent";

// Style-Konstanten
const CARD_STYLES = "relative mx-auto h-[513px] w-full max-w-sm";
const FRONT_STYLES =
  "group absolute inset-0 flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900";
const BACK_STYLES =
  "absolute inset-0 flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900";
const BUTTON_STYLES =
  "flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";

const Fahndungskarte: React.FC<ModernFahndungskarteProps> = ({
  data: propData,
  className = "",
  investigationId,
  userPermissions,
}) => {
  const router = useRouter();
  const [state, setState] = useState({
    isFlipped: false,
    activeTab: "overview",
    isAnimating: false,
    imageError: false,
    showQuickEdit: false,
    networkError: null as string | Error | null,
  });

  const {
    investigation: syncInvestigation,
    syncAfterUpdate,
    error: syncError,
  } = useInvestigationSync(investigationId!);
  const cardRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const detailsButtonRef = useRef<HTMLButtonElement>(null);

  // Error-Handling
  useEffect(() => {
    if (syncError) {
      // Konvertiere TRPC Error zu Standard Error
      const error =
        syncError instanceof Error
          ? syncError
          : new Error(
              syncError.message || "Ein Netzwerkfehler ist aufgetreten",
            );
      setState((prev) => ({ ...prev, networkError: error }));
    }
  }, [syncError]);

  // Daten-Setup
  const convertedData = syncInvestigation
    ? convertInvestigationToFahndungsData(
        syncInvestigation as unknown as Record<string, unknown>,
      )
    : propData;
  const data = convertedData ?? mockData;
  const safeData: FahndungsData = createSafeData(data, mockData);
  const isDataLoading = !syncInvestigation && !propData;
  const category = safeData?.step1?.category
    ? CATEGORY_CONFIG[safeData.step1.category]
    : CATEGORY_CONFIG.MISSING_PERSON;
  const priority = safeData?.step2?.priority
    ? PRIORITY_CONFIG[safeData.step2.priority]
    : PRIORITY_CONFIG.normal;

  // Event-Handler
  const updateState = useCallback(
    (updates: Partial<typeof state>) =>
      setState((prev) => ({ ...prev, ...updates })),
    [],
  );
  const handleImageError = () => updateState({ imageError: true });
  const handleQuickEdit = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (investigationId)
      router.push(`/fahndungen/${investigationId}?edit=true`);
  };

  const flipCard = useCallback((): void => {
    if (state.isAnimating) return;
    updateState({ isAnimating: true, isFlipped: !state.isFlipped });
    setTimeout(() => updateState({ isAnimating: false }), 500);
  }, [state.isFlipped, state.isAnimating, updateState]);

  const navigateToDetail = () =>
    router.push(
      getFahndungUrl(safeData.step1.title, safeData.step1.caseNumber),
    );

  // Retry-Funktion für NetworkErrors
  const handleRetry = useCallback(() => {
    updateState({ networkError: null });
    // Trigger re-fetch
    if (investigationId) {
      void syncAfterUpdate();
    }
  }, [investigationId, syncAfterUpdate, updateState]);

  // Vereinfachte Effects
  useEffect(() => {
    if (typeof window === "undefined") return;
    const loadLeaflet = async () => {
      try {
        const L = await import("leaflet");
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

    // Auto-sync
    if (!investigationId) return;
    const interval = setInterval(() => void syncAfterUpdate(), 5000);
    return () => clearInterval(interval);
  }, [investigationId, syncAfterUpdate]);

  // Keyboard & Click-Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!cardRef.current?.contains(document.activeElement)) return;
      const activeElement = document.activeElement;

      if (!state.isFlipped) {
        if (
          (e.key === "Enter" || e.key === " ") &&
          activeElement === detailsButtonRef.current
        ) {
          e.preventDefault();
          e.stopPropagation();
          flipCard();
        }
        if (e.key === "Tab") {
          if (activeElement === frontRef.current && !e.shiftKey) {
            e.preventDefault();
            detailsButtonRef.current?.focus();
          } else if (activeElement === detailsButtonRef.current && e.shiftKey) {
            e.preventDefault();
            frontRef.current?.focus();
          }
        }
      }
      if (state.isFlipped && e.key === "Escape") {
        e.preventDefault();
        flipCard();
        setTimeout(() => frontRef.current?.focus(), 100);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        state.isFlipped &&
        cardRef.current &&
        !cardRef.current.contains(e.target as Node)
      ) {
        flipCard();
      }
    };

    const handleScroll = () => {
      if (state.isFlipped) flipCard();
    };
    const handlePopState = () => {
      if (state.isFlipped) flipCard();
    };

    const cardElement = cardRef.current;
    if (cardElement) cardElement.addEventListener("keydown", handleKeyDown);
    if (state.isFlipped) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("popstate", handlePopState);
    }

    return () => {
      if (cardElement)
        cardElement.removeEventListener("keydown", handleKeyDown);
      if (state.isFlipped) {
        document.removeEventListener("mousedown", handleClickOutside);
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("popstate", handlePopState);
      }
    };
  }, [state.isFlipped, flipCard]);

  // Tab-Index Management
  useEffect(() => {
    if (backRef.current) {
      const focusableElements = backRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      focusableElements.forEach((element) => {
        element.setAttribute("tabindex", state.isFlipped ? "0" : "-1");
      });
    }
  }, [state.isFlipped]);

  // Zeige NetworkError-Diagnose wenn Fehler vorhanden
  if (state.networkError) {
    return (
      <div className={`${CARD_STYLES} ${className}`}>
        <NetworkErrorDiagnostic
          error={state.networkError}
          onRetry={handleRetry}
          className="h-full"
        />
      </div>
    );
  }

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

  return (
    <div
      ref={cardRef}
      className={`${CARD_STYLES} ${className}`}
      style={{ perspective: "1000px" }}
      role="region"
      aria-label={`Fahndungskarte: ${safeData.step1.title}`}
      onMouseEnter={() => updateState({ showQuickEdit: true })}
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
          ref={frontRef}
          className={FRONT_STYLES}
          style={{ backfaceVisibility: "hidden" }}
          onClick={navigateToDetail}
          role="button"
          aria-label={`Zur Detailseite von ${safeData.step1.title} navigieren`}
          tabIndex={state.isFlipped ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigateToDetail();
            }
          }}
        >
          {/* Image Section */}
          <div
            className="relative w-full overflow-hidden bg-gray-100 dark:bg-gray-800"
            style={{ height: "60%" }}
          >
            {userPermissions?.canEdit && state.showQuickEdit && (
              <button
                onClick={handleQuickEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    handleQuickEdit(e);
                  }
                }}
                className="absolute left-4 top-4 z-10 flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white shadow-lg transition-all hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                aria-label="Schnell bearbeiten"
                tabIndex={0}
              >
                <Edit3 className="h-3 w-3" />
                Bearbeiten
              </button>
            )}

            <Image
              src={getSafeImageSrc(safeData, state.imageError)}
              alt={`Hauptfoto von ${safeData.step1.title}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
              onError={handleImageError}
            />

            {safeData.step2.priority !== "normal" && !state.isFlipped && (
              <div
                className={`absolute right-4 top-4 rounded px-2 py-0.5 text-xs font-bold text-white ${priority.color} ${priority.pulse ? "animate-pulse" : ""}`}
                style={{ zIndex: 1 }}
                role="status"
                aria-label={`Priority: ${priority.label}`}
              >
                {priority.label}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div
            className="flex flex-col justify-between p-4"
            style={{ height: "40%" }}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {safeData.step4.mainLocation?.address.split(",")[0] ??
                    "Unbekannt"}{" "}
                  |{" "}
                  {safeData.step1.caseNumber
                    ? new Date().toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "Unbekannt"}
                </div>
                <div
                  className="rounded border border-gray-300 bg-white px-2 py-0.5 text-xs font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                  role="status"
                  aria-label={`Kategorie: ${category.label}`}
                >
                  {category.label}
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {safeData.step1.title}
              </h3>
              <p className="line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {safeData.step2.shortDescription}
              </p>
            </div>

            <div className="mt-auto flex items-center justify-between">
              <button
                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 transition-all hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToDetail();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    navigateToDetail();
                  }
                }}
                aria-label="Mehr erfahren"
                tabIndex={0}
              >
                <span>Mehr erfahren</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              <button
                ref={detailsButtonRef}
                className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-300"
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
                aria-label="Karte umdrehen"
                tabIndex={0}
              >
                <div className="flex flex-col gap-1.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-current"
                    ></div>
                  ))}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* BACK SIDE */}
        <div
          ref={backRef}
          className={BACK_STYLES}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
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

          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {TAB_CONFIG.map((tab) => (
              <button
                key={tab.id}
                onClick={() => updateState({ activeTab: tab.id })}
                className={`flex min-w-0 flex-1 items-center justify-center gap-1 px-2 py-3 text-xs font-medium transition-colors ${
                  state.activeTab === tab.id
                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <tab.icon className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <TabContent
              activeTab={state.activeTab}
              safeData={safeData}
              imageError={state.imageError}
              handleImageError={handleImageError}
              investigationId={investigationId}
            />
          </div>

          <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <button onClick={navigateToDetail} className={BUTTON_STYLES}>
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

export default Fahndungskarte;
