"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Edit3,
  Save,
  X,
  MoreVertical,
  Trash2,
  Archive,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getCurrentSession, type Session, canEdit } from "~/lib/auth";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import PageLayout from "@/components/layout/PageLayout";
import { InvestigationEditErrorBoundary } from "~/components/fahndungen/InvestigationEditErrorBoundary";
import { useInvestigationEdit } from "~/hooks/useInvestigationEdit";
import { useInvestigationSync } from "~/hooks/useInvestigationSync";

// Import categories
import {
  OverviewCategory,
  DescriptionCategory,
  MediaCategory,
  LocationsCategory,
  ContactCategory,
} from "./index";

interface FahndungCategoriesContainerProps {
  investigationId: string;
}

export default function FahndungCategoriesContainer({
  investigationId,
}: FahndungCategoriesContainerProps) {
  const searchParams = useSearchParams();
  const [session, setSession] = React.useState<Session | null>(null);
  const [activeCategory, setActiveCategory] = useState("overview");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  React.useEffect(() => {
    void getCurrentSession().then(setSession);
  }, []);

  // Verwende die Synchronisations-Hook für bessere Datenaktualisierung
  const { investigation: syncInvestigation, globalSync } =
    useInvestigationSync(investigationId);

  // Verwende den Custom Hook für Edit-Funktionalität
  const editHook = useInvestigationEdit(investigationId);

  // Separate useEffect for edit parameter handling
  React.useEffect(() => {
    const editParam = searchParams?.get("edit");
    if (
      editParam === "true" &&
      canEdit(session?.profile ?? null) &&
      !editHook.isEditing
    ) {
      editHook.startEditing();
    }
  }, [searchParams, session?.profile, editHook]);

  const {
    isEditing: isEditMode,
    original: investigation,
    current: editedData,
    isLoading,
    validationWarnings,
    updateField,
    save,
    cancel,
    startEditing,
    deleteInvestigation,
    publishInvestigation,
    archiveInvestigation,
    unpublishInvestigation,
  } = editHook;

  // Verwende syncInvestigation als primäre Datenquelle
  const dbInvestigation = syncInvestigation;
  const investigationStatus = dbInvestigation?.status;

  const handleDelete = async () => {
    try {
      await deleteInvestigation();
      window.location.href = "/fahndungen";
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // Automatische Refetch nach Speichern
  React.useEffect(() => {
    if (!isEditMode && investigationId) {
      console.log("🔄 Sofortige Synchronisation nach Speichern");
      globalSync();
    }
  }, [isEditMode, investigationId, globalSync]);

  // Navigation zwischen Kategorien
  const navigateToCategory = (category: string) => {
    setActiveCategory(category);
  };

  const handleSave = async () => {
    await save();
    // Nach dem Speichern zur Übersicht zurückkehren
    setActiveCategory("overview");
  };

  // Loading State
  if (isLoading) {
    return (
      <PageLayout session={session}>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-gray-600 dark:text-gray-400">
              Lade Fahndungsdaten...
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!investigation) {
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
              Die angeforderte Fahndung existiert nicht.
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

  // Render content based on active category
  const renderCategoryContent = (): React.JSX.Element => {
    const data = isEditMode ? editedData : investigation;

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
  };

  // Category navigation
  const categories = [
    { id: "overview", label: "Übersicht", icon: "📋" },
    { id: "description", label: "Beschreibung", icon: "📝" },
    { id: "media", label: "Medien", icon: "🖼️" },
    { id: "locations", label: "Orte", icon: "📍" },
    { id: "contact", label: "Kontakt", icon: "📞" },
  ];

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
                          onClick={save}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <Save className="h-4 w-4" />
                          Speichern
                        </Button>
                        <Button
                          onClick={cancel}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Abbrechen
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={startEditing}
                          className="flex items-center gap-2"
                        >
                          <Edit3 className="h-4 w-4" />
                          Bearbeiten
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {investigation && (
                              <>
                                {investigationStatus === "draft" && (
                                  <DropdownMenuItem
                                    onClick={() => publishInvestigation()}
                                    className="flex items-center gap-2"
                                  >
                                    <Eye className="h-4 w-4" />
                                    Veröffentlichen
                                  </DropdownMenuItem>
                                )}

                                {investigationStatus === "published" && (
                                  <DropdownMenuItem
                                    onClick={() => unpublishInvestigation()}
                                    className="flex items-center gap-2"
                                  >
                                    <EyeOff className="h-4 w-4" />
                                    Unveröffentlichen
                                  </DropdownMenuItem>
                                )}

                                {investigationStatus !== "archived" && (
                                  <DropdownMenuItem
                                    onClick={() => archiveInvestigation()}
                                    className="flex items-center gap-2"
                                  >
                                    <Archive className="h-4 w-4" />
                                    Archivieren
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  onClick={() => setIsDeleteDialogOpen(true)}
                                  className="flex items-center gap-2 text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Löschen
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Category Navigation */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    activeCategory === category.id ? "default" : "outline"
                  }
                  onClick={() => navigateToCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <span>{category.icon}</span>
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Validation Warnings */}
          {validationWarnings && validationWarnings.length > 0 && (
            <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <h4 className="mb-2 font-medium text-yellow-800">
                Datenqualitäts-Hinweise:
              </h4>
              <ul className="list-inside list-disc text-sm text-yellow-700">
                {validationWarnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-yellow-600">
                Diese Hinweise beeinträchtigen nicht die Bearbeitung, sollten
                aber behoben werden.
              </p>
            </div>
          )}

          {/* Main Content */}
          <div className="w-full">{renderCategoryContent()}</div>
        </div>
      </PageLayout>

      {/* Lösch-Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500">
                <div className="h-2 w-2 rounded-full bg-white"></div>
              </div>
              Fahndung löschen
            </AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie die Fahndung &quot;
              {investigation?.step1.title}
              &quot; löschen möchten? Diese Aktion kann nicht rückgängig gemacht
              werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </InvestigationEditErrorBoundary>
  );
}
