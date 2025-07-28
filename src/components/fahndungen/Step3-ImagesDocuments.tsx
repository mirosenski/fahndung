"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  X,
  Image as ImageIcon,
  FileText,
  Eye,
  Trash2,
  AlertCircle,
  Camera,
  Edit3,
  Download,
  CheckCircle,
  Info,
  FileImage,
  FileVideo,
  FileAudio,
} from "lucide-react";
import Image from "next/image";

interface Step3Data {
  mainImage: File | null;
  additionalImages: File[];
  documents: File[];
}

interface Step3Props {
  data: Step3Data;
  onChange: (data: Step3Data) => void;
}

const Step3ImagesDocuments: React.FC<Step3Props> = ({ data, onChange }) => {
  const [dragZone, setDragZone] = useState<
    "main" | "additional" | "documents" | null
  >(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

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
      handleFilesUpload(files, zone);
    }
  };

  const handleFilesUpload = (
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

        if (file.size > 10 * 1024 * 1024) {
          newErrors.push(`${file.name} ist zu groß (max. 10MB für Bilder)`);
          return;
        }
      }

      if (zone === "documents") {
        const allowedTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ];

        if (!allowedTypes.includes(file.type)) {
          newErrors.push(
            `${file.name} ist kein unterstütztes Dokumentenformat`,
          );
          return;
        }
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setTimeout(() => setErrors([]), 5000);
      return;
    }

    // Verarbeitung der gültigen Dateien
    if (zone === "main") {
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));
      if (imageFiles.length > 0) {
        onChange({ ...data, mainImage: imageFiles[0] ?? null });
      }
    } else if (zone === "additional") {
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));
      const newImages = [...data.additionalImages, ...imageFiles];
      onChange({ ...data, additionalImages: newImages });
    } else if (zone === "documents") {
      const newDocuments = [...data.documents, ...files];
      onChange({ ...data, documents: newDocuments });
    }
  };

  const handleImageUpload = (files: File[]) => {
    const newImages = [...data.additionalImages];

    files.forEach((file) => {
      if (file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024) {
        if (!data.mainImage) {
          onChange({ ...data, mainImage: file });
        } else {
          newImages.push(file);
        }
      }
    });

    if (newImages.length !== data.additionalImages.length) {
      onChange({ ...data, additionalImages: newImages });
    }
  };

  const handleDocumentUpload = (files: File[]) => {
    const newDocuments = [...data.documents];

    files.forEach((file) => {
      if (
        (file.type === "application/pdf" || file.type.includes("document")) &&
        file.size <= 20 * 1024 * 1024
      ) {
        newDocuments.push(file);
      }
    });

    if (newDocuments.length !== data.documents.length) {
      onChange({ ...data, documents: newDocuments });
    }
  };

  const removeMainImage = () => {
    onChange({ ...data, mainImage: null });
    setImagePreview(null);
  };

  const removeAdditionalImage = (index: number) => {
    const newImages = data.additionalImages.filter((_, i) => i !== index);
    onChange({ ...data, additionalImages: newImages });
  };

  const removeDocument = (index: number) => {
    const newDocuments = data.documents.filter((_, i) => i !== index);
    onChange({ ...data, documents: newDocuments });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/"))
      return <FileImage className="h-6 w-6 text-blue-500" />;
    if (file.type.startsWith("video/"))
      return <FileVideo className="h-6 w-6 text-purple-500" />;
    if (file.type.startsWith("audio/"))
      return <FileAudio className="h-6 w-6 text-green-500" />;
    return <FileText className="h-6 w-6 text-gray-500" />;
  };

  const getFileTypeLabel = (file: File) => {
    if (file.type.startsWith("image/")) return "Bild";
    if (file.type === "application/pdf") return "PDF";
    if (file.type.includes("word")) return "Word";
    if (file.type.includes("excel")) return "Excel";
    if (file.type === "text/plain") return "Text";
    return "Dokument";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Schritt 3: Bilder & Dokumente
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Laden Sie Bilder und Dokumente für die Fahndung hoch
        </p>
      </div>

      {/* Fehleranzeige */}
      {errors.length > 0 && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-600 dark:text-red-400" />
            <div>
              <h4 className="mb-1 text-sm font-medium text-red-800 dark:text-red-200">
                Upload-Fehler
              </h4>
              <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Hauptbild Upload mit Live-Vorschau */}
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Hauptbild *
          </label>
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
            Das Hauptbild wird auf der Fahndungskarte angezeigt. Format: JPG,
            PNG, WebP (max. 10MB)
          </p>

          {data.mainImage ? (
            <div className="space-y-4">
              {/* Live-Vorschau */}
              <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
                {imagePreview && (
                  <div className="relative h-64">
                    <Image
                      src={imagePreview}
                      alt="Hauptbild Vorschau"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="bg-opacity-0 hover:bg-opacity-10 absolute inset-0 bg-black transition-all duration-200">
                      <div className="absolute top-2 right-2 flex space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "image/*";
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement)
                                .files?.[0];
                              if (file) {
                                onChange({ ...data, mainImage: file });
                              }
                            };
                            input.click();
                          }}
                          className="bg-opacity-90 hover:bg-opacity-100 rounded-full bg-white p-2 text-gray-700"
                          title="Bild ersetzen"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={removeMainImage}
                          className="bg-opacity-90 hover:bg-opacity-100 rounded-full bg-white p-2 text-red-600"
                          title="Bild entfernen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Datei-Informationen */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <ImageIcon className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {data.mainImage.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatFileSize(data.mainImage.size)} •{" "}
                          {getFileTypeLabel(data.mainImage)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center space-x-1 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Hauptbild</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200 ${
                dragZone === "main"
                  ? "scale-105 border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 hover:border-blue-400 dark:border-gray-600"
              }`}
              onDragEnter={(e) => handleDrag(e, "main")}
              onDragLeave={(e) => handleDrag(e, "main")}
              onDragOver={(e) => handleDrag(e, "main")}
              onDrop={(e) => handleDrop(e, "main")}
            >
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onChange({ ...data, mainImage: file });
                  }
                }}
                className="hidden"
              />

              <div className="space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 p-4 dark:bg-blue-900/20">
                  <Camera className="h-8 w-8 text-blue-500" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    Hauptbild hochladen
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Ziehen Sie ein Bild hierher oder klicken Sie zum Auswählen
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Bild auswählen
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Weitere Bilder */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Weitere Bilder
          </label>
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
            Zusätzliche Bilder für die Detailansicht (optional)
          </p>

          <div
            className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-all duration-200 ${
              dragZone === "additional"
                ? "scale-105 border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 hover:border-blue-400 dark:border-gray-600"
            }`}
            onDragEnter={(e) => handleDrag(e, "additional")}
            onDragLeave={(e) => handleDrag(e, "additional")}
            onDragOver={(e) => handleDrag(e, "additional")}
            onDrop={(e) => handleDrop(e, "additional")}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                handleImageUpload(files);
              }}
              className="hidden"
            />

            <div className="space-y-3">
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Weitere Bilder hinzufügen
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Ziehen Sie Bilder hierher oder klicken Sie zum Auswählen
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
              >
                Bilder auswählen
              </button>
            </div>
          </div>

          {/* Angezeigte zusätzliche Bilder */}
          {data.additionalImages.length > 0 && (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.additionalImages.map((file, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`Zusätzliches Bild ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-200 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="bg-opacity-0 group-hover:bg-opacity-20 absolute inset-0 bg-black transition-all duration-200">
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <button
                        type="button"
                        onClick={() => {
                          const url = URL.createObjectURL(file);
                          window.open(url, "_blank");
                        }}
                        className="bg-opacity-90 hover:bg-opacity-100 rounded-full bg-white p-1.5 text-gray-700"
                        title="Vorschau"
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(index)}
                        className="bg-opacity-90 hover:bg-opacity-100 rounded-full bg-white p-1.5 text-red-600"
                        title="Entfernen"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="truncate text-xs font-medium text-gray-900 dark:text-white">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dokumente */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Dokumente
          </label>
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
            PDF-Dokumente und andere Dateien (optional, max. 20MB pro Datei)
          </p>

          <div
            className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-all duration-200 ${
              dragZone === "documents"
                ? "scale-105 border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 hover:border-blue-400 dark:border-gray-600"
            }`}
            onDragEnter={(e) => handleDrag(e, "documents")}
            onDragLeave={(e) => handleDrag(e, "documents")}
            onDragOver={(e) => handleDrag(e, "documents")}
            onDrop={(e) => handleDrop(e, "documents")}
          >
            <input
              ref={documentInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                handleDocumentUpload(files);
              }}
              className="hidden"
            />

            <div className="space-y-3">
              <FileText className="mx-auto h-8 w-8 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Dokumente hinzufügen
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Ziehen Sie Dokumente hierher oder klicken Sie zum Auswählen
                </p>
              </div>
              <button
                type="button"
                onClick={() => documentInputRef.current?.click()}
                className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
              >
                Dokumente auswählen
              </button>
            </div>
          </div>

          {/* Angezeigte Dokumente */}
          {data.documents.length > 0 && (
            <div className="mt-4 space-y-2">
              {data.documents.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file)}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)} • {getFileTypeLabel(file)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        const url = URL.createObjectURL(file);
                        window.open(url, "_blank");
                      }}
                      className="text-blue-600 hover:text-blue-700"
                      title="Vorschau"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const url = URL.createObjectURL(file);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = file.name;
                        a.click();
                      }}
                      className="text-green-600 hover:text-green-700"
                      title="Herunterladen"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-red-600 hover:text-red-700"
                      title="Entfernen"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Erweiterte Hilfe & Tipps */}
      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h4 className="mb-1 text-sm font-medium text-blue-800 dark:text-blue-200">
              Tipps für optimale Medien
            </h4>
            <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
              <li>
                • Verwenden Sie hochauflösende Bilder (mindestens 800x600 Pixel)
              </li>
              <li>
                • Hauptbild sollte das Gesicht oder den Gegenstand gut zeigen
              </li>
              <li>• Unterstützte Bildformate: JPG, PNG, WebP (max. 10MB)</li>
              <li>
                • Unterstützte Dokumente: PDF, Word, Excel, Text (max. 20MB)
              </li>
              <li>• Drag & Drop funktioniert für alle Upload-Bereiche</li>
              <li>• Klicken Sie auf Bilder für eine Vorschau</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload-Statistiken */}
      <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Upload-Übersicht
            </span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {data.mainImage ? "1" : "0"} Hauptbild •{" "}
            {data.additionalImages.length} weitere Bilder •{" "}
            {data.documents.length} Dokumente
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3ImagesDocuments;
