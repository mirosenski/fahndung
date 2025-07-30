/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/trpc/react";
import PageLayout from "~/components/layout/PageLayout";
import { getCurrentSession } from "~/lib/auth";
import EnhancedFahndungWizard from "~/components/fahndungen/EnhancedFahndungWizard";
import type { WizardData } from "~/components/fahndungen/types/WizardTypes";
import { predefinedStations } from "~/lib/data/predefined-stations";

export default function FahndungBearbeitenPage() {
  const params = useParams();
  const id = params?.["id"];
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [wizardData, setWizardData] = useState<Partial<WizardData> | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  const idString =
    typeof id === "string" ? id : Array.isArray(id) ? (id[0]! ?? "") : "";

  useEffect(() => {
    void getCurrentSession().then(setSession);
  }, []);

  // Lade Fahndungsdaten
  const {
    data: investigation,
    isLoading: loading,
    error,
  } = api.post.getInvestigation.useQuery(
    { id: idString },
    {
      enabled: !!idString,
    },
  );

  // Konvertiere Fahndungsdaten zu Wizard-Format
  useEffect(() => {
    if (investigation) {
      console.log("🔍 Investigation loaded for editing:", investigation);

      // Hilfsfunktion für sichere Kategorie-Konvertierung
      const getValidCategory = (
        category: string | null | undefined,
      ):
        | "WANTED_PERSON"
        | "MISSING_PERSON"
        | "UNKNOWN_DEAD"
        | "STOLEN_GOODS" => {
        const validCategories = [
          "WANTED_PERSON",
          "MISSING_PERSON",
          "UNKNOWN_DEAD",
          "STOLEN_GOODS",
        ] as const;
        return validCategories.includes(
          category as (typeof validCategories)[number],
        )
          ? (category as
              | "WANTED_PERSON"
              | "MISSING_PERSON"
              | "UNKNOWN_DEAD"
              | "STOLEN_GOODS")
          : "MISSING_PERSON";
      };

      const convertedData: Partial<WizardData> = {
        step1: {
          title: investigation.title ?? "",
          category: getValidCategory(investigation.category),
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
          mainImage: null, // Bilder werden separat geladen
          additionalImages: [],
          documents: [],
        },
        step4: {
          mainLocation: investigation.location
            ? {
                id: investigation.id ?? "main-location",
                address: investigation.location,
                lat: 0,
                lng: 0,
                type: "main",
                description: "",
              }
            : null,
          additionalLocations: predefinedStations
            .slice(0, 3)
            .map((station, index) => ({
              id: `station-${index}`,
              address: station.name,
              lat: station.coordinates[0],
              lng: station.coordinates[1],
              type: "sonstiges" as const,
              description: station.description,
            })),
          searchRadius: 5,
        },
        step5: {
          contactPerson: investigation.created_by_user?.name ?? "",
          contactPhone:
            typeof investigation.contact_info?.["phone"] === "string"
              ? investigation.contact_info["phone"]
              : "",
          contactEmail: investigation.created_by_user?.email ?? "",
          department: investigation.station ?? "",
          availableHours: "24/7",
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
            generateSeoUrl: false,
            seoTitle: "",
            seoDescription: "",
            keywords: [],
          },
        },
      };

      setWizardData(convertedData);
      setIsLoading(false);
    }
  }, [investigation]);

  // Loading State
  if (isLoading || loading) {
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
  if (error || !investigation) {
    return (
      <PageLayout session={session}>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Fahndung nicht gefunden
            </h2>
            <p className="max-w-md text-gray-600 dark:text-gray-400">
              Die angeforderte Fahndung konnte nicht gefunden werden oder ist
              nicht verfügbar.
            </p>
            <button
              onClick={() => router.push("/fahndungen")}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zur Übersicht
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Keine Daten
  if (!wizardData) {
    return (
      <PageLayout session={session}>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600 dark:text-gray-400">
              Bereite Bearbeitung vor...
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout session={session}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/fahndungen/${idString}`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Zurück zur Fahndung
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Fahndung bearbeiten
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Bearbeite alle Bereiche der Fahndung &quot;{investigation.title}
              &quot;
            </p>
          </div>

          {/* EnhancedFahndungWizard mit geladenen Daten */}
          <div className="mx-auto max-w-4xl">
            <EnhancedFahndungWizard initialData={wizardData} mode="edit" />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
