"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "~/hooks/useAuth";
import { clearAuthSession } from "~/lib/auth";

export function SessionManager() {
  const { session, loading, error, initialized } = useAuth();
  const hasHandledError = useRef(false);
  const lastError = useRef<string | null>(null);
  const errorCount = useRef(0);
  const maxErrorCount = 3; // Erlaubt bis zu 3 Fehler bevor abgemeldet wird

  // Verbesserte automatische Session-Bereinigung bei Fehlern
  useEffect(() => {
    if (error && !hasHandledError.current && error !== lastError.current) {
      errorCount.current++;
      console.log(
        `🔐 SessionManager: Auth-Fehler erkannt (${errorCount.current}/${maxErrorCount}):`,
        error,
      );
      
      lastError.current = error;

      // Nur bei mehreren aufeinanderfolgenden Fehlern abmelden
      if (errorCount.current >= maxErrorCount) {
        console.log(
          "🔐 SessionManager: Zu viele Auth-Fehler, bereinige Session...",
        );
        hasHandledError.current = true;

        // Session bereinigen
        void clearAuthSession();

        // Zur Login-Seite weiterleiten
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          window.location.href = "/login";
        }
      }
    }
  }, [error]);

  // Reset error handler wenn Session wiederhergestellt wird
  useEffect(() => {
    if (session && hasHandledError.current) {
      console.log(
        "🔐 SessionManager: Session wiederhergestellt, reset error handler",
      );
      hasHandledError.current = false;
      lastError.current = null;
      errorCount.current = 0; // Reset error count
    }
  }, [session]);

  // Reset error count wenn keine Fehler mehr auftreten
  useEffect(() => {
    if (!error && errorCount.current > 0) {
      console.log("🔐 SessionManager: Keine Fehler mehr, reset error count");
      errorCount.current = 0;
      lastError.current = null;
    }
  }, [error]);

  // Automatische Session-Überprüfung alle 5 Minuten
  useEffect(() => {
    if (!initialized || loading) return;

    const interval = setInterval(
      () => {
        if (session) {
          console.log("🔐 SessionManager: Überprüfe Session-Gültigkeit...");
          // Session wird automatisch durch useAuth überwacht
        }
      },
      5 * 60 * 1000,
    ); // 5 Minuten

    return () => clearInterval(interval);
  }, [session, initialized, loading]);

  // Kein UI-Rendering
  return null;
}
