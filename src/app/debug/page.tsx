"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";

export default function DebugPage() {
  const [testResult, setTestResult] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);

  // tRPC Hooks
  const createInvestigation = api.post.createInvestigation.useMutation({
    onSuccess: (data) => {
      setTestResult(
        (prev) => prev + `\n✅ Fahndung erstellt: ${data.title} (${data.id})`,
      );
    },
    onError: (error) => {
      setTestResult((prev) => prev + `\n❌ Fehler: ${error.message}`);
    },
  });

  const { data: investigations = [], refetch } =
    api.post.getInvestigations.useQuery(
      { limit: 10, offset: 0 },
      {
        onSuccess: (data) => {
          setTestResult(
            (prev) => prev + `\n📋 ${data.length} Fahndungen geladen`,
          );
        },
        onError: (error) => {
          setTestResult(
            (prev) => prev + `\n❌ Fehler beim Laden: ${error.message}`,
          );
        },
      },
    );

  const runTest = async () => {
    setIsRunning(true);
    setTestResult("🧪 Starte Debug-Test...\n");

    try {
      // Test-Daten
      const testData = {
        title: `TEST: Fahndung ${Date.now()}`,
        description: "Dies ist eine Test-Fahndung für Debugging-Zwecke.",
        status: "active" as const,
        priority: "normal" as const,
        category: "MISSING_PERSON" as const,
        location: "Berlin",
        contact_info: {
          person: "Test Person",
          phone: "123456789",
          email: "test@example.com",
        },
        tags: ["test", "debug"],
      };

      setTestResult(
        (prev) => prev + `\n📝 Erstelle Test-Fahndung: ${testData.title}`,
      );

      // Erstelle Fahndung
      await createInvestigation.mutateAsync(testData);

      // Lade Fahndungen neu
      setTestResult((prev) => prev + "\n📋 Lade Fahndungen neu...");
      await refetch();

      setTestResult((prev) => prev + "\n✅ Test abgeschlossen!");
    } catch (error) {
      setTestResult((prev) => prev + `\n❌ Test-Fehler: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-8 text-3xl font-bold">🔍 Debug-Seite</h1>

      <div className="mb-8">
        <button
          onClick={runTest}
          disabled={isRunning}
          className="rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isRunning ? "Test läuft..." : "Debug-Test starten"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Test-Ergebnisse */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold">Test-Ergebnisse</h2>
          <pre className="max-h-96 overflow-auto rounded bg-gray-100 p-4 text-sm dark:bg-gray-900">
            {testResult || "Noch keine Tests ausgeführt"}
          </pre>
        </div>

        {/* Aktuelle Fahndungen */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold">
            Aktuelle Fahndungen ({investigations.length})
          </h2>
          <div className="space-y-2">
            {investigations.map((inv) => (
              <div
                key={inv.id}
                className="rounded border border-gray-200 p-3 dark:border-gray-600"
              >
                <div className="font-semibold">{inv.title}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  ID: {inv.id} | Status: {inv.status} | Kategorie:{" "}
                  {inv.category}
                </div>
              </div>
            ))}
            {investigations.length === 0 && (
              <div className="text-gray-500 dark:text-gray-400">
                Keine Fahndungen vorhanden
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
