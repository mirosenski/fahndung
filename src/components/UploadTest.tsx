"use client";

import { useState } from "react";
import { useSupabaseUpload } from "~/hooks/useSupabaseUpload";

interface UploadResult {
  path: string;
  url: string;
  error?: string;
}

export const UploadTest = () => {
  const { uploadFile, deleteFile, isUploading, progress } = useSupabaseUpload();
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      setUploadResult(null);

      console.log("🚀 UploadTest: Starte Upload für:", file.name);

      const result = await uploadFile(file, "media");

      if (result.error) {
        console.error("❌ UploadTest: Upload-Fehler:", result.error);
        setError(result.error);
      } else {
        console.log("✅ UploadTest: Upload erfolgreich:", result);
        setUploadResult(result as UploadResult);
      }
    } catch (err) {
      console.error("❌ UploadTest: Unerwarteter Fehler:", err);
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    }
  };

  const handleDeleteFile = async () => {
    if (!uploadResult?.path) return;

    try {
      console.log("🗑️ UploadTest: Lösche Datei:", uploadResult.path);

      const success = await deleteFile(uploadResult.path, "media");

      if (success) {
        console.log("✅ UploadTest: Datei erfolgreich gelöscht");
        setUploadResult(null);
      } else {
        console.error("❌ UploadTest: Lösch-Fehler");
        setError("Fehler beim Löschen der Datei");
      }
    } catch (err) {
      console.error("❌ UploadTest: Lösch-Fehler:", err);
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-2xl font-bold">🧪 Upload Test</h2>

      {/* Debug Auth Component */}
      {/* <div className="mb-6">
        <DebugAuth />
      </div> */}

      {/* Upload Section */}
      <div className="mb-6">
        <h3 className="mb-3 text-lg font-semibold">📁 Datei Upload</h3>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Wähle eine Datei zum Hochladen:
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            />
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="text-sm text-blue-600">⏳ Upload läuft...</div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600">{progress}%</div>
            </div>
          )}

          {error && (
            <div className="rounded border border-red-400 bg-red-100 p-3 text-red-700">
              ❌ Fehler: {error}
            </div>
          )}

          {uploadResult && (
            <div className="rounded border border-green-400 bg-green-100 p-4">
              <h4 className="mb-2 font-semibold text-green-800">
                ✅ Upload erfolgreich!
              </h4>
              <div className="space-y-1 text-sm text-green-700">
                <div>
                  <strong>Pfad:</strong> {uploadResult.path}
                </div>
                <div>
                  <strong>URL:</strong>
                  <a
                    href={uploadResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 text-blue-600 hover:underline"
                  >
                    {uploadResult.url}
                  </a>
                </div>
              </div>

              <button
                onClick={handleDeleteFile}
                className="mt-3 rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
              >
                🗑️ Datei löschen
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded bg-blue-50 p-4">
        <h4 className="mb-2 font-semibold">📋 Test-Anweisungen:</h4>
        <ol className="list-inside list-decimal space-y-1 text-sm">
          <li>Überprüfe den Auth-Status oben</li>
          <li>Wähle eine Datei zum Hochladen</li>
          <li>Beobachte die Console-Logs</li>
          <li>Teste den Download-Link</li>
          <li>Lösche die Datei wenn gewünscht</li>
        </ol>
      </div>
    </div>
  );
};
