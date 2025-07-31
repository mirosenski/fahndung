import { useCallback, useEffect, useRef } from "react";
import { api } from "~/trpc/react";

/**
 * Globale Synchronisations-Hook für sofortige Updates in allen Komponenten
 * Stellt sicher, dass Änderungen sofort in Fahndungskarten und Detailseiten sichtbar sind
 */
export function useGlobalSync() {
  const utils = api.useUtils();
  const lastSyncRef = useRef<number>(0);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Globale Synchronisationsfunktion
  const globalSync = useCallback(() => {
    console.log("🌍 Globale Synchronisation aller Fahndungen");
    lastSyncRef.current = Date.now();

    // Sofortige Cache-Invalidierung für alle relevanten Queries
    void utils.post.getInvestigations.invalidate();
    void utils.post.getMyInvestigations.invalidate();

    // Manueller Refetch für alle Queries
    void utils.post.getInvestigations.refetch();
    void utils.post.getMyInvestigations.refetch();
  }, [utils]);

  // Spezifische Synchronisation für eine Investigation
  const syncInvestigation = useCallback(
    (investigationId: string) => {
      console.log(
        "🔍 Spezifische Synchronisation für Investigation:",
        investigationId,
      );
      lastSyncRef.current = Date.now();

      // Sofortige Cache-Invalidierung für alle relevanten Queries
      void utils.post.getInvestigation.invalidate({ id: investigationId });
      void utils.post.getInvestigations.invalidate();
      void utils.post.getMyInvestigations.invalidate();

      // Manueller Refetch für alle Queries
      void utils.post.getInvestigation.refetch({ id: investigationId });
      void utils.post.getInvestigations.refetch();
      void utils.post.getMyInvestigations.refetch();
    },
    [utils],
  );

  // Automatische globale Synchronisation alle 2 Sekunden
  useEffect(() => {
    syncIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceLastSync = now - lastSyncRef.current;

      // Nur synchronisieren wenn keine kürzlichen Updates
      if (timeSinceLastSync > 2000) {
        console.log("🔄 Automatische globale Synchronisation");
        globalSync();
      }
    }, 2000);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [globalSync]);

  // Event Listener für Browser-Fokus (wenn Tab wieder aktiv wird)
  useEffect(() => {
    const handleFocus = () => {
      console.log("🔄 Browser-Fokus - Globale Synchronisation");
      globalSync();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [globalSync]);

  // Event Listener für Online-Status
  useEffect(() => {
    const handleOnline = () => {
      console.log(
        "🔄 Online-Status wiederhergestellt - Globale Synchronisation",
      );
      globalSync();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [globalSync]);

  // Event Listener für Visibility Change (Tab-Wechsel)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("🔄 Tab wieder sichtbar - Globale Synchronisation");
        globalSync();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [globalSync]);

  return {
    globalSync,
    syncInvestigation,
    lastSyncTime: lastSyncRef.current,
  };
}
