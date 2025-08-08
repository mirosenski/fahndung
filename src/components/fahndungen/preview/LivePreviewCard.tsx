"use client";

import React, { useMemo, useEffect } from "react";
import type { WizardData } from "../types/WizardTypes";
import type { FahndungsData } from "~/components/fahndungskarte/types";
import Fahndungskarte from "~/components/fahndungskarte/Fahndungskarte";

/**
 * Wrapper‑Komponente für die Live‑Vorschau einer Fahndungskarte im Wizard.
 *
 * Diese Komponente konvertiert die vom Wizard bereitgestellten Daten in das
 * Format der echten Fahndungskarte und schaltet Navigation sowie
 * Editierfunktionen ab. Dadurch bleibt die Fahndungskarte eine Single
 * Source of Truth, Änderungen an der ursprünglichen Komponente wirken sich
 * automatisch auch auf die Vorschau aus.
 */
export interface LivePreviewCardProps {
  /** Teilweise befüllte Daten aus dem Wizard. */
  data: Partial<WizardData>;
}

const LivePreviewCard: React.FC<LivePreviewCardProps> = ({ data }) => {
  // Konvertiere WizardData zu FahndungsData.
  const fahndungsData = useMemo<FahndungsData>(
    () => ({
      step1: {
        title: data.step1?.title ?? "Titel der Fahndung",
        category: (data.step1?.category as FahndungsData["step1"]["category"]) ?? "MISSING_PERSON",
        caseNumber: data.step1?.caseNumber ?? "",
      },
      step2: {
        shortDescription:
          data.step2?.shortDescription ??
          "Kurzbeschreibung wird hier angezeigt...",
        description: data.step2?.description ?? "",
        priority: (data.step2?.priority as FahndungsData["step2"]["priority"]) ?? "normal",
        tags: data.step2?.tags ?? [],
        features: data.step2?.features ?? "",
      },
      step3: {
        // Verwende entweder die bereits hochgeladene URL oder erstelle bei File‑Objekten eine ObjectURL
        mainImage:
          data.step3?.mainImageUrl ??
          (data.step3?.mainImage
            ? data.step3.mainImage instanceof File
              ? URL.createObjectURL(data.step3.mainImage)
              : data.step3.mainImage
            : "/images/placeholders/fotos/platzhalterbild.svg"),
        mainImageUrl: data.step3?.mainImageUrl ?? undefined,
        additionalImages:
          data.step3?.additionalImageUrls &&
          data.step3.additionalImageUrls.length > 0
            ? data.step3.additionalImageUrls
            : (
                data.step3?.additionalImages?.map((img) =>
                  img instanceof File ? URL.createObjectURL(img) : img,
                ) ?? []
              ),
        additionalImageUrls: data.step3?.additionalImageUrls,
      },
      step4: {
        mainLocation: data.step4?.mainLocation
          ? { address: data.step4.mainLocation.address }
          : undefined,
      },
      step5: {
        contactPerson: data.step5?.contactPerson ?? "",
        contactPhone: data.step5?.contactPhone ?? "",
        contactEmail: data.step5?.contactEmail ?? undefined,
        department: data.step5?.department ?? "",
        availableHours: data.step5?.availableHours ?? "",
      },
    }),
    [data],
  );

  // Bereinige erzeugte ObjectURLs, wenn Komponenten unmountet wird
  useEffect(() => {
    return () => {
      if (data.step3?.mainImage instanceof File) {
        URL.revokeObjectURL(fahndungsData.step3.mainImage);
      }
      data.step3?.additionalImages?.forEach((img, idx) => {
        if (img instanceof File) {
          const url = fahndungsData.step3.additionalImages[idx];
          URL.revokeObjectURL(url);
        }
      });
    };
    // Wir möchten nur beim Unmount ausführen, daher linting ausschließen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex w-full justify-center">
      <Fahndungskarte
        data={fahndungsData}
        investigationId=""
        disableNavigation
        disableEdit
        userPermissions={{ canEdit: false, canDelete: false }}
        className="scale-90"
      />
    </div>
  );
};

export default LivePreviewCard;