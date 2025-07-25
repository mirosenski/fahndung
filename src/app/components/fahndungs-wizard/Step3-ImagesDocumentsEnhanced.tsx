import React, { useState, useEffect, useCallback } from "react";
import {
  Upload,
  FolderOpen,
  Image,
  FileText,
  X,
  Check,
  Grid,
  Search,
  Folder,
  Eye,
  Download,
  AlertCircle,
  Info,
} from "lucide-react";
import type { Step3Data } from "@/types/fahndung-wizard";
import {
  mediaService,
  type MediaItem,
  type UploadProgress,
} from "~/lib/media-service";

interface Step3Props {
  data: Step3Data;
  onUpdate: (data: Step3Data) => void;
  onNext: () => void;
  onBack: () => void;
  caseNumber: string; // z.B. "ST-2025-07-308"
}

export default function Step3ImagesDocumentsEnhanced({
  data,
  caseNumber,
  onUpdate,
  onNext,
  onBack,
}: Step3Props) {
  const [dragActive, setDragActive] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryItems, setGalleryItems] = useState<MediaItem[]>([]);
  const [selectedGalleryItems, setSelectedGalleryItems] = useState<string[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [folders, setFolders] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Generiere Verzeichnispfad basierend auf Aktenzeichen
  const getDirectoryPath = useCallback(() => {
    return `fahndungen/${caseNumber}`;
  }, [caseNumber]);

  // Lade Galerie-Items
  const loadGalleryItems = async () => {
    setLoading(true);
    try {
      const items = await mediaService.getMediaGallery({
        mediaType: "image",
        limit: 100,
      });

      setGalleryItems(items);

      // Extrahiere eindeutige Ordner
      const uniqueFolders = [
        ...new Set(
          items.map((item: MediaItem) => {
            const parts = item.directory.split("/");
            return parts.length > 1
              ? parts.slice(0, 2).join("/")
              : item.directory;
          }),
        ),
      ];
      setFolders(uniqueFolders);
    } catch (error) {
      console.error("Fehler beim Laden der Galerie:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showGallery) {
      void loadGalleryItems();
    }
  }, [showGallery]);

  // Drag & Drop Handler
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    void handleFiles(files);
  };

  // Datei-Upload mit Fortschritt
  const uploadFile = async (file: File, index: number) => {
    try {
      // Upload mit MediaService
      const mediaItem = await mediaService.uploadFile(
        {
          file,
          directory: getDirectoryPath(),
          isPrimary: !data.mainImage && index === 0,
          metadata: {
            uploadedAt: new Date().toISOString(),
            caseNumber,
          },
        },
        (progress: UploadProgress) => {
          setUploadProgress((prev) => ({
            ...prev,
            [progress.fileName]: progress.progress,
          }));
        },
      );

      return { success: true, file, mediaItem };
    } catch (error) {
      console.error("Upload-Fehler:", error);
      return { success: false, file, error };
    }
  };

  const handleFiles = async (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const docFiles = files.filter(
      (file) =>
        file.type === "application/pdf" ||
        file.type.includes("document") ||
        file.type.includes("word"),
    );

    // Setze erstes Bild als Hauptbild wenn noch keins vorhanden
    if (!data.mainImage && imageFiles.length > 0) {
      const firstImage = imageFiles[0];
      if (firstImage) {
        onUpdate({
          mainImage: firstImage,
          additionalImages: data.additionalImages,
          documents: data.documents,
          imagePreviews: data.imagePreviews ?? [],
        });

        // Upload des Hauptbildes
        await uploadFile(firstImage, 0);
        imageFiles.shift();
      }
    }

    // Weitere Bilder hinzufügen
    if (imageFiles.length > 0) {
      onUpdate({
        mainImage: data.mainImage,
        additionalImages: [...data.additionalImages, ...imageFiles],
        documents: data.documents,
        imagePreviews: data.imagePreviews ?? [],
      });

      // Upload der weiteren Bilder
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        if (file) {
          await uploadFile(file, i + 1);
        }
      }
    }

    // Dokumente hinzufügen
    if (docFiles.length > 0) {
      onUpdate({
        mainImage: data.mainImage,
        additionalImages: data.additionalImages,
        documents: [...data.documents, ...docFiles],
        imagePreviews: data.imagePreviews ?? [],
      });
    }

    // Reset Upload-Fortschritt nach 2 Sekunden
    setTimeout(() => {
      setUploadProgress({});
    }, 2000);
  };

  // Galerie-Auswahl
  const handleGallerySelect = (itemId: string) => {
    setSelectedGalleryItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const handleApplyGallerySelection = async () => {
    const selectedItems = galleryItems.filter((item) =>
      selectedGalleryItems.includes(item.id),
    );

    // Konvertiere zu Files für konsistente Handhabung
    const newFiles: File[] = [];
    for (const item of selectedItems) {
      try {
        // Verwende die korrekte Supabase Storage URL
        const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"];
        const bucketName = "media-gallery";
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${item.file_path}`;

        const response = await fetch(publicUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const blob = await response.blob();
        const file = new File([blob], item.original_name, {
          type: item.mime_type,
        });
        newFiles.push(file);
      } catch (error) {
        console.error("Fehler beim Konvertieren:", error);
      }
    }

    // Füge zur Auswahl hinzu
    void handleFiles(newFiles);

    // Reset
    setSelectedGalleryItems([]);
    setShowGallery(false);
  };

  // Filter-Funktionen
  const filteredGalleryItems = galleryItems.filter((item) => {
    const matchesSearch =
      item.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.directory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFolder =
      selectedFolder === "all" || item.directory.includes(selectedFolder);
    return matchesSearch && matchesFolder;
  });

  // Hilfsfunktionen
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const removeMainImage = () => {
    onUpdate({
      mainImage: null,
      additionalImages: data.additionalImages,
      documents: data.documents,
      imagePreviews: data.imagePreviews ?? [],
    });
  };

  const removeAdditionalImage = (index: number) => {
    const newImages = [...data.additionalImages];
    newImages.splice(index, 1);
    onUpdate({
      mainImage: data.mainImage,
      additionalImages: newImages,
      documents: data.documents,
      imagePreviews: data.imagePreviews ?? [],
    });
  };

  const makeMainImage = (index: number) => {
    const newMainImage = data.additionalImages[index];
    if (newMainImage) {
      const newAdditionalImages = [...data.additionalImages];
      newAdditionalImages.splice(index, 1);

      if (data.mainImage) {
        newAdditionalImages.unshift(data.mainImage);
      }

      onUpdate({
        mainImage: newMainImage,
        additionalImages: newAdditionalImages,
        documents: data.documents,
        imagePreviews: data.imagePreviews ?? [],
      });
    }
  };

  // Validierung
  const isValid = data.mainImage !== null || data.additionalImages.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Medien & Dokumente</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Folder className="h-4 w-4" />
          <span>Verzeichnis: {getDirectoryPath()}</span>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-start space-x-3">
          <Info className="mt-0.5 h-5 w-5 text-blue-600" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100">
              Automatische Organisation
            </p>
            <p className="mt-1 text-blue-700 dark:text-blue-300">
              Alle Dateien werden automatisch im Verzeichnis{" "}
              <code className="rounded bg-blue-100 px-1 py-0.5 text-xs dark:bg-blue-800">
                {getDirectoryPath()}
              </code>{" "}
              gespeichert.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Options */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Neue Dateien hochladen */}
        <div
          className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-300 hover:border-gray-400 dark:border-gray-600"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto mb-3 h-10 w-10 text-gray-400" />
          <p className="mb-2 text-sm font-medium">Neue Dateien hochladen</p>
          <p className="mb-3 text-xs text-gray-500">Drag & Drop oder klicken</p>
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*,application/pdf,.doc,.docx"
              className="hidden"
              onChange={(e) =>
                void handleFiles(Array.from(e.target.files ?? []))
              }
            />
            <span className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
              Dateien auswählen
            </span>
          </label>
        </div>

        {/* Aus Galerie wählen */}
        <div className="rounded-lg border-2 border-gray-300 p-6 text-center hover:border-gray-400 dark:border-gray-600">
          <Grid className="mx-auto mb-3 h-10 w-10 text-gray-400" />
          <p className="mb-2 text-sm font-medium">Aus Galerie wählen</p>
          <p className="mb-3 text-xs text-gray-500">
            Vorhandene Medien verwenden
          </p>
          <button
            onClick={() => setShowGallery(true)}
            className="inline-block rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
          >
            Galerie öffnen
          </button>
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="text-sm font-medium">Upload-Fortschritt</h4>
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="truncate">{fileName}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hauptbild */}
      <div>
        <h3 className="mb-3 text-lg font-semibold">Hauptbild</h3>
        {data.mainImage ? (
          <div className="inline-block">
            <div className="group relative">
              <img
                src={data.mainImage ? URL.createObjectURL(data.mainImage) : ""}
                alt="Hauptbild"
                className="h-48 w-48 rounded-lg object-cover shadow-lg"
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-0 transition-all group-hover:bg-opacity-50">
                <button
                  onClick={removeMainImage}
                  className="rounded-full bg-red-500 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  title="Entfernen"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="absolute left-2 top-2 rounded bg-blue-600 px-2 py-1 text-xs text-white">
                Hauptbild
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {data.mainImage.name} • {formatFileSize(data.mainImage.size)}
            </p>
          </div>
        ) : (
          <div className="flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
            <div className="text-center">
              <Image className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-xs text-gray-500">Kein Hauptbild</p>
            </div>
          </div>
        )}
      </div>

      {/* Weitere Bilder */}
      {data.additionalImages.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold">
            Weitere Bilder ({data.additionalImages.length})
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {data.additionalImages.map((file, index) => (
              <div key={index} className="group relative">
                <img
                  src={file ? URL.createObjectURL(file) : ""}
                  alt={`Bild ${index + 1}`}
                  className="h-32 w-full rounded-lg object-cover shadow"
                />
                <div className="absolute inset-0 flex items-center justify-center space-x-1 rounded-lg bg-black bg-opacity-0 transition-all group-hover:bg-opacity-50">
                  <button
                    onClick={() => makeMainImage(index)}
                    className="rounded bg-white p-1.5 text-gray-800 opacity-0 transition-opacity group-hover:opacity-100"
                    title="Als Hauptbild"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      setPreviewImage(file ? URL.createObjectURL(file) : null)
                    }
                    className="rounded bg-white p-1.5 text-gray-800 opacity-0 transition-opacity group-hover:opacity-100"
                    title="Vorschau"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeAdditionalImage(index)}
                    className="rounded bg-white p-1.5 text-gray-800 opacity-0 transition-opacity group-hover:opacity-100"
                    title="Entfernen"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dokumente */}
      {data.documents.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold">
            Dokumente ({data.documents.length})
          </h3>
          <div className="space-y-2">
            {data.documents.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const newDocs = [...data.documents];
                    newDocs.splice(index, 1);
                    onUpdate({
                      mainImage: data.mainImage,
                      additionalImages: data.additionalImages,
                      documents: newDocs,
                      imagePreviews: data.imagePreviews ?? [],
                    });
                  }}
                  className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validierung */}
      <div
        className={`rounded-lg p-4 ${
          isValid
            ? "border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
            : "border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20"
        }`}
      >
        <div className="flex items-center">
          {isValid ? (
            <Check className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle className="mr-2 h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          )}
          <span
            className={`text-sm ${
              isValid
                ? "text-green-800 dark:text-green-200"
                : "text-yellow-800 dark:text-yellow-200"
            }`}
          >
            {isValid
              ? "✓ Mindestens ein Bild ausgewählt - Sie können fortfahren"
              : "⚠️ Bitte laden Sie mindestens ein Bild hoch oder wählen Sie eines aus der Galerie"}
          </span>
        </div>
      </div>

      {/* Medien-Galerie Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-7xl overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-gray-800">
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Media-Galerie</h3>
                  <p className="text-sm text-gray-500">
                    Wählen Sie vorhandene Medien aus
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowGallery(false);
                    setSelectedGalleryItems([]);
                  }}
                  className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Filter & Suche */}
              <div className="mt-4 flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Suchen nach Dateinamen..."
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
                >
                  <option value="all">Alle Ordner</option>
                  {folders.map((folder) => (
                    <option key={folder} value={folder}>
                      {folder}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Gallery Content */}
            <div className="max-h-[60vh] overflow-y-auto p-4">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                </div>
              ) : filteredGalleryItems.length === 0 ? (
                <div className="py-12 text-center">
                  <Image className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-3 text-gray-500">Keine Medien gefunden</p>
                  <p className="text-sm text-gray-400">
                    Versuchen Sie eine andere Suche
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {filteredGalleryItems.map((item) => {
                    const isSelected = selectedGalleryItems.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`group relative cursor-pointer rounded-lg border-2 transition-all ${
                          isSelected
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-transparent hover:border-gray-300"
                        }`}
                        onClick={() => handleGallerySelect(item.id)}
                      >
                        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                          <img
                            src={`${process.env["NEXT_PUBLIC_SUPABASE_URL"]}/storage/v1/object/public/media-gallery/${item.file_path}`}
                            alt={item.original_name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              console.error(
                                "Fehler beim Laden des Bildes:",
                                item.original_name,
                              );
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                        {isSelected && (
                          <div className="absolute right-2 top-2 rounded-full bg-blue-500 p-1 text-white shadow-lg">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 rounded-b-lg bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="truncate text-xs text-white">
                            {item.original_name}
                          </p>
                          <p className="text-xs text-gray-300">
                            {item.directory.split("/").pop()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedGalleryItems.length} ausgewählt
                  </span>
                  {selectedGalleryItems.length > 0 && (
                    <button
                      onClick={() => setSelectedGalleryItems([])}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Auswahl löschen
                    </button>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowGallery(false);
                      setSelectedGalleryItems([]);
                    }}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={() => void handleApplyGallerySelection()}
                    disabled={selectedGalleryItems.length === 0}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {selectedGalleryItems.length} Medien übernehmen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bild-Vorschau Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -right-4 -top-4 rounded-full bg-white p-2 shadow-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={previewImage}
              alt="Vorschau"
              className="max-h-full max-w-full rounded-lg object-contain"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="rounded bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
        >
          Zurück
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Weiter
        </button>
      </div>
    </div>
  );
}
