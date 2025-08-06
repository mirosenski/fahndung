import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import {
  generateSeoSlug,
  findInvestigationBySlug,
  validateSeoSlug,
} from "~/lib/seo";
import FahndungCategoriesContainer from "~/components/fahndungen/categories/FahndungCategoriesContainer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function FahndungSlugPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Prüfe ob es eine Fallnummer ist (z.B. "2024-K-001" oder "POL-2025-K-649864-A")
  const isCaseNumber = /^(?:POL-)?\d{4}-[A-Z]-\d{3,6}(?:-[A-Z])?$/.test(slug);

  if (isCaseNumber) {
    // Direkte Fallnummer - verwende die ID-Route
    return <FahndungCategoriesContainer investigationId={slug} />;
  }

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

    // 5. Normale Detailseite rendern
    return <FahndungCategoriesContainer investigationId={caseNumber} />;
  } catch (error) {
    console.error("❌ Fehler beim Abrufen der Fahndung:", error);
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

      const seoSlug = generateSeoSlug(investigation.title);

      return {
        title: `${investigation.title} - Fahndung ${investigation.case_number}`,
        description:
          investigation.short_description || investigation.description,
        alternates: {
          canonical: `/fahndungen/${seoSlug}`,
          alternates: [
            `/fahndungen/${investigation.case_number}`,
            `/fahndungen/${investigation.id}`,
          ],
        },
        openGraph: {
          title: `${investigation.title} - Fahndung ${investigation.case_number}`,
          description:
            investigation.short_description || investigation.description,
          url: `/fahndungen/${seoSlug}`,
          type: "article",
        },
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
      title: `${investigation.title} - Fahndung ${investigation.case_number}`,
      description: investigation.short_description || investigation.description,
      alternates: {
        canonical: `/fahndungen/${slug}`,
        alternates: [
          `/fahndungen/${investigation.case_number}`,
          `/fahndungen/${investigation.id}`,
        ],
      },
      openGraph: {
        title: `${investigation.title} - Fahndung ${investigation.case_number}`,
        description:
          investigation.short_description || investigation.description,
        url: `/fahndungen/${slug}`,
        type: "article",
      },
    };
  } catch {
    return {
      title: "Fahndung nicht gefunden",
      description: "Die angeforderte Fahndung konnte nicht gefunden werden.",
    };
  }
}
