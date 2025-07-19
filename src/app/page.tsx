"use client";

import { useState } from "react";

import {
  Search,
  Plus,
  AlertTriangle,
  User,
  MapPin,
  Trash2,
  Edit,
  Eye,
  Database,
  TestTube,
} from "lucide-react";
import { api } from "~/trpc/react";
import Header from "~/components/layout/Header";

// Typen für Fahndungen
interface Investigation {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  tags?: string[];
  location?: string;
  created_at: string;
  updated_at: string;
}

export default function Home() {
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [testResult, setTestResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // tRPC Queries und Mutations
  const { data: investigations, refetch: refetchInvestigations } =
    api.post.getInvestigations.useQuery({
      limit: 10,
      offset: 0,
    });

  const createInvestigationMutation = api.post.createInvestigation.useMutation({
    onSuccess: () => {
      void refetchInvestigations();
      setTestResult("✅ Fahndung erfolgreich erstellt!");
    },
    onError: (error) => {
      setTestResult(`❌ Fehler beim Erstellen: ${error.message}`);
    },
  });

  const updateInvestigationMutation = api.post.updateInvestigation.useMutation({
    onSuccess: () => {
      void refetchInvestigations();
      setTestResult("✅ Fahndung erfolgreich aktualisiert!");
    },
    onError: (error) => {
      setTestResult(`❌ Fehler beim Aktualisieren: ${error.message}`);
    },
  });

  const deleteInvestigationMutation = api.post.deleteInvestigation.useMutation({
    onSuccess: () => {
      void refetchInvestigations();
      setTestResult("✅ Fahndung erfolgreich gelöscht!");
    },
    onError: (error) => {
      setTestResult(`❌ Fehler beim Löschen: ${error.message}`);
    },
  });

  // Test-Funktionen
  const testCreateInvestigation = async () => {
    setIsLoading(true);
    setTestResult("🔄 Erstelle Test-Fahndung...");

    try {
      await createInvestigationMutation.mutateAsync({
        title: `Test-Fahndung ${Date.now()}`,
        description: "Dies ist eine automatisch erstellte Test-Fahndung",
        status: "active",
        priority: "medium",
        tags: ["test", "automatisch"],
        location: "Test-Standort",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unbekannter Fehler";
      setTestResult(`❌ Fehler: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testUpdateInvestigation = async () => {
    if (!investigations || investigations.length === 0) {
      setTestResult("❌ Keine Fahndungen zum Aktualisieren vorhanden");
      return;
    }

    setIsLoading(true);
    setTestResult("🔄 Aktualisiere erste Fahndung...");

    try {
      const firstInvestigation = investigations[0] as Investigation;
      console.log("Updating investigation with ID:", firstInvestigation.id);
      await updateInvestigationMutation.mutateAsync({
        id: firstInvestigation.id,
        title: `${firstInvestigation.title} (Aktualisiert)`,
        description: "Diese Fahndung wurde automatisch aktualisiert",
        priority: "high",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unbekannter Fehler";
      console.error("Update error:", error);
      setTestResult(`❌ Fehler: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testDeleteInvestigation = async () => {
    if (!investigations || investigations.length === 0) {
      setTestResult("❌ Keine Fahndungen zum Löschen vorhanden");
      return;
    }

    setIsLoading(true);
    setTestResult("🔄 Lösche letzte Fahndung...");

    try {
      const lastInvestigation = investigations[
        investigations.length - 1
      ] as Investigation;
      console.log("Deleting investigation with ID:", lastInvestigation.id);
      await deleteInvestigationMutation.mutateAsync({
        id: lastInvestigation.id,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unbekannter Fehler";
      console.error("Delete error:", error);
      setTestResult(`❌ Fehler: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSupabaseConnection = async () => {
    setIsLoading(true);
    setTestResult("🔄 Teste Supabase-Verbindung...");

    try {
      // Teste die Verbindung durch Abrufen der Fahndungen
      await refetchInvestigations();
      setTestResult("✅ Supabase-Verbindung erfolgreich!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unbekannter Fehler";
      setTestResult(`❌ Supabase-Verbindung fehlgeschlagen: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Diese Funktionen werden nicht mehr benötigt, da die Navigation jetzt über die Header-Komponente erfolgt

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header
        variant="home"
        onShowTestPanel={() => setShowTestPanel(!showTestPanel)}
      />

      {/* Test Panel */}
      {showTestPanel && (
        <div className="border-b border-white/10 bg-yellow-500/10 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center space-x-2 text-lg font-semibold text-white">
                <TestTube className="h-5 w-5" />
                <span>Supabase Test-Panel</span>
              </h2>
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-400">
                  Supabase Integration
                </span>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <button
                onClick={testSupabaseConnection}
                disabled={isLoading}
                className="flex cursor-pointer items-center justify-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-blue-600/50"
              >
                <Database className="h-4 w-4" />
                <span>Verbindung testen</span>
              </button>

              <button
                onClick={testCreateInvestigation}
                disabled={isLoading}
                className="flex cursor-pointer items-center justify-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:bg-green-600/50"
              >
                <Plus className="h-4 w-4" />
                <span>Erstellen testen</span>
              </button>

              <button
                onClick={testUpdateInvestigation}
                disabled={isLoading}
                className="flex cursor-pointer items-center justify-center space-x-2 rounded-lg bg-yellow-600 px-4 py-2 text-white transition-colors hover:bg-yellow-700 disabled:bg-yellow-600/50"
              >
                <Edit className="h-4 w-4" />
                <span>Aktualisieren testen</span>
              </button>

              <button
                onClick={testDeleteInvestigation}
                disabled={isLoading}
                className="flex cursor-pointer items-center justify-center space-x-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:bg-red-600/50"
              >
                <Trash2 className="h-4 w-4" />
                <span>Löschen testen</span>
              </button>
            </div>

            {testResult && (
              <div className="rounded-lg border border-white/20 bg-white/10 p-4">
                <h3 className="mb-2 text-sm font-medium text-white">
                  Test-Ergebnis:
                </h3>
                <p className="text-sm text-gray-300">{testResult}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Fahndungen durchsuchen..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-10 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <div>
                <p className="text-sm text-gray-400">Aktive Fahndungen</p>
                <p className="text-2xl font-bold text-white">
                  {investigations?.filter(
                    (i) => (i as Investigation).status === "active",
                  ).length ?? 0}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-sm text-gray-400">Vermisste Personen</p>
                <p className="text-2xl font-bold text-white">
                  {investigations?.filter((i) =>
                    (i as Investigation).tags?.includes("vermisst"),
                  ).length ?? 0}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <div className="flex items-center space-x-3">
              <MapPin className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-sm text-gray-400">Standorte</p>
                <p className="text-2xl font-bold text-white">
                  {investigations?.filter((i) => (i as Investigation).location)
                    .length ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Investigations List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Aktuelle Fahndungen
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Eye className="h-4 w-4" />
              <span>{investigations?.length ?? 0} Fahndungen</span>
            </div>
          </div>

          {investigations && investigations.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {investigations.map((investigation) => {
                const inv = investigation as Investigation;
                return (
                  <div
                    key={inv.id}
                    className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="mb-2 font-semibold text-white">
                          {inv.title}
                        </h3>
                        <p className="line-clamp-2 text-sm text-gray-400">
                          {inv.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            inv.priority === "high"
                              ? "bg-red-500/20 text-red-400"
                              : inv.priority === "medium"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {inv.priority}
                        </span>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            inv.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                    </div>

                    {inv.location && (
                      <div className="mb-3 flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          {inv.location}
                        </span>
                      </div>
                    )}

                    {inv.tags && inv.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {inv.tags
                          .slice(0, 3)
                          .map((tag: string, index: number) => (
                            <span
                              key={index}
                              className="rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-400"
                            >
                              {tag}
                            </span>
                          ))}
                        {inv.tags.length > 3 && (
                          <span className="rounded-full bg-gray-500/20 px-2 py-1 text-xs text-gray-400">
                            +{inv.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-4 text-xs text-gray-500">
                      Erstellt:{" "}
                      {new Date(inv.created_at).toLocaleDateString("de-DE")}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-400">
                Keine Fahndungen gefunden
              </h3>
              <p className="text-gray-500">
                Erstellen Sie Ihre erste Fahndung, um zu beginnen.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
