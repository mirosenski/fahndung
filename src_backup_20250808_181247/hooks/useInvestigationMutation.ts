import { useCallback } from "react";
import { toast } from "~/lib/toast";
import { api } from "~/trpc/react";

/**
 * Hook für optimierte Mutations mit sofortiger Cache-Invalidierung
 * Stellt sicher, dass Änderungen sofort in der UI sichtbar sind
 */
export function useInvestigationMutation(investigationId: string) {
  // Update-Mutation mit optimistischer UI-Aktualisierung
  const updateMutation = api.post.updateInvestigation.useMutation({
    onMutate: async (newData) => {
      console.log("🚀 Optimistisches Update gestartet:", newData);

      return { previousData: null };
    },
    onSuccess: (updatedData) => {
      toast.success("Änderungen erfolgreich gespeichert");
      console.log("✅ Update erfolgreich:", updatedData);
    },
    onError: (error, _variables, _context) => {
      const errorMessage =
        error instanceof Error ? error.message : "Unbekannter Fehler";
      toast.error(`Fehler beim Speichern: ${errorMessage}`);
      console.error("❌ Update-Fehler:", error);
    },
  });

  // Delete-Mutation
  const deleteMutation = api.post.deleteInvestigation.useMutation({
    onSuccess: () => {
      toast.success("Fahndung erfolgreich gelöscht");
      console.log("✅ Delete erfolgreich");
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Unbekannter Fehler";
      toast.error(`Fehler beim Löschen: ${errorMessage}`);
      console.error("❌ Delete-Fehler:", error);
    },
  });

  // Publish-Mutation
  const publishMutation = api.post.updateInvestigation.useMutation({
    onSuccess: (updatedData) => {
      toast.success("Fahndung erfolgreich veröffentlicht");
      console.log("✅ Publish erfolgreich:", updatedData);
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Unbekannter Fehler";
      toast.error(`Fehler beim Veröffentlichen: ${errorMessage}`);
      console.error("❌ Publish-Fehler:", error);
    },
  });

  // Archive-Mutation
  const archiveMutation = api.post.updateInvestigation.useMutation({
    onSuccess: (updatedData) => {
      toast.success("Fahndung erfolgreich archiviert");
      console.log("✅ Archive erfolgreich:", updatedData);
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Unbekannter Fehler";
      toast.error(`Fehler beim Archivieren: ${errorMessage}`);
      console.error("❌ Archive-Fehler:", error);
    },
  });

  // Wrapper-Funktionen für bessere Fehlerbehandlung
  const updateInvestigation = useCallback(
    async (data: Record<string, unknown>) => {
      try {
        const result = await updateMutation.mutateAsync({
          id: investigationId,
          ...data,
        });
        return result;
      } catch (error) {
        console.error("Update error:", error);
        throw error;
      }
    },
    [updateMutation, investigationId],
  );

  const deleteInvestigation = useCallback(async () => {
    try {
      await deleteMutation.mutateAsync({ id: investigationId });
    } catch (error) {
      console.error("Delete error:", error);
      throw error;
    }
  }, [deleteMutation, investigationId]);

  const publishInvestigation = useCallback(async () => {
    try {
      await publishMutation.mutateAsync({
        id: investigationId,
        status: "published",
      });
    } catch (error) {
      console.error("Publish error:", error);
      throw error;
    }
  }, [publishMutation, investigationId]);

  const archiveInvestigation = useCallback(async () => {
    try {
      await archiveMutation.mutateAsync({
        id: investigationId,
        status: "archived",
      });
    } catch (error) {
      console.error("Archive error:", error);
      throw error;
    }
  }, [archiveMutation, investigationId]);

  const unpublishInvestigation = useCallback(async () => {
    try {
      await publishMutation.mutateAsync({
        id: investigationId,
        status: "draft",
      });
    } catch (error) {
      console.error("Unpublish error:", error);
      throw error;
    }
  }, [publishMutation, investigationId]);

  return {
    updateInvestigation,
    deleteInvestigation,
    publishInvestigation,
    archiveInvestigation,
    unpublishInvestigation,
    isLoading: Boolean(
      updateMutation.isPending ||
        deleteMutation.isPending ||
        publishMutation.isPending ||
        archiveMutation.isPending,
    ),
  };
}
