import { useState, useEffect } from "react";
import { useAuth } from "~/hooks/useAuth";
import { supabase } from "~/lib/supabase";
import { api } from "~/trpc/react";
import type { Session } from "@supabase/supabase-js";

export default function SessionDebug() {
  const { session, isAuthenticated, loading, error, initialized } = useAuth();
  const [localStorageData, setLocalStorageData] = useState<
    Record<string, string>
  >({});
  const [supabaseSession, setSupabaseSession] = useState<Session | null>(null);
  const [testResult, setTestResult] = useState<string>("");
  const [debugInfo, setDebugInfo] = useState<string>("");

  // Test tRPC Auth
  const testAuth = api.auth.getSession.useQuery(undefined, {
    enabled: false,
  });

  useEffect(() => {
    // LocalStorage Daten sammeln
    if (typeof window !== "undefined") {
      const data: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.includes("supabase")) {
          data[key] = localStorage.getItem(key) ?? "";
        }
      }
      setLocalStorageData(data);
    }

    // Supabase Session direkt prüfen
    const checkSupabaseSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSupabaseSession(session);
      } catch (error) {
        console.error("Supabase Session Check Error:", error);
      }
    };

    void checkSupabaseSession();
  }, []);

  // Debug-Informationen sammeln
  useEffect(() => {
    const info = [
      `Loading: ${loading}`,
      `Initialized: ${initialized}`,
      `Has Session: ${!!session}`,
      `Is Authenticated: ${isAuthenticated}`,
      `Error: ${error ?? "None"}`,
      `Supabase Session: ${!!supabaseSession}`,
      `LocalStorage Keys: ${Object.keys(localStorageData).length}`,
    ].join("\n");

    setDebugInfo(info);
  }, [
    loading,
    initialized,
    session,
    isAuthenticated,
    error,
    supabaseSession,
    localStorageData,
  ]);

  const runAuthTest = async () => {
    try {
      setTestResult("Teste tRPC Auth...");
      await testAuth.refetch();
      setTestResult("✅ tRPC Auth Test erfolgreich");
    } catch (error) {
      setTestResult(
        `❌ tRPC Auth Test fehlgeschlagen: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
      );
    }
  };

  const clearSession = async () => {
    try {
      await supabase.auth.signOut();
      window.location.reload();
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold">Session Debug</h3>

      <div className="mb-4">
        <h4 className="mb-2 font-medium">Debug Info:</h4>
        <pre className="overflow-auto rounded bg-gray-200 p-2 text-xs dark:bg-gray-700">
          {debugInfo}
        </pre>
      </div>

      <div className="mb-4">
        <h4 className="mb-2 font-medium">Actions:</h4>
        <div className="space-x-2">
          <button
            onClick={runAuthTest}
            className="rounded bg-blue-500 px-3 py-1 text-sm text-white"
          >
            Test tRPC Auth
          </button>
          <button
            onClick={clearSession}
            className="rounded bg-red-500 px-3 py-1 text-sm text-white"
          >
            Clear Session
          </button>
        </div>
      </div>

      {testResult && (
        <div className="mb-4">
          <h4 className="mb-2 font-medium">Test Result:</h4>
          <p className="text-sm">{testResult}</p>
        </div>
      )}

      <div className="mb-4">
        <h4 className="mb-2 font-medium">LocalStorage Data:</h4>
        <pre className="max-h-32 overflow-auto rounded bg-gray-200 p-2 text-xs dark:bg-gray-700">
          {JSON.stringify(localStorageData, null, 2)}
        </pre>
      </div>
    </div>
  );
}
