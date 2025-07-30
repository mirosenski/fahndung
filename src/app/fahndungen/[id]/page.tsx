/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Edit3,
  Share2,
  MoreVertical,
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
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";

// Import components
import WizardTabNavigation, {
  type WizardTab,
} from "@/components/investigation/WizardTabNavigation";
import BreadcrumbNavigation, {
  type BreadcrumbItem,
} from "@/components/ui/BreadcrumbNavigation";
import PageLayout from "@/components/layout/PageLayout";
import { getCurrentSession } from "~/lib/auth";
import { CaseNumberDetailed } from "~/components/ui/CaseNumberDisplay";

// Types
interface Investigation {
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
    mainImage: File | null;
    additionalImages: File[];
    documents: File[];
  };
  step4: {
    mainLocation: {
      id: string;
      address: string;
      lat: number;
      lng: number;
      type: "main";
      description: string;
    };
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
  };
  step5: {
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
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    views: number;
    status: string;
  };
  // Article publishing features
  published_as_article?: boolean;
  article_slug?: string | null;
  article_meta?: {
    seo_title?: string;
    seo_description?: string;
    keywords?: string[];
    author?: string;
    reading_time?: number;
  };
}

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

  React.useEffect(() => {
    void getCurrentSession().then(setSession);
  }, []);

  // Simulate data loading - in a real app, this would be a database call
  const investigation: Investigation = {
    id: "1",
    step1: {
      title: "Vermisste - Max Mustermann",
      category: "MISSING_PERSON",
      caseNumber: "POL-2024-K-001234-A",
    },
    step2: {
      shortDescription:
        "Max Mustermann wird seit 15.03.2024 vermisst. Zuletzt gesehen in Stuttgart.",
      description: "Detaillierte Beschreibung des Falls...",
      priority: "urgent",
      tags: ["vermisst", "stuttgart", "dringend"],
      features: "Größe: 1,80m, braune Haare, grüne Augen",
    },
    step3: {
      mainImage: null,
      additionalImages: [],
      documents: [],
    },
    step4: {
      mainLocation: {
        id: "main-location-1",
        address: "Stuttgart, Königstraße",
        lat: 48.7758,
        lng: 9.1829,
        type: "main" as const,
        description: "Hauptort der Vermisstenmeldung",
      },
      additionalLocations: [],
      searchRadius: 50,
    },
    step5: {
      contactPerson: "Kommissar Schmidt",
      contactPhone: "+49 711 123456",
      contactEmail: "fahndung@polizei-bw.de",
      department: "Kriminalpolizei Stuttgart",
      availableHours: "Mo-Fr 8:00-16:00",
      publishStatus: "immediate",
      urgencyLevel: "high",
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
        customSlug: undefined,
        seoTitle: undefined,
        seoDescription: undefined,
        keywords: [],
        author: undefined,
        readingTime: undefined,
      },
    },
    metadata: {
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T14:30:00Z",
      createdBy: "admin@polizei.de",
      views: 1234,
      status: "active",
    },
    // Article publishing features (simulated)
    published_as_article: false,
    article_slug: null,
    article_meta: {
      seo_title: undefined,
      seo_description: undefined,
      keywords: [],
      author: undefined,
      reading_time: undefined,
    },
  };

  // Breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: "Fahndungen",
      href: "/fahndungen",
    },
    {
      label: investigation.step1.title,
    },
  ];

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
                  {investigation.step2.priority === "urgent" && (
                    <span className="animate-pulse rounded-full bg-red-500 px-3 py-1 text-sm font-medium">
                      DRINGEND
                    </span>
                  )}
                </div>
                <h1 className="mb-2 text-3xl font-bold md:text-4xl">
                  {investigation.step1.title}
                </h1>
                <p className="text-lg text-blue-100 md:text-xl">
                  {investigation.step2.shortDescription}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-blue-200">
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <CaseNumberDetailed
                      caseNumber={investigation.step1.caseNumber}
                    />
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(
                      investigation.metadata.createdAt,
                    ).toLocaleDateString("de-DE")}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {investigation.step4.mainLocation?.address ??
                      "Standort unbekannt"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                    <Eye className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Aufrufe
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {investigation.metadata.views.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      Aktiv
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/30">
                    <MapPin className="h-5 w-5 text-yellow-600 dark:text-yellow-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Suchradius
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {investigation.step4.searchRadius} km
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Preview */}
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Beschreibung
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {investigation.step2.description}
              </p>
              {investigation.step2.features && (
                <div className="mt-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                  <h3 className="mb-2 font-medium text-gray-900 dark:text-white">
                    Besondere Merkmale
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {investigation.step2.features}
                  </p>
                </div>
              )}
            </div>

            {/* Contact Preview */}
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Kontakt
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {investigation.step5.contactPerson}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {investigation.step5.department}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <a
                    href={`tel:${investigation.step5.contactPhone}`}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    {investigation.step5.contactPhone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        );

      case "description":
        return (
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Detaillierte Beschreibung
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">
                  {investigation.step2.description}
                </p>
              </div>
            </div>

            {investigation.step2.features && (
              <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  Besondere Merkmale
                </h2>
                <p className="whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                  {investigation.step2.features}
                </p>
              </div>
            )}

            {investigation.step2.tags.length > 0 && (
              <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  Schlagwörter
                </h2>
                <div className="flex flex-wrap gap-2">
                  {investigation.step2.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "media":
        return (
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Bildmaterial
              </h2>
              <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                <div className="text-center">
                  <ImageIcon className="mx-auto h-16 w-16 text-gray-400" />
                  <p className="mt-2 text-gray-500">Keine Bilder verfügbar</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Dokumente
              </h2>
              <div className="flex h-32 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                <div className="text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-500">
                    Keine Dokumente verfügbar
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "locations":
        return (
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Hauptstandort
              </h2>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {investigation.step4.mainLocation?.address}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {investigation.step4.mainLocation?.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Karte
              </h2>
              <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                <div className="text-center">
                  <MapPin className="mx-auto h-16 w-16 text-gray-400" />
                  <p className="mt-2 text-gray-500">Karte wird geladen...</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Suchradius
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <div className="h-3 w-3 rounded-full border-2 border-blue-500"></div>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {investigation.step4.searchRadius} Kilometer
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Suchradius um den Hauptstandort
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "contact":
        return (
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Ansprechpartner
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {investigation.step5.contactPerson}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {investigation.step5.department}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <a
                    href={`tel:${investigation.step5.contactPhone}`}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    {investigation.step5.contactPhone}
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <a
                    href={`mailto:${investigation.step5.contactEmail}`}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    {investigation.step5.contactEmail}
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {investigation.step5.availableHours}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Sichtbarkeit
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Intern
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Regional
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    National
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    International
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PageLayout session={session}>
      {/* Header Bar */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <Link
                href="/fahndungen"
                className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Zurück zur Übersicht"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="line-clamp-1 text-lg font-semibold">
                  {investigation.step1.title}
                </h1>
                <CaseNumberDetailed
                  caseNumber={investigation.step1.caseNumber}
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-2">
              {/* View counter */}
              <div className="hidden items-center space-x-1 rounded-lg bg-gray-100 px-3 py-1 dark:bg-gray-700 sm:flex">
                <Eye className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {investigation.metadata.views.toLocaleString()}
                </span>
              </div>

              {/* Status badge */}
              <div className="hidden items-center space-x-1 rounded-lg bg-green-100 px-3 py-1 text-green-700 dark:bg-green-900/30 dark:text-green-300 sm:flex">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Aktiv</span>
              </div>

              {/* Action buttons */}
              <Link
                href={`/fahndungen/${investigation.id}/bearbeiten`}
                className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                <Edit3 className="h-4 w-4" />
                <span className="hidden sm:inline">Bearbeiten</span>
              </Link>

              <button
                className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Teilen"
              >
                <Share2 className="h-5 w-5" />
              </button>

              {/* More actions dropdown */}
              <div className="relative">
                <button
                  className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Weitere Aktionen"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Wizard Navigation */}
      <WizardTabNavigation
        tabs={wizardTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showProgress={true}
      />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl">
        {/* Breadcrumb Navigation */}
        <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700 sm:px-6 lg:px-8">
          <BreadcrumbNavigation items={breadcrumbItems} />
        </div>

        {/* Last updated info */}
        <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>
                Zuletzt aktualisiert:{" "}
                {new Date(investigation.metadata.updatedAt).toLocaleString(
                  "de-DE",
                )}
              </span>
            </div>
            <span>•</span>
            <span>Erstellt von: {investigation.metadata.createdBy}</span>
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-4 py-8 sm:px-6 lg:px-8">{renderTabContent()}</div>
      </main>
    </PageLayout>
  );
}
