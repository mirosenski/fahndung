import { useState, useCallback, useRef } from "react";
import {
  Upload,
  AlertTriangle,
  CheckCircle,
  Loader2,
  FileImage,
} from "lucide-react";
import { api } from "~/trpc/react";
import { useAuth } from "~/hooks/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  compressImage,
  shouldCompressImage,
  estimateCompressedSize,
} from "~/lib/utils/imageCompression";

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
  const [compressionInfo, setCompressionInfo] = useState<{
    originalSize: number;
    compressedSize: number;
    isCompressing: boolean;
  } | null>(null);

  const { session, isAuthenticated } = useAuth();
  const router = useRouter();
  const isAdmin = session?.profile?.role === "admin";

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function zum Konvertieren von File zu Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;

        const base64 = result.split(",")[1];
        if (!base64) {
          reject(new Error("Failed to convert file to base64"));
          return;
        }
        resolve(base64);
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
    });
  };

  // Upload mutation mit Base64
  const uploadMutation = api.media.uploadMedia.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setError(null);
      onUploadComplete?.([]);
      // Reset after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (error) => {
      console.error("❌ Upload error:", error);

      // Handle specific authentication errors
      if (
        error.message.includes("UNAUTHORIZED") ||
        error.message.includes("Nicht authentifiziert")
      ) {
        setError(
          "Sie sind nicht angemeldet. Bitte melden Sie sich als Admin an.",
        );
        toast.error("Bitte erst einloggen!");
        router.push("/login");
      } else if (
        error.message.includes("FORBIDDEN") ||
        error.message.includes("Admin-Rechte") ||
        error.message.includes("Admin-") ||
        error.message.includes("Editor-Rechte")
      ) {
        setError(
          "Sie benötigen Admin- oder Editor-Rechte um Dateien hochzuladen.",
        );
        toast.error("Admin-Rechte erforderlich!");
      } else if (
        error.message.includes("PAYLOAD_TOO_LARGE") ||
        error.message.includes("413") ||
        error.message.includes("Content Too Large")
      ) {
        setError(
          "Datei ist zu groß. Bitte wählen Sie eine kleinere Datei aus oder komprimieren Sie das Bild.",
        );
        toast.error("Datei zu groß!");
      } else {
        setError(`Upload fehlgeschlagen: ${error.message}`);
        toast.error("Upload fehlgeschlagen!");
      }
    },
  });

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      // 🔥 VERBESSERTE AUTHENTIFIZIERUNGSPRÜFUNG
      if (!isAuthenticated) {
        setError(
          "Sie sind nicht angemeldet. Bitte melden Sie sich als Admin an.",
        );
        toast.error("Bitte erst einloggen!");
        router.push("/login");
        return;
      }

      if (!isAdmin) {
        setError("Sie benötigen Admin-Rechte um Dateien hochzuladen.");
        toast.error("Admin-Rechte erforderlich!");
        return;
      }

      // Zusätzliche Session-Validierung
      if (!session?.user?.id) {
        setError("Session ungültig. Bitte melden Sie sich erneut an.");
        toast.error("Session ungültig!");
        router.push("/login");
        return;
      }

      console.log("✅ Upload-Authentifizierung erfolgreich:", {
        userId: session.user.id,
        userRole: session.profile?.role,
        isAdmin,
      });

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
            userId: session?.user?.id,
          });

          // Prüfe ob Bildkompression nötig ist
          let fileToUpload = file;

          if (shouldCompressImage(file)) {
            console.log("🖼️ Bildkompression wird angewendet...");
            setCompressionInfo({
              originalSize: file.size,
              compressedSize: estimateCompressedSize(file),
              isCompressing: true,
            });

            try {
              fileToUpload = await compressImage(file, {
                maxWidth: 1920,
                maxHeight: 1080,
                quality: 0.8,
              });

              setCompressionInfo({
                originalSize: file.size,
                compressedSize: fileToUpload.size,
                isCompressing: false,
              });

              console.log("✅ Bildkompression erfolgreich:", {
                original: formatFileSize(file.size),
                compressed: formatFileSize(fileToUpload.size),
                reduction:
                  Math.round(
                    ((file.size - fileToUpload.size) / file.size) * 100,
                  ) + "%",
              });
            } catch (compressionError) {
              console.warn(
                "⚠️ Bildkompression fehlgeschlagen, verwende Original:",
                compressionError,
              );
              fileToUpload = file;
              setCompressionInfo(null);
            }
          }

          // Konvertiere File zu Base64
          const base64Data = await fileToBase64(fileToUpload);

          console.log("📦 Upload-Daten:", {
            fileBase64Length: base64Data.length,
            filename: file.name,
            contentType: file.type,
          });

          // Upload über tRPC mit Base64
          const result = await uploadMutation.mutateAsync({
            file: base64Data, // String
            filename: fileToUpload.name, // String
            contentType: fileToUpload.type, // String
            directory: "allgemein", // String mit Default
            tags: [], // Array mit Default
            is_public: true, // Boolean mit Default
          });

          console.log("✅ Upload erfolgreich:", result);

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
    [
      uploadMutation,
      isAuthenticated,
      isAdmin,
      session?.profile?.role,
      session?.user?.id,
      router,
    ],
  );

  const handleFileInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      if (files.length > 0) {
        void handleFiles(files);
      }
    },
    [handleFiles],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const files = Array.from(event.dataTransfer.files);
      if (files.length > 0) {
        void handleFiles(files);
      }
    },
    [handleFiles],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
    },
    [],
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Progress */}
      {uploading && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
            <div className="flex-1">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Upload läuft... {Math.round(uploadProgress.percentage)}%
              </p>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-blue-200 dark:bg-blue-700">
                <div
                  className="h-full bg-blue-600 transition-all duration-300 dark:bg-blue-400"
                  style={{ width: `${uploadProgress.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compression Info */}
      {compressionInfo && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-700 dark:bg-orange-900/20">
          <div className="flex items-center space-x-2">
            <FileImage className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <div className="flex-1">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                {compressionInfo.isCompressing
                  ? "Bild wird komprimiert..."
                  : `Bild komprimiert: ${formatFileSize(
                      compressionInfo.originalSize,
                    )} → ${formatFileSize(compressionInfo.compressedSize)}`}
              </p>
            </div>
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
            onClick={handleClick}
            disabled={uploading}
            className="focus:outline-hidden rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-800"
          >
            {uploading ? "Upload läuft..." : "Dateien auswählen"}
          </button>
        </div>

        <div
          className="mt-4 min-h-[100px] rounded-lg border-2 border-dashed border-gray-300 p-4 dark:border-gray-600"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Hier Dateien ablegen
          </p>
        </div>
      </div>
    </div>
  );
}
