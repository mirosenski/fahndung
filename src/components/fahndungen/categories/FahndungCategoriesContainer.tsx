"use client";

import React, { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Edit, Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { useInvestigationSync } from "~/hooks/useInvestigationSync";
import { useInvestigationEdit } from "~/hooks/useInvestigationEdit";
import { useAuth } from "~/hooks/useAuth";
import { canEdit } from "~/lib/auth";
import PageLayout from "~/components/layout/PageLayout";
import { InvestigationEditErrorBoundary } from "~/components/fahndungen/InvestigationEditErrorBoundary";
import { Button } from "~/components/ui/button";
import dynamic from "next/dynamic";
import { InvestigationDataConverter } from "~/lib/services/investigationDataConverter";
import type { UIInvestigationData } from "~/lib/types/investigation.types";
import { isValidInvestigationId } from "~/lib/utils/validation";
import { InvestigationDebug } from "~/components/debug/InvestigationDebug";

// Lazy Loading für bessere Performance
// Nutze die modernisierte Overview‑Kategorie mit optimierter Performance
const OverviewCategory = dynamic(() => import("./ModernOverviewCategory"), {
  loading: () => (
    <div className="animate-pulse">
      <div className="h-64 rounded-lg bg-gray-200 dark:bg-gray-700" />
    </div>
  ),
  ssr: false,
});

const DescriptionCategory = dynamic(() => import("./DescriptionCategory"), {
  loading: () => (
    <div className="animate-pulse">
      <div className="h-64 rounded-lg bg-gray-200 dark:bg-gray-700" />
    </div>
  ),
  ssr: false,
});

const MediaCategory = dynamic(() => import("./MediaCategory"), {
  loading: () => (
    <div className="animate-pulse">
      <div className="h-64 rounded-lg bg-gray-200 dark:bg-gray-700" />
    </div>
  ),
  ssr: false,
});

const LocationsCategory = dynamic(() => import("./LocationsCategory"), {
  loading: () => (
    <div className="animate-pulse">
      <div className="h-64 rounded-lg bg-gray-200 dark:bg-gray-700" />
    </div>
  ),
  ssr: false,
});

const ContactCategory = dynamic(() => import("./ContactCategory"), {
  loading: () => (
    <div className="animate-pulse">
      <div className="h-64 rounded-lg bg-gray-200 dark:bg-gray-700" />
    </div>
  ),
  ssr: false,
});

interface FahndungCategoriesContainerProps {
  investigationId: string;
}

export default function FahndungCategoriesContainer({
  investigationId,
}: FahndungCategoriesContainerProps) {
  const router = useRouter();
  const { session } = useAuth();
  const [activeCategory, setActiveCategory] = useState("overview");

  // Validiere investigationId
  const isValidId = isValidInvestigationId(investigationId);

  // Optimierte Hooks mit reduzierter Synchronisation
  const { investigation, isLoading } = useInvestigationSync(investigationId);
  const { editedData, isEditMode, save, updateField, globalSync } =
    useInvestigationEdit(investigationId);

  // Delete mutation hook
  const deleteMutation = api.post.deleteInvestigation.useMutation({
    onSuccess: () => {
      router.push("/fahndungen");
    },
    onError: (error) => {
      console.error("Fehler beim Löschen:", error);
    },
  });

  // Memoized Navigation Function
  const navigateToCategory = useCallback((category: string) => {
    setActiveCategory(category);
  }, []);

  // Memoized Save Handler
  const handleSave = useCallback(async () => {
    await save();
    setActiveCategory("overview");
  }, [save]);

  // Memoized Delete Handler
  const handleDelete = useCallback(async () => {
    if (!investigation) return;

    try {
      await deleteMutation.mutateAsync({ id: investigationId });
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
    }
  }, [investigation, investigationId, deleteMutation]);

  // Memoized Loading State
  const loadingState = useMemo(() => {
    if (isLoading || !isValidId) {
      return (
        <PageLayout session={session}>
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="text-gray-600 dark:text-gray-400">
                {!isValidId
                  ? "Ungültige Fahndungs-ID"
                  : "Lade Fahndungsdaten..."}
              </p>
            </div>
          </div>
        </PageLayout>
      );
    }
    return null;
  }, [isLoading, isValidId, session]);

  // Memoized Error State
  const errorState = useMemo(() => {
    if (!isValidId) {
      return (
        <PageLayout session={session}>
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500">
                <div className="h-6 w-6 text-white">!</div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Ungültige Fahndungs-ID
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Die angegebene Fahndungs-ID ist ungültig oder leer.
              </p>
              <Link
                href="/fahndungen"
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Zurück zur Übersicht
              </Link>
            </div>
          </div>
        </PageLayout>
      );
    }

    if (!investigation && !isLoading) {
      return (
        <PageLayout session={session}>
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500">
                <div className="h-6 w-6 text-white">!</div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Fahndung nicht gefunden
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Die angeforderte Fahndung konnte nicht gefunden werden.
              </p>
              <Link
                href="/fahndungen"
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Zurück zur Übersicht
              </Link>
            </div>
          </div>
        </PageLayout>
      );
    }

    return null;
  }, [isValidId, investigation, isLoading, session]);

  // Memoized Converted Data
  const convertedData = useMemo(() => {
    if (!investigation) return null;

    const conversion = InvestigationDataConverter.toUIFormat(
      investigation as Record<string, unknown>,
    );
    if (conversion.success) {
      return conversion.data;
    } else {
      console.error("Fehler bei der Datenkonvertierung:", conversion.error);
      // Fallback: Verwende die Rohdaten mit Standardwerten
      return {
        step1: {
          title: investigation.title ?? "",
          category: investigation.category ?? "MISSING_PERSON",
          caseNumber: investigation.case_number ?? "",
        },
        step2: {
          shortDescription: investigation.short_description ?? "",
          description: investigation.description ?? "",
          priority: investigation.priority ?? "normal",
          tags: investigation.tags ?? [],
          features: investigation.features ?? "",
        },
        step3: {
          mainImage: investigation.images?.[0]?.url ?? null,
          additionalImages:
            investigation.images?.slice(1).map((img) => img.url) ?? [],
        },
        step4: {
          mainLocation: investigation.location
            ? { address: investigation.location }
            : null,
        },
        step5: {
          contactPerson:
            investigation.contact_info?.["person"] as string ?? "Polizei",
          contactPhone:
            investigation.contact_info?.["phone"] as string ??
            "+49 711 8990-0",
          contactEmail: investigation.contact_info?.["email"] as string ?? "",
          department: investigation.station ?? "Polizeipräsidium",
          availableHours:
            investigation.contact_info?.["hours"] as string ?? "24/7",
        },
        images: investigation.images ?? [],
        contact_info: investigation.contact_info ?? {},
      } as UIInvestigationData;
    }
  }, [investigation]);

  // Memoized Category Content
  const categoryContent = useMemo(() => {
    if (!convertedData) return null;

    const data = isEditMode ? editedData : convertedData;

    if (!data) {
      return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">
            Keine Daten verfügbar.
          </p>
        </div>
      );
    }

    const commonProps = {
      data,
      isEditMode,
      updateField,
    };

    switch (activeCategory) {
      case "overview":
        return (
          <OverviewCategory
            {...commonProps}
            onNext={() => navigateToCategory("description")}
          />
        );

      case "description":
        return (
          <DescriptionCategory
            {...commonProps}
            onNext={() => navigateToCategory("media")}
            onPrevious={() => navigateToCategory("overview")}
          />
        );

      case "media":
        return (
          <MediaCategory
            {...commonProps}
            onNext={() => navigateToCategory("locations")}
            onPrevious={() => navigateToCategory("description")}
          />
        );

      case "locations":
        return (
          <LocationsCategory
            {...commonProps}
            onNext={() => navigateToCategory("contact")}
            onPrevious={() => navigateToCategory("media")}
          />
        );

      case "contact":
        return (
          <ContactCategory
            {...commonProps}
            onPrevious={() => navigateToCategory("locations")}
            onSave={handleSave}
          />
        );

      default:
        return (
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-400">
              Kategorie nicht verfügbar.
            </p>
          </div>
        );
    }
  }, [
    activeCategory,
    convertedData,
    editedData,
    isEditMode,
    updateField,
    navigateToCategory,
    handleSave,
  ]);

  // Memoized Categories Array
  const categories = useMemo(
    () => [
      { id: "overview", label: "Übersicht", icon: "📋" },
      { id: "description", label: "Beschreibung", icon: "📝" },
      { id: "media", label: "Medien", icon: "🖼️" },
      { id: "locations", label: "Orte", icon: "📍" },
      { id: "contact", label: "Kontakt", icon: "📞" },
    ],
    [],
  );

  // Early returns für Loading und Error States
  if (loadingState) return loadingState;
  if (errorState) return errorState;

  return (
    <InvestigationEditErrorBoundary>
      <PageLayout session={session}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/fahndungen"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Zurück zu allen Fahndungen
                </Link>
              </div>

              <div className="flex items-center gap-2">
                {canEdit(session?.profile ?? null) && (
                  <>
                    {isEditMode ? (
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={handleSave}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <Save className="h-4 w-4" />
                          Speichern
                        </Button>
                        <Button
                          onClick={() => globalSync()}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Ansicht
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => globalSync()}
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Bearbeiten
                        </Button>
                        <Button
                          onClick={handleDelete}
                          variant="destructive"
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Löschen
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Category Navigation */}
          <div className="mb-6">
            <nav className="flex space-x-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => navigateToCategory(category.id)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    activeCategory === category.id
                      ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  <span>{category.icon}</span>
                  <span className="hidden sm:inline">{category.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Category Content */}
          <div className="min-h-[600px]">{categoryContent}</div>
        </div>
      </PageLayout>

      {/* Debug-Komponente (nur in Development) */}
      <InvestigationDebug investigationId={investigationId} />
    </InvestigationEditErrorBoundary>
  );
}
