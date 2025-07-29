"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/trpc/react";
import Header from "~/components/layout/Header";
import Footer from "~/components/layout/Footer";
import { Breadcrumb } from "~/components/ui/Breadcrumb";
import { useAuth } from "~/hooks/useAuth";
import EnhancedFahndungWizard from "~/components/fahndungen/EnhancedFahndungWizard";
import type { WizardData } from "~/components/fahndungen/types/WizardTypes";
import { predefinedStations } from "~/lib/data/predefined-stations";

export default function FahndungBearbeitenPage() {
  const params = useParams();
  const id = params?.["id"];
  const router = useRouter();
  const { session } = useAuth();
  const [wizardData, setWizardData] = useState<Partial<WizardData> | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  const idString =
    typeof id === "string" ? id : Array.isArray(id) ? (id[0] ?? "") : "";

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
              address: `${station.address}, ${station.city}`,
              lat: station.coordinates[0],
              lng: station.coordinates[1],
              type: "tatort" as const,
              description: station.name,
              timestamp: undefined,
            })),
          searchRadius: 5,
        },
        step5: {
          contactPerson:
            (investigation.contact_info?.["person"] as string) ?? "",
          contactPhone: (investigation.contact_info?.["phone"] as string) ?? "",
          contactEmail: (investigation.contact_info?.["email"] as string) ?? "",
          department: investigation.station ?? "",
          availableHours: "Mo-Fr 8:00-16:00 Uhr",
          publishStatus:
            investigation.status === "published" ? "immediate" : "draft",
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
            keywords: [],
          },
        },
      };

      setWizardData(convertedData);
      setIsLoading(false);
    }
  }, [investigation]);

  // Loading state
  if (loading || isLoading) {
    return (
      <div className="bg-background min-h-screen">
        <Header
          variant="dashboard"
          session={session}
          onCreateInvestigation={() => {
            // Leere Funktion für Header
          }}
        />

        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-gray-400" />
            <p className="text-gray-600">Lade Fahndung...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !investigation) {
    return (
      <div className="bg-background min-h-screen">
        <Header
          variant="dashboard"
          session={session}
          onCreateInvestigation={() => {
            // Leere Funktion für Header
          }}
        />

        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <p className="text-gray-600">Fahndung nicht gefunden</p>
            <button
              onClick={() => router.push("/fahndungen")}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Zurück zur Übersicht
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!wizardData) {
    return (
      <div className="bg-background min-h-screen">
        <Header
          variant="dashboard"
          session={session}
          onCreateInvestigation={() => {
            // Leere Funktion für Header
          }}
        />

        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-gray-400" />
            <p className="text-gray-600">Bereite Bearbeitung vor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Header
        variant="dashboard"
        session={session}
        onCreateInvestigation={() => {
          // Leere Funktion für Header
        }}
      />

      <Breadcrumb
        values={{
          fahndungen: "Fahndungen",
          [idString]: investigation.title,
          bearbeiten: "Bearbeiten",
        }}
      />

      <div className="container mx-auto py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push(`/fahndungen/${idString}`)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Zurück zur Fahndung</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold">Fahndung bearbeiten</h1>
          <p className="text-muted-foreground mt-2">
            Bearbeite alle Bereiche der Fahndung &quot;{investigation.title}
            &quot;
          </p>
        </div>

        {/* EnhancedFahndungWizard mit geladenen Daten */}
        <div className="mx-auto max-w-2xl">
          <EnhancedFahndungWizard initialData={wizardData} mode="edit" />
        </div>
      </div>

      <Footer variant="dashboard" session={session} />
    </div>
  );
}
