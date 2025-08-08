"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
// Lucide‑Icons als Named Exports importieren (tree‑shakable)
import {
  Camera as CameraIcon,
  Upload as UploadIcon,
  Trash2 as Trash2Icon,
  Plus as PlusIcon,
  AlertCircle as AlertCircleIcon,
  Download as DownloadIcon,
  Edit3 as Edit3Icon,
  Crop as CropIcon,
  RotateCw as RotateCwIcon,
  Sun as SunIcon,
  Contrast as ContrastIcon,
  Droplets as DropletsIcon,
  Filter as FilterIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Grid3X3 as Grid3x3Icon,
  List as ListIcon,
  FileImage as FileImageIcon,
  Square as SquareIcon,
  Check as CheckIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Maximize2 as Maximize2Icon,
  Sparkles as SparklesIcon,
  Wand2 as Wand2Icon,
  Shield as ShieldIcon,
} from "lucide-react";
import type { UIInvestigationData } from "~/lib/types/investigation.types";

interface MediaCategoryProps {
  data: UIInvestigationData;
  isEditMode: boolean;
  updateField: (
    step: keyof UIInvestigationData,
    field: string,
    value: unknown,
  ) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface MediaItem {
  id: number;
  url: string;
  alt_text: string;
  caption: string;
  size: string;
  dimensions: string;
  date: string;
  tags: string[];
  status: "verified" | "pending";
}

/**
 * ModernMediaCategory
 *
 * Diese Komponente bildet eine moderne Medienverwaltung mit verschiedenen
 * Ansichtsmodi, Drag‑and‑Drop‑Upload, Multi‑Select, einfachen Bildbearbeitungs‑
 * Einstellungen und AI‑Verbesserungsvorschlägen ab. Icons werden einzeln
 * importiert, um den JavaScript‑Bundle klein zu halten. Bilddaten werden
 * ausschließlich aus dem übergebenen Wizard‑State bezogen, Fallback‑Bilder
 * dienen der Demonstration.
 */
export default function ModernMediaCategory({
  data,
  isEditMode,
  updateField,
  onNext,
  onPrevious,
}: MediaCategoryProps) {
  // Verhindert Lint-/TS-Fehler für ungenutzte Prop, bis Integration benötigt wird
  void updateField;
  // Zustand für Ansichtsmodus (grid, list, masonry)
  const [viewMode, setViewMode] = useState<"grid" | "list" | "masonry">("grid");
  // Auswahl von Bildern für Bulk‑Aktionen
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  // Upload‑Fortschritt
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  // Editor & Viewer
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Filter‑Einstellungen
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  // Upload Input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lese Bilder aus Daten oder nutze Fallback (nur wenn Array)
  const defaultImages: MediaItem[] = [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=800",
      alt_text: "Fahndungsbild 1",
      caption: "Hauptansicht",
      size: "2.4 MB",
      dimensions: "1920x1080",
      date: "2024-01-15",
      tags: ["person", "outdoor"],
      status: "verified",
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1589391886645-d51941baf7fb?w=800",
      alt_text: "Fahndungsbild 2",
      caption: "Seitenansicht",
      size: "1.8 MB",
      dimensions: "1920x1080",
      date: "2024-01-14",
      tags: ["vehicle", "street"],
      status: "pending",
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1574482620811-1aa16ffe3c82?w=800",
      alt_text: "Fahndungsbild 3",
      caption: "Detailaufnahme",
      size: "3.1 MB",
      dimensions: "1920x1080",
      date: "2024-01-13",
      tags: ["evidence", "indoor"],
      status: "verified",
    },
  ];
  const images: MediaItem[] =
    Array.isArray(data?.images) &&
    (data?.images as unknown as MediaItem[]).length > 0
      ? (data?.images as unknown as MediaItem[]).filter(Boolean)
      : defaultImages;

  const currentImage =
    selectedImage !== null ? images[selectedImage] : undefined;

  // Presets für Filter
  const filters = [
    { name: "none", label: "Original", style: "" },
    { name: "grayscale", label: "Schwarz/Weiß", style: "grayscale(100%)" },
    { name: "sepia", label: "Sepia", style: "sepia(100%)" },
    {
      name: "vintage",
      label: "Vintage",
      style: "sepia(50%) contrast(120%) brightness(90%)",
    },
    { name: "cold", label: "Kalt", style: "hue-rotate(180deg) saturate(120%)" },
    { name: "warm", label: "Warm", style: "hue-rotate(-30deg) saturate(130%)" },
    {
      name: "dramatic",
      label: "Dramatisch",
      style: "contrast(150%) brightness(90%)",
    },
    {
      name: "fade",
      label: "Verblasst",
      style: "opacity(80%) brightness(110%)",
    },
  ];
  // AI‑Verbesserungen
  const aiEnhancements = [
    {
      name: "face-blur",
      label: "Gesichter unkenntlich",
      icon: <ShieldIcon className="h-4 w-4" />,
    },
    {
      name: "license-blur",
      label: "Kennzeichen unkenntlich",
      icon: <ShieldIcon className="h-4 w-4" />,
    },
    {
      name: "enhance",
      label: "Qualität verbessern",
      icon: <SparklesIcon className="h-4 w-4" />,
    },
    {
      name: "sharpen",
      label: "Schärfen",
      icon: <Wand2Icon className="h-4 w-4" />,
    },
    {
      name: "denoise",
      label: "Rauschen entfernen",
      icon: <Wand2Icon className="h-4 w-4" />,
    },
    {
      name: "upscale",
      label: "Auflösung erhöhen",
      icon: <ZoomInIcon className="h-4 w-4" />,
    },
  ];

  // Simulierter Upload
  const handleFileUpload = async (files: FileList) => {
    setIsDragging(false);
    if (!files || files.length === 0) return;
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      // Warte kurz, um Fortschritt zu simulieren
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    setTimeout(() => setUploadProgress(0), 800);
  };

  // Toggle Auswahl eines Bildes
  const toggleImageSelection = (imageId: string) => {
    setSelectedImages((prev) =>
      prev.includes(imageId)
        ? prev.filter((id) => id !== imageId)
        : [...prev, imageId],
    );
  };

  // Alle Bilder auswählen oder abwählen
  const selectAllImages = () => {
    if (selectedImages.length === images.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(images.map((img) => String(img.id)));
    }
  };

  // Lösche ausgewählte Bilder (hier nur UI‑Reset)
  const deleteSelectedImages = () => {
    setSelectedImages([]);
    setIsBulkMode(false);
    // Upload‑State nicht verändert; Integration in Backend ggf. später
  };

  // Filter anwenden
  const applyFilter = (filterName: string) => {
    setSelectedFilter(filterName);
  };

  return (
    <div className="w-full space-y-6">
      {/* Kopfbereich */}
      <div className="rounded-3xl bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-6 dark:from-purple-950 dark:via-pink-950 dark:to-orange-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/50 p-3 backdrop-blur-sm dark:bg-white/10">
              <CameraIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Medien & Bildbearbeitung
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {images.length} Dateien •{" "}
                {Number(
                  images.reduce(
                    (acc: number, img: MediaItem) =>
                      acc + parseFloat(img.size) || 0,
                    0,
                  ),
                ).toFixed(1)}
                MB gesamt
              </p>
            </div>
          </div>
          {/* Ansichtsmodi */}
          <div className="flex items-center gap-2 rounded-xl bg-white/50 p-1 backdrop-blur-sm dark:bg-white/10">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-lg p-2 transition-all ${
                viewMode === "grid"
                  ? "bg-white text-purple-600 shadow-sm dark:bg-gray-800 dark:text-purple-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <Grid3x3Icon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-lg p-2 transition-all ${
                viewMode === "list"
                  ? "bg-white text-purple-600 shadow-sm dark:bg-gray-800 dark:text-purple-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <ListIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("masonry")}
              className={`rounded-lg p-2 transition-all ${
                viewMode === "masonry"
                  ? "bg-white text-purple-600 shadow-sm dark:bg-gray-800 dark:text-purple-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <FileImageIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      {/* Aktionsleiste */}
      {isEditMode && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-lg dark:bg-gray-800">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-white transition-all hover:shadow-lg"
            >
              <UploadIcon className="h-4 w-4" /> Dateien auswählen
            </button>
            <button
              onClick={() => setIsBulkMode(!isBulkMode)}
              className={
                isBulkMode
                  ? "flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-white"
                  : "flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }
            >
              <SquareIcon className="h-4 w-4" /> Mehrfachauswahl
            </button>
            {isBulkMode && selectedImages.length > 0 && (
              <>
                <button
                  onClick={deleteSelectedImages}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                  <Trash2Icon className="h-4 w-4" /> Löschen (
                  {selectedImages.length})
                </button>
                <button
                  onClick={() => {
                    // Download functionality
                  }}
                  className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  <DownloadIcon className="h-4 w-4" /> Herunterladen
                </button>
              </>
            )}
          </div>
          {/* Suchfeld & Alles auswählen */}
          <div className="flex items-center gap-2">
            {isBulkMode && (
              <button
                onClick={selectAllImages}
                className="rounded-xl bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                {selectedImages.length === images.length
                  ? "Keine auswählen"
                  : "Alle auswählen"}
              </button>
            )}
          </div>
        </div>
      )}
      {/* Hauptinhalte */}
      <div className="rounded-3xl bg-white p-6 shadow-xl dark:bg-gray-800">
        {/* Drag & Drop */}
        <div
          className={`mb-6 rounded-2xl border-2 border-dashed transition-all ${
            isDragging
              ? "border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-950"
              : "border-gray-300 dark:border-gray-700"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            void handleFileUpload(e.dataTransfer.files);
          }}
        >
          {isDragging ? (
            <div className="py-12 text-center">
              <UploadIcon className="mx-auto mb-4 h-12 w-12 text-purple-600 dark:text-purple-400" />
              <p className="text-lg font-medium text-purple-600 dark:text-purple-400">
                Dateien hier ablegen
              </p>
            </div>
          ) : (
            <div className="py-8 text-center">
              <CameraIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="mb-2 text-gray-600 dark:text-gray-400">
                Ziehen Sie Dateien hierher oder
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
              >
                Dateien auswählen
              </button>
              <p className="mt-2 text-xs text-gray-500">
                JPG, PNG, GIF, MP4, PDF (max. 50MB)
              </p>
            </div>
          )}
        </div>
        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {images.filter(Boolean).map((image: MediaItem, index: number) => (
              <div
                key={image.id}
                className={`group relative overflow-hidden rounded-2xl bg-gray-100 transition-all hover:shadow-xl dark:bg-gray-700 ${
                  selectedImages.includes(String(image.id))
                    ? "ring-2 ring-purple-600"
                    : ""
                }`}
              >
                {/* Checkbox bei Bulk‑Mode */}
                {isBulkMode && (
                  <div className="absolute left-3 top-3 z-10">
                    <button
                      onClick={() => toggleImageSelection(String(image.id))}
                      className={`rounded-lg p-2 transition-all ${
                        selectedImages.includes(String(image.id))
                          ? "bg-purple-600 text-white"
                          : "bg-white/80 backdrop-blur-sm dark:bg-gray-800/80"
                      }`}
                    >
                      {selectedImages.includes(String(image.id)) ? (
                        <CheckIcon className="h-4 w-4" />
                      ) : (
                        <SquareIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute right-3 top-3 z-10">
                  <div
                    className={`rounded-full px-2 py-1 text-xs font-medium backdrop-blur-sm ${
                      image.status === "verified"
                        ? "bg-green-500/90 text-white"
                        : "bg-yellow-500/90 text-white"
                    }`}
                  >
                    {image.status === "verified" ? "Verifiziert" : "Ausstehend"}
                  </div>
                </div>
                {/* Bild selbst */}
                <div className="aspect-square">
                  <Image
                    src={image.url}
                    alt={image.alt_text}
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                  />
                </div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="mb-2 text-sm font-medium text-white">
                      {image.caption}
                    </p>
                    <div className="flex items-center justify-between text-xs text-white/80">
                      <span>{image.dimensions}</span>
                      <span>{image.size}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedImage(index);
                          setIsEditorOpen(true);
                        }}
                        className="flex-1 rounded-lg bg-white/20 py-1.5 text-xs text-white backdrop-blur-sm transition-all hover:bg-white/30"
                      >
                        <Edit3Icon className="mx-auto h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedImage(index);
                          setIsFullscreen(true);
                        }}
                        className="flex-1 rounded-lg bg-white/20 py-1.5 text-xs text-white backdrop-blur-sm transition-all hover:bg-white/30"
                      >
                        <Maximize2Icon className="mx-auto h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          // Download functionality
                        }}
                        className="flex-1 rounded-lg bg-white/20 py-1.5 text-xs text-white backdrop-blur-sm transition-all hover:bg-white/30"
                      >
                        <DownloadIcon className="mx-auto h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          // Delete functionality
                        }}
                        className="flex-1 rounded-lg bg-white/20 py-1.5 text-xs text-white backdrop-blur-sm transition-all hover:bg-white/30"
                      >
                        <Trash2Icon className="mx-auto h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                {/* Tags */}
                <div className="absolute left-4 top-12 flex flex-wrap gap-1">
                  {Array.isArray(image?.tags) &&
                    image.tags.map((tag: string, tagIndex: number) => (
                      <span
                        key={tagIndex}
                        className="rounded-full bg-white/20 px-2 py-0.5 text-xs text-white backdrop-blur-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                </div>
              </div>
            ))}
            {/* Hinzufügen */}
            {isEditMode && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition-all hover:border-purple-500 hover:bg-purple-50 dark:border-gray-600 dark:bg-gray-900 dark:hover:border-purple-500 dark:hover:bg-purple-950"
              >
                <div className="text-center">
                  <PlusIcon className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-500">Hinzufügen</p>
                </div>
              </button>
            )}
          </div>
        )}
        {/* Listenansicht */}
        {viewMode === "list" && (
          <div className="space-y-3">
            {images.filter(Boolean).map((image: MediaItem, index: number) => (
              <div
                key={image.id}
                className={`flex items-center gap-4 rounded-2xl bg-gray-50 p-4 transition-all hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 ${
                  selectedImages.includes(String(image.id))
                    ? "ring-2 ring-purple-600"
                    : ""
                }`}
              >
                {isBulkMode && (
                  <button
                    onClick={() => toggleImageSelection(String(image.id))}
                    className={`rounded-lg p-2 ${
                      selectedImages.includes(String(image.id))
                        ? "bg-purple-600 text-white"
                        : "bg-white dark:bg-gray-800"
                    }`}
                  >
                    {selectedImages.includes(String(image.id)) ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      <SquareIcon className="h-4 w-4" />
                    )}
                  </button>
                )}
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={image.url}
                    alt={image.alt_text}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {image.caption}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {image.alt_text}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                        <span>{image.dimensions}</span>
                        <span>•</span>
                        <span>{image.size}</span>
                        <span>•</span>
                        <span>{image.date}</span>
                      </div>
                    </div>
                    <div
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        image.status === "verified"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}
                    >
                      {image.status === "verified"
                        ? "Verifiziert"
                        : "Ausstehend"}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Array.isArray(image?.tags) &&
                      image.tags.map((tag: string, tagIndex: number) => (
                        <span
                          key={tagIndex}
                          className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                        >
                          #{tag}
                        </span>
                      ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedImage(index);
                      setIsEditorOpen(true);
                    }}
                    className="rounded-lg bg-white p-2 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <Edit3Icon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      // Download functionality
                    }}
                    className="rounded-lg bg-white p-2 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      // Delete functionality
                    }}
                    className="rounded-lg bg-white p-2 text-red-600 hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-950"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Masonry */}
        {viewMode === "masonry" && (
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
            {images.filter(Boolean).map((image: MediaItem) => (
              <div
                key={image.id}
                className={`mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-gray-100 transition-all hover:shadow-xl dark:bg-gray-700 ${
                  selectedImages.includes(String(image.id))
                    ? "ring-2 ring-purple-600"
                    : ""
                }`}
              >
                <div
                  className="relative w-full"
                  style={{
                    height: `${200 + Math.random() * 200}px`,
                  }}
                >
                  <Image
                    src={image.url}
                    alt={image.alt_text}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {image.caption}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {image.size} • {image.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Datei‑Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf"
          onChange={(e) =>
            e.target.files && void handleFileUpload(e.target.files)
          }
          className="hidden"
        />
      </div>
      {/* AI‑Bildverbesserung */}
      {isEditMode && (
        <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6 dark:from-blue-950 dark:to-cyan-950">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-white/50 p-3 backdrop-blur-sm dark:bg-white/10">
              <SparklesIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              AI‑Bildverbesserung
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {aiEnhancements.map((enhancement, index) => (
              <button
                key={index}
                className="flex flex-col items-center gap-2 rounded-xl bg-white/50 p-4 backdrop-blur-sm transition-all hover:bg-white hover:shadow-md dark:bg-white/10 dark:hover:bg-white/20"
              >
                {enhancement.icon}
                <span className="text-center text-xs">{enhancement.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Editor Modal */}
      {isEditorOpen && selectedImage !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <div className="h-full w-full max-w-6xl bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
              <h3 className="text-xl font-bold">Bildeditor</h3>
              <div className="flex items-center gap-2">
                <button className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                  <CheckIcon className="mr-2 inline h-4 w-4" /> Speichern
                </button>
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="rounded-lg bg-gray-200 p-2 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <Trash2Icon className="h-5 w-5" />
                </button>
              </div>
            </div>
            {/* Toolbar */}
            <div className="flex items-center gap-2 border-b border-gray-200 p-4 dark:border-gray-700">
              <button className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <CropIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setRotation(rotation + 90)}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <RotateCwIcon className="h-5 w-5" />
              </button>
              <div className="mx-2 h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <button className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <SunIcon className="h-5 w-5" />
              </button>
              <button className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <ContrastIcon className="h-5 w-5" />
              </button>
              <button className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <DropletsIcon className="h-5 w-5" />
              </button>
              <div className="mx-2 h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <button className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <FilterIcon className="h-5 w-5" />
              </button>
              <div className="mx-2 h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <button
                onClick={() => setZoom(Math.max(25, zoom - 10))}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ZoomOutIcon className="h-5 w-5" />
              </button>
              <span className="px-2 text-sm">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ZoomInIcon className="h-5 w-5" />
              </button>
            </div>
            {/* Editor Area */}
            <div className="flex h-[calc(100%-200px)]">
              {/* Filterliste */}
              <div className="w-48 border-r border-gray-200 p-4 dark:border-gray-700">
                <h4 className="mb-3 font-semibold">Filter</h4>
                <div className="space-y-2">
                  {filters.map((filter) => (
                    <button
                      key={filter.name}
                      onClick={() => applyFilter(filter.name)}
                      className={`w-full rounded-lg p-2 text-left text-sm transition-all ${
                        selectedFilter === filter.name
                          ? "bg-purple-600 text-white"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Bild */}
              <div className="flex flex-1 items-center justify-center bg-gray-100 dark:bg-gray-800">
                <div
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    filter:
                      filters.find((f) => f.name === selectedFilter)?.style ??
                      "",
                  }}
                >
                  <Image
                    src={currentImage?.url ?? ""}
                    alt={currentImage?.alt_text ?? "Editor"}
                    width={800}
                    height={600}
                    className="max-h-[600px] max-w-full object-contain"
                  />
                </div>
              </div>
              {/* Placeholder für weitere Einstellungen */}
              <div className="w-64 border-l border-gray-200 p-4 dark:border-gray-700">
                <h4 className="mb-3 font-semibold">Anpassungen</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Helligkeit, Kontrast, Sättigung etc.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Fullscreen Viewer */}
      {isFullscreen && selectedImage !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white backdrop-blur-md hover:bg-white/20"
          >
            <Trash2Icon className="h-6 w-6" />
          </button>
          <Image
            src={currentImage?.url ?? ""}
            alt={currentImage?.alt_text ?? "Fullscreen"}
            width={1200}
            height={800}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(
                selectedImage > 0 ? selectedImage - 1 : images.length - 1,
              );
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-md hover:bg-white/20"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(
                selectedImage < images.length - 1 ? selectedImage + 1 : 0,
              );
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-md hover:bg-white/20"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </div>
      )}
      {/* Upload Fortschritt */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-3xl bg-white p-6 dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
              <p className="font-medium">Dateien werden hochgeladen...</p>
            </div>
            <div className="h-2 w-64 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}
      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          className="flex items-center gap-2 rounded-2xl bg-gray-100 px-6 py-3 font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Zurück zur Beschreibung
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-medium text-white hover:shadow-lg"
        >
          Weiter zu Orten
        </button>
      </div>
      {/* Validierung */}
      {images.length === 0 && (
        <div className="rounded-2xl border-2 border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
          <div className="flex items-center gap-3">
            <AlertCircleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Keine Medien vorhanden
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Bilder oder Dokumente können die Fahndung unterstützen.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
