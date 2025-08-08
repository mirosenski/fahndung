"use client";

import { useState, useTransition } from "react";
import { supabase } from "~/lib/supabase";
import { log, error as logError } from "~/lib/logger";

// Helper to enforce a timeout on an async operation. If the wrapped
// promise does not settle within the specified milliseconds, the returned
// promise rejects with a timeout error. This prevents hanging network
// requests from blocking the UI indefinitely.
async function raceWithTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timed out after ${ms} ms`)), ms),
    ),
  ]);
}

/**
 * Encapsulated supabase authentication actions.  This hook uses
 * `useTransition` to ensure that the UI remains responsive while
 * asynchronous authentication operations (sign in, sign up, sign out)
 * are running.  It centralises success/error handling and logging.
 */
export function useSupabaseAuthActions() {
  // React 18 transition state; `pending` is true while a transition is running
  const [pending, startTransition] = useTransition();
  // Expose error and success messages for UI rendering
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  /**
   * Sign in a user using Supabase.  Resets messages before starting and
   * logs results.  Errors are captured and stored in `errorMsg`.
   */
  const signIn = (email: string, password: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    startTransition(async () => {
      try {
        log("🔐 Login: Versuche Anmeldung für:", email);
        const { data, error } = await raceWithTimeout(
          supabase.auth.signInWithPassword({
            email,
            password,
          }),
          10000,
        );
        if (error) {
          logError("❌ Login: Anmeldung fehlgeschlagen:", error.message);
          setErrorMsg(error.message);
        } else {
          log("✅ Login: Anmeldung erfolgreich für:", data.user?.email);
          setSuccessMsg("Anmeldung erfolgreich!");
        }
      } catch (err) {
        logError("❌ Login: Unerwarteter Fehler:", err);
        setErrorMsg(err instanceof Error ? err.message : "Unbekannter Fehler");
      }
    });
  };

  /**
   * Register a new user using Supabase.  Handles success and error messages.
   */
  const signUp = (email: string, password: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    startTransition(async () => {
      try {
        log("📝 SignUp: Versuche Registrierung für:", email);
        const { data, error } = await raceWithTimeout(
          supabase.auth.signUp({ email, password }),
          10000,
        );
        if (error) {
          logError("❌ SignUp: Registrierung fehlgeschlagen:", error.message);
          setErrorMsg(error.message);
        } else {
          log("✅ SignUp: Registrierung erfolgreich für:", data.user?.email);
          setSuccessMsg(
            "Registrierung erfolgreich! Bitte bestätige deine E‑Mail.",
          );
        }
      } catch (err) {
        logError("❌ SignUp: Unerwarteter Fehler:", err);
        setErrorMsg(err instanceof Error ? err.message : "Unbekannter Fehler");
      }
    });
  };

  /**
   * Sign the current user out.  On success a success message is set.
   */
  const signOut = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    startTransition(async () => {
      try {
        const { error } = await raceWithTimeout(
          supabase.auth.signOut(),
          5000,
        );
        if (error) {
          logError("❌ Logout: Abmeldung fehlgeschlagen:", error.message);
          setErrorMsg(error.message);
        } else {
          log("✅ Logout: Abmeldung erfolgreich");
          setSuccessMsg("Abmeldung erfolgreich!");
        }
      } catch (err) {
        logError("❌ Logout: Unerwarteter Fehler:", err);
        setErrorMsg(err instanceof Error ? err.message : "Unbekannter Fehler");
      }
    });
  };

  return {
    signIn,
    signUp,
    signOut,
    pending,
    errorMsg,
    successMsg,
  };
}