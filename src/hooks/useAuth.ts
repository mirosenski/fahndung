"use client";

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
  const maxRetries = 1; // RADIKALE OPTIMIERUNG: Nur 1 Retry

  // Verbesserte Session-Prüfung mit Retry-Logic
  const checkSession = useCallback(async (force = false) => {
    // Verhindere gleichzeitige Session-Checks
    if (isCheckingSession.current && !force) {
      return;
    }

    // Verhindere zu viele Retries
    if (retryCount.current >= maxRetries && !force) {
      setSession(null);
      setLoading(false);
      setInitialized(true);
      return;
    }

    isCheckingSession.current = true;
    setLoading(true);
    setError(null);
    setTimeoutReached(false);

    try {
      // RADIKALE OPTIMIERUNG: Noch kürzerer Timeout
      const sessionPromise = getCurrentSession();
      const timeoutPromise = new Promise<null>(
        (resolve) => setTimeout(() => resolve(null), 800), // Reduziert von 1500ms auf 800ms
      );

      const currentSession = await Promise.race([
        sessionPromise,
        timeoutPromise,
      ]);

      if (currentSession) {
        setSession(currentSession);
        retryCount.current = 0; // Reset retry count on success
      } else {
        setSession(null);
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

  const logout = useCallback(async () => {
    try {
      // Session bereinigen
      await clearAuthSession();

      // Session-State zurücksetzen
      setSession(null);
      setLoading(false);
      setInitialized(true);
      setError(null);
      retryCount.current = 0; // Reset retry count

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

    void checkSession();
  }, [checkSession]);

  // Session-Listener für Änderungen - nur einmal setup
  useEffect(() => {
    if (!supabase || authListenerSetup.current) return;

    authListenerSetup.current = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "🔐 Auth State Change:",
        event,
        session ? "Session vorhanden" : "Keine Session",
      );

      // RADIKALE OPTIMIERUNG: Sofortige Reaktion ohne Verzögerungen
      if (event === "SIGNED_OUT") {
        // Sofortige Reaktion für Logout
        setSession(null);
        setLoading(false);
        setInitialized(true);
        setError(null);
        retryCount.current = 0;
      } else if (event === "SIGNED_IN" && session) {
        // Sofortige Reaktion für Login
        // Konvertiere Supabase Session zu benutzerdefinierter Session
        const customSession = {
          user: {
            id: session.user.id,
            email: session.user.email ?? "",
          },
          profile: null, // Wird später geladen
        };
        setSession(customSession);
        setLoading(false);
        setInitialized(true);
        setError(null);
        retryCount.current = 0;
      }
      // TOKEN_REFRESHED und andere Events komplett ignorieren
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Zusätzlicher Effect für Message Port Error Handling
  useEffect(() => {
    const handleMessagePortError = (event: ErrorEvent) => {
      if (event.message.includes("message port closed")) {
        // Ignoriere Message Port Fehler - sie sind normal bei Tab-Wechsel
        return true;
      }
      return false;
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason as unknown;
      if (reason && typeof reason === "object" && "message" in reason) {
        const message = String((reason as { message: unknown }).message);
        if (message.includes("403") ?? message.includes("Forbidden")) {
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
    loading: loading ?? !initialized,
    error,
    logout,
    checkSession,
    isAuthenticated: !!session,
    initialized,
    timeoutReached,
  };
};
