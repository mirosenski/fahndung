"use client";

import React from "react";
import type { WizardData } from "../types/WizardTypes";

interface DetailPagePreviewProps {
  data: Partial<WizardData>;
}

const DetailPagePreview: React.FC<DetailPagePreviewProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4 dark:border-border">
        <h1 className="text-2xl font-bold">{data.step1?.title ?? "Titel"}</h1>
        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground dark:text-muted-foreground">
          <span>Fall #{data.step1?.caseNumber}</span>
          <span>•</span>
          <span>{data.step1?.category}</span>
        </div>
      </div>

      {/* Content Preview */}
      <div className="space-y-4">
        <section>
          <h2 className="text-lg font-semibold">Beschreibung</h2>
          <p className="text-muted-foreground dark:text-muted-foreground">
            {data.step2?.description ?? "Keine Beschreibung verfügbar"}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Kontakt</h2>
          <div className="space-y-2">
            <p>
              <strong>Ansprechpartner:</strong>{" "}
              {data.step5?.contactPerson ?? "-"}
            </p>
            <p>
              <strong>Telefon:</strong> {data.step5?.contactPhone ?? "-"}
            </p>
            <p>
              <strong>E-Mail:</strong> {data.step5?.contactEmail ?? "-"}
            </p>
            <p>
              <strong>Abteilung:</strong> {data.step5?.department ?? "-"}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DetailPagePreview;
