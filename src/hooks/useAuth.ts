import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "~/lib/supabase";
import { getCurrentSession, clearAuthSession } from "~/lib/auth";
import type { Session } from "~/lib/auth";

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Session prüfen
  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

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
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
      setSession(null);

      // Bei Auth-Fehlern Session bereinigen
      await clearAuthSession();
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout mit verbesserter Fehlerbehandlung
  const logout = useCallback(async () => {
    try {
      console.log("🔐 Starte Logout-Prozess...");

      // Lokale Session-Daten bereinigen
      if (typeof window !== "undefined") {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.includes("supabase")) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));

        // Auch sessionStorage bereinigen
        sessionStorage.clear();
      }

      // Supabase-Logout versuchen (auch wenn Session bereits fehlt)
      if (supabase) {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.log(
              "ℹ️ Logout-Fehler (normal bei fehlender Session):",
              error?.message,
            );
          }
        } catch (err) {
          console.log(
            "ℹ️ Logout-Ausnahme (normal bei fehlender Session):",
            err,
          );
        }
      }

      setSession(null);
      console.log("✅ Logout erfolgreich abgeschlossen");

      // Zur Login-Seite weiterleiten
      router.push("/login");
    } catch (err) {
      console.error("❌ Unerwarteter Fehler beim Logout:", err);
      setError("Fehler beim Abmelden");

      // Trotzdem zur Login-Seite weiterleiten
      router.push("/login");
    }
  }, [router]);

  // Initial Session prüfen
  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  // Session-Listener für Änderungen
  useEffect(() => {
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "🔐 Auth State Change:",
        event,
        session ? "Session vorhanden" : "Keine Session",
      );

      if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        setSession(null);
      } else if (event === "SIGNED_IN" && session) {
        await checkSession();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkSession]);

  return {
    session,
    loading,
    error,
    logout,
    checkSession,
    isAuthenticated: !!session,
  };
};
