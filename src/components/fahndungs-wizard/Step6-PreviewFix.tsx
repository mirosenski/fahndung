import React from "react";
import {
  FileText,
  MapPin,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import type {
  Step1Data,
  Step2Data,
  Step3Data,
  Step4Data,
  Step5Data,
} from "@/types/fahndung-wizard";

interface PreviewData {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  step5: Step5Data;
}

interface Step6PreviewProps {
  data: PreviewData;
}

export default function Step6Preview({ data }: Step6PreviewProps) {
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      WANTED_PERSON: "Straftäter",
      MISSING_PERSON: "Vermisste Person",
      UNKNOWN_DEAD: "Unbekannte Tote",
      STOLEN_GOODS: "Sachen",
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-6">
      {/* Vorschau Tab */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        {/* Header mit Kategorie */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <span className="inline-block rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {getCategoryLabel(data.step1.category)}
            </span>
            {data.step2.priority === "urgent" && (
              <span className="ml-2 inline-block animate-pulse rounded bg-red-100 px-2 py-1 text-xs text-red-800 dark:bg-red-900 dark:text-red-200">
                DRINGEND
              </span>
            )}
          </div>
          <span className="text-sm text-gray-500">{data.step1.caseNumber}</span>
        </div>

        {/* Titel */}
        <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
          {data.step1.title}
        </h2>

        {/* Kurzbeschreibung */}
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          {data.step2.shortDescription}
        </p>

        {/* Bilder */}
        {data.step3.imagePreviews && data.step3.imagePreviews.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 text-lg font-semibold">Bilder</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {data.step3.imagePreviews.map((img, index) => (
                <div key={img.id} className="relative">
                  <img
                    src={img.preview}
                    alt={`Bild ${index + 1}`}
                    className="h-32 w-full rounded-lg object-cover"
                  />
                  {data.step3.mainImage &&
                    img.name === data.step3.mainImage.name && (
                      <span className="absolute left-2 top-2 rounded bg-blue-600 px-2 py-1 text-xs text-white">
                        Hauptbild
                      </span>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Keine Bilder Platzhalter */}
        {(!data.step3.imagePreviews ||
          data.step3.imagePreviews.length === 0) && (
          <div className="mb-6 rounded-lg bg-gray-100 p-8 text-center dark:bg-gray-700">
            <ImageIcon className="mx-auto mb-2 h-12 w-12 text-gray-400" />
            <p className="text-sm text-gray-500">Keine Bilder hochgeladen</p>
          </div>
        )}

        {/* Beschreibung */}
        <div className="mb-6">
          <h3 className="mb-2 text-lg font-semibold">Beschreibung</h3>
          <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {data.step2.description}
          </p>
        </div>

        {/* Besondere Merkmale */}
        {data.step2.features && (
          <div className="mb-6 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
            <h4 className="mb-2 font-semibold text-yellow-800 dark:text-yellow-200">
              Besondere Merkmale
            </h4>
            <p className="text-yellow-700 dark:text-yellow-300">
              {data.step2.features}
            </p>
          </div>
        )}

        {/* Orte */}
        {data.step4.mainLocation && (
          <div className="mb-6">
            <h3 className="mb-3 flex items-center text-lg font-semibold">
              <MapPin className="mr-2 h-5 w-5" />
              Relevante Orte
            </h3>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <p className="font-medium">{data.step4.mainLocation.address}</p>
              {data.step4.mainLocation.description && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {data.step4.mainLocation.description}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Suchradius: {data.step4.searchRadius} km
              </p>
            </div>
          </div>
        )}

        {/* Kontaktinformationen */}
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <h3 className="mb-3 font-semibold text-blue-800 dark:text-blue-200">
            Kontaktinformationen
          </h3>
          <div className="space-y-2 text-sm">
            <p className="flex items-center text-blue-700 dark:text-blue-300">
              <Phone className="mr-2 h-4 w-4" />
              {data.step5.contactPhone}
            </p>
            {data.step5.contactEmail && (
              <p className="flex items-center text-blue-700 dark:text-blue-300">
                <Mail className="mr-2 h-4 w-4" />
                {data.step5.contactEmail}
              </p>
            )}
            <p className="text-blue-700 dark:text-blue-300">
              <strong>Ansprechpartner:</strong> {data.step5.contactPerson}
            </p>
            <p className="text-blue-700 dark:text-blue-300">
              <strong>Dienststelle:</strong> {data.step5.department}
            </p>
            <p className="text-blue-700 dark:text-blue-300">
              <strong>Erreichbarkeit:</strong> {data.step5.availableHours}
            </p>
          </div>
        </div>

        {/* Tags */}
        {data.step2.tags && data.step2.tags.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {data.step2.tags.map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Veröffentlichungsstatus */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
        <div className="flex items-start">
          <AlertCircle className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
          <div>
            <h4 className="font-semibold text-green-800 dark:text-green-200">
              Veröffentlichungsstatus
            </h4>
            <p className="mt-1 text-sm text-green-700 dark:text-green-300">
              Diese Fahndung wird als{" "}
              <strong>{data.step5.publishStatus}</strong> gespeichert.
              {data.step5.articlePublishing?.publishAsArticle && (
                <span className="ml-1">
                  Zusätzlich wird ein öffentlicher Artikel erstellt.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
