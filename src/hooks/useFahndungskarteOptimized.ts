import { useMemo, useCallback } from "react";
import { useInvestigationSync } from "./useInvestigationSync";
import { InvestigationDataConverter } from "~/lib/services/investigationDataConverter";
import type { FahndungsData } from "~/components/fahndungskarte/types";
import { mockData } from "~/components/fahndungskarte/mockData";

/**
 * Optimierte Hook für Fahndungskarten mit reduzierten Queries
 * Stellt sicher, dass nur eine Query pro Investigation ausgeführt wird
 */
/**
 * Liefert optimierte Daten für die Fahndungskarte. Wenn keine
 * `investigationId` übergeben wird oder die ID ein leerer String ist,
 * wird kein Backend‑Request ausgelöst und stattdessen `propData`
 * direkt verwendet. Dadurch kann die Hook auch im Vorschau‑Modus
 * (z. B. im Wizard) verwendet werden, ohne unnötige Netzwerkaufrufe.
 *
 * @param investigationId Die ID der Fahndung; optional. Ein leerer
 *                        oder undefinierter Wert deaktiviert die
 *                        Synchronisation mit dem Backend.
 * @param propData        Bereits vorhandene Daten, die als Fallback
 *                        verwendet werden, wenn keine ID vorhanden ist.
 */
export function useFahndungskarteOptimized(
  investigationId?: string,
  propData?: FahndungsData,
) {
  // Bestimme, ob eine gültige Investigation-ID übergeben wurde. Ein leerer
  // String wird als "keine ID" behandelt.
  const hasValidId = Boolean(
    investigationId && investigationId.trim().length > 0,
  );

  const {
    investigation: syncInvestigation,
    isLoading: isSyncLoading,
    error: syncError,
    refetch: syncAfterUpdate,
  } = useInvestigationSync(hasValidId ? investigationId! : "");

  // Optimierte Datenkonvertierung mit Memoization
  const convertedData = useMemo(() => {
    // Wenn eine gültige ID vorliegt und Daten aus dem Backend vorhanden sind,
    // konvertiere diese in das UI‑Format. Ansonsten verwende propData.
    if (hasValidId && syncInvestigation) {
      const conversion = InvestigationDataConverter.toUIFormat(
        syncInvestigation as Record<string, unknown>,
      );
      return conversion.success ? conversion.data : null;
    }
    return propData;
  }, [hasValidId, syncInvestigation, propData]);

  const data = convertedData ?? mockData;
  const safeData: FahndungsData = useMemo(() => {
    const maybe = data as unknown as Partial<FahndungsData>;
    // Erstelle sichere Daten mit Fallback
    return {
      step1: {
        title: maybe.step1?.title ?? mockData.step1.title,
        category: maybe.step1?.category ?? mockData.step1.category,
        caseNumber: maybe.step1?.caseNumber ?? mockData.step1.caseNumber,
        caseDate: maybe.step1?.caseDate ?? mockData.step1.caseDate,
        department:
          maybe.step1?.department ??
          maybe.step5?.department ??
          mockData.step5.department,
        variant: maybe.step1?.variant,
      },
      step2: {
        shortDescription:
          maybe.step2?.shortDescription ?? mockData.step2.shortDescription,
        description: maybe.step2?.description ?? mockData.step2.description,
        priority: maybe.step2?.priority ?? mockData.step2.priority,
        tags: maybe.step2?.tags ?? mockData.step2.tags,
        features: maybe.step2?.features ?? mockData.step2.features,
      },
      step3: {
        mainImage: maybe.step3?.mainImage ?? mockData.step3.mainImage,
        additionalImages:
          maybe.step3?.additionalImages ?? mockData.step3.additionalImages,
      },
      step4: {
        mainLocation: maybe.step4?.mainLocation ?? mockData.step4.mainLocation,
      },
      step5: {
        contactPerson:
          maybe.step5?.contactPerson ?? mockData.step5.contactPerson,
        contactPhone: maybe.step5?.contactPhone ?? mockData.step5.contactPhone,
        contactEmail: maybe.step5?.contactEmail ?? mockData.step5.contactEmail,
        department: maybe.step5?.department ?? mockData.step5.department,
        availableHours:
          maybe.step5?.availableHours ?? mockData.step5.availableHours,
      },
    };
  }, [data]);

  // Die Daten gelten als geladen, sobald entweder aus dem Backend Daten
  // vorhanden sind oder propData bereitsteht. Wenn keine ID vorhanden ist,
  // wird die Ladezeit ausschließlich über propData bestimmt.
  const isDataLoading =
    isSyncLoading || (hasValidId ? !syncInvestigation && !propData : false);

  // Optimierte Error-Behandlung
  const networkError = useMemo(() => {
    if (syncError) {
      return syncError instanceof Error
        ? syncError
        : new Error(syncError.message || "Ein Netzwerkfehler ist aufgetreten");
    }
    return null;
  }, [syncError]);

  // Optimierte Retry-Funktion
  const handleRetry = useCallback(async () => {
    try {
      await syncAfterUpdate();
    } catch (error) {
      console.error("❌ Retry fehlgeschlagen:", error);
    }
  }, [syncAfterUpdate]);

  return {
    safeData,
    isDataLoading,
    networkError,
    handleRetry,
    syncInvestigation,
    syncAfterUpdate,
  };
}
