import { useState, useEffect, useCallback } from "react";
import { api } from "~/trpc/react";
import { InvestigationDataConverter } from "~/lib/services/investigationDataConverter";
import { isValidInvestigationId } from "~/lib/utils/validation";
import type { UIInvestigationData } from "~/lib/types/investigation.types";
import { toast } from "~/lib/toast";

export function useInvestigationEdit(investigationId: string) {
  const utils = api.useUtils();

  // Validiere investigationId
  const isValidId = isValidInvestigationId(investigationId);

  const {
    data: dbInvestigation,
    isLoading: isLoadingData,
    refetch,
  } = api.post.getInvestigation.useQuery(
    { id: investigationId },
    {
      enabled: isValidId, // Nur ausführen wenn ID gültig ist
      // Reduzierte Synchronisation für bessere Performance
      staleTime: 60 * 1000, // 60 Sekunden Cache (erhöht von 30s)
      refetchOnWindowFocus: false, // Verhindert unnötige Refetches
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchInterval: 120000, // Alle 2 Minuten (reduziert von 30s)
      retry: (failureCount, error) => {
        // Retry-Logik verbessern
        if (failureCount < 2) { // Reduziert von 3 auf 2
          console.log(`🔄 Retry ${failureCount + 1}/2 für getInvestigation (Edit)`);
          return true;
        }
        console.error("❌ Max retries erreicht für getInvestigation (Edit):", error);
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 10000), // Reduziert
    },
  );

  // Update mutation hook
  const updateMutation = api.post.updateInvestigation.useMutation({
    onSuccess: () => {
      toast.success("Fahndung erfolgreich gespeichert");
      setIsEditMode(false);
    },
    onError: (error) => {
      console.error("Fehler beim Speichern:", error);
      toast.error("Fehler beim Speichern der Fahndung");
    },
  });

  const [editedData, setEditedData] = useState<UIInvestigationData | null>(
    null,
  );
  const [isEditMode, setIsEditMode] = useState(false);

  // Update edited data when dbInvestigation changes
  useEffect(() => {
    if (dbInvestigation) {
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 DEBUG: Rohdaten aus DB:", dbInvestigation);
      }

      // Konvertiere die Daten mit dem InvestigationDataConverter
      const conversion = InvestigationDataConverter.toUIFormat(
        dbInvestigation as Record<string, unknown>,
      );
      if (conversion.success) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            "✅ DEBUG: Datenkonvertierung erfolgreich:",
            conversion.data,
          );
        }
        setEditedData(conversion.data);
      } else {
        if (process.env.NODE_ENV === "development") {
          console.error(
            "❌ DEBUG: Fehler bei der Datenkonvertierung:",
            conversion.error,
          );
        }
        // Fallback: Verwende die Rohdaten mit Standardwerten
        const fallbackData: UIInvestigationData = {
          step1: {
            title: dbInvestigation.title ?? "",
            category:
              (dbInvestigation.category as
                | "WANTED_PERSON"
                | "MISSING_PERSON"
                | "UNKNOWN_DEAD"
                | "STOLEN_GOODS") ?? "MISSING_PERSON",
            caseNumber: dbInvestigation.case_number ?? "",
          },
          step2: {
            shortDescription: dbInvestigation.short_description ?? "",
            description: dbInvestigation.description ?? "",
            priority: dbInvestigation.priority ?? "normal",
            tags: dbInvestigation.tags ?? [],
            features: dbInvestigation.features ?? "",
          },
          step3: {
            mainImage:
              dbInvestigation.images?.[0]?.url ?? null,
            additionalImages:
              dbInvestigation.images
                ?.slice(1)
                .map((img) => img.url) ?? [],
          },
          step4: {
            mainLocation: {
              address: dbInvestigation.location ?? "",
            },
          },
          step5: {
            contactPerson: dbInvestigation.contact_info?.["person"] as string ?? "",
            contactPhone: dbInvestigation.contact_info?.["phone"] as string ?? "",
            contactEmail: dbInvestigation.contact_info?.["email"] as string ?? "",
            department: dbInvestigation.station ?? "",
            availableHours: dbInvestigation.contact_info?.["hours"] as string ?? "",
          },
          images: dbInvestigation.images ?? [],
          contact_info: dbInvestigation.contact_info ?? {},
        };
        setEditedData(fallbackData);
      }
    }
  }, [dbInvestigation]);

  // Optimierte Update-Funktion
  const updateField = useCallback(
    (step: keyof UIInvestigationData, field: string, value: unknown) => {
      setEditedData((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          [step]: {
            ...prev[step],
            [field]: value,
          },
        };
      });
    },
    [],
  );

  // Optimierte Save-Funktion
  const save = useCallback(async () => {
    if (!editedData) {
      toast.error("Keine Daten zum Speichern vorhanden");
      return;
    }

    try {
      // Validierung vor dem Speichern
      const validation = InvestigationDataConverter.validateForSave(editedData);
      if (!validation.isValid) {
        toast.error("Validierungsfehler: " + validation.errors.join(", "));
        return;
      }

      // Konvertierung zu API-Format
      const apiData = InvestigationDataConverter.toAPIFormat(editedData);

      // Speichern
      await updateMutation.mutateAsync({
        id: investigationId,
        ...apiData,
      });

      // Cache invalidieren
      void utils.post.getInvestigation.invalidate({ id: investigationId });
      void utils.post.getInvestigations.invalidate();
      void utils.post.getMyInvestigations.invalidate();

      // Refetch für sofortige Updates
      await refetch();

      toast.success("Fahndung erfolgreich gespeichert");
      setIsEditMode(false);
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      toast.error("Fehler beim Speichern der Fahndung");
    }
  }, [editedData, investigationId, refetch, utils, updateMutation]);

  // Optimierte Global Sync Funktion
  const globalSync = useCallback(() => {
    console.log(
      "🔄 Globale Synchronisation für Investigation:",
      investigationId,
    );

    // Cache invalidieren
    void utils.post.getInvestigation.invalidate({ id: investigationId });
    void utils.post.getInvestigations.invalidate();
    void utils.post.getMyInvestigations.invalidate();

    // Refetch für sofortige Updates
    void refetch();
  }, [investigationId, refetch, utils]);

  return {
    editedData,
    isEditMode,
    isLoading: isLoadingData,
    updateField,
    save,
    globalSync,
  };
}
