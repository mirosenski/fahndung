"use client";

import { useState, useEffect } from "react";
import { useAuth } from "~/hooks/useAuth";
import { api } from "~/trpc/react";
import { supabase } from "~/lib/supabase";
import { toast } from "sonner";

export default function AuthDebug() {
  const { session, isAuthenticated, loading } = useAuth();
  const [testResult, setTestResult] = useState<string>("");
  const [isTesting, setIsTesting] = useState(false);
  const [supabaseSession, setSupabaseSession] = useState<any>(null);
  const [localStorageData, setLocalStorageData] = useState<Record<string, string>>({});

  // tRPC Auth Test
  const authTest = api.auth.getSession.useQuery(undefined, {
    enabled: false,
  });

  // tRPC Media Test
  const mediaTest = api.media.getDirectories.useQuery(undefined, {
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
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Supabase Session Error:", error);
        } else {
          setSupabaseSession(session);
        }
      } catch (error) {
        console.error("Supabase Session Check Error:", error);
      }
    };

    void checkSupabaseSession();
  }, []);

  const runAuthTest = async () => {
    setIsTesting(true);
    setTestResult("Teste Authentifizierung...");

    try {
      // Test 1: tRPC Auth Session
      console.log("🔍 Teste tRPC Auth Session...");
      await authTest.refetch();
      
      if (authTest.data) {
        console.log("✅ tRPC Auth erfolgreich:", authTest.data);
        setTestResult("✅ tRPC Auth erfolgreich!");
      } else {
        throw new Error("Keine tRPC Auth Session");
      }

      // Test 2: tRPC Media API
      console.log("🔍 Teste tRPC Media API...");
      await mediaTest.refetch();
      
      if (mediaTest.data) {
        console.log("✅ tRPC Media erfolgreich:", mediaTest.data);
        setTestResult("✅ tRPC Auth & Media erfolgreich!");
      } else {
        throw new Error("Keine tRPC Media Response");
      }

      toast.success("Authentifizierungstest erfolgreich!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler";
      setTestResult(`❌ Authentifizierungstest fehlgeschlagen: ${errorMessage}`);
      toast.error("Authentifizierungstest fehlgeschlagen!");
      console.error("❌ Auth Test fehlgeschlagen:", error);
    } finally {
      setIsTesting(false);
    }
  };

  const clearSession = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Session bereinigt!");
      window.location.reload();
    } catch (error) {
      console.error("Logout Error:", error);
      toast.error("Fehler beim Bereinigen der Session!");
    }
  };

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
        🔍 Auth Debug (Dev)
      </h3>
      
      <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
        <div>Loading: {loading ? "✅" : "❌"}</div>
        <div>Authentifiziert: {isAuthenticated ? "✅" : "❌"}</div>
        <div>Session: {session ? "✅" : "❌"}</div>
        {session && (
          <>
            <div>User ID: {session.user?.id ?? "N/A"}</div>
            <div>Email: {session.user?.email ?? "N/A"}</div>
            <div>Rolle: {session.profile?.role ?? "N/A"}</div>
          </>
        )}
        <div>Supabase Session: {supabaseSession ? "✅" : "❌"}</div>
        <div>LocalStorage Keys: {Object.keys(localStorageData).length}</div>
      </div>

      <div className="mt-3 space-y-2">
        <button
          onClick={runAuthTest}
          disabled={isTesting}
          className="w-full rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isTesting ? "Teste..." : "Auth Test"}
        </button>
        
        <button
          onClick={clearSession}
          className="w-full rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
        >
          Session löschen
        </button>
      </div>

      {testResult && (
        <div className="mt-2 rounded bg-gray-100 p-2 text-xs dark:bg-gray-700">
          <strong>Test Result:</strong> {testResult}
        </div>
      )}

      {/* LocalStorage Debug */}
      {Object.keys(localStorageData).length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs font-medium">LocalStorage</summary>
          <div className="mt-1 max-h-20 overflow-y-auto text-xs">
            {Object.entries(localStorageData).map(([key, value]) => (
              <div key={key} className="break-all">
                <strong>{key}:</strong> {value.substring(0, 50)}...
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
} 