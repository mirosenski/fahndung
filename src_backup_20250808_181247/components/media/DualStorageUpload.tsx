import React, { useState } from "react";
import { Upload, Cloud, HardDrive, Loader2 } from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { toast } from "~/lib/toast";
import type { LocalImageMetadata } from "~/lib/services/local-storage.service";

interface DualStorageUploadProps {
  onUploadComplete?: (result: {
    success: boolean;
    media: LocalImageMetadata | Record<string, unknown>;
    url: string;
    storageType: "local" | "supabase";
  }) => void;
}

export default function DualStorageUpload({
  onUploadComplete,
}: DualStorageUploadProps) {
  const [useLocalStorage, setUseLocalStorage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadToSupabase = api.media.uploadMedia.useMutation();
  const uploadToLocal = api.localMedia.uploadLocalImage.useMutation();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log("📁 Datei ausgewählt:", {
        name: file.name,
        size: file.size,
        type: file.type,
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Bitte wählen Sie eine Datei aus");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      console.log("🚀 Starte Upload für:", selectedFile.name);
      console.log("📊 Datei-Details:", {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        useLocalStorage,
      });

      // Progress simulieren
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const base64Data = await fileToBase64(selectedFile);
      console.log(
        "✅ Base64 Konvertierung erfolgreich, Länge:",
        base64Data.length,
      );

      if (useLocalStorage) {
        console.log("📁 Verwende lokalen Storage");

        try {
          const result = await uploadToLocal.mutateAsync({
            file: base64Data,
            filename: selectedFile.name,
            contentType: selectedFile.type,
            directory: "uploads",
            tags: [],
            is_public: true,
          });

          clearInterval(progressInterval);
          setUploadProgress(100);

          console.log("✅ Lokaler Upload erfolgreich:", result);

          toast.success(`Bild wurde lokal gespeichert: ${selectedFile.name}`);

          onUploadComplete?.({
            ...result,
            storageType: "local" as const,
          });
        } catch (localError) {
          console.error("❌ Lokaler Upload fehlgeschlagen:", localError);
          throw localError;
        }
      } else {
        console.log("☁️ Verwende Supabase Storage");

        try {
          const result = await uploadToSupabase.mutateAsync({
            file: base64Data,
            filename: selectedFile.name,
            contentType: selectedFile.type,
            directory: "uploads",
            tags: [],
            is_public: true,
          });

          clearInterval(progressInterval);
          setUploadProgress(100);

          console.log("✅ Supabase Upload erfolgreich:", result);

          toast.success(
            `Bild wurde zu Supabase hochgeladen: ${selectedFile.name}`,
          );

          onUploadComplete?.({
            ...result,
            storageType: "supabase" as const,
          });
        } catch (supabaseError) {
          console.error("❌ Supabase Upload fehlgeschlagen:", supabaseError);
          throw supabaseError;
        }
      }

      // Reset nach erfolgreichem Upload
      setSelectedFile(null);
      setUploadProgress(0);
    } catch (error) {
      console.error("❌ Upload fehlgeschlagen:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unbekannter Fehler";
      console.error("❌ Fehler-Details:", {
        message: errorMessage,
        error,
        useLocalStorage,
      });

      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        if (base64) {
          resolve(base64);
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };
      reader.onerror = () => reject(new Error("File reading failed"));
    });
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-blue-500" />
          <span>Supabase</span>
        </div>
        <Switch
          checked={useLocalStorage}
          onCheckedChange={setUseLocalStorage}
          disabled={isUploading}
        />
        <div className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-green-500" />
          <span>Lokal</span>
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={isUploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
      />

      {selectedFile && (
        <div className="text-sm text-gray-600">
          Ausgewählte Datei: {selectedFile.name} (
          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
        </div>
      )}

      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Upload läuft... {uploadProgress}%
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <Button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        className="w-full"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Upload läuft...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Hochladen zu {useLocalStorage ? "lokalen Storage" : "Supabase"}
          </>
        )}
      </Button>

      {/* Debug Info */}
      <div className="mt-2 text-xs text-gray-500">
        <div>Upload-Mutation Status:</div>
        <div>
          Lokal:{" "}
          {uploadToLocal.isPending
            ? "Lädt..."
            : uploadToLocal.isError
              ? "Fehler"
              : "Bereit"}
        </div>
        <div>
          Supabase:{" "}
          {uploadToSupabase.isPending
            ? "Lädt..."
            : uploadToSupabase.isError
              ? "Fehler"
              : "Bereit"}
        </div>
        {uploadToLocal.error && (
          <div className="mt-1 text-red-500">
            Lokaler Upload Fehler: {uploadToLocal.error.message}
          </div>
        )}
        {uploadToSupabase.error && (
          <div className="mt-1 text-red-500">
            Supabase Upload Fehler: {uploadToSupabase.error.message}
          </div>
        )}
      </div>
    </div>
  );
}
