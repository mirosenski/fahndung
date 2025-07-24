import React, { useState, useEffect } from "react";
import {
  Upload,
  X,
  AlertCircle,
  CheckCircle,
  FileImage,
  Info,
  Loader2,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";

// Supabase Client initialisieren
const supabase = createClient(
  process.env["NEXT_PUBLIC_SUPABASE_URL"] ?? "",
  process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] ?? "",
);

interface UploadResult {
  path: string;
  url: string;
  error?: string;
}

interface MediaUploadRobustProps {
  onUploadComplete?: (result: UploadResult) => void;
  bucketName?: string;
}

export default function MediaUploadRobust({
  onUploadComplete,
  bucketName = "media",
}: MediaUploadRobustProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Session überwachen
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        console.log(
          "📱 MediaUpload: Session Status:",
          session ? "✅ Aktiv" : "❌ Inaktiv",
        );
      } catch (error) {
        console.error("❌ MediaUpload: Session-Check Fehler:", error);
      }
    };

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      console.log(
        "🔄 MediaUpload: Auth State Change:",
        session ? "✅ Aktiv" : "❌ Inaktiv",
      );
    });

    return () => subscription.unsubscribe();
  }, []);

  // Datei-Auswahl Handler
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setError(null);
    setUploadResult(null);

    // Preview für Bilder
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  // Drag & Drop Handler
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.add("border-blue-500", "bg-blue-50");
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove("border-blue-500", "bg-blue-50");
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove("border-blue-500", "bg-blue-50");

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file) {
        setSelectedFile(file);
        setError(null);
        setUploadResult(null);

        // Preview für Bilder
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreview(reader.result as string);
          };
          reader.readAsDataURL(file);
        } else {
          setPreview(null);
        }
      }
    }
  };

  // Upload Handler
  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Bitte wählen Sie eine Datei aus");
      return;
    }

    if (!session) {
      setError("Sie müssen angemeldet sein, um Dateien hochzuladen");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);
    setUploadResult(null);

    try {
      console.log("🚀 MediaUpload: Starte Upload für:", selectedFile.name);

      // Eindeutigen Dateinamen generieren
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const fileExtension = selectedFile.name.split(".").pop();
      const fileName = `${timestamp}_${randomString}.${fileExtension}`;

      // Progress simulieren
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Upload zu Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      clearInterval(progressInterval);
      setProgress(100);

      if (uploadError) {
        console.error("❌ MediaUpload: Upload-Fehler:", uploadError);
        throw new Error(uploadError.message);
      }

      if (!data?.path) {
        throw new Error("Keine Pfad-Information vom Server erhalten");
      }

      // Öffentliche URL generieren
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(data.path);

      const result: UploadResult = {
        path: data.path,
        url: publicUrl,
      };

      console.log("✅ MediaUpload: Upload erfolgreich:", result);
      setUploadResult(result);

      // Callback aufrufen
      if (onUploadComplete) {
        onUploadComplete(result);
      }

      // Reset nach 5 Sekunden
      setTimeout(() => {
        setSelectedFile(null);
        setPreview(null);
        setUploadResult(null);
        setProgress(0);
      }, 5000);
    } catch (err) {
      console.error("❌ MediaUpload: Fehler:", err);
      setError(
        err instanceof Error ? err.message : "Unbekannter Fehler beim Upload",
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Datei löschen
  const handleDelete = async () => {
    if (!uploadResult?.path) return;

    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([uploadResult.path]);

      if (error) {
        console.error("❌ MediaUpload: Lösch-Fehler:", error);
        setError("Fehler beim Löschen der Datei");
      } else {
        console.log("✅ MediaUpload: Datei gelöscht");
        setUploadResult(null);
        setSelectedFile(null);
        setPreview(null);
      }
    } catch (err) {
      console.error("❌ MediaUpload: Lösch-Fehler:", err);
      setError("Fehler beim Löschen der Datei");
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
      <div className="mb-6">
        <h3 className="mb-2 text-xl font-semibold">📁 Medien Upload</h3>
        <p className="text-sm text-gray-600">
          Laden Sie Bilder, Videos oder Dokumente hoch (max. 10MB)
        </p>
      </div>

      {/* Session Status */}
      <div
        className={`mb-4 rounded-lg p-3 ${session ? "border border-green-200 bg-green-50" : "border border-red-200 bg-red-50"}`}
      >
        <div className="flex items-center space-x-2">
          {session ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-800">
                Angemeldet als: {session.user?.email}
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm text-red-800">
                Nicht angemeldet - Bitte melden Sie sich an
              </span>
            </>
          )}
        </div>
      </div>

      {/* File Selection */}
      <div className="mb-6">
        <label className="block w-full">
          <div
            className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-gray-400"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FileImage className="mb-2 h-10 w-10 text-gray-400" />
            <span className="text-sm text-gray-600">
              {selectedFile
                ? selectedFile.name
                : "Klicken Sie hier oder ziehen Sie eine Datei herein"}
            </span>
            <span className="mt-1 text-xs text-gray-500">
              Unterstützt: Bilder, Videos, PDF, Dokumente
            </span>
          </div>
          <input
            type="file"
            onChange={handleFileSelect}
            disabled={isUploading || !session}
            accept="image/*,video/*,.pdf,.doc,.docx"
            className="hidden"
          />
        </label>
      </div>

      {/* Preview */}
      {preview && (
        <div className="mb-6">
          <h4 className="mb-2 text-sm font-medium text-gray-700">Vorschau:</h4>
          <img
            src={preview}
            alt="Vorschau"
            className="max-h-48 rounded-lg shadow-md"
          />
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-700">Upload läuft...</span>
            <span className="text-sm text-gray-700">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Success Message */}
      {uploadResult && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="mb-2 flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">
              Upload erfolgreich!
            </span>
          </div>
          <div className="space-y-1 text-sm text-green-700">
            <div className="truncate">
              <strong>Pfad:</strong> {uploadResult.path}
            </div>
            <div className="truncate">
              <strong>URL:</strong>{" "}
              <a
                href={uploadResult.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {uploadResult.url}
              </a>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="mt-3 text-sm text-red-600 hover:text-red-700"
          >
            Datei löschen
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading || !session}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" />
              Upload läuft...
            </>
          ) : (
            <>
              <Upload className="mr-2 inline-block h-4 w-4" />
              Hochladen
            </>
          )}
        </button>

        {selectedFile && !isUploading && (
          <button
            onClick={() => {
              setSelectedFile(null);
              setPreview(null);
              setError(null);
              setUploadResult(null);
            }}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
          >
            <X className="mr-2 inline-block h-4 w-4" />
            Abbrechen
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 rounded-lg bg-blue-50 p-4">
        <div className="flex items-start space-x-2">
          <Info className="mt-0.5 h-5 w-5 text-blue-600" />
          <div className="text-sm text-blue-800">
            <h4 className="mb-1 font-medium">Hinweise:</h4>
            <ul className="list-inside list-disc space-y-1">
              <li>Maximale Dateigröße: 10MB</li>
              <li>Unterstützte Formate: JPG, PNG, GIF, MP4, PDF, DOC, DOCX</li>
              <li>Dateien werden automatisch umbenannt</li>
              <li>Uploads sind sofort öffentlich verfügbar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
