import { useState, useCallback, useRef } from "react";
import { Upload, X, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { api } from "~/trpc/react";
import { useAuth } from "~/hooks/useAuth";

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

  const uploadMutation = api.media.uploadMedia.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setError(null);
      onUploadComplete?.([]);
      // Reset after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (error) => {
      console.error("Upload error:", error);

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
      } else if (
        error.message.includes("illegal path") ||
        error.message.includes("filesystem")
      ) {
        setError(
          "Storage Bucket nicht konfiguriert. Bitte führen Sie das Setup-Script aus.",
        );
      } else {
        setError(`Upload fehlgeschlagen: ${error.message}`);
      }
    },
  });

  const handleFiles = useCallback(
    (files: File[]) => {
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
      const uploadFile = async (file: File, index: number) => {
        try {
          await uploadMutation.mutateAsync({
            file,
            directory: "allgemein",
            tags: [],
            is_public: true,
          });

          // Simulate progress for UI feedback
          const progress = ((index + 1) / files.length) * 100;
          setUploadProgress({
            loaded: file.size,
            total: file.size,
            percentage: progress,
          });
        } catch (error) {
          console.error(`Upload failed for ${file.name}:`, error);
          // Error is already handled by mutation onError
        }
      };

      // Upload files one by one
      files.forEach((file, index) => {
        setTimeout(() => {
          void uploadFile(file, index);
        }, index * 100); // Small delay between uploads
      });
    },
    [uploadMutation, isAuthenticated, isAdmin],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      handleFiles(files);
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
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          uploading
            ? "border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20"
            : "border-gray-300 bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={handleFileInput}
          className="hidden"
          disabled={uploading || !isAuthenticated || !isAdmin}
        />

        {uploading ? (
          <div className="space-y-4">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Upload läuft...
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {uploadProgress.percentage.toFixed(0)}% abgeschlossen
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${uploadProgress.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Dateien hochladen
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Ziehen Sie Dateien hierher oder klicken Sie zum Auswählen
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Unterstützt: Bilder, Videos, PDF, DOC, DOCX (max. 50MB)
              </p>
            </div>
            <button
              onClick={openFileDialog}
              disabled={!isAuthenticated || !isAdmin}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Dateien auswählen
            </button>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Fortschritt: {uploadProgress.percentage.toFixed(0)}%
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {formatFileSize(uploadProgress.loaded)} /{" "}
              {formatFileSize(uploadProgress.total)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
