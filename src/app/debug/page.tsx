"use client";

import { useState } from "react";
import {
  testSupabaseConnection,
  getCurrentSession,
  createDemoUsers,
} from "../../lib/auth";
import { supabase } from "../../lib/supabase";

export default function DebugPage() {
  const [connectionTest, setConnectionTest] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [sessionTest, setSessionTest] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const handleConnectionTest = async () => {
    setLoading(true);
    try {
      const result = await testSupabaseConnection();
      setConnectionTest(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unbekannter Fehler";
      setConnectionTest({ success: false, message: `Fehler: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSessionTest = async () => {
    setLoading(true);
    try {
      const session = await getCurrentSession();
      setSessionTest(session);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unbekannter Fehler";
      setSessionTest({ error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDemoUsers = async () => {
    setLoading(true);
    try {
      const result = await createDemoUsers();
      setConnectionTest(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unbekannter Fehler";
      setConnectionTest({ success: false, message: `Fehler: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setSessionTest(null);
    }
  };

  // Umgebungsvariablen anzeigen (nur für Debug-Zwecke)
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "Nicht gesetzt",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...`
      : "Nicht gesetzt",
    NODE_ENV: process.env.NODE_ENV ?? "Nicht gesetzt",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          🔧 Debug-Seite
        </h1>

        {/* Umgebungsvariablen */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            🌍 Umgebungsvariablen
          </h2>
          <div className="space-y-2">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="font-mono text-sm text-gray-600">{key}:</span>
                <span
                  className={`font-mono text-sm ${value === "Nicht gesetzt" ? "text-red-500" : "text-green-600"}`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Verbindungstest */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            🔗 Supabase-Verbindungstest
          </h2>
          <button
            onClick={handleConnectionTest}
            disabled={loading}
            className="mb-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "Teste..." : "Verbindung testen"}
          </button>
          {connectionTest && (
            <div
              className={`rounded-md p-4 ${
                connectionTest.success
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              <pre className="text-sm whitespace-pre-wrap">
                {connectionTest.message}
              </pre>
            </div>
          )}
        </div>

        {/* Session-Test */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            👤 Session-Test
          </h2>
          <div className="mb-4 space-x-2">
            <button
              onClick={handleSessionTest}
              disabled={loading}
              className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:bg-gray-400"
            >
              {loading ? "Prüfe..." : "Session prüfen"}
            </button>
            <button
              onClick={handleSignOut}
              className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              Abmelden
            </button>
          </div>
          {sessionTest && (
            <div className="rounded-md bg-gray-100 p-4">
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(sessionTest, null, 2) as string}
              </pre>
            </div>
          )}
        </div>

        {/* Demo-User erstellen */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            👥 Demo-User erstellen
          </h2>
          <button
            onClick={handleCreateDemoUsers}
            disabled={loading}
            className="rounded-md bg-purple-500 px-4 py-2 text-white hover:bg-purple-600 disabled:bg-gray-400"
          >
            {loading ? "Erstelle..." : "Demo-User erstellen"}
          </button>
        </div>
      </div>
    </div>
  );
}
