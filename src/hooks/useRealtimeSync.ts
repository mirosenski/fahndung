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

  const handleBroadcastEvent = useCallback(
    (payload: RealtimePayload) => {
      // Sofortige Cache-Invalidierung für alle relevanten Queries
      void utils.post.getInvestigations.invalidate();
      void utils.post.getMyInvestigations.invalidate();

      // Wenn eine spezifische Investigation betroffen ist
      const investigationId = payload.new?.id ?? payload.old?.id;
      if (investigationId) {
        console.log("🔍 Invalidierung für Investigation:", investigationId);
        void utils.post.getInvestigation.invalidate({ id: investigationId });
      }

      // Sofortiger Refetch für sofortige UI-Updates
      void utils.post.getInvestigations.refetch();
      void utils.post.getMyInvestigations.refetch();
    },
    [utils],
  );

  const setupSubscription = useCallback(async () => {
    console.log("🔗 Initialisiere Supabase Real-time Subscription");

    try {
      // Versuche zuerst Postgres Changes (einfacher Ansatz)
      const subscription = subscribeToInvestigations(
        (payload: RealtimePayload) => {
          console.log("📡 Real-time Update erhalten:", payload);

          // Sofortige Cache-Invalidierung für alle relevanten Queries
          void utils.post.getInvestigations.invalidate();
          void utils.post.getMyInvestigations.invalidate();

          // Wenn eine spezifische Investigation betroffen ist
          const investigationId = payload.new?.id ?? payload.old?.id;
          if (investigationId) {
            console.log("🔍 Invalidierung für Investigation:", investigationId);
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
      console.log(
        "✅ Postgres Changes Real-time Subscription erfolgreich erstellt",
      );
    } catch (error) {
      console.error(
        "❌ Fehler beim Erstellen der Postgres Changes Subscription:",
        error,
      );

      // Fallback: Versuche Broadcast-basierte Subscriptions
      try {
        console.log(
          "🔄 Versuche Broadcast-basierte Real-time Subscriptions...",
        );

        // Für Broadcast müssen wir Auth setzen
        const { supabase } = await import("~/lib/supabase");
        await supabase.realtime.setAuth();

        // Erstelle eine generische Broadcast-Subscription für alle Investigations
        const broadcastSubscription = supabase
          .channel("investigations-broadcast", {
            config: { private: true },
          })
          .on("broadcast", { event: "INSERT" }, (payload) => {
            console.log("📡 Broadcast INSERT Event:", payload);
            handleBroadcastEvent(payload);
          })
          .on("broadcast", { event: "UPDATE" }, (payload) => {
            console.log("📡 Broadcast UPDATE Event:", payload);
            handleBroadcastEvent(payload);
          })
          .on("broadcast", { event: "DELETE" }, (payload) => {
            console.log("📡 Broadcast DELETE Event:", payload);
            handleBroadcastEvent(payload);
          })
          .subscribe((status) => {
            console.log("🔗 Broadcast Real-time Subscription Status:", status);
            // Setze Connection-Status direkt nach erfolgreicher Subscription
            setIsConnected(true);
            setConnectionType("broadcast");
            setConnectionAttempts(0);
            console.log(
              "✅ Broadcast Real-time Subscription erfolgreich erstellt",
            );
          });

        subscriptionRef.current = broadcastSubscription;
      } catch (broadcastError) {
        console.error(
          "❌ Fehler beim Erstellen der Broadcast Subscription:",
          broadcastError,
        );
        setIsConnected(false);
        setConnectionType("none");

        // Automatische Reconnection nach Fehler
        if (connectionAttempts < maxReconnectAttempts) {
          console.log(
            `🔄 Reconnection Versuch ${connectionAttempts + 1}/${maxReconnectAttempts}`,
          );
          setConnectionAttempts((prev) => prev + 1);

          setTimeout(
            () => {
              void setupSubscription();
            },
            2000 * (connectionAttempts + 1),
          ); // Exponentieller Backoff
        } else {
          console.error("❌ Maximale Reconnection-Versuche erreicht");
        }
      }
    }
  }, [utils, connectionAttempts, maxReconnectAttempts, handleBroadcastEvent]);

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
