import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { InvestigationDataConverter } from "~/lib/services/investigationDataConverter";
import type { UIInvestigationData } from "~/lib/types/investigation.types";
import { z } from "zod";

export function useInvestigationEdit(investigationId: string) {
  const {
    data: dbInvestigation,
    isLoading: isLoadingData,
    refetch,
  } = api.post.getInvestigation.useQuery({ id: investigationId });

  // Update-Mutation hinzufügen
  const updateMutation = api.post.updateInvestigation.useMutation({
    onSuccess: () => {
      toast.success("Änderungen erfolgreich gespeichert");
      // Refetch der Daten nach erfolgreichem Speichern
      void refetch();
    },
    onError: (error) => {
      toast.error(`Fehler beim Speichern: ${error.message}`);
    },
  });

  // Delete-Mutation hinzufügen
  const deleteMutation = api.post.deleteInvestigation.useMutation({
    onSuccess: () => {
      toast.success("Fahndung erfolgreich gelöscht");
    },
    onError: (error) => {
      toast.error(`Fehler beim Löschen: ${error.message}`);
    },
  });

  // Publish-Mutation hinzufügen
  const publishMutation = api.post.updateInvestigation.useMutation({
    onSuccess: () => {
      toast.success("Fahndung erfolgreich veröffentlicht");
      void refetch();
    },
    onError: (error) => {
      toast.error(`Fehler beim Veröffentlichen: ${error.message}`);
    },
  });

  // Archive-Mutation hinzufügen
  const archiveMutation = api.post.updateInvestigation.useMutation({
    onSuccess: () => {
      toast.success("Fahndung erfolgreich archiviert");
      void refetch();
    },
    onError: (error) => {
      toast.error(`Fehler beim Archivieren: ${error.message}`);
    },
  });

  const [editState, setEditState] = useState<{
    isEditing: boolean;
    isDirty: boolean;
    errors: string[];
    validationWarnings: string[];
    original: UIInvestigationData | null;
    current: UIInvestigationData | null;
  }>({
    isEditing: false,
    isDirty: false,
    errors: [],
    validationWarnings: [],
    original: null,
    current: null,
  });

  // Initialisiere Daten wenn geladen
  useEffect(() => {
    if (dbInvestigation && !editState.original) {
      const converted = InvestigationDataConverter.toUIFormat(
        dbInvestigation as unknown as Record<string, unknown>,
      );

      if (converted.success) {
        setEditState((prev) => ({
          ...prev,
          original: converted.data,
          current: converted.data,
        }));
      } else {
        // Zeige Warnungen, aber lade trotzdem die Daten
        console.warn("Daten-Validierungswarnungen:", converted.error);

        // Erstelle Fallback-Daten
        const fallbackData = createFallbackData(
          dbInvestigation as unknown as Record<string, unknown>,
        );
        setEditState((prev) => ({
          ...prev,
          original: fallbackData,
          current: fallbackData,
          validationWarnings:
            converted.error instanceof z.ZodError
              ? converted.error.errors.map(
                  (e) => `${e.path.join(".")}: ${e.message}`,
                )
              : [converted.error.message],
        }));
      }
    }
  }, [dbInvestigation, editState.original]);

  const updateField = useCallback(
    (step: keyof UIInvestigationData, field: string, value: unknown) => {
      setEditState((prev) => {
        if (!prev.current) return prev;

        const updated = {
          ...prev.current,
          [step]: {
            ...prev.current[step],
            [field]: value,
          },
        };

        return {
          ...prev,
          current: updated,
          isDirty: true,
          errors: [], // Clear errors when user makes changes
        };
      });
    },
    [],
  );

  const startEditing = useCallback(() => {
    setEditState((prev) => ({
      ...prev,
      isEditing: true,
      errors: [],
    }));
  }, []);

  const cancel = useCallback(() => {
    setEditState((prev) => ({
      ...prev,
      isEditing: false,
      current: prev.original,
      isDirty: false,
      errors: [],
    }));
  }, []);

  const save = useCallback(async () => {
    console.log("🔍 DEBUG: save Funktion aufgerufen");
    console.log("🔍 DEBUG: editState.current:", editState.current);
    console.log("🔍 DEBUG: editState.original:", editState.original);
    console.log("🔍 DEBUG: dbInvestigation:", dbInvestigation);

    if (!editState.current || !editState.original) {
      console.error("❌ DEBUG: Keine Daten zum Speichern verfügbar");
      toast.error("Keine Daten zum Speichern verfügbar");
      return;
    }

    // Verwende die echte UUID aus der Datenbankabfrage
    const realInvestigationId = dbInvestigation?.id;
    if (!realInvestigationId) {
      console.error("❌ DEBUG: Keine echte UUID verfügbar");
      toast.error("Fahndung konnte nicht gefunden werden");
      return;
    }

    console.log("🔍 DEBUG: Validiere Daten...");
    // Validiere nur Benutzereingaben beim Speichern
    const validation = InvestigationDataConverter.validateForSave(
      editState.current,
    );
    console.log("🔍 DEBUG: Validierungsergebnis:", validation);

    if (!validation.isValid) {
      console.error("❌ DEBUG: Validierungsfehler:", validation.errors);
      toast.error("Bitte korrigieren Sie die Fehler vor dem Speichern");
      setEditState((prev) => ({
        ...prev,
        errors: validation.errors,
      }));
      return;
    }

    console.log("🔍 DEBUG: Konvertiere UI-Daten zu API-Format...");
    // Konvertiere UI-Daten in API-Format
    const apiData = InvestigationDataConverter.toAPIFormat(editState.current);
    console.log("🔍 DEBUG: API-Daten:", apiData);

    try {
      console.log("🔍 DEBUG: Sende Update-Request...");
      console.log("🔍 DEBUG: echte UUID:", realInvestigationId);
      console.log("🔍 DEBUG: Vollständige Request-Daten:", {
        id: realInvestigationId,
        ...apiData,
      });

      await updateMutation.mutateAsync({
        id: realInvestigationId,
        ...apiData,
      });

      console.log("✅ DEBUG: Update erfolgreich!");
      // Update local state nach erfolgreichem Speichern
      setEditState((prev) => ({
        ...prev,
        isEditing: false,
        original: prev.current,
        isDirty: false,
        errors: [],
      }));
    } catch (error) {
      console.error("❌ DEBUG: Save error:", error);
      // Error wird bereits in onError behandelt
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateMutation, dbInvestigation]);

  const deleteInvestigation = useCallback(async () => {
    const realInvestigationId = dbInvestigation?.id;
    if (!realInvestigationId) {
      toast.error("Fahndung konnte nicht gefunden werden");
      return;
    }

    try {
      await deleteMutation.mutateAsync({ id: realInvestigationId });
    } catch (error) {
      console.error("Delete error:", error);
      // Error wird bereits in onError behandelt
    }
  }, [deleteMutation, dbInvestigation]);

  const publishInvestigation = useCallback(async () => {
    const realInvestigationId = dbInvestigation?.id;
    if (!realInvestigationId) {
      toast.error("Fahndung konnte nicht gefunden werden");
      return;
    }

    try {
      await publishMutation.mutateAsync({
        id: realInvestigationId,
        status: "published",
      });
    } catch (error) {
      console.error("Publish error:", error);
      // Error wird bereits in onError behandelt
    }
  }, [publishMutation, dbInvestigation]);

  const archiveInvestigation = useCallback(async () => {
    const realInvestigationId = dbInvestigation?.id;
    if (!realInvestigationId) {
      toast.error("Fahndung konnte nicht gefunden werden");
      return;
    }

    try {
      await archiveMutation.mutateAsync({
        id: realInvestigationId,
        status: "archived",
      });
    } catch (error) {
      console.error("Archive error:", error);
      // Error wird bereits in onError behandelt
    }
  }, [archiveMutation, dbInvestigation]);

  const unpublishInvestigation = useCallback(async () => {
    const realInvestigationId = dbInvestigation?.id;
    if (!realInvestigationId) {
      toast.error("Fahndung konnte nicht gefunden werden");
      return;
    }

    try {
      await publishMutation.mutateAsync({
        id: realInvestigationId,
        status: "draft",
      });
    } catch (error) {
      console.error("Unpublish error:", error);
      // Error wird bereits in onError behandelt
    }
  }, [publishMutation, dbInvestigation]);

  return {
    ...editState,
    isLoading: isLoadingData,
    updateField,
    startEditing,
    cancel,
    save,
    deleteInvestigation,
    publishInvestigation,
    archiveInvestigation,
    unpublishInvestigation,
  };
}

// Hilfsfunktion für Fallback-Daten
function createFallbackData(
  dbData: Record<string, unknown>,
): UIInvestigationData {
  return {
    step1: {
      title: (dbData["title"] as string) ?? "Unbekannt",
      category:
        (dbData["category"] as
          | "WANTED_PERSON"
          | "MISSING_PERSON"
          | "UNKNOWN_DEAD"
          | "STOLEN_GOODS") ?? "MISSING_PERSON",
      caseNumber: dbData["case_number"] as string,
    },
    step2: {
      shortDescription: (dbData["short_description"] as string) ?? "",
      description: (dbData["description"] as string) ?? "",
      priority: (dbData["priority"] as "normal" | "urgent" | "new") ?? "normal",
      tags: (dbData["tags"] as string[]) ?? [],
      features: (dbData["features"] as string) ?? "",
    },
    step3: {
      mainImage: (dbData["images"] as Array<{ url: string }>)?.[0]?.url ?? null,
      additionalImages:
        (dbData["images"] as Array<{ url: string }>)
          ?.slice(1)
          .map((img) => img.url) ?? [],
    },
    step4: {
      mainLocation: dbData["location"]
        ? { address: dbData["location"] as string }
        : null,
    },
    step5: {
      contactPerson: "Polizei",
      contactPhone: "+49 711 8990-0",
      contactEmail: "",
      department: "Polizeipräsidium",
      availableHours: "24/7",
    },
    images:
      (dbData["images"] as Array<{
        id: string;
        url: string;
        alt_text?: string;
        caption?: string;
      }>) ?? [],
    contact_info: (dbData["contact_info"] as Record<string, unknown>) ?? {},
  };
}
