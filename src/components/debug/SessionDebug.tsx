import { useState, useEffect } from "react";
import { useAuth } from "~/hooks/useAuth";
import { supabase } from "~/lib/supabase";
import { api } from "~/trpc/react";

export default function SessionDebug() {
  const { session, isAuthenticated, loading } = useAuth();
  const [localStorageData, setLocalStorageData] = useState<
    Record<string, string>
  >({});
  const [supabaseSession, setSupabaseSession] = useState<any>(null);
  const [testResult, setTestResult] = useState<string>("");

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
        if (key && key.includes("supabase")) {
          data[key] = localStorage.getItem(key) || "";
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
    <div className="space-y-6 rounded-lg bg-gray-50 p-6 dark:bg-gray-900">
      <h2 className="text-xl font-bold">🔍 Session Debug</h2>

      {/* Auth Status */}
      <div className="space-y-2">
        <h3 className="font-semibold">Authentifizierungsstatus:</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Loading: {loading ? "✅" : "❌"}</div>
          <div>Authentifiziert: {isAuthenticated ? "✅" : "❌"}</div>
          <div>Session vorhanden: {session ? "✅" : "❌"}</div>
          <div>User ID: {session?.user?.id || "N/A"}</div>
          <div>Email: {session?.user?.email || "N/A"}</div>
          <div>Rolle: {session?.profile?.role || "N/A"}</div>
        </div>
      </div>

      {/* Supabase Session */}
      <div className="space-y-2">
        <h3 className="font-semibold">Supabase Session:</h3>
        <pre className="max-h-40 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
          {JSON.stringify(supabaseSession, null, 2)}
        </pre>
      </div>

      {/* LocalStorage */}
      <div className="space-y-2">
        <h3 className="font-semibold">LocalStorage (Supabase):</h3>
        <div className="space-y-1">
          {Object.entries(localStorageData).map(([key, value]) => (
            <div key={key} className="text-xs">
              <strong>{key}:</strong>
              <pre className="mt-1 max-h-20 overflow-auto rounded bg-gray-100 p-1 dark:bg-gray-800">
                {value.substring(0, 200)}...
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* Test Buttons */}
      <div className="space-y-2">
        <h3 className="font-semibold">Tests:</h3>
        <div className="flex space-x-2">
          <button
            onClick={runAuthTest}
            className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
          >
            tRPC Auth Test
          </button>
          <button
            onClick={clearSession}
            className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
          >
            Session löschen
          </button>
        </div>
        {testResult && (
          <div className="rounded bg-gray-100 p-2 text-sm dark:bg-gray-800">
            {testResult}
          </div>
        )}
      </div>

      {/* Token Info */}
      {supabaseSession?.access_token && (
        <div className="space-y-2">
          <h3 className="font-semibold">Token Info:</h3>
          <div className="space-y-1 text-xs">
            <div>Token Länge: {supabaseSession.access_token.length}</div>
            <div>
              Token Start: {supabaseSession.access_token.substring(0, 50)}...
            </div>
            <div>
              Token Ende: ...
              {supabaseSession.access_token.substring(
                supabaseSession.access_token.length - 20,
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
