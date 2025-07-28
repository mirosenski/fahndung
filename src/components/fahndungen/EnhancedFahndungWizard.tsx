"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Eye,
  X,
  Check,
  AlertCircle,
  MapPin,
  User,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Shield,
  Search,
  Camera,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "~/trpc/react";
import { getCategoryOptions } from "@/types/categories";
import { generateNewCaseNumber } from "~/lib/utils/caseNumberGenerator";
import Step3ImagesDocuments from "./Step3-ImagesDocuments";
import Step4LocationMap from "./Step4-LocationMap";
import Step5ContactPublication from "./Step5-ContactPublication";

// Enhanced Types basierend auf Ihrer Struktur
interface Step1Data {
  title: string;
  category:
    | "WANTED_PERSON"
    | "MISSING_PERSON"
    | "UNKNOWN_DEAD"
    | "STOLEN_GOODS";
  caseNumber: string;
}

interface Step2Data {
  shortDescription: string;
  description: string;
  priority: "normal" | "urgent" | "new";
  tags: string[];
  features: string;
}

interface Step3Data {
  mainImage: File | null;
  additionalImages: File[];
  documents: File[];
}

interface Step4Data {
  mainLocation: {
    id: string;
    address: string;
    lat: number;
    lng: number;
    type:
      | "main"
      | "tatort"
      | "wohnort"
      | "arbeitsplatz"
      | "sichtung"
      | "sonstiges";
    description?: string;
    timestamp?: Date;
  } | null;
  additionalLocations: Array<{
    id: string;
    lat: number;
    lng: number;
    address: string;
    type:
      | "main"
      | "tatort"
      | "wohnort"
      | "arbeitsplatz"
      | "sichtung"
      | "sonstiges";
    description?: string;
    timestamp?: Date;
  }>;
  searchRadius: number;
}

interface Step5Data {
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  department: string;
  availableHours: string;
  publishStatus: "draft" | "review" | "scheduled" | "immediate";
  urgencyLevel: "low" | "medium" | "high" | "critical";
  requiresApproval: boolean;
  visibility: {
    internal: boolean;
    regional: boolean;
    national: boolean;
    international: boolean;
  };
  notifications: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    appNotifications: boolean;
    pressRelease: boolean;
  };
  articlePublishing: {
    publishAsArticle: boolean;
    generateSeoUrl: boolean;
    customSlug?: string;
    seoTitle?: string;
    seoDescription?: string;
    keywords: string[];
    author?: string;
    readingTime?: number;
  };
}

interface WizardData {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  step5: Step5Data;
}

// Kategorie-Konfiguration
const CATEGORY_CONFIG = {
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

const PRIORITY_CONFIG = {
  urgent: { label: "DRINGEND", color: "bg-red-600", pulse: true },
  new: { label: "NEU", color: "bg-blue-600", pulse: false },
  normal: { label: "STANDARD", color: "bg-gray-500", pulse: false },
};

// Live-Vorschau Komponente (ModernFahndungskarte Miniatur)
const LivePreviewCard = ({ data }: { data: Partial<WizardData> }) => {
  const category = data.step1?.category
    ? CATEGORY_CONFIG[data.step1.category]
    : CATEGORY_CONFIG.MISSING_PERSON;
  const priority = data.step2?.priority
    ? PRIORITY_CONFIG[data.step2.priority]
    : PRIORITY_CONFIG.normal;
  const [mainImagePreview, setMainImagePreview] = useState<string>(
    "/images/placeholders/fotos/platzhalterbild.svg",
  );

  useEffect(() => {
    if (data.step3?.mainImage) {
      const reader = new FileReader();
      reader.onload = (e) => setMainImagePreview(e.target?.result as string);
      reader.readAsDataURL(data.step3.mainImage);
    }
  }, [data.step3?.mainImage]);

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="relative h-[400px] w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
        {/* Image Section - 60% */}
        <div className="relative h-[60%] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          {/* Priority Badge */}
          {data.step2?.priority !== "normal" && (
            <div
              className={`absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-bold text-white ${priority.color} ${priority.pulse ? "animate-pulse" : ""}`}
            >
              {priority.label}
            </div>
          )}

          <Image
            src={mainImagePreview}
            alt={data.step1?.title ?? "Fahndungsbild"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          {/* Category Badge */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-white/90 px-3 py-1 text-xs font-medium backdrop-blur-sm dark:bg-gray-900/90">
            <span>{category.label}</span>
          </div>

          {/* Case Number Badge */}
          {data.step1?.caseNumber && (
            <div className="absolute right-4 bottom-4 rounded-lg bg-black/80 px-2 py-1 font-mono text-xs text-white">
              #{data.step1.caseNumber}
            </div>
          )}
        </div>

        {/* Info Section - 40% */}
        <div className="flex h-[40%] flex-col justify-between p-4">
          <div className="space-y-2">
            <h3 className="line-clamp-2 text-lg font-bold text-gray-900 dark:text-white">
              {data.step1?.title ?? "Titel der Fahndung"}
            </h3>
            <p className="line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {data.step2?.shortDescription ??
                "Kurzbeschreibung wird hier angezeigt..."}
            </p>
          </div>

          <div className="mt-auto flex items-center justify-between">
            <button className="flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white dark:bg-gray-100 dark:text-gray-900">
              <span>Details</span>
              <ChevronRight className="h-4 w-4" />
            </button>

            {data.step4?.mainLocation && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <MapPin className="h-3 w-3" />
                <span className="max-w-24 truncate">
                  {data.step4.mainLocation.address.split(",")[0]}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Schritt 1: Grundinformationen
const Step1Component = ({
  data,
  onChange,
}: {
  data: Step1Data;
  onChange: (data: Step1Data) => void;
}) => {
  const generateCaseNumber = (category: string): string => {
    return generateNewCaseNumber(category as Step1Data["category"], "draft");
  };

  const handleCategoryChange = (category: string) => {
    onChange({
      ...data,
      category: category as Step1Data["category"],
      caseNumber: generateCaseNumber(category),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Schritt 1: Grundinformationen
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Legen Sie die grundlegenden Informationen für die Fahndung fest
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Titel der Fahndung *
          </label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="z.B. Vermisste - Maria Schmidt"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Kategorie *
            </label>
            <select
              value={data.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {getCategoryOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Aktenzeichen
            </label>
            <input
              type="text"
              value={data.caseNumber}
              onChange={(e) =>
                onChange({ ...data, caseNumber: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="POL-2024-K-001234-A"
            />
          </div>
        </div>

        {/* Aktenzeichen Info */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
          <div className="mb-2 flex items-center space-x-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Aktenzeichen Format:
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Format: [Präfix]-[Jahr]-[Monat]-[Nummer] | Wird automatisch bei
            Kategorieänderung generiert
          </div>
        </div>
      </div>
    </div>
  );
};

// Schritt 2: Beschreibung & Details
const Step2Component = ({
  data,
  onChange,
}: {
  data: Step2Data;
  onChange: (data: Step2Data) => void;
}) => {
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    if (tagInput.trim() && !data.tags.includes(tagInput.trim())) {
      onChange({
        ...data,
        tags: [...data.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    onChange({
      ...data,
      tags: data.tags.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Schritt 2: Beschreibung & Details
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Fügen Sie detaillierte Informationen zur Fahndung hinzu
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Kurzbeschreibung *
          </label>
          <textarea
            value={data.shortDescription}
            onChange={(e) =>
              onChange({ ...data, shortDescription: e.target.value })
            }
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="Kurze Zusammenfassung für die Kartenansicht..."
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Detaillierte Beschreibung *
          </label>
          <textarea
            value={data.description}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            rows={6}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="Ausführliche Beschreibung der Fahndung..."
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Priorität *
            </label>
            <select
              value={data.priority}
              onChange={(e) =>
                onChange({
                  ...data,
                  priority: e.target.value as Step2Data["priority"],
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="normal">Normal</option>
              <option value="urgent">Dringend</option>
              <option value="new">Neu</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tags hinzufügen
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Tag eingeben..."
              />
              <button
                type="button"
                onClick={addTag}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Tags anzeigen */}
        {data.tags.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Aktuelle Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {data.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="ml-1 hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Besondere Merkmale
          </label>
          <textarea
            value={data.features}
            onChange={(e) => onChange({ ...data, features: e.target.value })}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="z.B. Narben, Tattoos, besondere Kleidung, Auffälligkeiten..."
          />
        </div>
      </div>
    </div>
  );
};

// Hauptkomponente: Enhanced Fahndung Wizard
const EnhancedFahndungWizard = ({
  initialData,
  mode = "create",
}: {
  initialData?: Partial<WizardData>;
  mode?: "create" | "edit";
}) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [wizardData, setWizardData] = useState<Partial<WizardData>>({
    step1: initialData?.step1 ?? {
      title: "",
      category: "MISSING_PERSON",
      caseNumber: generateNewCaseNumber("MISSING_PERSON", "draft"),
    },
    step2: initialData?.step2 ?? {
      shortDescription: "",
      description: "",
      priority: "normal",
      tags: [],
      features: "",
    },
    step3: initialData?.step3 ?? {
      mainImage: null,
      additionalImages: [],
      documents: [],
    },
    step4: initialData?.step4 ?? {
      mainLocation: null,
      additionalLocations: [],
      searchRadius: 5,
    },
    step5: initialData?.step5 ?? {
      contactPerson: "",
      contactPhone: "",
      contactEmail: "",
      department: "",
      availableHours: "Mo-Fr 8:00-16:00 Uhr",
      publishStatus: "draft",
      urgencyLevel: "medium",
      requiresApproval: false,
      visibility: {
        internal: true,
        regional: false,
        national: false,
        international: false,
      },
      notifications: {
        emailAlerts: true,
        smsAlerts: false,
        appNotifications: true,
        pressRelease: false,
      },
      articlePublishing: {
        publishAsArticle: false,
        generateSeoUrl: true,
        keywords: [],
      },
    },
  });

  // tRPC Mutation für das Erstellen von Fahndungen
  const createInvestigation = api.post.createInvestigation.useMutation({
    onSuccess: (data) => {
      console.log("✅ Fahndung erfolgreich erstellt:", data);
      if (wizardData.step5?.publishStatus === "immediate") {
        router.push(`/fahndungen/${data.id}`);
      } else {
        router.push("/fahndungen");
      }
    },
    onError: (error) => {
      console.error("❌ Fehler beim Erstellen der Fahndung:", error);
    },
  });

  const steps = [
    { id: 1, label: "Grundinfo", icon: FileText },
    { id: 2, label: "Beschreibung", icon: MessageSquare },
    { id: 3, label: "Medien", icon: ImageIcon },
    { id: 4, label: "Ort", icon: MapPin },
    { id: 5, label: "Kontakt", icon: User },
    { id: 6, label: "Zusammenfassung", icon: Check },
  ];

  const updateStepData = useCallback(
    (step: keyof WizardData, data: WizardData[keyof WizardData]) => {
      setWizardData((prev) => ({
        ...prev,
        [step]: data,
      }));
    },
    [],
  );

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return wizardData.step1?.title && wizardData.step1?.category;
      case 2:
        return (
          wizardData.step2?.shortDescription && wizardData.step2?.description
        );
      case 3:
        return wizardData.step3?.mainImage;
      case 4:
        return wizardData.step4?.mainLocation;
      case 5:
        return (
          wizardData.step5?.contactPerson && wizardData.step5?.contactPhone
        );
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (canProceedToNextStep() && currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const finalStatus =
        wizardData.step5?.publishStatus === "immediate" ? "published" : "draft";

      await createInvestigation.mutateAsync({
        title: wizardData.step1?.title ?? "",
        description: wizardData.step2?.description ?? "",
        status: finalStatus,
        priority: wizardData.step2?.priority ?? "normal",
        category: wizardData.step1?.category ?? "MISSING_PERSON",
        location: wizardData.step4?.mainLocation?.address ?? "",
        contact_info: {
          person: wizardData.step5?.contactPerson ?? "",
          phone: wizardData.step5?.contactPhone ?? "",
          email: wizardData.step5?.contactEmail ?? "",
        },
        tags: [
          wizardData.step1?.category ?? "",
          wizardData.step2?.priority ?? "",
          ...(wizardData.step2?.tags ?? []),
        ],
      });
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Fehler beim Speichern der Fahndung");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          wizardData.step1 && (
            <Step1Component
              data={wizardData.step1}
              onChange={(data) => updateStepData("step1", data)}
            />
          )
        );
      case 2:
        return (
          wizardData.step2 && (
            <Step2Component
              data={wizardData.step2}
              onChange={(data) => updateStepData("step2", data)}
            />
          )
        );
      case 3:
        return (
          wizardData.step3 && (
            <Step3ImagesDocuments
              data={wizardData.step3}
              onChange={(data) => updateStepData("step3", data)}
            />
          )
        );
      case 4:
        return (
          wizardData.step4 && (
            <Step4LocationMap
              data={wizardData.step4}
              onChange={(data) => updateStepData("step4", data)}
            />
          )
        );
      case 5:
        return (
          wizardData.step5 && (
            <Step5ContactPublication
              data={wizardData.step5}
              onChange={(data) => updateStepData("step5", data)}
            />
          )
        );
      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                Schritt 6: Zusammenfassung & Abschluss
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Überprüfen Sie alle Daten vor der finalen Speicherung
              </p>
            </div>

            {/* Zusammenfassung */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                    Grundinformationen
                  </h3>
                  <dl className="space-y-1 text-sm">
                    <div>
                      <dt className="inline font-medium">Titel:</dt>{" "}
                      <dd className="ml-2 inline">{wizardData.step1?.title}</dd>
                    </div>
                    <div>
                      <dt className="inline font-medium">Kategorie:</dt>{" "}
                      <dd className="ml-2 inline">
                        {
                          CATEGORY_CONFIG[
                            wizardData.step1?.category ?? "MISSING_PERSON"
                          ].label
                        }
                      </dd>
                    </div>
                    <div>
                      <dt className="inline font-medium">Aktenzeichen:</dt>{" "}
                      <dd className="ml-2 inline">
                        {wizardData.step1?.caseNumber}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                    Beschreibung
                  </h3>
                  <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                    {wizardData.step2?.description}
                  </p>
                  <div className="mt-2">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${PRIORITY_CONFIG[wizardData.step2?.priority ?? "normal"].color} text-white`}
                    >
                      {
                        PRIORITY_CONFIG[wizardData.step2?.priority ?? "normal"]
                          .label
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                    Medien
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      Hauptbild:{" "}
                      {wizardData.step3?.mainImage
                        ? "✓ Vorhanden"
                        : "✗ Nicht vorhanden"}
                    </div>
                    <div>
                      Weitere Bilder:{" "}
                      {wizardData.step3?.additionalImages?.length ?? 0}
                    </div>
                    <div>
                      Dokumente: {wizardData.step3?.documents?.length ?? 0}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                    Standort
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      Hauptort:{" "}
                      {wizardData.step4?.mainLocation?.address ??
                        "Nicht festgelegt"}
                    </div>
                    <div>
                      Weitere Orte:{" "}
                      {wizardData.step4?.additionalLocations?.length ?? 0}
                    </div>
                    <div>
                      Suchradius: {wizardData.step4?.searchRadius ?? 5} km
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                    Kontakt & Veröffentlichung
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      Kontakt:{" "}
                      {wizardData.step5?.contactPerson ?? "Nicht angegeben"}
                    </div>
                    <div>
                      Abteilung:{" "}
                      {wizardData.step5?.department ?? "Nicht angegeben"}
                    </div>
                    <div>
                      Status:{" "}
                      {wizardData.step5?.publishStatus === "draft"
                        ? "Entwurf"
                        : wizardData.step5?.publishStatus === "immediate"
                          ? "Sofort veröffentlichen"
                          : (wizardData.step5?.publishStatus ?? "Entwurf")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Aktion Buttons */}
            <div className="flex justify-between border-t border-gray-200 pt-6 dark:border-gray-700">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                <Eye className="h-4 w-4" />
                {showPreview
                  ? "Vorschau ausblenden"
                  : "Kartenvorschau anzeigen"}
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-lg bg-gray-600 px-6 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "Speichert..." : "Als Entwurf speichern"}
                </button>

                <button
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Eye className="h-4 w-4" />
                  {isSubmitting
                    ? "Veröffentlicht..."
                    : mode === "create"
                      ? "Sofort veröffentlichen"
                      : "Änderungen speichern"}
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-4">
            <button
              onClick={() => router.push("/fahndungen")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Zurück zur Übersicht</span>
            </button>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {mode === "create"
              ? "Neue Fahndung erstellen"
              : "Fahndung bearbeiten"}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {mode === "create"
              ? "Erstellen Sie eine neue Fahndung mit unserem erweiterten Wizard"
              : "Bearbeiten Sie die bestehende Fahndung"}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Fortschritt: {currentStep} von {steps.length} Schritten
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round((currentStep / steps.length) * 100)}% abgeschlossen
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    currentStep >= step.id
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-800"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    currentStep >= step.id
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-4 h-1 w-16 ${
                      currentStep > step.id
                        ? "bg-blue-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          {/* Main Content */}
          <div className="xl:col-span-2">
            <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
              {renderCurrentStep()}

              {/* Navigation Buttons */}
              {currentStep < 6 && (
                <div className="mt-8 flex justify-between border-t border-gray-200 pt-6 dark:border-gray-700">
                  <button
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 ${
                      currentStep === 1
                        ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Zurück
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={!canProceedToNextStep()}
                    className={`flex items-center gap-2 rounded-lg px-6 py-2 ${
                      canProceedToNextStep()
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-600"
                    }`}
                  >
                    Weiter
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Live Preview Sidebar */}
          <div className="xl:col-span-1">
            <div className="sticky top-8">
              <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Live-Vorschau
                  </h3>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showPreview ? (
                      <X className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {showPreview && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      So wird Ihre Fahndungskarte aussehen:
                    </p>
                    <LivePreviewCard data={wizardData} />

                    {/* Zusätzliche Informationen */}
                    <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>Kategorie:</span>
                        <span>
                          {wizardData.step1?.category
                            ? CATEGORY_CONFIG[wizardData.step1.category].label
                            : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Priorität:</span>
                        <span>
                          {wizardData.step2?.priority
                            ? PRIORITY_CONFIG[wizardData.step2.priority].label
                            : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tags:</span>
                        <span>{wizardData.step2?.tags?.length ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bilder:</span>
                        <span>
                          {(wizardData.step3?.mainImage ? 1 : 0) +
                            (wizardData.step3?.additionalImages?.length ?? 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Hilfe & Tipps */}
              <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h4 className="mb-1 text-sm font-medium text-blue-800 dark:text-blue-200">
                      Schritt {currentStep} Hilfe
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {currentStep === 1 &&
                        "Geben Sie einen aussagekräftigen Titel ein. Das Aktenzeichen wird automatisch generiert."}
                      {currentStep === 2 &&
                        "Die Kurzbeschreibung erscheint auf der Fahndungskarte. Die detaillierte Beschreibung wird auf der Detailseite angezeigt."}
                      {currentStep === 3 &&
                        "Laden Sie ein Hauptbild hoch - dies ist erforderlich. Zusätzliche Bilder und Dokumente sind optional."}
                      {currentStep === 4 &&
                        "Markieren Sie mindestens einen Hauptort. Weitere Orte können für eine bessere Übersicht hinzugefügt werden."}
                      {currentStep === 5 &&
                        "Geben Sie Kontaktdaten an und wählen Sie, wie die Fahndung veröffentlicht werden soll."}
                      {currentStep === 6 &&
                        "Überprüfen Sie alle Daten vor der finalen Speicherung. Die Live-Vorschau zeigt, wie die Karte aussehen wird."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedFahndungWizard;
