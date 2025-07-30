import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import {
  generateSeoSlug,
  findInvestigationBySlug,
  validateSeoSlug,
} from "~/lib/seo";
import EnhancedFahndungWizard from "~/components/fahndungen/EnhancedFahndungWizard";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function FahndungBearbeitenPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Prüfe ob es eine Fallnummer ist (z.B. "2024-K-001" oder "POL-2025-K-649864-A")
  const isCaseNumber = /^(?:POL-)?\d{4}-[A-Z]-\d{3,6}(?:-[A-Z])?$/.test(slug);

  let investigationId: string;

  if (isCaseNumber) {
    // Direkte Fallnummer - verwende die ID direkt
    investigationId = slug;
  } else {
    // 2. Fahndung basierend auf Titel-Slug finden
    const caseNumber = await findInvestigationBySlug(slug, api);
    if (!caseNumber) {
      console.log("❌ Fahndung nicht gefunden für Slug:", slug);
      return notFound();
    }

    try {
      // 3. Fahndung per Fallnummer abrufen
      const investigation = await api.post.getInvestigation({ id: caseNumber });

      if (!investigation) {
        console.log("❌ Fahndung nicht gefunden für Fallnummer:", caseNumber);
        return notFound();
      }

      // 4. Slug validieren
      const expectedSlug = generateSeoSlug(investigation.title);
      if (!validateSeoSlug(slug, investigation.title)) {
        console.log("❌ Slug-Validierung fehlgeschlagen:", {
          expected: expectedSlug,
          actual: slug,
          title: investigation.title,
          caseNumber: investigation.case_number,
        });
        return notFound();
      }

      investigationId = caseNumber;
    } catch (error) {
      console.error("❌ Fehler beim Abrufen der Fahndung:", error);
      return notFound();
    }
  }

  // 5. Lade die Fahndungsdaten für den Wizard
  try {
    const investigation = await api.post.getInvestigation({
      id: investigationId,
    });

    if (!investigation) {
      console.log(
        "❌ Fahndung nicht gefunden für Bearbeitung:",
        investigationId,
      );
      return notFound();
    }

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

    return <EnhancedFahndungWizard initialData={wizardData} mode="edit" />;
  } catch {
    console.error("❌ Fehler beim Laden der Fahndung für Bearbeitung");
    return notFound();
  }
}

// Metadata für SEO
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  // Prüfe ob es eine Fallnummer ist
  const isCaseNumber = /^(?:POL-)?\d{4}-[A-Z]-\d{3,6}(?:-[A-Z])?$/.test(slug);

  if (isCaseNumber) {
    // Direkte Fallnummer - verwende die ID-Route Metadata
    try {
      const investigation = await api.post.getInvestigation({ id: slug });

      if (!investigation) {
        return {
          title: "Fahndung nicht gefunden",
          description:
            "Die angeforderte Fahndung konnte nicht gefunden werden.",
        };
      }

      return {
        title: `${investigation.title} bearbeiten - Fahndung ${investigation.case_number}`,
        description: `Bearbeiten Sie die Fahndung "${investigation.title}"`,
      };
    } catch {
      return {
        title: "Fahndung nicht gefunden",
        description: "Die angeforderte Fahndung konnte nicht gefunden werden.",
      };
    }
  }

  // SEO-Slug - Fahndung basierend auf Titel finden
  const caseNumber = await findInvestigationBySlug(slug, api);

  if (!caseNumber) {
    return {
      title: "Fahndung nicht gefunden",
      description: "Die angeforderte Fahndung konnte nicht gefunden werden.",
    };
  }

  try {
    const investigation = await api.post.getInvestigation({ id: caseNumber });

    if (!investigation) {
      return {
        title: "Fahndung nicht gefunden",
        description: "Die angeforderte Fahndung konnte nicht gefunden werden.",
      };
    }

    return {
      title: `${investigation.title} bearbeiten - Fahndung ${investigation.case_number}`,
      description: `Bearbeiten Sie die Fahndung "${investigation.title}"`,
    };
  } catch {
    return {
      title: "Fahndung nicht gefunden",
      description: "Die angeforderte Fahndung konnte nicht gefunden werden.",
    };
  }
}
