import { useState, useCallback, useRef } from "react";
import { Upload, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { api } from "~/trpc/react";
import { useAuth } from "~/hooks/useAuth";
import { supabase } from "~/lib/supabase";

interface MediaUploadProps {
  onUploadComplete?: (results: unknown[]) => void;
  className?: string;
}

export default function MediaUpload({
  onUploadComplete,
  className = "",
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    loaded: 0,
    total: 0,
    percentage: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { session, isAuthenticated } = useAuth();
  const isAdmin = session?.profile?.role === "admin";

  // Debug-Logging für Session-Status
  console.log("🔍 MediaUpload Debug:", {
    isAuthenticated,
    hasSession: !!session,
    userRole: session?.profile?.role,
    isAdmin,
    userId: session?.user?.id,
    userEmail: session?.user?.email,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Separate mutation nur für Metadaten
  const saveMediaMutation = api.media.saveMediaRecord.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setError(null);
      onUploadComplete?.([]);
      // Reset after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (error) => {
      console.error("Save media error:", error);

      // Handle specific authentication errors
      if (
        error.message.includes("UNAUTHORIZED") ||
        error.message.includes("Nicht authentifiziert")
      ) {
        setError(
          "Sie sind nicht angemeldet. Bitte melden Sie sich als Admin an.",
        );
      } else if (
        error.message.includes("FORBIDDEN") ||
        error.message.includes("Admin-Rechte")
      ) {
        setError("Sie benötigen Admin-Rechte um Dateien hochzuladen.");
      } else {
        setError(`Speichern fehlgeschlagen: ${error.message}`);
      }
    },
  });

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      // Check authentication before upload
      if (!isAuthenticated) {
        setError(
          "Sie sind nicht angemeldet. Bitte melden Sie sich als Admin an.",
        );
        return;
      }

      if (!isAdmin) {
        setError("Sie benötigen Admin-Rechte um Dateien hochzuladen.");
        return;
      }

      setUploading(true);
      setError(null);
      setUploadProgress({ loaded: 0, total: 0, percentage: 0 });

      // Upload files sequentially
      for (const file of files) {
        if (!file) continue; // Skip if file is undefined

        try {
          console.log("🚀 Starte Upload für:", file.name, {
            size: file.size,
            type: file.type,
            isAuthenticated,
            userRole: session?.profile?.role,
          });

          // 1. Direkt zu Supabase Storage hochladen
          const timestamp = Date.now();
          const uniqueFilename = `${timestamp}-${file.name}`;
          const path = `allgemein/${uniqueFilename}`;

          const { data: uploadData, error: uploadError } =
            await supabase.storage.from("media-gallery").upload(path, file, {
              upsert: false,
            });

          if (uploadError) {
            throw new Error(`Storage upload failed: ${uploadError.message}`);
          }

          // 2. Metadaten über tRPC speichern
          await saveMediaMutation.mutateAsync({
            filename: uniqueFilename,
            original_filename: file.name,
            file_path: uploadData.path,
            file_size: file.size,
            mime_type: file.type,
            directory: "allgemein",
            tags: [],
            is_public: true,
          });

          // Progress update
          const progress = ((files.indexOf(file) + 1) / files.length) * 100;
          setUploadProgress({
            loaded: file.size,
            total: file.size,
            percentage: progress,
          });

          console.log("✅ Upload erfolgreich für:", file.name);
        } catch (error) {
          console.error(`Upload failed for ${file.name}:`, error);
          setError(
            `Upload fehlgeschlagen für ${file.name}: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
          );
          break; // Stop uploading if one file fails
        }
      }

      setUploading(false);
    },
    [saveMediaMutation, isAuthenticated, isAdmin, session?.profile?.role],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      void handleFiles(files);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFiles],
  );

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Authentication Status */}
      {!isAuthenticated && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-800 dark:text-red-200">
              Sie sind nicht angemeldet. Bitte melden Sie sich als Admin an.
            </p>
          </div>
        </div>
      )}

      {isAuthenticated && !isAdmin && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-700 dark:bg-orange-900/20">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <p className="text-sm text-orange-800 dark:text-orange-200">
              Sie benötigen Admin-Rechte um Dateien hochzuladen.
            </p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/20">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-800 dark:text-green-200">
              Upload erfolgreich abgeschlossen!
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-600">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="space-y-4">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              Dateien hochladen
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ziehen Sie Dateien hierher oder klicken Sie zum Auswählen
            </p>
          </div>

          <button
            onClick={openFileDialog}
            disabled={!isAuthenticated || !isAdmin || uploading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Upload läuft...</span>
              </div>
            ) : (
              "Dateien auswählen"
            )}
          </button>
        </div>

        {/* Progress Bar */}
        {uploading && uploadProgress.percentage > 0 && (
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-sm">
              <span>Fortschritt</span>
              <span>{Math.round(uploadProgress.percentage)}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${uploadProgress.percentage}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {formatFileSize(uploadProgress.loaded)} /{" "}
              {formatFileSize(uploadProgress.total)}
            </div>
          </div>
        )}
      </div>

      {/* Debug Info (nur in Development) */}
      {process.env.NODE_ENV === "development" && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            Debug Info:
          </h4>
          <div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <div>Authentifiziert: {isAuthenticated ? "Ja" : "Nein"}</div>
            <div>Admin: {isAdmin ? "Ja" : "Nein"}</div>
            <div>User ID: {session?.user?.id ?? "N/A"}</div>
            <div>Email: {session?.user?.email ?? "N/A"}</div>
            <div>Rolle: {session?.profile?.role ?? "N/A"}</div>
            <div>Upload Status: {uploading ? "Läuft" : "Bereit"}</div>
          </div>
        </div>
      )}
    </div>
  );
}
