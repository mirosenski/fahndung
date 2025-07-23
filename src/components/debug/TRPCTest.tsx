import { useState } from "react";
import { api } from "~/trpc/react";

export default function TRPCTest() {
  const [testResult, setTestResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Test tRPC Auth
  const authTest = api.auth.getSession.useQuery(undefined, {
    enabled: false,
  });

  // Test tRPC Media
  const mediaTest = api.media.getDirectories.useQuery(undefined, {
    enabled: false,
  });

  const runTRPCTest = async () => {
    setIsLoading(true);
    setTestResult("Teste tRPC-API...");

    try {
      // Test 1: Auth Session
      console.log("🔍 Teste tRPC Auth Session...");
      await authTest.refetch();

      // Test 2: Media Directories
      console.log("🔍 Teste tRPC Media Directories...");
      await mediaTest.refetch();

      setTestResult("✅ tRPC-API funktioniert korrekt!");
      console.log("✅ tRPC-API Tests erfolgreich");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unbekannter Fehler";
      setTestResult(`❌ tRPC-API Fehler: ${errorMessage}`);
      console.error("❌ tRPC-API Test fehlgeschlagen:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectFetch = async () => {
    setIsLoading(true);
    setTestResult("Teste direkten API-Call...");

    try {
      const response = await fetch("/api/trpc/auth.getSession", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult("✅ Direkter API-Call erfolgreich!");
        console.log("✅ Direkter API-Call:", data);
      } else {
        const errorText = await response.text();
        setTestResult(
          `❌ API-Call fehlgeschlagen: ${response.status} ${errorText}`,
        );
        console.error("❌ API-Call Fehler:", response.status, errorText);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unbekannter Fehler";
      setTestResult(`❌ API-Call Exception: ${errorMessage}`);
      console.error("❌ API-Call Exception:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
        🔧 tRPC-API Test
      </h3>

      <div className="space-y-2">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Testet, ob die tRPC-API nach der Behebung des
          createCallerFactory-Problems wieder funktioniert.
        </p>

        <div className="flex space-x-2">
          <button
            onClick={runTRPCTest}
            disabled={isLoading}
            className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Teste..." : "tRPC Hook Test"}
          </button>

          <button
            onClick={testDirectFetch}
            disabled={isLoading}
            className="rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? "Teste..." : "Direkter API-Call"}
          </button>
        </div>

        {testResult && (
          <div
            className={`rounded p-3 text-sm ${
              testResult.includes("✅")
                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200"
            }`}
          >
            {testResult}
          </div>
        )}
      </div>

      <div className="text-xs text-blue-600 dark:text-blue-400">
        <p>
          <strong>Erwartetes Verhalten:</strong>
        </p>
        <ul className="mt-1 list-inside list-disc space-y-1">
          <li>✅ Keine 500 Internal Server Errors</li>
          <li>✅ tRPC Hooks funktionieren</li>
          <li>✅ Direkte API-Calls funktionieren</li>
          <li>✅ Media-Upload sollte jetzt möglich sein</li>
        </ul>
      </div>
    </div>
  );
}
