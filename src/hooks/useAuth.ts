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

  // Vereinfachte Session-Prüfung ohne komplexe Timeouts
  const checkSession = useCallback(async (force = false) => {
    // Verhindere gleichzeitige Session-Checks
    if (isCheckingSession.current && !force) {
      console.log("🔍 useAuth: Session-Check bereits läuft, überspringe...");
      return;
    }

    isCheckingSession.current = true;
    setLoading(true);
    setError(null);
    setTimeoutReached(false);

    try {
      console.log("🔍 useAuth: Prüfe Session...");

      // Einfache Session-Prüfung ohne Race-Conditions
      const currentSession = await getCurrentSession();

      if (currentSession) {
        setSession(currentSession);
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
    } finally {
      setLoading(false);
      setInitialized(true);
      isCheckingSession.current = false;
      hasInitialized.current = true;
    }
  }, []);

  // Logout
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
            const { error } = await supabase.auth.signOut();
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
      } else if (event === "SIGNED_IN" && session) {
        // Nur bei SIGNED_IN erneut prüfen
        await checkSession(true);
      }
      // TOKEN_REFRESHED ignorieren um Schleifen zu vermeiden
    });

    return () => {
      console.log("🔐 useAuth: Cleanup Auth State Listener...");
      subscription?.unsubscribe();
    };
  }, [checkSession]);

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
