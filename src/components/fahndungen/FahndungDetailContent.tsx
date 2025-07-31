"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  Save,
  X,
  Shield,
  Clock,
  Eye,
  FileText,
  MapPin,
  Phone,
  Mail,
  Calendar,
  User,
  Image as ImageIcon,
  AlertCircle,
  Info,
  Loader2,
  MoreVertical,
  Trash2,
  Archive,
  EyeOff,
  AlertTriangle,
} from "lucide-react";

// Import components
import WizardTabNavigation, {
  type WizardTab,
} from "@/components/investigation/WizardTabNavigation";
import PageLayout from "@/components/layout/PageLayout";
import { getCurrentSession, type Session, canEdit } from "~/lib/auth";
import { CaseNumberDetailed } from "~/components/ui/CaseNumberDisplay";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import { useInvestigationEdit } from "~/hooks/useInvestigationEdit";
import { InvestigationEditErrorBoundary } from "~/components/fahndungen/InvestigationEditErrorBoundary";
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

import { useInvestigationSync } from "~/hooks/useInvestigationSync";


// Wizard Navigation Tabs
const wizardTabs: WizardTab[] = [
  {
    id: "overview",
    label: "Übersicht",
    icon: Info,
    description: "Zusammenfassung aller Informationen",
    completed: true,
  },
  {
    id: "description",
    label: "Beschreibung",
    icon: FileText,
    description: "Detaillierte Fallbeschreibung und Merkmale",
    completed: true,
  },
  {
    id: "media",
    label: "Medien",
    icon: ImageIcon,
    description: "Bilder und Dokumente",
    completed: false,
  },
  {
    id: "locations",
    label: "Orte",
    icon: MapPin,
    description: "Relevante Standorte und Karte",
    completed: true,
  },
  {
    id: "contact",
    label: "Kontakt",
    icon: Phone,
    description: "Ansprechpartner und Erreichbarkeit",
    completed: true,
  },
];

interface FahndungDetailContentProps {
  investigationId: string;
}

export default function FahndungDetailContent({
  investigationId,
}: FahndungDetailContentProps) {
  const searchParams = useSearchParams();
  const [session, setSession] = React.useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  React.useEffect(() => {
    void getCurrentSession().then(setSession);
  }, []);

  // Verwende die neue Synchronisations-Hook für bessere Datenaktualisierung
  const { investigation: syncInvestigation, globalSync } =
    useInvestigationSync(investigationId);

  // Prüfe Query-Parameter für automatischen Edit-Modus
  // Verwende den neuen Custom Hook
  const editHook = useInvestigationEdit(investigationId);

  React.useEffect(() => {
    const editParam = searchParams?.get("edit");
    if (editParam === "true" && canEdit(session?.profile ?? null)) {
      // Start editing when edit param is present
      editHook.startEditing();
    }
  }, [searchParams, session, editHook]);

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
      // Redirect to fahndungen list after successful deletion
      window.location.href = "/fahndungen";
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // Automatische Refetch nach Speichern
  useEffect(() => {
    if (!isEditMode && investigationId) {
      // Sofortige Synchronisation nach dem Speichern
      console.log("🔄 Sofortige Synchronisation nach Speichern");
      globalSync();
    }
    return undefined;
  }, [isEditMode, investigationId, globalSync]);

  // Loading State
  if (isLoading) {
    return (
      <PageLayout session={session}>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
            <AlertCircle className="h-12 w-12 text-red-500" />
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

  // Render content based on active tab
  const renderTabContent = (): React.JSX.Element => {
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

    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white">
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10">
                <div className="mb-4 flex items-center gap-2">
                  {isEditMode ? (
                    <Select
                      value={data.step1.category}
                      onValueChange={(value) =>
                        updateField("step1", "category", value)
                      }
                    >
                      <SelectTrigger className="w-auto border-white/30 bg-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MISSING_PERSON">
                          Vermisste
                        </SelectItem>
                        <SelectItem value="WANTED_PERSON">
                          Straftäter
                        </SelectItem>
                        <SelectItem value="UNKNOWN_DEAD">
                          Unbekannte Tote
                        </SelectItem>
                        <SelectItem value="STOLEN_GOODS">Sachen</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                      {data.step1.category === "MISSING_PERSON"
                        ? "Vermisste"
                        : data.step1.category === "WANTED_PERSON"
                          ? "Straftäter"
                          : data.step1.category === "UNKNOWN_DEAD"
                            ? "Unbekannte Tote"
                            : "Sachen"}
                    </span>
                  )}

                  {isEditMode ? (
                    <Select
                      value={data.step2.priority}
                      onValueChange={(value) =>
                        updateField("step2", "priority", value)
                      }
                    >
                      <SelectTrigger className="w-auto border-white/30 bg-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="urgent">Dringend</SelectItem>
                        <SelectItem value="new">Neu</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        data.step2.priority === "urgent"
                          ? "bg-red-500/20 text-red-100"
                          : data.step2.priority === "new"
                            ? "bg-green-500/20 text-green-100"
                            : "bg-gray-500/20 text-gray-100"
                      }`}
                    >
                      {data.step2.priority === "urgent"
                        ? "Dringend"
                        : data.step2.priority === "new"
                          ? "Neu"
                          : "Normal"}
                    </span>
                  )}
                </div>

                {isEditMode ? (
                  <Input
                    value={data.step1.title}
                    onChange={(e) =>
                      updateField("step1", "title", e.target.value)
                    }
                    className="mb-2 border-white/30 bg-white/10 text-3xl font-bold text-white placeholder-white/70"
                    placeholder="Titel eingeben..."
                  />
                ) : (
                  <h1 className="mb-2 text-3xl font-bold">
                    {data.step1.title}
                  </h1>
                )}

                {isEditMode ? (
                  <Textarea
                    value={data.step2.shortDescription}
                    onChange={(e) =>
                      updateField("step2", "shortDescription", e.target.value)
                    }
                    className="border-white/30 bg-white/10 text-lg text-blue-100 placeholder-white/70"
                    placeholder="Kurze Beschreibung..."
                    rows={2}
                  />
                ) : (
                  <p className="text-lg text-blue-100">
                    {data.step2.shortDescription}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-4 text-sm text-blue-100">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date().toLocaleDateString("de-DE")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />0 Aufrufe
                  </span>
                </div>
              </div>
            </div>

            {/* Case Number */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <CaseNumberDetailed caseNumber={data.step1.caseNumber ?? ""} />
            </div>

            {/* Description */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Beschreibung
              </h3>
              {isEditMode ? (
                <Textarea
                  value={data.step2.description}
                  onChange={(e) =>
                    updateField("step2", "description", e.target.value)
                  }
                  className="leading-relaxed"
                  rows={6}
                  placeholder="Detaillierte Beschreibung..."
                />
              ) : (
                <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                  {data.step2.description}
                </p>
              )}
            </div>

            {/* Features */}
            {data.step2.features && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  Merkmale
                </h3>
                {isEditMode ? (
                  <Textarea
                    value={data.step2.features}
                    onChange={(e) =>
                      updateField("step2", "features", e.target.value)
                    }
                    className="leading-relaxed"
                    rows={4}
                    placeholder="Besondere Merkmale..."
                  />
                ) : (
                  <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                    {data.step2.features}
                  </p>
                )}
              </div>
            )}

            {/* Tags */}
            {data.step2.tags.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.step2.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Kontakt
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  {isEditMode ? (
                    <Input
                      value={data.step5.contactPerson}
                      onChange={(e) =>
                        updateField("step5", "contactPerson", e.target.value)
                      }
                      className="flex-1"
                      placeholder="Kontaktperson..."
                    />
                  ) : (
                    <span className="text-gray-700 dark:text-gray-300">
                      {data.step5.contactPerson}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  {isEditMode ? (
                    <Input
                      value={data.step5.contactPhone}
                      onChange={(e) =>
                        updateField("step5", "contactPhone", e.target.value)
                      }
                      className="flex-1"
                      placeholder="Telefonnummer..."
                    />
                  ) : (
                    <span className="text-gray-700 dark:text-gray-300">
                      {data.step5.contactPhone}
                    </span>
                  )}
                </div>
                {data.step5.contactEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    {isEditMode ? (
                      <Input
                        value={data.step5.contactEmail}
                        onChange={(e) =>
                          updateField("step5", "contactEmail", e.target.value)
                        }
                        className="flex-1"
                        placeholder="E-Mail..."
                      />
                    ) : (
                      <span className="text-gray-700 dark:text-gray-300">
                        {data.step5.contactEmail}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {data.step5.department}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {data.step5.availableHours}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case "description":
        return (
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Detaillierte Beschreibung
              </h3>
              {isEditMode ? (
                <Textarea
                  value={data.step2.description}
                  onChange={(e) =>
                    updateField("step2", "description", e.target.value)
                  }
                  className="whitespace-pre-wrap leading-relaxed"
                  rows={12}
                  placeholder="Detaillierte Beschreibung..."
                />
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300">
                  {data.step2.description}
                </p>
              )}
            </div>

            {data.step2.features && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  Besondere Merkmale
                </h3>
                {isEditMode ? (
                  <Textarea
                    value={data.step2.features}
                    onChange={(e) =>
                      updateField("step2", "features", e.target.value)
                    }
                    className="whitespace-pre-wrap leading-relaxed"
                    rows={8}
                    placeholder="Besondere Merkmale..."
                  />
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300">
                    {data.step2.features}
                  </p>
                )}
              </div>
            )}
          </div>
        );

      case "media":
        return (
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Medien
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(
                  data as { images?: Array<{ url: string; alt_text?: string }> }
                ).images?.map((image, index: number) => (
                  <div
                    key={index}
                    className="relative aspect-video overflow-hidden rounded-lg"
                  >
                    <Image
                      src={image.url}
                      alt={image.alt_text ?? "Fahndungsbild"}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
                {(!(
                  data as { images?: Array<{ url: string; alt_text?: string }> }
                ).images ||
                  (
                    data as {
                      images?: Array<{ url: string; alt_text?: string }>;
                    }
                  ).images?.length === 0) && (
                  <div className="col-span-full flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Keine Bilder verfügbar
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "locations":
        return (
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Standort
              </h3>
              {isEditMode ? (
                <Input
                  value={data.step4.mainLocation?.address ?? ""}
                  onChange={(e) =>
                    updateField("step4", "mainLocation", {
                      address: e.target.value,
                    })
                  }
                  placeholder="Standort eingeben..."
                  className="w-full"
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300">
                  {data.step4.mainLocation?.address ??
                    "Standort nicht angegeben"}
                </p>
              )}
            </div>
          </div>
        );

      case "contact":
        return (
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Kontaktinformationen
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Kontaktperson
                  </Label>
                  {isEditMode ? (
                    <Input
                      value={data.step5.contactPerson}
                      onChange={(e) =>
                        updateField("step5", "contactPerson", e.target.value)
                      }
                      className="mt-1"
                      placeholder="Kontaktperson..."
                    />
                  ) : (
                    <p className="mt-1 text-gray-700 dark:text-gray-300">
                      {data.step5.contactPerson}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Telefon
                  </Label>
                  {isEditMode ? (
                    <Input
                      value={data.step5.contactPhone}
                      onChange={(e) =>
                        updateField("step5", "contactPhone", e.target.value)
                      }
                      className="mt-1"
                      placeholder="Telefonnummer..."
                    />
                  ) : (
                    <p className="mt-1 text-gray-700 dark:text-gray-300">
                      {data.step5.contactPhone}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    E-Mail
                  </Label>
                  {isEditMode ? (
                    <Input
                      value={data.step5.contactEmail}
                      onChange={(e) =>
                        updateField("step5", "contactEmail", e.target.value)
                      }
                      className="mt-1"
                      placeholder="E-Mail..."
                    />
                  ) : (
                    <p className="mt-1 text-gray-700 dark:text-gray-300">
                      {data.step5.contactEmail}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Abteilung
                  </Label>
                  <p className="mt-1 text-gray-700 dark:text-gray-300">
                    {data.step5.department}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Erreichbarkeit
                  </Label>
                  <p className="mt-1 text-gray-700 dark:text-gray-300">
                    {data.step5.availableHours}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-400">
              Tab-Inhalt nicht verfügbar.
            </p>
          </div>
        );
    }
  };

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

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="bg-blue-600 transition-all duration-300 ease-in-out"
                style={{ width: "20%" }}
              />
            </div>
            <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
              Schritt 1 von 5
            </div>
          </div>

          {/* Horizontal Wizard Navigation */}
          <div className="mb-8">
            <WizardTabNavigation
              tabs={wizardTabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              showProgress={false}
            />
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
          <div className="w-full">{renderTabContent()}</div>
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
              <AlertTriangle className="h-5 w-5 text-red-500" />
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
