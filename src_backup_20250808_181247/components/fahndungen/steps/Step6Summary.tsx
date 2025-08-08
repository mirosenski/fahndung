"use client";

import React from "react";
import { Eye, Save } from "lucide-react";
import { CATEGORY_CONFIG, PRIORITY_CONFIG } from "../types/WizardTypes";
import type { WizardData } from "../types/WizardTypes";

interface Step6SummaryProps {
  data: Partial<WizardData>;
  showPreview: boolean;
  onTogglePreview: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  mode: "create" | "edit";
}

const Step6Summary: React.FC<Step6SummaryProps> = ({
  data,
  showPreview,
  onTogglePreview,
  onSubmit,
  isSubmitting,
  mode,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Schritt 6: Zusammenfassung & Abschluss
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Überprüfen Sie alle Daten vor der finalen Speicherung
        </p>
      </div>

      {/* Zusammenfassung */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              Grundinformationen
            </h3>
            <dl className="space-y-1 text-sm">
              <div>
                <dt className="inline font-medium">Titel:</dt>{" "}
                <dd className="ml-2 inline">{data.step1?.title}</dd>
              </div>
              <div>
                <dt className="inline font-medium">Kategorie:</dt>{" "}
                <dd className="ml-2 inline">
                  {
                    CATEGORY_CONFIG[data.step1?.category ?? "MISSING_PERSON"]
                      .label
                  }
                </dd>
              </div>
              <div>
                <dt className="inline font-medium">Aktenzeichen:</dt>{" "}
                <dd className="ml-2 inline">{data.step1?.caseNumber}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              Beschreibung
            </h3>
            <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
              {data.step2?.description}
            </p>
            <div className="mt-2">
              <span
                className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${PRIORITY_CONFIG[data.step2?.priority ?? "normal"].color} text-white`}
              >
                {PRIORITY_CONFIG[data.step2?.priority ?? "normal"].label}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              Medien
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div>
                Hauptbild:{" "}
                {data.step3?.mainImage ? "✓ Vorhanden" : "✗ Nicht vorhanden"}
              </div>
              <div>
                Weitere Bilder: {data.step3?.additionalImages?.length ?? 0}
              </div>
              <div>Dokumente: {data.step3?.documents?.length ?? 0}</div>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              Standort
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div>
                Hauptort:{" "}
                {data.step4?.mainLocation?.address ?? "Nicht festgelegt"}
              </div>
              <div>
                Weitere Orte: {data.step4?.additionalLocations?.length ?? 0}
              </div>
              <div>Suchradius: {data.step4?.searchRadius ?? 5} km</div>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              Kontakt & Veröffentlichung
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div>
                Kontakt: {data.step5?.contactPerson ?? "Nicht angegeben"}
              </div>
              <div>
                Abteilung: {data.step5?.department ?? "Nicht angegeben"}
              </div>
              <div>
                Status:{" "}
                {data.step5?.publishStatus === "draft"
                  ? "Entwurf"
                  : data.step5?.publishStatus === "immediate"
                    ? "Sofort veröffentlichen"
                    : (data.step5?.publishStatus ?? "Entwurf")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aktion Buttons */}
      <div className="flex justify-between border-t border-gray-200 pt-6 dark:border-gray-700">
        <button
          onClick={onTogglePreview}
          className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <Eye className="h-4 w-4" />
          {showPreview ? "Vorschau ausblenden" : "Kartenvorschau anzeigen"}
        </button>

        <div className="flex gap-3">
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-gray-600 px-6 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Speichert..." : "Als Entwurf speichern"}
          </button>

          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Eye className="h-4 w-4" />
            {isSubmitting
              ? "Veröffentlicht..."
              : mode === "create"
                ? "Sofort veröffentlichen"
                : "Änderungen speichern"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step6Summary;
