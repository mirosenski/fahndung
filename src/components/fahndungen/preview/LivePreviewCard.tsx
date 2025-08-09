"use client";

import React, { useMemo, useEffect, useRef, memo } from "react";
import type { WizardData } from "../types/WizardTypes";
import type { FahndungsData } from "~/components/fahndungskarte/types";
import dynamic from "next/dynamic";

const Fahndungskarte = dynamic(
  () => import("~/components/fahndungskarte/Fahndungskarte"),
  { ssr: false },
);

export interface LivePreviewCardProps {
  data: Partial<WizardData>;
}

// PERFORMANCE FIX: Memoize component und verwende stabile Object URLs
const LivePreviewCard = memo<LivePreviewCardProps>(
  ({ data }) => {
    // Cache für Object URLs um Memory Leaks zu vermeiden
    const urlCache = useRef<Map<File, string>>(new Map());

    // Cleanup URLs beim Unmount
    useEffect(() => {
      const cache = urlCache.current;
      return () => {
        cache.forEach((url) => URL.revokeObjectURL(url));
        cache.clear();
      };
    }, []);

    // Optimierte URL Generierung mit Cache
    const getObjectUrl = (file: File | null): string | null => {
      if (!file) return null;
      if (!(file instanceof File)) return (file as unknown as string) ?? null;

      if (!urlCache.current.has(file)) {
        const url = URL.createObjectURL(file);
        urlCache.current.set(file, url);
      }
      return urlCache.current.get(file) ?? null;
    };

    // PERFORMANCE: Nur relevante Teile memoizen
    const fahndungsData = useMemo<FahndungsData>(
      () => ({
        step1: {
          title: data.step1?.title ?? "Titel der Fahndung",
          category: data.step1?.category ?? "MISSING_PERSON",
          caseNumber: data.step1?.caseNumber ?? "",
        },
        step2: {
          shortDescription:
            data.step2?.shortDescription ?? "Kurzbeschreibung...",
          description: data.step2?.description ?? "",
          priority: data.step2?.priority ?? "normal",
          tags: data.step2?.tags ?? [],
          features: data.step2?.features ?? "",
        },
        step3: {
          mainImage:
            data.step3?.mainImageUrl ??
            getObjectUrl(data.step3?.mainImage ?? null) ??
            "/images/placeholders/fotos/platzhalterbild.svg",
          mainImageUrl: data.step3?.mainImageUrl ?? undefined,
          additionalImages: data.step3?.additionalImageUrls ?? [],
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
          contactEmail: data.step5?.contactEmail,
          department: data.step5?.department ?? "",
          availableHours: data.step5?.availableHours ?? "",
        },
      }),
      [
        // Granulare Dependencies für bessere Performance
        data.step1?.title,
        data.step1?.category,
        data.step1?.caseNumber,
        data.step2?.shortDescription,
        data.step2?.description,
        data.step2?.priority,
        data.step2?.tags,
        data.step2?.features,
        data.step3?.mainImage,
        data.step3?.mainImageUrl,
        data.step3?.additionalImageUrls,
        data.step4?.mainLocation,
        data.step5?.contactPerson,
        data.step5?.contactPhone,
        data.step5?.contactEmail,
        data.step5?.department,
        data.step5?.availableHours,
      ],
    );

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
  },
  (prevProps, nextProps) => {
    // Custom comparison für noch bessere Performance
    return JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data);
  },
);

LivePreviewCard.displayName = "LivePreviewCard";
export default LivePreviewCard;
