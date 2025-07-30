"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import EnhancedFahndungWizard from "~/components/fahndungen/EnhancedFahndungWizard";
import ProtectedRoute from "~/components/ProtectedRoute";

export default function FahndungBearbeitenPage() {
  const params = useParams();
  const slug = params?.["slug"] as string;
  const [investigationId, setInvestigationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // tRPC Query für alle Fahndungen (für Slug-Auflösung)
  const investigationsQuery = api.post.getInvestigations.useQuery(
    { limit: 50 },
    {
      enabled:
        !!slug && !/^(?:POL-)?\d{4}-[A-Z]-\d{3,6}(?:-[A-Z])?$/.test(slug),
    },
  );

  // tRPC Query für Fahndungsdaten
  const investigationQuery = api.post.getInvestigation.useQuery(
    { id: investigationId! },
    {
      enabled: !!investigationId,
    },
  );

  useEffect(() => {
    if (!slug) {
      setError("Kein Slug angegeben");
      setIsLoading(false);
      return;
    }

    // Prüfe ob es eine Fallnummer ist
    const isCaseNumber = /^(?:POL-)?\d{4}-[A-Z]-\d{3,6}(?:-[A-Z])?$/.test(slug);

    if (isCaseNumber) {
      // Direkte Fallnummer - verwende die ID direkt
      setInvestigationId(slug);
      setIsLoading(false);
      return;
    }

    // Für SEO-Slugs suchen wir in den geladenen Fahndungen
    if (investigationsQuery.data) {
      // Importiere generateSeoSlug dynamisch
      void import("~/lib/seo").then(({ generateSeoSlug }) => {
        for (const investigation of investigationsQuery.data) {
          const expectedSlug = generateSeoSlug(investigation.title);
          if (expectedSlug === slug) {
            setInvestigationId(investigation.case_number);
            setIsLoading(false);
            return;
          }
        }
        // Keine Fahndung gefunden
        setError("Fahndung nicht gefunden");
        setIsLoading(false);
      });
    } else if (investigationsQuery.error) {
      setError("Fehler beim Laden der Fahndungen");
      setIsLoading(false);
    }
  }, [slug, investigationsQuery.data, investigationsQuery.error]);

  // Loading State
  if (isLoading || investigationsQuery.isLoading) {
    return (
      <ProtectedRoute requiredRoles={["editor", "admin", "super_admin"]}>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Lade Fahndungsdaten...
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Error State
  if (error || investigationsQuery.error || investigationQuery.error) {
    return (
      <ProtectedRoute requiredRoles={["editor", "admin", "super_admin"]}>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="text-4xl">❌</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Fahndung nicht gefunden
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {error ??
                "Die angeforderte Fahndung konnte nicht geladen werden."}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Verwenden Sie die Fallnummer (z.B. 2024-K-001) oder den korrekten
              Titel-Slug für die Bearbeitung.
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Keine Fahndung gefunden
  if (!investigationQuery.data) {
    return (
      <ProtectedRoute requiredRoles={["editor", "admin", "super_admin"]}>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="text-4xl">❌</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Fahndung nicht gefunden
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Die angeforderte Fahndung existiert nicht.
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const investigation = investigationQuery.data;

  // Konvertiere Datenbankdaten zu Wizard-Format
  const wizardData = {
    step1: {
      title: investigation.title,
      caseNumber: investigation.case_number,
      category: investigation.category as
        | "WANTED_PERSON"
        | "MISSING_PERSON"
        | "UNKNOWN_DEAD"
        | "STOLEN_GOODS",
    },
    step2: {
      description: investigation.description,
      shortDescription: investigation.short_description,
      features: investigation.features,
      priority: investigation.priority,
      tags: investigation.tags,
    },
    step3: {
      mainImage: null,
      mainImageUrl:
        investigation.images?.[0]?.url ??
        "/images/placeholders/fotos/platzhalterbild.svg",
      additionalImages: [],
      additionalImageUrls:
        investigation.images?.slice(1).map((img) => img.url) ?? [],
      documents: [],
    },
    step4: {
      mainLocation: investigation.location
        ? {
            id: "main-location",
            address: investigation.location,
            lat: 0,
            lng: 0,
            type: "main" as const,
          }
        : null,
      additionalLocations: [],
      searchRadius: 5,
    },
    step5: {
      contactPerson:
        (investigation.contact_info?.["person"] as string) ?? "Polizei",
      contactPhone:
        (investigation.contact_info?.["phone"] as string) ?? "+49 711 8990-0",
      contactEmail: (investigation.contact_info?.["email"] as string) ?? "",
      department: investigation.station ?? "Polizeipräsidium",
      availableHours: "24/7",
      publishStatus: "draft" as const,
      urgencyLevel: "medium" as const,
      requiresApproval: false,
      visibility: {
        internal: true,
        regional: true,
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
  };

  return (
    <ProtectedRoute requiredRoles={["editor", "admin", "super_admin"]}>
      <EnhancedFahndungWizard initialData={wizardData} mode="edit" />
    </ProtectedRoute>
  );
}
