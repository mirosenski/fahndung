import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Edit3,
  Share2,
  MoreVertical,
  Shield,
  Clock,
  Eye,
} from "lucide-react";

// Import components
import InvestigationDisplay from "@/components/investigation/InvestigationDisplay";
import PageLayout from "@/components/layout/PageLayout";

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

export default async function FahndungDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Simulate data loading - in a real app, this would be a database call
  const investigation: Investigation = {
    id,
    step1: {
      title: "Vermisste Person - Max Mustermann",
      category: "MISSING_PERSON",
      caseNumber: "VM-2024-01-001",
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

  return (
    <PageLayout>
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
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {investigation.step1.caseNumber}
                </p>
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
                href={`/fahndungen/${id}/bearbeiten`}
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

      {/* Main Content */}
      <main className="mx-auto max-w-7xl">
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

        {/* Investigation Display Component */}
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          <InvestigationDisplay
            mode="detail"
            data={{
              step1: investigation.step1,
              step2: investigation.step2,
              step3: investigation.step3,
              step4: investigation.step4,
              step5: investigation.step5,
            }}
          />
        </div>
      </main>
    </PageLayout>
  );
}
