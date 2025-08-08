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
      staleTime: 10 * 60 * 1000, // 10 Minuten Cache (erhöht von 5 Minuten)
      refetchOnWindowFocus: false, // Verhindert unnötige Refetches
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchInterval: 300000, // Alle 5 Minuten als Fallback (erhöht von 60s)
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
      staleTime: 10 * 60 * 1000, // 10 Minuten Cache (erhöht von 5 Minuten)
      refetchOnWindowFocus: false, // Verhindert unnötige Refetches
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchInterval: 300000, // Alle 5 Minuten als Fallback (erhöht von 60s)
    },
  );

  // Optimierte Synchronisation mit reduzierter Frequenz
  useEffect(() => {
    const syncInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastUpdateRef.current > 60000) { // Nur alle 60 Sekunden synchronisieren
        lastUpdateRef.current = now;
        void refetchAll();
        if (viewMode === "my" && currentUser) {
          void refetchMy();
        }
      }
    }, 60000); // Reduziert von 30s auf 60s

    return () => clearInterval(syncInterval);
  }, [refetchAll, refetchMy, viewMode, currentUser]);

  // Optimierte Synchronisation für spezifische Investigation
  const syncInvestigationOptimized = useCallback(
    (investigationId: string) => {
      const now = Date.now();
      if (now - lastUpdateRef.current > 10000) { // Mindestens 10 Sekunden zwischen Syncs
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
