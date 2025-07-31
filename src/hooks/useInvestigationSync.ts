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
      staleTime: 0, // Keine Cache-Zeit für sofortige Updates
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchInterval: 1000, // Alle 1 Sekunde automatisch refetchen
    },
  );

  // Globale Synchronisationsfunktion
  const globalSync = useCallback(() => {
    if (investigationId) {
      console.log(
        "🌍 Globale Synchronisation für Investigation:",
        investigationId,
      );
      lastUpdateRef.current = Date.now();

      // Sofortige Cache-Invalidierung für alle relevanten Queries
      void utils.post.getInvestigation.invalidate({ id: investigationId });
      void utils.post.getInvestigations.invalidate();
      void utils.post.getMyInvestigations.invalidate();

      // Manueller Refetch für alle Queries
      void refetch();
      void utils.post.getInvestigations.refetch();
      void utils.post.getMyInvestigations.refetch();
    }
  }, [investigationId, refetch, utils]);

  // Manuelle Refetch-Funktion mit verbesserter Cache-Invalidierung
  const manualRefetch = useCallback(() => {
    if (investigationId) {
      console.log("🔄 Manueller Refetch für Investigation:", investigationId);
      lastUpdateRef.current = Date.now();

      // Sofortige Cache-Invalidierung für alle relevanten Queries
      void utils.post.getInvestigation.invalidate({ id: investigationId });
      void utils.post.getInvestigations.invalidate();
      void utils.post.getMyInvestigations.invalidate();

      // Manueller Refetch
      void refetch();
    }
  }, [investigationId, refetch, utils]);

  // Sofortige Synchronisation nach Änderungen
  const syncAfterUpdate = useCallback(() => {
    console.log("⚡ Sofortige Synchronisation nach Update");

    // Globale Synchronisation
    globalSync();
  }, [globalSync]);

  // Automatische Synchronisation alle 1 Sekunde
  useEffect(() => {
    if (!investigationId) return;

    syncIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateRef.current;

      // Nur refetchen wenn keine kürzlichen Updates
      if (timeSinceLastUpdate > 1000) {
        console.log("🔄 Automatische Synchronisation");
        manualRefetch();
      }
    }, 1000);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [investigationId, manualRefetch]);

  // Event Listener für Browser-Fokus (wenn Tab wieder aktiv wird)
  useEffect(() => {
    const handleFocus = () => {
      console.log("🔄 Browser-Fokus - Synchronisiere Daten");
      globalSync();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [globalSync]);

  // Event Listener für Online-Status
  useEffect(() => {
    const handleOnline = () => {
      console.log("🔄 Online-Status wiederhergestellt - Synchronisiere Daten");
      globalSync();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [globalSync]);

  // Event Listener für Visibility Change (Tab-Wechsel)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("🔄 Tab wieder sichtbar - Synchronisiere Daten");
        globalSync();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [globalSync]);

  return {
    investigation,
    isLoading,
    error,
    refetch: manualRefetch,
    syncAfterUpdate,
    globalSync,
    lastUpdateTime: lastUpdateRef.current,
  };
}
