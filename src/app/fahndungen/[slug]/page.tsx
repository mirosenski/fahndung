import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import {
  generateSeoSlug,
  validateSeoSlug,
} from "~/lib/seo";
import FahndungCategoriesContainer from "~/components/fahndungen/categories/FahndungCategoriesContainer";

// TypeScript-Typen für die API-Responses
interface Investigation {
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
    og_image?: string;
    keywords?: string[];
    author?: string;
    reading_time?: number;
  };
  article_published_at?: string;
  article_views?: number;
}

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

  // 2. Prüfe ob es eine UUID ist
  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      slug,
    );

  if (isUUID) {
    // Direkte UUID - verwende die ID-Route
    return <FahndungCategoriesContainer investigationId={slug} />;
  }

  // 3. Fahndung basierend auf Titel-Slug finden
  try {
    const investigation = await api.post.getInvestigationBySlug({ slug }) as Investigation | null;

    if (!investigation) {
      console.log("❌ Fahndung nicht gefunden für Slug:", slug);
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
    return (
      <FahndungCategoriesContainer
        investigationId={investigation.case_number}
      />
    );
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
      const investigation = await api.post.getInvestigation({ id: slug }) as Investigation | null;

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
          investigation.short_description ?? investigation.description,
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
            investigation.short_description ?? investigation.description,
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

  // Prüfe ob es eine UUID ist
  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      slug,
    );

  if (isUUID) {
    // Direkte UUID - verwende die ID-Route Metadata
    try {
      const investigation = await api.post.getInvestigation({ id: slug }) as Investigation | null;

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
          investigation.short_description ?? investigation.description,
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
            investigation.short_description ?? investigation.description,
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
  try {
    const investigation = await api.post.getInvestigationBySlug({ slug }) as Investigation | null;

    if (!investigation) {
      return {
        title: "Fahndung nicht gefunden",
        description: "Die angeforderte Fahndung konnte nicht gefunden werden.",
      };
    }

    return {
      title: `${investigation.title} - Fahndung ${investigation.case_number}`,
      description: investigation.short_description ?? investigation.description,
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
          investigation.short_description ?? investigation.description,
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
