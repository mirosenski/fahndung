import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { InvestigationDataConverter } from "~/lib/services/investigationDataConverter";
import type { UIInvestigationData } from "~/lib/types/investigation.types";

export function useInvestigationEdit(investigationId: string) {
  const utils = api.useUtils();

  const {
    data: dbInvestigation,
    isLoading: isLoadingData,
    refetch,
  } = api.post.getInvestigation.useQuery(
    { id: investigationId },
    {
      // Reduzierte Synchronisation für bessere Performance
      staleTime: 30 * 1000, // 30 Sekunden Cache
      refetchOnWindowFocus: false, // Verhindert unnötige Refetches
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchInterval: 30000, // Alle 30 Sekunden (reduziert von 1s)
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
      console.log("🔍 DEBUG: Rohdaten aus DB:", dbInvestigation);

      // Konvertiere die Daten mit dem InvestigationDataConverter
      const conversion = InvestigationDataConverter.toUIFormat(
        dbInvestigation as unknown as Record<string, unknown>,
      );
      if (conversion.success) {
        console.log(
          "✅ DEBUG: Datenkonvertierung erfolgreich:",
          conversion.data,
        );
        setEditedData(conversion.data);
      } else {
        console.error(
          "❌ DEBUG: Fehler bei der Datenkonvertierung:",
          conversion.error,
        );
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
              (dbInvestigation.images as Array<{ url: string }>)?.[0]?.url ??
              null,
            additionalImages:
              (dbInvestigation.images as Array<{ url: string }>)
                ?.slice(1)
                .map((img) => img.url) ?? [],
          },
          step4: {
            mainLocation: dbInvestigation.location
              ? { address: dbInvestigation.location }
              : null,
          },
          step5: {
            contactPerson:
              (dbInvestigation.contact_info?.["person"] as string) ?? "Polizei",
            contactPhone:
              (dbInvestigation.contact_info?.["phone"] as string) ??
              "+49 711 8990-0",
            contactEmail:
              (dbInvestigation.contact_info?.["email"] as string) ?? "",
            department: dbInvestigation.station ?? "Polizeipräsidium",
            availableHours:
              (dbInvestigation.contact_info?.["hours"] as string) ?? "24/7",
          },
          images:
            (dbInvestigation.images as Array<{
              id: string;
              url: string;
              alt_text?: string;
              caption?: string;
            }>) ?? [],
          contact_info: dbInvestigation.contact_info! ?? {},
        };
        console.log("🔄 DEBUG: Fallback-Daten verwendet:", fallbackData);
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
