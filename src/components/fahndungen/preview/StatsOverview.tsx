"use client";

import React from "react";
import type { WizardData } from "../types/WizardTypes";

interface StatsOverviewProps {
  data: Partial<WizardData>;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ data }) => {
  const getValidationStatus = (field: unknown) => (field ? "✓" : "✗");
  const getValidationColor = (field: unknown) =>
    field ? "text-green-600" : "text-red-600";

  return (
    <div className="space-y-4">
      {/* Fortschritt */}
      <div className="rounded-lg bg-muted p-4 dark:bg-muted">
        <h4 className="mb-3 font-medium">Fortschritt</h4>
        <div className="space-y-2">
          {[
            {
              label: "Grundinfo",
              valid: !!(data.step1?.title && data.step1?.category),
            },
            { label: "Beschreibung", valid: !!data.step2?.description },
            { label: "Hauptbild", valid: !!data.step3?.mainImage },
            { label: "Standort", valid: !!data.step4?.mainLocation },
            { label: "Kontakt", valid: !!data.step5?.contactPerson },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-sm">{item.label}</span>
              <span className={`font-medium ${getValidationColor(item.valid)}`}>
                {getValidationStatus(item.valid)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Medien-Übersicht */}
      <div className="rounded-lg bg-muted p-4 dark:bg-muted">
        <h4 className="mb-3 font-medium">Medien</h4>
        <div className="space-y-1 text-sm">
          <div>Hauptbild: {data.step3?.mainImage ? "1" : "0"}</div>
          <div>Weitere Bilder: {data.step3?.additionalImages?.length ?? 0}</div>
          <div>Dokumente: {data.step3?.documents?.length ?? 0}</div>
        </div>
      </div>

      {/* Meta-Informationen */}
      <div className="rounded-lg bg-muted p-4 dark:bg-muted">
        <h4 className="mb-3 font-medium">Meta-Daten</h4>
        <div className="space-y-1 text-sm">
          <div>Kategorie: {data.step1?.category ?? "-"}</div>
          <div>Priorität: {data.step2?.priority ?? "-"}</div>
          <div>Status: {data.step5?.publishStatus ?? "draft"}</div>
          <div>Tags: {data.step2?.tags?.length ?? 0}</div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
