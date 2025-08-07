import { useCallback, useEffect, useRef } from "react";
import { api } from "~/trpc/react";

/**
 * Hook für bessere Synchronisation zwischen Fahndungskarten und Detailseiten
 * Stellt sicher, dass Änderungen sofort in allen Komponenten sichtbar sind
 */
export function useInvestigationSync(investigationId: string) {
  const utils = api.useUtils();
  const lastUpdateRef = useRef<number>(0);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  console.log(
    "🔍 DEBUG: useInvestigationSync aufgerufen mit ID:",
    investigationId,
  );

  // Query mit optimierter Synchronisation
  const {
    data: investigation,
    isLoading,
    error,
    refetch,
  } = api.post.getInvestigation.useQuery(
    { id: investigationId },
    {
      enabled: !!investigationId,
      staleTime: 5 * 60 * 1000, // 5 Minuten Cache (erhöht von 30s)
      refetchOnWindowFocus: false, // Verhindert unnötige Refetches
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchInterval: 60000, // Alle 60 Sekunden als Fallback (erhöht von 30s)
    },
  );

  console.log("🔍 DEBUG: Query-Status:", {
    isLoading,
    hasData: !!investigation,
    hasError: !!error,
    investigationId,
  });

  if (investigation) {
    console.log("✅ DEBUG: Investigation-Daten geladen:", {
      id: investigation.id,
      title: investigation.title,
      case_number: investigation.case_number,
      category: investigation.category,
      priority: investigation.priority,
      images_count: investigation.images?.length ?? 0,
    });
  }

  if (error) {
    console.error("❌ DEBUG: Query-Fehler:", error);
  }

  // Optimierte Cache-Invalidierung mit reduzierter Frequenz
  const invalidateCache = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdateRef.current > 5000) { // Mindestens 5 Sekunden zwischen Invalidierungen
      lastUpdateRef.current = now;
      console.log("🔄 Cache-Invalidierung für Investigation:", investigationId);
      void utils.post.getInvestigation.invalidate({ id: investigationId });
    }
  }, [investigationId, utils]);

  // Optimierte Synchronisation mit reduzierter Frequenz
  useEffect(() => {
    if (!investigationId) return;

    // Reduzierte Synchronisation alle 60 Sekunden
    syncIntervalRef.current = setInterval(() => {
      const now = Date.now();
      if (now - lastUpdateRef.current > 60000) { // Nur alle 60 Sekunden synchronisieren
        lastUpdateRef.current = now;
        console.log("🔄 Automatische Synchronisation für Investigation:", investigationId);
        void refetch();
      }
    }, 60000); // Reduziert von 30s auf 60s

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [investigationId, refetch]);

  // Optimierte manuelle Synchronisation
  const manualSync = useCallback(async () => {
    const now = Date.now();
    if (now - lastUpdateRef.current > 5000) { // Mindestens 5 Sekunden zwischen Syncs
      lastUpdateRef.current = now;
      console.log("🔄 Manuelle Synchronisation für Investigation:", investigationId);
      await refetch();
    }
  }, [investigationId, refetch]);

  return {
    investigation,
    isLoading,
    error,
    refetch: manualSync,
    invalidateCache,
    lastUpdateTime: lastUpdateRef.current,
  };
}
