"use client";

import React from "react";
import { Eye, Save } from "lucide-react";
import { CATEGORY_CONFIG, PRIORITY_CONFIG } from "../types/WizardTypes";
import type { WizardData } from "../types/WizardTypes";
import type { CategoryType } from "~/components/fahndungskarte/types";

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
  const toValidCategory = (value: unknown): CategoryType =>
    value === "WANTED_PERSON" ||
    value === "MISSING_PERSON" ||
    value === "UNKNOWN_DEAD" ||
    value === "STOLEN_GOODS"
      ? (value as CategoryType)
      : "MISSING_PERSON";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-muted-foreground dark:text-white">
          Schritt 6: Zusammenfassung & Abschluss
        </h2>
        <p className="text-muted-foreground dark:text-muted-foreground">
          Überprüfen Sie alle Daten vor der finalen Speicherung
        </p>
      </div>

      {/* Zusammenfassung */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4 dark:bg-muted">
            <h3 className="mb-2 font-semibold text-muted-foreground dark:text-white">
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
                  {CATEGORY_CONFIG[toValidCategory(data.step1?.category)].label}
                </dd>
              </div>
              <div>
                <dt className="inline font-medium">Aktenzeichen:</dt>{" "}
                <dd className="ml-2 inline">{data.step1?.caseNumber}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg bg-muted p-4 dark:bg-muted">
            <h3 className="mb-2 font-semibold text-muted-foreground dark:text-white">
              Beschreibung
            </h3>
            <p className="line-clamp-3 text-sm text-muted-foreground dark:text-muted-foreground">
              {data.step2?.description}
            </p>
            <div className="mt-2">
              {(() => {
                const p = data.step1?.priority ?? "normal";
                const cfg = PRIORITY_CONFIG[p];
                return (
                  <span
                    className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${cfg.color} text-white`}
                  >
                    {cfg.label}
                  </span>
                );
              })()}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4 dark:bg-muted">
            <h3 className="mb-2 font-semibold text-muted-foreground dark:text-white">
              Medien
            </h3>
            <div className="text-sm text-muted-foreground dark:text-muted-foreground">
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

          <div className="rounded-lg bg-muted p-4 dark:bg-muted">
            <h3 className="mb-2 font-semibold text-muted-foreground dark:text-white">
              Standort
            </h3>
            <div className="text-sm text-muted-foreground dark:text-muted-foreground">
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

          <div className="rounded-lg bg-muted p-4 dark:bg-muted">
            <h3 className="mb-2 font-semibold text-muted-foreground dark:text-white">
              Kontakt & Veröffentlichung
            </h3>
            <div className="text-sm text-muted-foreground dark:text-muted-foreground">
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
      <div className="flex justify-between border-t border-border pt-6 dark:border-border">
        <button
          onClick={onTogglePreview}
          className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-muted-foreground hover:bg-muted dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted"
        >
          <Eye className="h-4 w-4" />
          {showPreview ? "Vorschau ausblenden" : "Kartenvorschau anzeigen"}
        </button>

        <div className="flex gap-3">
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-muted px-6 py-2 text-white hover:bg-muted disabled:opacity-50"
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
