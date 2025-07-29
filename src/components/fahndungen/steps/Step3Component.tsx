"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Image as ImageIcon,
  FileText,
  Eye,
  Trash2,
  AlertCircle,
  Camera,
  Info,
  FileImage,
  FileVideo,
  FileAudio,
  Upload,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import type { Step3Data } from "../types/WizardTypes";

// Supabase Client initialisieren
const supabase = createClient(
  process.env["NEXT_PUBLIC_SUPABASE_URL"] ?? "",
  process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] ?? "",
);

interface Step3ComponentProps {
  data: Step3Data;
  onChange: (data: Step3Data) => void;
}

const Step3Component: React.FC<Step3ComponentProps> = ({ data, onChange }) => {
  const [dragZone, setDragZone] = useState<
    "main" | "additional" | "documents" | null
  >(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Live-Vorschau für Hauptbild
  useEffect(() => {
    if (data.mainImage) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(data.mainImage);
    } else {
      setImagePreview(null);
    }
  }, [data.mainImage]);

  // Hilfsfunktion zum Hochladen von Bildern
  const uploadImageToSupabase = async (file: File): Promise<string> => {
    try {
      console.log("🚀 Starte Bild-Upload für:", file.name);

      // Session prüfen
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("❌ Session-Fehler:", sessionError);
        throw new Error("Authentifizierungsfehler - Bitte melden Sie sich an");
      }

      if (!session?.user) {
        console.error("❌ Keine aktive Session");
        throw new Error("Nicht authentifiziert - Bitte melden Sie sich an");
      }

      console.log("✅ Authentifiziert für User:", session.user.email);

      // Eindeutigen Dateinamen generieren
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const fileExtension = file.name.split(".").pop();
      const fileName = `fahndungen/${timestamp}_${randomString}.${fileExtension}`;

      // Upload zu Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("media-gallery")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("❌ Upload-Fehler:", uploadError);
        throw new Error(`Upload-Fehler: ${uploadError.message}`);
      }

      if (!uploadData?.path) {
        throw new Error("Keine Pfad-Information vom Upload erhalten");
      }

      // Öffentliche URL generieren
      const { data: urlData } = supabase.storage
        .from("media-gallery")
        .getPublicUrl(uploadData.path);

      console.log("✅ Bild erfolgreich hochgeladen:", urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error: unknown) {
      console.error("❌ Bild-Upload fehlgeschlagen:", error);
      throw error;
    }
  };

  const handleDrag = (
    e: React.DragEvent,
    zone: "main" | "additional" | "documents",
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragZone(zone);
    } else if (e.type === "dragleave") {
      setDragZone(null);
    }
  };

  const handleDrop = (
    e: React.DragEvent,
    zone: "main" | "additional" | "documents",
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragZone(null);

    if (e.dataTransfer.files?.[0]) {
      const files = Array.from(e.dataTransfer.files);
      void handleFilesUpload(files, zone);
    }
  };

  const handleFilesUpload = async (
    files: File[],
    zone: "main" | "additional" | "documents",
  ) => {
    const newErrors: string[] = [];

    files.forEach((file) => {
      // Validierung
      if (file.size > 20 * 1024 * 1024) {
        newErrors.push(`${file.name} ist zu groß (max. 20MB)`);
        return;
      }

      if (zone === "main" || zone === "additional") {
        if (!file.type.startsWith("image/")) {
          newErrors.push(`${file.name} ist kein gültiges Bildformat`);
          return;
        }
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setTimeout(() => setErrors([]), 5000);
      return;
    }

    // Dateien verarbeiten
    if (zone === "main") {
      const file = files[0];
      if (file) {
        onChange({
          ...data,
          mainImage: file,
        });
      }
    } else if (zone === "additional") {
      onChange({
        ...data,
        additionalImages: [...data.additionalImages, ...files],
      });
    } else if (zone === "documents") {
      onChange({
        ...data,
        documents: [...data.documents, ...files],
      });
    }
  };

  const handleImageUpload = async (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      if (!file) return;

      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Simuliere Progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        // Bild hochladen
        const imageUrl = await uploadImageToSupabase(file);

        clearInterval(progressInterval);
        setUploadProgress(100);

        // Aktualisiere Daten mit URL statt File
        onChange({
          ...data,
          mainImage: file,
          mainImageUrl: imageUrl, // Neue Eigenschaft für URL
        });

        console.log("✅ Hauptbild erfolgreich hochgeladen:", imageUrl);
      } catch (error: unknown) {
        console.error("❌ Fehler beim Hochladen des Hauptbildes:", error);
        setErrors([
          `Fehler beim Hochladen: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
        ]);
        setTimeout(() => setErrors([]), 5000);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const handleAdditionalImagesUpload = async (files: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;

        // Progress für jedes Bild
        setUploadProgress((i / files.length) * 100);

        try {
          const imageUrl = await uploadImageToSupabase(file);
          uploadedUrls.push(imageUrl);
        } catch (error: unknown) {
          console.error(`❌ Fehler beim Hochladen von ${file.name}:`, error);
          setErrors([
            `Fehler beim Hochladen von ${file.name}: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
          ]);
        }
      }

      // Aktualisiere Daten mit URLs
      const currentAdditionalImageUrls = data.additionalImageUrls ?? [];
      const updatedData: Step3Data = {
        ...data,
        additionalImages: [...data.additionalImages, ...files],
        additionalImageUrls: [...currentAdditionalImageUrls, ...uploadedUrls],
      };
      onChange(updatedData);

      console.log(
        "✅ Zusätzliche Bilder erfolgreich hochgeladen:",
        uploadedUrls,
      );
    } catch (error: unknown) {
      console.error("❌ Fehler beim Hochladen der zusätzlichen Bilder:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unbekannter Fehler";
      setErrors([`Fehler beim Hochladen: ${errorMessage}`]);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDocumentUpload = (files: File[]) => {
    const updatedData: Step3Data = {
      ...data,
      documents: [...data.documents, ...files],
    };
    onChange(updatedData);
  };

  const removeMainImage = () => {
    const updatedData: Step3Data = {
      ...data,
      mainImage: null,
      mainImageUrl: null,
    };
    onChange(updatedData);
  };

  const removeAdditionalImage = (index: number) => {
    if (!Array.isArray(data.additionalImages)) {
      console.error("additionalImages ist kein Array");
      return;
    }

    const newAdditionalImages = data.additionalImages.filter(
      (_, i) => i !== index,
    );
    const currentAdditionalImageUrls = data.additionalImageUrls ?? [];
    const newAdditionalImageUrls = currentAdditionalImageUrls.filter(
      (_, i) => i !== index,
    );

    const updatedData: Step3Data = {
      ...data,
      additionalImages: newAdditionalImages,
      additionalImageUrls: newAdditionalImageUrls,
    };
    onChange(updatedData);
  };

  const removeDocument = (index: number) => {
    if (!Array.isArray(data.documents)) {
      console.error("documents ist kein Array");
      return;
    }

    const updatedData: Step3Data = {
      ...data,
      documents: data.documents.filter((_, i) => i !== index),
    };
    onChange(updatedData);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return FileImage;
    if (file.type.startsWith("video/")) return FileVideo;
    if (file.type.startsWith("audio/")) return FileAudio;
    return FileText;
  };

  const getFileTypeLabel = (file: File) => {
    if (file.type.startsWith("image/")) return "Bild";
    if (file.type.startsWith("video/")) return "Video";
    if (file.type.startsWith("audio/")) return "Audio";
    return "Dokument";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Schritt 3: Medien & Dokumente
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Fügen Sie Bilder und Dokumente zur Fahndung hinzu
        </p>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-sm text-blue-800 dark:text-blue-200">
              Bilder werden hochgeladen... {uploadProgress.toFixed(0)}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-blue-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Fehlermeldungen */}
      {errors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="font-medium text-red-800 dark:text-red-200">
              Fehler beim Hochladen:
            </span>
          </div>
          <ul className="mt-2 list-disc pl-5 text-sm text-red-700 dark:text-red-300">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Hauptbild */}
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Hauptbild *
          </label>
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
            Das Hauptbild wird auf der Fahndungskarte angezeigt
          </p>

          {/* Drag & Drop Zone für Hauptbild */}
          <div
            className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              dragZone === "main"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                : "border-gray-300 hover:border-gray-400 dark:border-gray-600"
            }`}
            onDragEnter={(e) => handleDrag(e, "main")}
            onDragOver={(e) => handleDrag(e, "main")}
            onDragLeave={(e) => handleDrag(e, "main")}
            onDrop={(e) => handleDrop(e, "main")}
          >
            {data.mainImage ? (
              <div className="space-y-4">
                <div className="relative mx-auto max-w-xs">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Vorschau"
                      width={200}
                      height={150}
                      className="rounded-lg object-cover"
                    />
                  ) : null}
                  <button
                    onClick={removeMainImage}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium">{data.mainImage.name}</p>
                  <p>{formatFileSize(data.mainImage.size)}</p>
                  {data.mainImageUrl && (
                    <p className="text-xs text-green-600">✅ Hochgeladen</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                  <Camera className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Bild hierher ziehen oder klicken zum Auswählen
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, GIF bis 20MB
                  </p>
                </div>
                <button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isUploading}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" />
                      Wird hochgeladen...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 inline-block h-4 w-4" />
                      Bild auswählen
                    </>
                  )}
                </button>
              </div>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={(e) =>
                e.target.files && handleImageUpload(Array.from(e.target.files))
              }
              className="hidden"
              disabled={isUploading}
            />
          </div>
        </div>

        {/* Weitere Bilder */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Weitere Bilder
          </label>
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
            Zusätzliche Bilder für die Detailansicht
          </p>

          {/* Drag & Drop Zone für weitere Bilder */}
          <div
            className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
              dragZone === "additional"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                : "border-gray-300 hover:border-gray-400 dark:border-gray-600"
            }`}
            onDragEnter={(e) => handleDrag(e, "additional")}
            onDragOver={(e) => handleDrag(e, "additional")}
            onDragLeave={(e) => handleDrag(e, "additional")}
            onDrop={(e) => handleDrop(e, "additional")}
          >
            <div className="space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                <ImageIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Weitere Bilder hierher ziehen
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF bis 20MB
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="rounded-lg bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" />
                    Wird hochgeladen...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 inline-block h-4 w-4" />
                    Bilder auswählen
                  </>
                )}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                e.target.files &&
                handleAdditionalImagesUpload(Array.from(e.target.files))
              }
              className="hidden"
              disabled={isUploading}
            />
          </div>

          {/* Anzeige der weiteren Bilder */}
          {Array.isArray(data.additionalImages) &&
            data.additionalImages.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Hochgeladene Bilder ({data.additionalImages.length})
                </h4>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {data.additionalImages.map((file, index) => {
                    const Icon = getFileIcon(file);
                    const currentAdditionalImageUrls =
                      data.additionalImageUrls ?? [];
                    const isUploaded = currentAdditionalImageUrls[index];

                    return (
                      <div
                        key={index}
                        className="group relative rounded-lg border border-gray-200 p-3 dark:border-gray-600"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-gray-500" />
                          <span className="flex-1 truncate text-xs">
                            {file.name}
                          </span>
                          <button
                            onClick={() => removeAdditionalImage(index)}
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X className="h-3 w-3 text-red-500" />
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.size)}
                        </p>
                        {isUploaded && (
                          <p className="text-xs text-green-600">
                            ✅ Hochgeladen
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </div>

        {/* Dokumente */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Dokumente
          </label>
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
            PDFs, Word-Dokumente und andere relevante Dateien
          </p>

          {/* Drag & Drop Zone für Dokumente */}
          <div
            className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
              dragZone === "documents"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                : "border-gray-300 hover:border-gray-400 dark:border-gray-600"
            }`}
            onDragEnter={(e) => handleDrag(e, "documents")}
            onDragOver={(e) => handleDrag(e, "documents")}
            onDragLeave={(e) => handleDrag(e, "documents")}
            onDrop={(e) => handleDrop(e, "documents")}
          >
            <div className="space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Dokumente hierher ziehen
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PDF, DOC, DOCX bis 20MB
                </p>
              </div>
              <button
                onClick={() => documentInputRef.current?.click()}
                className="rounded-lg bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-700"
              >
                Dokumente auswählen
              </button>
            </div>
            <input
              ref={documentInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              multiple
              onChange={(e) =>
                e.target.files &&
                handleDocumentUpload(Array.from(e.target.files))
              }
              className="hidden"
            />
          </div>

          {/* Anzeige der Dokumente */}
          {data.documents.length > 0 && (
            <div className="mt-4">
              <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Hochgeladene Dokumente ({data.documents.length})
              </h4>
              <div className="space-y-2">
                {data.documents.map((file, index) => {
                  const Icon = getFileIcon(file);
                  return (
                    <div
                      key={index}
                      className="group flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {getFileTypeLabel(file)} •{" "}
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
                          <Eye className="h-4 w-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => removeDocument(index)}
                          className="rounded p-1 hover:bg-red-100 dark:hover:bg-red-900"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info-Box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500" />
          <div className="text-sm">
            <h4 className="font-medium text-blue-900 dark:text-blue-100">
              Tipps für optimale Medien
            </h4>
            <ul className="mt-2 space-y-1 text-blue-800 dark:text-blue-200">
              <li>• Hauptbild: Hochauflösend, gut beleuchtet</li>
              <li>• Weitere Bilder: Verschiedene Perspektiven und Details</li>
              <li>• Dokumente: Nur relevante und aktuelle Informationen</li>
              <li>• Maximale Dateigröße: 20MB pro Datei</li>
              <li>• Bilder werden automatisch zu Supabase hochgeladen</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Component;
