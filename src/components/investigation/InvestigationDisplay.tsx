"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  FileText,
  MapPin,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  Edit2,
  Image as ImageIcon,
  X,
  Info,
  Clock,
  Building,
  User,
} from "lucide-react";
import { CaseNumberDetailed } from "~/components/ui/CaseNumberDisplay";

// TypeScript Interfaces
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
  features?: string;
}

interface Step3Data {
  mainImage: File | null;
  additionalImages: File[];
  documents: File[];
  imagePreviews?: Array<{
    id: string;
    preview: string; // Base64 URL
    name: string;
  }>;
}

interface MapLocation {
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
}

interface Step4Data {
  mainLocation: MapLocation | null;
  additionalLocations: MapLocation[];
  searchRadius: number;
}

interface Step5Data {
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  department: string;
  availableHours: string;
  alternativeContact?: {
    name: string;
    phone: string;
    email: string;
  };
  publishStatus: "draft" | "review" | "scheduled" | "immediate";
  publishDate?: string;
  publishTime?: string;
  expiryDate?: string;
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
  urgencyLevel: "low" | "medium" | "high" | "critical";
  requiresApproval: boolean;
  approvalNotes?: string;
}

export type DisplayMode = "summary" | "detail" | "card" | "preview";

export interface InvestigationDisplayProps {
  mode: DisplayMode;
  data: {
    step1: Step1Data;
    step2: Step2Data;
    step3: Step3Data;
    step4: Step4Data;
    step5: Step5Data;
  };
  onEdit?: (step: string) => void;
  className?: string;
  viewMode?: "grid-3" | "grid-4" | "list-flat";
}

import { getCategoryLabel, getCategoryStyles } from "@/types/categories";
import CategoryBadge from "@/components/ui/CategoryBadge";
import UniversalBadge from "@/components/ui/UniversalBadge";

// Helper Functions

const getPriorityStyles = (priority: string): string => {
  const styles: Record<string, string> = {
    urgent: "bg-red-100 text-red-800 animate-pulse",
    new: "bg-blue-100 text-blue-800",
    normal: "bg-gray-100 text-gray-800",
  };
  return styles[priority] ?? "bg-gray-100 text-gray-800";
};

const getUrgencyColor = (level: string): string => {
  const colors: Record<string, string> = {
    critical: "text-red-600",
    high: "text-orange-600",
    medium: "text-yellow-600",
    low: "text-gray-600",
  };
  return colors[level] ?? "text-gray-600";
};

// FlipCard Component
const FlipCard: React.FC<{
  data: InvestigationDisplayProps["data"];
  className?: string;
  viewMode?: "grid-3" | "grid-4" | "list-flat";
}> = ({ data, className = "", viewMode = "grid-3" }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Bildproportionen basierend auf viewMode
  const getImageProportions = () => {
    switch (viewMode) {
      case "grid-3":
        return { imageHeight: "70%", infoHeight: "30%" };
      case "grid-4":
      case "list-flat":
      default:
        return { imageHeight: "60%", infoHeight: "40%" };
    }
  };

  const { imageHeight, infoHeight } = getImageProportions();

  return (
    <div className={`relative ${className}`} style={{ perspective: "1000px" }}>
      <div
        className="relative h-full w-full transition-transform duration-700 ease-in-out"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front Side */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Image Section */}
          <div
            className="relative w-full bg-gray-200 dark:bg-gray-700"
            style={{ height: imageHeight }}
          >
            {data.step3.imagePreviews && data.step3.imagePreviews.length > 0 ? (
              <>
                {/* Main Image */}
                {data.step3.mainImage &&
                  data.step3.imagePreviews &&
                  (() => {
                    const mainPreview = data.step3.imagePreviews.find(
                      (preview) => preview.name === data.step3.mainImage!.name,
                    );
                    return mainPreview ? (
                      <Image
                        src={mainPreview.preview}
                        alt="Hauptbild"
                        fill
                        className="object-cover"
                      />
                    ) : null;
                  })()}
                {/* Overlay for multiple images indicator */}
                {data.step3.imagePreviews.length > 1 && (
                  <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                    +{data.step3.imagePreviews.length - 1} weitere
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="h-24 w-24 text-gray-400" />
              </div>
            )}
            {data.step2.priority === "urgent" && (
              <div className="absolute right-2 top-2 animate-pulse rounded bg-red-500 px-2 py-1 text-xs text-white">
                DRINGEND
              </div>
            )}
            <CategoryBadge
              category={data.step1.category}
              className="absolute left-2 top-2"
            />
          </div>

          {/* Content Section */}
          <div
            className="flex flex-col justify-between p-4"
            style={{ height: infoHeight }}
          >
            <div>
              <h3 className="mb-1 line-clamp-2 text-lg font-bold">
                {data.step1.title}
              </h3>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                {data.step4.mainLocation?.address ?? "Standort unbekannt"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {data.step1.caseNumber} •{" "}
                {new Date().toLocaleDateString("de-DE")}
              </p>
            </div>

            <button
              onClick={() => setIsFlipped(true)}
              className="absolute bottom-4 right-4 rounded-full bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600"
              aria-label="Details anzeigen"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Back Side */}
        <div
          className="absolute inset-0 h-full w-full rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="flex h-full flex-col">
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-lg font-bold">Details</h3>
              <button
                onClick={() => setIsFlipped(false)}
                className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Schließen"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto text-sm">
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  Kurzbeschreibung:
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {data.step2.shortDescription}
                </p>
              </div>

              {data.step2.features && (
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    Besondere Merkmale:
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {data.step2.features}
                  </p>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="mb-1 font-medium text-gray-700 dark:text-gray-300">
                  Kontakt:
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {data.step5.contactPerson}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {data.step5.department}
                </p>
                <p className="text-blue-600 dark:text-blue-400">
                  {data.step5.contactPhone}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function InvestigationDisplay({
  mode,
  data,
  onEdit,
  className = "",
  viewMode = "grid-3",
}: InvestigationDisplayProps) {
  // Memoized calculations

  const locationCount = useMemo(
    () =>
      (data.step4.mainLocation ? 1 : 0) + data.step4.additionalLocations.length,
    [data.step4],
  );

  // Summary Mode - Editable sections
  const renderSummaryMode = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-semibold">Basis-Informationen</h3>
          {onEdit && (
            <button
              onClick={() => onEdit("step1")}
              className="p-1 text-blue-600 hover:text-blue-700"
              aria-label="Basis-Informationen bearbeiten"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <div>
            <dt className="font-medium text-gray-600 dark:text-gray-400">
              Titel:
            </dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">
              {data.step1.title}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-600 dark:text-gray-400">
              Aktenzeichen:
            </dt>
            <dd className="mt-1">
              <CaseNumberDetailed caseNumber={data.step1.caseNumber} />
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-600 dark:text-gray-400">
              Kategorie:
            </dt>
            <dd className="mt-1">
              <span
                className={`inline-block rounded px-2 py-1 text-xs ${getCategoryStyles(data.step1.category)}`}
              >
                {getCategoryLabel(data.step1.category)}
              </span>
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-600 dark:text-gray-400">
              Priorität:
            </dt>
            <dd className="mt-1">
              <span
                className={`inline-block rounded px-2 py-1 text-xs ${getPriorityStyles(data.step2.priority)}`}
              >
                {data.step2.priority === "urgent"
                  ? "DRINGEND"
                  : data.step2.priority === "new"
                    ? "NEU"
                    : "NORMAL"}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      {/* Description */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-semibold">Beschreibung</h3>
          {onEdit && (
            <button
              onClick={() => onEdit("step2")}
              className="p-1 text-blue-600 hover:text-blue-700"
              aria-label="Beschreibung bearbeiten"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <p className="mb-1 font-medium text-gray-600 dark:text-gray-400">
              Kurzbeschreibung:
            </p>
            <p className="text-gray-900 dark:text-gray-100">
              {data.step2.shortDescription}
            </p>
          </div>

          <div>
            <p className="mb-1 font-medium text-gray-600 dark:text-gray-400">
              Ausführliche Beschreibung:
            </p>
            <p className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">
              {data.step2.description}
            </p>
          </div>

          {data.step2.features && (
            <div>
              <p className="mb-1 font-medium text-gray-600 dark:text-gray-400">
                Besondere Merkmale:
              </p>
              <p className="text-gray-900 dark:text-gray-100">
                {data.step2.features}
              </p>
            </div>
          )}

          {data.step2.tags.length > 0 && (
            <div>
              <p className="mb-2 font-medium text-gray-600 dark:text-gray-400">
                Tags:
              </p>
              <div className="flex flex-wrap gap-2">
                {data.step2.tags.map((tag, index) => (
                  <UniversalBadge
                    key={index}
                    content={tag}
                    className="inline-flex items-center"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Media */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-semibold">Medien</h3>
          {onEdit && (
            <button
              onClick={() => onEdit("step3")}
              className="p-1 text-blue-600 hover:text-blue-700"
              aria-label="Medien bearbeiten"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Image Preview */}
          {data.step3.imagePreviews && data.step3.imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {data.step3.imagePreviews.slice(0, 4).map((image, index) => (
                <div key={image.id} className="relative">
                  <Image
                    src={image.preview}
                    alt={image.name}
                    width={80}
                    height={80}
                    className="h-20 w-full rounded object-cover"
                  />
                  {data.step3.mainImage &&
                    image.name === data.step3.mainImage.name && (
                      <span className="absolute left-1 top-1 rounded bg-blue-600 px-1 py-0.5 text-xs text-white">
                        Haupt
                      </span>
                    )}
                  {index === 3 && data.step3.imagePreviews!.length > 4 && (
                    <div className="absolute inset-0 flex items-center justify-center rounded bg-black/50 text-xs text-white">
                      +{data.step3.imagePreviews!.length - 4}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Media Stats */}
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
            <div className="flex items-center space-x-3">
              <ImageIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">Hauptbild</p>
                <p className="text-gray-600 dark:text-gray-400">
                  {data.step3.mainImage ? "✓ Hochgeladen" : "✗ Fehlt"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <ImageIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">Weitere Bilder</p>
                <p className="text-gray-600 dark:text-gray-400">
                  {data.step3.additionalImages.length} Dateien
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">Dokumente</p>
                <p className="text-gray-600 dark:text-gray-400">
                  {data.step3.documents.length} PDFs
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-semibold">Orte & Karte</h3>
          {onEdit && (
            <button
              onClick={() => onEdit("step4")}
              className="p-1 text-blue-600 hover:text-blue-700"
              aria-label="Orte bearbeiten"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="space-y-3 text-sm">
          {data.step4.mainLocation && (
            <div className="flex items-start space-x-3">
              <MapPin className="mt-0.5 h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Hauptort:</p>
                <p className="text-gray-600 dark:text-gray-400">
                  {data.step4.mainLocation.address}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-gray-400" />
            <p>
              <span className="font-medium">Weitere Orte:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {data.step4.additionalLocations.length} markiert
              </span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex h-5 w-5 items-center justify-center">
              <div className="h-3 w-3 rounded-full border-2 border-gray-400"></div>
            </div>
            <p>
              <span className="font-medium">Suchradius:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {data.step4.searchRadius} km
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Contact & Publication */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-semibold">Kontakt & Veröffentlichung</h3>
          {onEdit && (
            <button
              onClick={() => onEdit("step5")}
              className="p-1 text-blue-600 hover:text-blue-700"
              aria-label="Kontakt bearbeiten"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">
              Ansprechpartner
            </h4>
            <div className="space-y-2">
              <p className="flex items-center">
                <User className="mr-2 h-4 w-4 text-gray-400" />
                {data.step5.contactPerson}
              </p>
              <p className="flex items-center">
                <Building className="mr-2 h-4 w-4 text-gray-400" />
                {data.step5.department}
              </p>
              <p className="flex items-center">
                <Phone className="mr-2 h-4 w-4 text-gray-400" />
                {data.step5.contactPhone}
              </p>
              {data.step5.contactEmail && (
                <p className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-gray-400" />
                  {data.step5.contactEmail}
                </p>
              )}
            </div>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">
              Veröffentlichung
            </h4>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Status:</span>
                <span className="ml-2 rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700">
                  {data.step5.publishStatus}
                </span>
              </p>
              <p
                className={`font-medium ${getUrgencyColor(data.step5.urgencyLevel)}`}
              >
                Dringlichkeit: {data.step5.urgencyLevel.toUpperCase()}
              </p>
              {data.step5.requiresApproval && (
                <p className="text-yellow-600 dark:text-yellow-400">
                  <AlertCircle className="mr-1 inline h-4 w-4" />
                  Freigabe erforderlich
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  // Detail Mode - Blog-style layout
  const renderDetailMode = () => (
    <article className="mx-auto max-w-4xl">
      {/* Hero Section */}
      <header className="relative h-[40vh] overflow-hidden rounded-t-xl bg-gradient-to-b from-gray-900 to-gray-700 md:h-[60vh]">
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="h-32 w-32 text-gray-600" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 md:p-8">
          <div className="mb-4 flex flex-wrap gap-2">
            <span
              className={`rounded px-3 py-1 text-sm ${getCategoryStyles(data.step1.category)}`}
            >
              {getCategoryLabel(data.step1.category)}
            </span>
            {data.step2.priority === "urgent" && (
              <span className="animate-pulse rounded bg-red-500 px-3 py-1 text-sm text-white">
                DRINGEND
              </span>
            )}
          </div>

          <h1 className="mb-2 text-3xl font-bold text-white md:text-5xl">
            {data.step1.title}
          </h1>
          <p className="text-lg text-gray-200 md:text-xl">
            {data.step2.shortDescription}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-300">
            <span className="flex items-center">
              <FileText className="mr-1 h-4 w-4" />
              <CaseNumberDetailed caseNumber={data.step1.caseNumber} />
            </span>
            <span className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              {new Date().toLocaleDateString("de-DE")}
            </span>
            <span className="flex items-center">
              <MapPin className="mr-1 h-4 w-4" />
              {data.step4.mainLocation?.address ?? "Standort unbekannt"}
            </span>
          </div>
        </div>
      </header>

      {/* Content Section */}
      <div className="space-y-8 rounded-b-xl bg-white p-6 dark:bg-gray-800 md:p-8">
        {/* Description */}
        <section>
          <h2 className="mb-4 text-2xl font-bold">Beschreibung</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{data.step2.description}</p>

            {data.step2.features && (
              <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <h3 className="mb-2 text-lg font-semibold">
                  Besondere Merkmale
                </h3>
                <p>{data.step2.features}</p>
              </div>
            )}
          </div>
        </section>

        {/* Image Gallery */}
        {data.step3.imagePreviews && data.step3.imagePreviews.length > 0 && (
          <section>
            <h2 className="mb-4 text-2xl font-bold">Bildmaterial</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {data.step3.imagePreviews.map((image) => (
                <div key={image.id} className="group relative">
                  <Image
                    src={image.preview}
                    alt={image.name}
                    width={300}
                    height={300}
                    className="aspect-square w-full rounded-lg object-cover shadow-md transition-transform hover:scale-105"
                  />
                  {data.step3.mainImage &&
                    image.name === data.step3.mainImage.name && (
                      <span className="absolute left-2 top-2 rounded bg-blue-600 px-2 py-1 text-xs text-white">
                        Hauptbild
                      </span>
                    )}
                  <div className="absolute inset-0 rounded-lg bg-black/0 transition-colors group-hover:bg-black/20" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Map Placeholder */}
        {locationCount > 0 && (
          <section>
            <h2 className="mb-4 text-2xl font-bold">Relevante Orte</h2>
            <div className="flex h-64 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700 md:h-96">
              <div className="text-center">
                <MapPin className="mx-auto mb-2 h-16 w-16 text-gray-400" />
                <p className="text-gray-500">{locationCount} Orte markiert</p>
                <p className="text-sm text-gray-400">
                  Suchradius: {data.step4.searchRadius} km
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Contact Section */}
        <section className="border-t pt-8">
          <h2 className="mb-4 text-2xl font-bold">Kontaktinformationen</h2>
          <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-900">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-3 font-semibold">Ansprechpartner</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-gray-400" />
                    {data.step5.contactPerson}
                  </p>
                  <p className="flex items-center">
                    <Building className="mr-2 h-4 w-4 text-gray-400" />
                    {data.step5.department}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold">Erreichbarkeit</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-gray-400" />
                    <a
                      href={`tel:${data.step5.contactPhone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {data.step5.contactPhone}
                    </a>
                  </p>
                  {data.step5.contactEmail && (
                    <p className="flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-gray-400" />
                      <a
                        href={`mailto:${data.step5.contactEmail}`}
                        className="text-blue-600 hover:underline"
                      >
                        {data.step5.contactEmail}
                      </a>
                    </p>
                  )}
                  <p className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-gray-400" />
                    {data.step5.availableHours}
                  </p>
                </div>
              </div>
            </div>

            {data.step5.alternativeContact && (
              <div className="mt-4 border-t pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Vertretung:</strong>{" "}
                  {data.step5.alternativeContact.name} •{" "}
                  {data.step5.alternativeContact.phone}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Tags */}
        {data.step2.tags.length > 0 && (
          <section className="border-t pt-8">
            <h2 className="mb-4 text-2xl font-bold">Schlagwörter</h2>
            <div className="flex flex-wrap gap-2">
              {data.step2.tags.map((tag, index) => (
                <UniversalBadge
                  key={index}
                  content={tag}
                  className="inline-flex items-center"
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );

  // Preview Mode - Styled preview
  const renderPreviewMode = () => (
    <div className="mx-auto max-w-4xl rounded-lg bg-white shadow-xl dark:bg-gray-800">
      {renderDetailMode()}
    </div>
  );

  // Card Mode - Flip card
  const renderCardMode = () => (
    <div className="flex justify-center">
      <FlipCard
        data={data}
        className="h-[500px] w-full max-w-[320px] md:h-[608px] md:max-w-[385px]"
        viewMode={viewMode}
      />
    </div>
  );

  // Main render logic
  return (
    <div className={`investigation-display ${className}`}>
      {mode === "summary" && renderSummaryMode()}
      {mode === "detail" && renderDetailMode()}
      {mode === "preview" && renderPreviewMode()}
      {mode === "card" && renderCardMode()}
    </div>
  );
}
