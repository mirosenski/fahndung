import { useCallback, useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import { useGlobalSync } from "./useGlobalSync";

/**
 * Optimierte Hook für Fahndungen mit reduzierter Synchronisation
 * Stellt sicher, dass Änderungen sofort in allen Komponenten sichtbar sind
 */
export function useFahndungenOptimized(options: {
  limit?: number;
  offset?: number;
  status?: string;
  priority?: string;
  viewMode?: "all" | "my";
  currentUser?: boolean;
}) {
  const {
    limit = 50,
    offset = 0,
    status,
    priority,
    viewMode = "all",
    currentUser = false,
  } = options;

  const lastUpdateRef = useRef<number>(0);
  const { globalSync, syncInvestigation } = useGlobalSync();

  // Optimierte Queries mit reduzierter Synchronisation
  const {
    data: investigations = [],
    isLoading: isLoadingAll,
    refetch: refetchAll,
  } = api.post.getInvestigations.useQuery(
    {
      limit,
      offset,
      status: status === "all" ? undefined : status,
      priority: priority === "all" ? undefined : priority,
    },
    {
      // Reduzierte Synchronisation für bessere Performance
      staleTime: 5 * 60 * 1000, // 5 Minuten Cache (erhöht von 30s)
      refetchOnWindowFocus: false, // Verhindert unnötige Refetches
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchInterval: 60000, // Alle 60 Sekunden als Fallback (erhöht von 30s)
    },
  );

  const {
    data: myInvestigations = [],
    isLoading: isLoadingMy,
    refetch: refetchMy,
  } = api.post.getMyInvestigations.useQuery(
    { limit, offset },
    {
      enabled: viewMode === "my" && currentUser,
      // Reduzierte Synchronisation für bessere Performance
      staleTime: 5 * 60 * 1000, // 5 Minuten Cache (erhöht von 30s)
      refetchOnWindowFocus: false, // Verhindert unnötige Refetches
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchInterval: 60000, // Alle 60 Sekunden als Fallback (erhöht von 30s)
    },
  );

  // Optimierte Synchronisation mit reduzierter Frequenz
  useEffect(() => {
    const syncInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastUpdateRef.current > 30000) { // Nur alle 30 Sekunden synchronisieren
        lastUpdateRef.current = now;
        void refetchAll();
        if (viewMode === "my" && currentUser) {
          void refetchMy();
        }
      }
    }, 30000); // Reduziert von 10s auf 30s

    return () => clearInterval(syncInterval);
  }, [refetchAll, refetchMy, viewMode, currentUser]);

  // Optimierte Synchronisation für spezifische Investigation
  const syncInvestigationOptimized = useCallback(
    (investigationId: string) => {
      const now = Date.now();
      if (now - lastUpdateRef.current > 5000) { // Mindestens 5 Sekunden zwischen Syncs
        lastUpdateRef.current = now;
        syncInvestigation(investigationId);
      }
    },
    [syncInvestigation],
  );

  return {
    investigations: viewMode === "my" ? myInvestigations : investigations,
    isLoading: viewMode === "my" ? isLoadingMy : isLoadingAll,
    refetch: viewMode === "my" ? refetchMy : refetchAll,
    syncInvestigation: syncInvestigationOptimized,
    globalSync,
  };
}
