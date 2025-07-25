"use client";

import { useState, useEffect } from "react";
import { supabase } from "~/lib/supabase";
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from "lucide-react";

interface StorageStatus {
  bucketExists: boolean;
  bucketPublic: boolean;
  policiesExist: boolean;
  mediaTableExists: boolean;
  userAuthenticated: boolean;
  userRole: string | null;
}

export default function StorageDebug() {
  const [status, setStatus] = useState<StorageStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkStorageStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 StorageDebug: Prüfe Storage-Status...");

      // 1. Prüfe Benutzer-Authentifizierung
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      const userAuthenticated = !!session && !sessionError;
      const userRole =
        session?.user?.email === "admin@example.com" ? "admin" : "user";

      console.log("✅ StorageDebug: Authentifizierung geprüft:", {
        userAuthenticated,
        userRole,
      });

      // 2. Prüfe Storage Bucket
      const { data: buckets, error: bucketError } =
        await supabase.storage.listBuckets();
      const bucketExists =
        buckets?.some((bucket) => bucket.id === "media-gallery") ?? false;
      const bucketPublic =
        buckets?.find((bucket) => bucket.id === "media-gallery")?.public ??
        false;

      console.log("✅ StorageDebug: Bucket geprüft:", {
        bucketExists,
        bucketPublic,
      });

      // 3. Prüfe RLS Policies (vereinfacht)
      let policiesExist = false;
      try {
        const { data: testList, error: listError } = await supabase.storage
          .from("media-gallery")
          .list("", { limit: 1 });
        policiesExist = !listError;
      } catch {
        policiesExist = false;
      }

      console.log("✅ StorageDebug: Policies geprüft:", { policiesExist });

      // 4. Prüfe Media Tabelle
      let mediaTableExists = false;
      try {
        const { data: mediaTest, error: mediaError } = await supabase
          .from("media")
          .select("id")
          .limit(1);
        mediaTableExists = !mediaError;
      } catch {
        mediaTableExists = false;
      }

      console.log("✅ StorageDebug: Media Tabelle geprüft:", {
        mediaTableExists,
      });

      setStatus({
        bucketExists,
        bucketPublic,
        policiesExist,
        mediaTableExists,
        userAuthenticated,
        userRole,
      });
    } catch (err) {
      console.error("❌ StorageDebug: Fehler bei Status-Prüfung:", err);
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void checkStorageStatus();
  }, []);

  const handleFixStorage = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔧 StorageDebug: Starte Storage-Fix...");

      // Hier könnten wir automatisch das SQL Script ausführen
      // Da das nicht möglich ist, zeigen wir Anweisungen
      alert(`
🔧 Storage Bucket Setup erforderlich!

Bitte führen Sie folgende Schritte aus:

1. Gehen Sie zu: https://app.supabase.com/project/rgbxdxrhwrszidbnsmuy
2. Klicken Sie auf "SQL Editor"
3. Kopieren Sie den Inhalt von scripts/setup-storage-simple.sql
4. Führen Sie das Script aus
5. Prüfen Sie den Storage Tab

Danach sollte der Upload funktionieren.
      `);
    } catch (err) {
      console.error("❌ StorageDebug: Fehler beim Fix:", err);
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Prüfe Storage-Status...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20">
        <div className="flex items-center space-x-2">
          <XCircle className="h-5 w-5 text-red-600" />
          <span className="text-sm text-red-600 dark:text-red-400">
            Fehler: {error}
          </span>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const allGood =
    status.bucketExists &&
    status.bucketPublic &&
    status.policiesExist &&
    status.mediaTableExists &&
    status.userAuthenticated;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Storage Debug
        </h3>
        <button
          onClick={handleFixStorage}
          className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
        >
          Fix Storage
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Bucket existiert:
          </span>
          {status.bucketExists ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Bucket öffentlich:
          </span>
          {status.bucketPublic ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Policies konfiguriert:
          </span>
          {status.policiesExist ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Media Tabelle:
          </span>
          {status.mediaTableExists ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Benutzer authentifiziert:
          </span>
          {status.userAuthenticated ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Benutzer-Rolle:
          </span>
          <span className="text-xs font-medium text-gray-900 dark:text-white">
            {status.userRole}
          </span>
        </div>
      </div>

      {!allGood && (
        <div className="mt-3 rounded bg-yellow-50 p-2 dark:bg-yellow-900/20">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-xs text-yellow-800 dark:text-yellow-200">
              Storage nicht vollständig konfiguriert. Klicken Sie auf "Fix
              Storage".
            </span>
          </div>
        </div>
      )}

      {allGood && (
        <div className="mt-3 rounded bg-green-50 p-2 dark:bg-green-900/20">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-xs text-green-800 dark:text-green-200">
              Storage korrekt konfiguriert! Upload sollte funktionieren.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
