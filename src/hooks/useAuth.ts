"use client";

/* eslint-disable @typescript-eslint/prefer-optional-chain */
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "~/lib/supabase";
import {
  getCurrentSession,
  clearAuthSession,
  handle403Error,
} from "~/lib/auth";
import type { Session } from "~/lib/auth";

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const router = useRouter();

  // Ref für Session-Check Status um Endlosschleifen zu verhindern
  const isCheckingSession = useRef(false);
  const hasInitialized = useRef(false);
  const authListenerSetup = useRef(false);
  const retryCount = useRef(0);
  const maxRetries = 3;

  // Verbesserte Session-Prüfung mit Retry-Logic
  const checkSession = useCallback(async (force = false) => {
    // Verhindere gleichzeitige Session-Checks
    if (isCheckingSession.current && !force) {
      console.log("🔍 useAuth: Session-Check bereits läuft, überspringe...");
      return;
    }

    // Verhindere zu viele Retries
    if (retryCount.current >= maxRetries && !force) {
      console.log("🔍 useAuth: Max Retries erreicht, überspringe...");
      setLoading(false);
      setInitialized(true);
      return;
    }

    isCheckingSession.current = true;
    setLoading(true);
    setError(null);
    setTimeoutReached(false);

    try {
      console.log(
        "🔍 useAuth: Prüfe Session... (Versuch",
        retryCount.current + 1,
        ")",
      );

      // Einfache Session-Prüfung ohne Race-Conditions
      const currentSession = await getCurrentSession();

      if (currentSession) {
        setSession(currentSession);
        retryCount.current = 0; // Reset retry count on success
        console.log("✅ Session erfolgreich geladen");
      } else {
        setSession(null);
        console.log("ℹ️ Keine aktive Session gefunden");
      }
    } catch (err) {
      console.error("❌ Fehler beim Prüfen der Session:", err);

      // 403-Fehler spezifisch behandeln
      await handle403Error(err);

      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
      setSession(null);

      // Bei Timeout-Fehlern Session bereinigen
      if (err instanceof Error && err.message.includes("Timeout")) {
        setTimeoutReached(true);
        await clearAuthSession();
      }

      // Increment retry count
      retryCount.current++;
    } finally {
      setLoading(false);
      setInitialized(true);
      isCheckingSession.current = false;
      hasInitialized.current = true;
    }
  }, []);

  // Verbesserte Logout-Funktion
  const logout = useCallback(async () => {
    try {
      console.log("🔐 Starte Logout-Prozess...");

      // Zuerst lokale Storage bereinigen
      if (typeof window !== "undefined") {
        try {
          // Alle Supabase-bezogenen Daten bereinigen
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes("supabase")) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach((key) => localStorage.removeItem(key));
          sessionStorage.clear();
          console.log("✅ Lokale Storage bereinigt");
        } catch (storageError) {
          console.error(
            "⚠️ Fehler beim Bereinigen des lokalen Storage:",
            storageError,
          );
        }
      }

      // Dann Supabase-Abmeldung mit verbesserter Fehlerbehandlung
      if (supabase) {
        try {
          // Zuerst prüfen, ob eine Session existiert
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) {
            console.log(
              "ℹ️ Session-Fehler beim Logout (normal):",
              sessionError.message,
            );
          } else if (!session) {
            console.log("ℹ️ Keine aktive Session gefunden - normal");
          } else {
            // Nur abmelden, wenn eine Session existiert
            const { error } = await supabase.auth.signOut({
              scope: "local", // Verwende lokalen Scope statt global
            });
            if (error) {
              console.log("ℹ️ Supabase Logout-Fehler (normal):", error.message);
            } else {
              console.log("✅ Supabase Logout erfolgreich");
            }
          }
        } catch (err) {
          console.log("ℹ️ Logout-Ausnahme (normal):", err);
        }
      }

      // Session-State zurücksetzen
      setSession(null);
      setLoading(false);
      setInitialized(true);
      setError(null);
      retryCount.current = 0; // Reset retry count

      console.log("✅ Logout erfolgreich abgeschlossen");
      router.push("/login");
    } catch (err) {
      console.error("❌ Unerwarteter Fehler beim Logout:", err);
      setError("Fehler beim Abmelden");

      // Auch bei Fehlern zur Login-Seite weiterleiten
      router.push("/login");
    }
  }, [router]);

  // Initial Session prüfen - nur einmal beim Mount
  useEffect(() => {
    if (hasInitialized.current) return;

    console.log("🚀 useAuth: Initial Session-Check...");
    void checkSession();
  }, [checkSession]);

  // Session-Listener für Änderungen - nur einmal setup
  useEffect(() => {
    if (!supabase || authListenerSetup.current) return;

    console.log("🔐 useAuth: Setup Auth State Listener...");
    authListenerSetup.current = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "🔐 Auth State Change:",
        event,
        session ? "Session vorhanden" : "Keine Session",
      );

      // Vereinfachte Event-Behandlung
      if (event === "SIGNED_OUT") {
        setSession(null);
        setLoading(false);
        setInitialized(true);
        retryCount.current = 0; // Reset retry count
      } else if (event === "SIGNED_IN" && session) {
        // Nur bei SIGNED_IN erneut prüfen
        retryCount.current = 0; // Reset retry count
        await checkSession(true);
      }
      // TOKEN_REFRESHED ignorieren um Schleifen zu vermeiden
    });

    return () => {
      console.log("🔐 useAuth: Cleanup Auth State Listener...");
      subscription?.unsubscribe();
    };
  }, [checkSession]);

  // Zusätzlicher Effect für Message Port Error Handling
  useEffect(() => {
    const handleMessagePortError = (event: ErrorEvent) => {
      if (event.message.includes("message port closed")) {
        console.log("ℹ️ Message Port Error (normal):", event.message);
        // Ignoriere Message Port Fehler - sie sind normal bei Tab-Wechsel
        return true;
      }
      return false;
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason as unknown;
      if (reason && typeof reason === "object" && "message" in reason) {
        const message = String((reason as { message: unknown }).message);
        if (message.includes("403") || message.includes("Forbidden")) {
          console.log("ℹ️ 403 Error in unhandled rejection (normal):", reason);
          // Behandle 403-Fehler automatisch
          void handle403Error(reason);
          return true;
        }
      }
      return false;
    };

    // Event Listener hinzufügen
    window.addEventListener("error", handleMessagePortError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleMessagePortError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  return {
    session,
    loading: loading || !initialized,
    error,
    logout,
    checkSession,
    isAuthenticated: !!session,
    initialized,
    timeoutReached,
  };
};
