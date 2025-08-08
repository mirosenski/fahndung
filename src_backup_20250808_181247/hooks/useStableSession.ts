"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "./useAuth";
import type { Session } from "~/lib/auth";

/**
 * Radikale Lösung gegen Flackern: Stabile Session-Behandlung
 * Verhindert häufige Session-Updates und sorgt für konsistente UI
 */
export const useStableSession = (externalSession?: Session | null) => {
  const { session: authSession, loading, initialized } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [stableSession, setStableSession] = useState<Session | null>(null);
  const lastSessionId = useRef<string | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Optimierte Session-Vergleich mit useMemo
  const currentSession = useMemo(() => {
    return externalSession ?? authSession;
  }, [externalSession, authSession]);

  // Stabiler Session-Vergleich ohne JSON.stringify
  const sessionChanged = useMemo(() => {
    if (!mounted) return false;

    // Vergleiche nur relevante Eigenschaften
    const oldUser = stableSession?.user;
    const newUser = currentSession?.user;

    if (!oldUser && !newUser) return false;
    if (!oldUser && newUser) return true;
    if (oldUser && !newUser) return true;

    // Vergleiche nur die wichtigsten Eigenschaften
    const oldId = oldUser?.id;
    const newId = newUser?.id;
    const oldEmail = oldUser?.email;
    const newEmail = newUser?.email;

    return oldId !== newId || oldEmail !== newEmail;
  }, [mounted, stableSession, currentSession]);

  // Nur bei echten Änderungen updaten mit Debouncing
  useEffect(() => {
    if (!mounted) return;

    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    if (sessionChanged) {
      // Debounce updates to prevent rapid changes
      updateTimeoutRef.current = setTimeout(() => {
        setStableSession(currentSession);
        lastSessionId.current = currentSession?.user?.id ?? null;
      }, 50); // 50ms debounce
    }
  }, [mounted, sessionChanged, currentSession]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return {
    session: stableSession,
    loading: !mounted || (loading && !initialized),
    isAuthenticated: !!stableSession,
    mounted,
  };
}; 