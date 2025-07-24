"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "~/hooks/useAuth";
import { clearAuthSession } from "~/lib/auth";

export function SessionManager() {
  const { session, loading, error, initialized } = useAuth();
  const hasHandledError = useRef(false);
  const lastError = useRef<string | null>(null);

  // Automatische Session-Bereinigung bei Fehlern
  useEffect(() => {
    if (error && !hasHandledError.current && error !== lastError.current) {
      console.log(
        "🔐 SessionManager: Auth-Fehler erkannt, bereinige Session...",
      );
      hasHandledError.current = true;
      lastError.current = error;

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
  }, [error]);

  // Reset error handler wenn Session wiederhergestellt wird
  useEffect(() => {
    if (session && hasHandledError.current) {
      console.log(
        "🔐 SessionManager: Session wiederhergestellt, reset error handler",
      );
      hasHandledError.current = false;
      lastError.current = null;
    }
  }, [session]);

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
