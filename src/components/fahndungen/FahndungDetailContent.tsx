"use client";

import React, { useState } from "react";
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
} from "lucide-react";

// Import components
import WizardTabNavigation, {
  type WizardTab,
} from "@/components/investigation/WizardTabNavigation";
import PageLayout from "@/components/layout/PageLayout";
import { getCurrentSession, type Session, canEdit } from "~/lib/auth";
import { CaseNumberDetailed } from "~/components/ui/CaseNumberDisplay";
import { api } from "~/trpc/react";
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
import { toast } from "sonner";

// Types für echte Datenbankdaten
interface DatabaseInvestigation {
  id: string;
  title: string;
  case_number: string;
  description: string;
  short_description: string;
  status: string;
  priority: "normal" | "urgent" | "new";
  category: string;
  location: string;
  station: string;
  features: string;
  date: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to?: string;
  tags: string[];
  metadata: Record<string, unknown>;
  contact_info?: Record<string, unknown>;
  created_by_user?: {
    name: string;
    email: string;
  };
  assigned_to_user?: {
    name: string;
    email: string;
  };
  images?: Array<{
    id: string;
    url: string;
    alt_text?: string;
    caption?: string;
  }>;
  published_as_article?: boolean;
  article_slug?: string;
  article_content?: {
    blocks: Array<{
      type: string;
      content: Record<string, unknown>;
      id?: string;
    }>;
  };
  article_meta?: {
    seo_title?: string;
    seo_description?: string;
    keywords?: string[];
    author?: string;
    reading_time?: number;
  };
}

// UI Data Types
interface UIInvestigationData {
  id: string;
  step1: {
    title: string;
    category:
      | "WANTED_PERSON"
      | "MISSING_PERSON"
      | "UNKNOWN_DEAD"
      | "STOLEN_GOODS";
    caseNumber: string;
  };
  step2: {
    shortDescription: string;
    description: string;
    priority: "normal" | "urgent" | "new";
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
    contactEmail: string;
    department: string;
    availableHours: string;
  };
  images: Array<{
    id: string;
    url: string;
    alt_text?: string;
    caption?: string;
  }>;
  contact_info: Record<string, unknown>;
}

// Konvertierung von Datenbankdaten zu UI-Format
const convertDatabaseToUIFormat = (
  dbData: DatabaseInvestigation,
): UIInvestigationData => {
  return {
    id: dbData.id,
    step1: {
      title: dbData.title,
      category: dbData.category as
        | "WANTED_PERSON"
        | "MISSING_PERSON"
        | "UNKNOWN_DEAD"
        | "STOLEN_GOODS",
      caseNumber: dbData.case_number,
    },
    step2: {
      shortDescription: dbData.short_description ?? "",
      description: dbData.description,
      priority: dbData.priority,
      tags: dbData.tags ?? [],
      features: dbData.features,
    },
    step3: {
      mainImage:
        dbData.images?.[0]?.url ??
        "/images/placeholders/fotos/platzhalterbild.svg",
      additionalImages: dbData.images?.slice(1).map((img) => img.url) ?? [],
    },
    step4: {
      mainLocation: dbData.location ? { address: dbData.location } : undefined,
    },
    step5: {
      contactPerson:
        (dbData.contact_info?.["person"] as string | undefined) ?? "Polizei",
      contactPhone:
        (dbData.contact_info?.["phone"] as string | undefined) ??
        "+49 711 8990-0",
      contactEmail:
        (dbData.contact_info?.["email"] as string | undefined) ?? "",
      department: dbData.station ?? "Polizeipräsidium",
      availableHours: "Mo-Fr 08:00-18:00, Sa-So Bereitschaftsdienst",
    },
    images: dbData.images ?? [],
    contact_info: dbData.contact_info ?? {},
  };
};

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<UIInvestigationData | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState("overview");

  React.useEffect(() => {
    void getCurrentSession().then(setSession);
  }, []);

  // Prüfe Query-Parameter für automatischen Edit-Modus
  React.useEffect(() => {
    const editParam = searchParams?.get("edit");
    if (editParam === "true" && canEdit(session?.profile ?? null)) {
      setIsEditMode(true);
    }
  }, [searchParams, session]);

  // Lade echte Daten aus der Datenbank
  const {
    data: dbInvestigation,
    isLoading,
    error,
    refetch,
  } = api.post.getInvestigation.useQuery(
    { id: investigationId },
    {
      enabled: !!investigationId,
    },
  );

  // Update mutation
  const updateMutation = api.post.updateInvestigation.useMutation({
    onSuccess: () => {
      toast.success("Fahndung erfolgreich aktualisiert");
      setIsEditMode(false);
      void refetch();
    },
    onError: (error) => {
      toast.error(`Fehler beim Aktualisieren: ${error.message}`);
    },
  });

  // Konvertiere Datenbankdaten zu UI-Format
  const investigation = dbInvestigation
    ? convertDatabaseToUIFormat(dbInvestigation)
    : null;

  // Initialisiere editedData wenn investigation geladen ist
  React.useEffect(() => {
    if (investigation && !editedData) {
      setEditedData(investigation);
    }
  }, [investigation, editedData]);

  // Edit-Modus Toggle
  const handleEditToggle = () => {
    if (isEditMode) {
      // Cancel edit mode
      setEditedData(investigation);
      setIsEditMode(false);
    } else {
      // Enter edit mode
      setEditedData(investigation);
      setIsEditMode(true);
    }
  };

  // Save changes
  const handleSave = async () => {
    if (!editedData || !dbInvestigation) return;

    try {
      await updateMutation.mutateAsync({
        id: investigationId,
        title: editedData.step1.title,
        description: editedData.step2.description,
        short_description: editedData.step2.shortDescription,
        priority: editedData.step2.priority,
        category: editedData.step1.category,
        location: editedData.step4.mainLocation?.address ?? "",
        features: editedData.step2.features,
        contact_info: {
          person: editedData.step5.contactPerson,
          phone: editedData.step5.contactPhone,
          email: editedData.step5.contactEmail,
        },
        tags: editedData.step2.tags,
      });
    } catch (error) {
      console.error(
        "Fehler beim Speichern:",
        error instanceof Error ? error.message : String(error),
      );
    }
  };

  // Handle field changes
  const handleFieldChange = (
    step: keyof UIInvestigationData,
    field: string,
    value: unknown,
  ) => {
    setEditedData((prev) => {
      if (!prev) return prev;
      const stepData = prev[step] as Record<string, unknown>;
      return {
        ...prev,
        [step]: {
          ...stepData,
          [field]: value,
        },
      };
    });
  };

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

  // Error State
  if (error) {
    return (
      <PageLayout session={session}>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Fahndung nicht gefunden
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Die angeforderte Fahndung konnte nicht geladen werden.
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
  const renderTabContent = () => {
    const data = isEditMode ? editedData : investigation;

    if (!data) return null;

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
                        handleFieldChange("step1", "category", value)
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
                        handleFieldChange("step2", "priority", value)
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
                      handleFieldChange("step1", "title", e.target.value)
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
                      handleFieldChange(
                        "step2",
                        "shortDescription",
                        e.target.value,
                      )
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
              <CaseNumberDetailed caseNumber={data.step1.caseNumber} />
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
                    handleFieldChange("step2", "description", e.target.value)
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
                      handleFieldChange("step2", "features", e.target.value)
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
                        handleFieldChange(
                          "step5",
                          "contactPerson",
                          e.target.value,
                        )
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
                        handleFieldChange(
                          "step5",
                          "contactPhone",
                          e.target.value,
                        )
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
                          handleFieldChange(
                            "step5",
                            "contactEmail",
                            e.target.value,
                          )
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
                    handleFieldChange("step2", "description", e.target.value)
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
                      handleFieldChange("step2", "features", e.target.value)
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
                {data.images?.map((image, index: number) => (
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
                {(!data.images || data.images.length === 0) && (
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
                    handleFieldChange("step4", "mainLocation", {
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
                        handleFieldChange(
                          "step5",
                          "contactPerson",
                          e.target.value,
                        )
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
                        handleFieldChange(
                          "step5",
                          "contactPhone",
                          e.target.value,
                        )
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
                        handleFieldChange(
                          "step5",
                          "contactEmail",
                          e.target.value,
                        )
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
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                      >
                        {updateMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Speichern
                      </Button>
                      <Button
                        onClick={handleEditToggle}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Abbrechen
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleEditToggle}
                      className="flex items-center gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      Bearbeiten
                    </Button>
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

        {/* Main Content */}
        <div className="w-full">{renderTabContent()}</div>
      </div>
    </PageLayout>
  );
}
