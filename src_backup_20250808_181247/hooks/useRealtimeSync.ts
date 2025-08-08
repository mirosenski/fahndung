"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import { subscribeToInvestigations } from "~/lib/supabase";

interface RealtimePayload {
  new?: { id?: string; [key: string]: unknown };
  old?: { id?: string; [key: string]: unknown };
  eventType?: string;
  [key: string]: unknown;
}

/**
 * Hook für Supabase Real-time Subscriptions
 * Stellt sicher, dass Änderungen sofort in allen Komponenten sichtbar sind
 */
export function useRealtimeSync() {
  const utils = api.useUtils();
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [connectionType, setConnectionType] = useState<
    "postgres" | "broadcast" | "none"
  >("none");
  const maxReconnectAttempts = 5;

  const setupSubscription = useCallback(async () => {
    try {
      // Versuche zuerst Postgres Changes (einfacher Ansatz)
      const subscription = subscribeToInvestigations(
        (payload: RealtimePayload) => {
          // Sofortige Cache-Invalidierung für alle relevanten Queries
          void utils.post.getInvestigations.invalidate();
          void utils.post.getMyInvestigations.invalidate();

          // Wenn eine spezifische Investigation betroffen ist
          const investigationId = payload.new?.id ?? payload.old?.id;
          if (investigationId) {
            void utils.post.getInvestigation.invalidate({
              id: investigationId,
            });
          }

          // Sofortiger Refetch für sofortige UI-Updates
          void utils.post.getInvestigations.refetch();
          void utils.post.getMyInvestigations.refetch();
        },
      );

      subscriptionRef.current = subscription;
      setIsConnected(true);
      setConnectionType("postgres");
      setConnectionAttempts(0);
    } catch (error) {
      console.error("❌ Real-time Subscription Fehler:", error);
      setConnectionType("none");
      setConnectionAttempts((prev) => prev + 1);
    }
  }, [utils]);

  useEffect(() => {
    void setupSubscription();

    return () => {
      console.log("🔗 Cleanup Supabase Real-time Subscription");
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      setIsConnected(false);
      setConnectionType("none");
    };
  }, [utils, setupSubscription]);

  // Automatische Reconnection bei Netzwerkänderungen
  useEffect(() => {
    const handleOnline = () => {
      console.log(
        "🌐 Netzwerk wieder online - Reconnecte Real-time Subscription",
      );
      if (!isConnected && connectionAttempts < maxReconnectAttempts) {
        void setupSubscription();
      }
    };

    const handleOffline = () => {
      console.log("🌐 Netzwerk offline - Pausiere Real-time Subscription");
      setIsConnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isConnected, connectionAttempts, setupSubscription]);

  return {
    isConnected,
    connectionAttempts,
    maxReconnectAttempts,
    connectionType,
  };
}
