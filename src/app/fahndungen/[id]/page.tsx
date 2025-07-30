/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Edit3,
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
import { getCurrentSession } from "~/lib/auth";
import { CaseNumberDetailed } from "~/components/ui/CaseNumberDisplay";
import { api } from "~/trpc/react";
import { useParams } from "next/navigation";

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

// Konvertierung von Datenbankdaten zu UI-Format
const convertDatabaseToUIFormat = (dbData: DatabaseInvestigation) => {
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
      shortDescription:
        dbData.short_description ??
        dbData.description?.substring(0, 100) + "..." ??
        "",
      description: dbData.description ?? "",
      priority: dbData.priority,
      tags: dbData.tags ?? [],
      features: dbData.features ?? "",
    },
    step3: {
      mainImage: null, // Wird über URL behandelt
      additionalImages: [],
      documents: [],
    },
    step4: {
      mainLocation: dbData.location
        ? {
            id: "main-location",
            address: dbData.location,
            lat: 0, // Könnte aus metadata extrahiert werden
            lng: 0,
            type: "main" as const,
            description: "Hauptort der Fahndung",
          }
        : undefined,
      additionalLocations: [],
      searchRadius: 5,
    },
    step5: {
      contactPerson: (dbData.contact_info?.["person"] as string) ?? "Polizei",
      contactPhone:
        (dbData.contact_info?.["phone"] as string) ?? "+49 711 8990-0",
      contactEmail: (dbData.contact_info?.["email"] as string) ?? "",
      department: dbData.station ?? "Polizeipräsidium",
      availableHours: "Mo-Fr 08:00-18:00, Sa-So Bereitschaftsdienst",
      publishStatus: "immediate" as const,
      urgencyLevel:
        dbData.priority === "urgent"
          ? "high"
          : dbData.priority === "new"
            ? "medium"
            : ("low" as const),
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
        publishAsArticle: dbData.published_as_article ?? false,
        generateSeoUrl: !!dbData.article_slug,
        customSlug: dbData.article_slug ?? undefined,
        seoTitle: dbData.article_meta?.seo_title ?? undefined,
        seoDescription: dbData.article_meta?.seo_description ?? undefined,
        keywords: dbData.article_meta?.keywords ?? [],
        author: dbData.article_meta?.author ?? undefined,
        readingTime: dbData.article_meta?.reading_time ?? undefined,
      },
    },
    metadata: {
      createdAt: dbData.created_at,
      updatedAt: dbData.updated_at,
      createdBy: dbData.created_by_user?.email ?? dbData.created_by,
      views: (dbData.metadata?.["views"] as number) ?? 0,
      status: dbData.status,
    },
    published_as_article: dbData.published_as_article,
    article_slug: dbData.article_slug,
    article_meta: dbData.article_meta,
    // Zusätzliche Daten für UI
    images: dbData.images ?? [],
    contact_info: dbData.contact_info ?? {},
  };
};

interface PageProps {
  params: Promise<{ id: string }>;
}

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

export default function FahndungDetailPage({ params: _params }: PageProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [session, setSession] = React.useState<any>(null);
  const params = useParams();
  const id = params?.["id"] as string;

  React.useEffect(() => {
    void getCurrentSession().then(setSession);
  }, []);

  // Lade echte Daten aus der Datenbank
  const {
    data: dbInvestigation,
    isLoading,
    error,
  } = api.post.getInvestigation.useQuery(
    { id },
    {
      enabled: !!id,
    },
  );

  // Konvertiere Datenbankdaten zu UI-Format
  const investigation = dbInvestigation
    ? convertDatabaseToUIFormat(dbInvestigation)
    : null;

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
            <p className="max-w-md text-gray-600 dark:text-gray-400">
              Die angeforderte Fahndung konnte nicht gefunden werden oder ist
              nicht verfügbar.
            </p>
            <Link
              href="/fahndungen"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zu allen Fahndungen
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Keine Daten
  if (!investigation) {
    return (
      <PageLayout session={session}>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Keine Daten verfügbar
            </h2>
            <p className="max-w-md text-gray-600 dark:text-gray-400">
              Für diese Fahndung sind keine Daten verfügbar.
            </p>
            <Link
              href="/fahndungen"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zu allen Fahndungen
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white">
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10">
                <div className="mb-4 flex items-center gap-2">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                    {investigation.step1.category === "MISSING_PERSON"
                      ? "Vermisste"
                      : investigation.step1.category === "WANTED_PERSON"
                        ? "Straftäter"
                        : investigation.step1.category === "UNKNOWN_DEAD"
                          ? "Unbekannte Tote"
                          : "Sachen"}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      investigation.step2.priority === "urgent"
                        ? "bg-red-500/20 text-red-100"
                        : investigation.step2.priority === "new"
                          ? "bg-green-500/20 text-green-100"
                          : "bg-gray-500/20 text-gray-100"
                    }`}
                  >
                    {investigation.step2.priority === "urgent"
                      ? "Dringend"
                      : investigation.step2.priority === "new"
                        ? "Neu"
                        : "Normal"}
                  </span>
                </div>
                <h1 className="mb-2 text-3xl font-bold">
                  {investigation.step1.title}
                </h1>
                <p className="text-lg text-blue-100">
                  {investigation.step2.shortDescription}
                </p>
                <div className="mt-4 flex items-center gap-4 text-sm text-blue-100">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(
                      investigation.metadata.createdAt,
                    ).toLocaleDateString("de-DE")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {investigation.metadata.views} Aufrufe
                  </span>
                </div>
              </div>
            </div>

            {/* Case Number */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <CaseNumberDetailed caseNumber={investigation.step1.caseNumber} />
            </div>

            {/* Description */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Beschreibung
              </h3>
              <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                {investigation.step2.description}
              </p>
            </div>

            {/* Features */}
            {investigation.step2.features && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  Merkmale
                </h3>
                <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                  {investigation.step2.features}
                </p>
              </div>
            )}

            {/* Tags */}
            {investigation.step2.tags.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  Schlagworte
                </h3>
                <div className="flex flex-wrap gap-2">
                  {investigation.step2.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
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
                  <span className="text-gray-700 dark:text-gray-300">
                    {investigation.step5.contactPerson}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {investigation.step5.contactPhone}
                  </span>
                </div>
                {investigation.step5.contactEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {investigation.step5.contactEmail}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {investigation.step5.department}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {investigation.step5.availableHours}
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
              <p className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300">
                {investigation.step2.description}
              </p>
            </div>

            {investigation.step2.features && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  Besondere Merkmale
                </h3>
                <p className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300">
                  {investigation.step2.features}
                </p>
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
              {investigation.images && investigation.images.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {investigation.images.map((image, index) => (
                    <div
                      key={image.id ?? index}
                      className="overflow-hidden rounded-lg"
                    >
                      <Image
                        src={image.url}
                        alt={image.alt_text ?? `Bild ${index + 1}`}
                        width={400}
                        height={192}
                        className="h-48 w-full object-cover"
                      />
                      {image.caption && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {image.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  Keine Medien verfügbar.
                </p>
              )}
            </div>
          </div>
        );

      case "locations":
        return (
          <div className="space-y-6">
            {investigation.step4.mainLocation ? (
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  Hauptort
                </h3>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {investigation.step4.mainLocation.address}
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  Orte
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Keine Ortsangaben verfügbar.
                </p>
              </div>
            )}
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
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Ansprechpartner
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {investigation.step5.contactPerson}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Telefon
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {investigation.step5.contactPhone}
                  </p>
                </div>
                {investigation.step5.contactEmail && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      E-Mail
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      {investigation.step5.contactEmail}
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Dienststelle
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {investigation.step5.department}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Erreichbarkeit
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {investigation.step5.availableHours}
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
              <Link
                href={`/fahndungen/${id}/bearbeiten`}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <Edit3 className="h-4 w-4" />
                Bearbeiten
              </Link>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
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
