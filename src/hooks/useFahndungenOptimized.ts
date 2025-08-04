import { useCallback, useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import { useGlobalSync } from "./useGlobalSync";

/**
 * Optimierte Hook für Fahndungen mit aggressiver Synchronisation
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

  const utils = api.useUtils();
  const lastUpdateRef = useRef<number>(0);
  const { globalSync, syncInvestigation } = useGlobalSync();

  // Optimierte Queries mit aggressiver Synchronisation
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
      // Reduzierte Synchronisation da Real-time Updates aktiv sind
      staleTime: 0, // Sofort als veraltet markieren
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchInterval: 10000, // Alle 10 Sekunden als Fallback (Real-time ist primär)
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
      // Reduzierte Synchronisation da Real-time Updates aktiv sind
      staleTime: 0, // Sofort als veraltet markieren
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchInterval: 10000, // Alle 10 Sekunden als Fallback (Real-time ist primär)
    },
  );

  // Aktuelle Daten basierend auf View Mode
  const currentInvestigations =
    viewMode === "my" ? myInvestigations : investigations;
  const isLoading = viewMode === "my" ? isLoadingMy : isLoadingAll;

  // Manuelle Refetch-Funktion mit verbesserter Cache-Invalidierung
  const manualRefetch = useCallback(async () => {
    console.log("🔄 Manueller Refetch für Fahndungen");
    lastUpdateRef.current = Date.now();

    // Sofortige Cache-Invalidierung für alle relevanten Queries
    void utils.post.getInvestigations.invalidate();
    void utils.post.getMyInvestigations.invalidate();

    // Manueller Refetch
    if (viewMode === "my") {
      await refetchMy();
    } else {
      await refetchAll();
    }
  }, [viewMode, refetchMy, refetchAll, utils]);

  // Sofortige Synchronisation nach Änderungen
  const syncAfterUpdate = useCallback(() => {
    console.log("⚡ Sofortige Synchronisation nach Update");
    lastUpdateRef.current = Date.now();

    // Globale Synchronisation
    globalSync();
  }, [globalSync]);

  // Spezifische Synchronisation für eine Investigation
  const syncSpecificInvestigation = useCallback(
    (investigationId: string) => {
      console.log(
        "🔍 Spezifische Synchronisation für Investigation:",
        investigationId,
      );
      lastUpdateRef.current = Date.now();

      // Spezifische Synchronisation
      syncInvestigation(investigationId);
    },
    [syncInvestigation],
  );

  // Automatische Synchronisation alle 10 Sekunden (als Fallback)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateRef.current;

      // Nur refetchen wenn keine kürzlichen Updates
      if (timeSinceLastUpdate > 10000) {
        console.log(
          "🔄 Automatische Synchronisation der Fahndungen (Fallback)",
        );
        void manualRefetch();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [manualRefetch]);

  // Event Listener für Browser-Fokus (wenn Tab wieder aktiv wird)
  useEffect(() => {
    const handleFocus = () => {
      console.log("🔄 Browser-Fokus - Synchronisiere Fahndungen");
      void manualRefetch();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [manualRefetch]);

  // Event Listener für Visibility Change (Tab-Wechsel)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("🔄 Tab wieder sichtbar - Synchronisiere Fahndungen");
        void manualRefetch();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [manualRefetch]);

  return {
    investigations: currentInvestigations,
    isLoading,
    refetch: manualRefetch,
    syncAfterUpdate,
    syncSpecificInvestigation,
    lastUpdateTime: lastUpdateRef.current,
  };
}
