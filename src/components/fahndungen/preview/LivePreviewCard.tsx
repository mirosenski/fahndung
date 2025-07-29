"use client";

import React, { useEffect } from "react";
import { ModernFahndungskarte } from "~/components/fahndungskarte/Fahndungskarte";
import type { WizardData } from "../types/WizardTypes";

interface LivePreviewCardProps {
  data: Partial<WizardData>;
}

const LivePreviewCard: React.FC<LivePreviewCardProps> = ({ data }) => {
  // Konvertiere WizardData zu FahndungsData Format
  const fahndungsData = {
    step1: {
      title: data.step1?.title ?? "Titel der Fahndung",
      category: data.step1?.category ?? "MISSING_PERSON",
      caseNumber: data.step1?.caseNumber ?? "",
    },
    step2: {
      shortDescription:
        data.step2?.shortDescription ??
        "Kurzbeschreibung wird hier angezeigt...",
      description: data.step2?.description ?? "",
      priority: data.step2?.priority ?? "normal",
      tags: data.step2?.tags ?? [],
      features: data.step2?.features ?? "",
    },
    step3: {
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
          : (data.step3?.additionalImages?.map((img) =>
              img instanceof File ? URL.createObjectURL(img) : img,
            ) ?? []),
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
      contactEmail: data.step5?.contactEmail ?? "",
      department: data.step5?.department ?? "",
      availableHours: data.step5?.availableHours ?? "",
    },
  };

  // Cleanup für File URLs
  useEffect(() => {
    return () => {
      if (data.step3?.mainImage instanceof File) {
        const url = URL.createObjectURL(data.step3.mainImage);
        URL.revokeObjectURL(url);
      }
      data.step3?.additionalImages?.forEach((img) => {
        if (img instanceof File) {
          URL.revokeObjectURL(URL.createObjectURL(img));
        }
      });
    };
  }, [data.step3]);

  return (
    <div className="flex w-full justify-center">
      <ModernFahndungskarte data={fahndungsData} className="scale-90" />
    </div>
  );
};

export default LivePreviewCard;
