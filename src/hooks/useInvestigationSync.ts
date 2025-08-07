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
      staleTime: 30 * 1000, // 30 Sekunden Cache für bessere Performance
      refetchOnWindowFocus: false, // Verhindert unnötige Refetches
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchInterval: 30000, // Alle 30 Sekunden als Fallback (reduziert von 10s)
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

  // Automatische Synchronisation alle 30 Sekunden (reduziert von 10s)
  useEffect(() => {
    if (!investigationId) return;

    syncIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateRef.current;

      // Nur refetchen wenn keine kürzlichen Updates
      if (timeSinceLastUpdate > 30000) {
        console.log("🔄 Automatische Synchronisation (Fallback)");
        manualRefetch();
      }
    }, 30000); // Reduziert von 10s auf 30s

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

  // Event Listener für Visibility Change (Tab-Wechsel) - nur bei Bedarf
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
