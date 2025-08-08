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
  Square as SquareIcon,
  Check as CheckIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Maximize2 as Maximize2Icon,
  Sparkles as SparklesIcon,
  Wand2 as Wand2Icon,
  Shield as ShieldIcon,
  Image as ImageIcon,
  SquareStack as SquareStackIcon,
  Play as PlayIcon,
  X as XIcon,
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

// Galerie-Komponenten
function FeaturedImageGallery({
  images,
  isEditMode,
  onImageClick,
  onEditImage,
  onDeleteImage,
}: {
  images: MediaItem[];
  isEditMode: boolean;
  onImageClick: (index: number) => void;
  onEditImage: (index: number) => void;
  onDeleteImage: (index: number) => void;
}) {
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="grid gap-4">
      <div className="relative">
        <Image
          src={images[activeImage]?.url ?? ""}
          alt={images[activeImage]?.alt_text ?? ""}
          width={800}
          height={600}
          className="h-auto w-full max-w-full rounded-lg object-cover object-center md:h-[480px]"
          onClick={() => onImageClick(activeImage)}
        />
        {/* Bearbeitungs-Buttons für Hauptbild */}
        {isEditMode ? (
          <div className="absolute right-4 top-4 flex gap-2">
            <button
              onClick={() => onEditImage(activeImage)}
              className="rounded-lg bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30"
              title="Bearbeiten"
            >
              <Edit3Icon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDeleteImage(activeImage)}
              className="rounded-lg bg-red-500/80 p-2 text-white backdrop-blur-sm hover:bg-red-600/80"
              title="Löschen"
            >
              <Trash2Icon className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
      <div className="grid grid-cols-5 gap-4">
        {images.map((image, index) => (
          <div key={image.id} className="group relative">
            <Image
              onClick={() => setActiveImage(index)}
              src={image.url}
              alt={image.alt_text}
              width={200}
              height={150}
              className="h-20 max-w-full cursor-pointer rounded-lg object-cover object-center transition-all hover:opacity-80"
            />
            {/* Bearbeitungs-Buttons für Thumbnails */}
            {isEditMode ? (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditImage(index);
                    }}
                    className="rounded-lg bg-white/20 p-1 text-white backdrop-blur-sm hover:bg-white/30"
                    title="Bearbeiten"
                  >
                    <Edit3Icon className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteImage(index);
                    }}
                    className="rounded-lg bg-red-500/80 p-1 text-white backdrop-blur-sm hover:bg-red-600/80"
                    title="Löschen"
                  >
                    <Trash2Icon className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onImageClick(index);
                    }}
                    className="rounded-lg bg-white/20 p-1 text-white backdrop-blur-sm hover:bg-white/30"
                    title="Vergrößern"
                  >
                    <Maximize2Icon className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function QuadGallery({
  images,
  isEditMode,
  onImageClick,
  onEditImage,
  onDeleteImage,
}: {
  images: MediaItem[];
  isEditMode: boolean;
  onImageClick: (index: number) => void;
  onEditImage: (index: number) => void;
  onDeleteImage: (index: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {images.slice(0, 4).map((image, index) => (
        <div
          key={image.id}
          className="group relative overflow-hidden rounded-lg bg-muted transition-all hover:shadow-sm dark:bg-muted"
        >
          <div className="h-40 md:h-60">
            <Image
              src={image.url}
              alt={image.alt_text}
              fill
              className="h-40 max-w-full rounded-lg object-cover object-center md:h-60"
              onClick={() => onImageClick(index)}
            />
          </div>
          {/* Bearbeitungs-Buttons */}
          {isEditMode ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditImage(index);
                  }}
                  className="rounded-lg bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30"
                  title="Bearbeiten"
                >
                  <Edit3Icon className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteImage(index);
                  }}
                  className="rounded-lg bg-red-500/80 p-2 text-white backdrop-blur-sm hover:bg-red-600/80"
                  title="Löschen"
                >
                  <Trash2Icon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageClick(index);
                  }}
                  className="rounded-lg bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30"
                  title="Vergrößern"
                >
                  <Maximize2Icon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function GalleryWithCarousel({
  images,
  isEditMode,
  onImageClick,
  onEditImage,
  onDeleteImage,
}: {
  images: MediaItem[];
  isEditMode: boolean;
  onImageClick: (index: number) => void;
  onEditImage: (index: number) => void;
  onDeleteImage: (index: number) => void;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <div className="relative">
      <div className="relative h-96 overflow-hidden rounded-lg">
        <Image
          src={images[currentSlide]?.url ?? ""}
          alt={images[currentSlide]?.alt_text ?? ""}
          fill
          className="h-full w-full object-cover object-center"
          onClick={() => onImageClick(currentSlide)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-lg font-semibold">
            {images[currentSlide]?.caption}
          </h3>
          <p className="text-sm opacity-90">{images[currentSlide]?.alt_text}</p>
        </div>
        {/* Bearbeitungs-Buttons für Carousel */}
        {isEditMode ? (
          <div className="absolute right-4 top-4 flex gap-2">
            <button
              onClick={() => onEditImage(currentSlide)}
              className="rounded-lg bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30"
              title="Bearbeiten"
            >
              <Edit3Icon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDeleteImage(currentSlide)}
              className="rounded-lg bg-red-500/80 p-2 text-white backdrop-blur-sm hover:bg-red-600/80"
              title="Löschen"
            >
              <Trash2Icon className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
      <button
        onClick={() =>
          setCurrentSlide(
            currentSlide > 0 ? currentSlide - 1 : images.length - 1,
          )
        }
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur-md hover:bg-white/30"
      >
        <ChevronLeftIcon className="h-6 w-6" />
      </button>
      <button
        onClick={() =>
          setCurrentSlide(
            currentSlide < images.length - 1 ? currentSlide + 1 : 0,
          )
        }
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur-md hover:bg-white/30"
      >
        <ChevronRightIcon className="h-6 w-6" />
      </button>
      <div className="mt-4 flex justify-center gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 w-2 rounded-full transition-all ${
              index === currentSlide ? "bg-purple-600" : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
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
}: MediaCategoryProps) {
  // Verhindert Lint-/TS-Fehler für ungenutzte Prop, bis Integration benötigt wird
  void updateField;
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
  // Galerie-Tab State
  const [activeGalleryTab, setActiveGalleryTab] = useState("featured");

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
    {
      id: 4,
      url: "https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?w=800",
      alt_text: "Fahndungsbild 4",
      caption: "Übersichtsaufnahme",
      size: "2.8 MB",
      dimensions: "1920x1080",
      date: "2024-01-12",
      tags: ["overview", "landscape"],
      status: "verified",
    },
    {
      id: 5,
      url: "https://images.unsplash.com/photo-1432462770865-65b70566d673?w=800",
      alt_text: "Fahndungsbild 5",
      caption: "Nahaufnahme",
      size: "1.9 MB",
      dimensions: "1920x1080",
      date: "2024-01-11",
      tags: ["closeup", "detail"],
      status: "pending",
    },
    {
      id: 6,
      url: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800",
      alt_text: "Fahndungsbild 6",
      caption: "Weitwinkel",
      size: "3.3 MB",
      dimensions: "1920x1080",
      date: "2024-01-10",
      tags: ["wide", "panorama"],
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

  // Galerie-Tabs
  const galleryTabs = [
    {
      id: "featured",
      label: "Featured",
      icon: <ImageIcon className="h-4 w-4" />,
      component: FeaturedImageGallery,
    },
    {
      id: "quad",
      label: "Quad",
      icon: <SquareStackIcon className="h-4 w-4" />,
      component: QuadGallery,
    },
    {
      id: "carousel",
      label: "Carousel",
      icon: <PlayIcon className="h-4 w-4" />,
      component: GalleryWithCarousel,
    },
  ];

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

  // Bild-Klick Handler
  const handleImageClick = (index: number) => {
    setSelectedImage(index);
    setIsFullscreen(true);
  };

  // Bearbeitungs-Handler
  const handleEditImage = (index: number) => {
    setSelectedImage(index);
    setIsEditorOpen(true);
  };

  const handleDeleteImage = (index: number) => {
    // Hier würde die tatsächliche Lösch-Logik implementiert
    console.log(`Bild ${index} löschen`);
    // TODO: Implementiere tatsächliche Lösch-Logik
  };

  // Aktive Galerie-Komponente
  const ActiveGalleryComponent =
    galleryTabs.find((tab) => tab.id === activeGalleryTab)?.component ??
    FeaturedImageGallery;

  return (
    <div className="w-full space-y-6">
      {/* Aktionsleiste */}
      {isEditMode && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white p-4 shadow-sm dark:bg-muted">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-white transition-all hover:shadow-sm"
            >
              <UploadIcon className="h-4 w-4" /> Dateien auswählen
            </button>
            <button
              onClick={() => setIsBulkMode(!isBulkMode)}
              className={
                isBulkMode
                  ? "flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white"
                  : "flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-muted-foreground hover:bg-muted dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted"
              }
            >
              <SquareIcon className="h-4 w-4" /> Mehrfachauswahl
            </button>
            {isBulkMode && selectedImages.length > 0 && (
              <>
                <button
                  onClick={deleteSelectedImages}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                  <Trash2Icon className="h-4 w-4" /> Löschen (
                  {selectedImages.length})
                </button>
                <button
                  onClick={() => {
                    // Download functionality
                  }}
                  className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-muted-foreground hover:bg-muted dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted"
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
                className="rounded-lg bg-muted px-4 py-2 text-muted-foreground hover:bg-muted dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted"
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
      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-muted">
        {/* Drag & Drop - nur im Edit Mode */}
        {isEditMode && (
          <div
            className={`mb-6 rounded-lg border-2 border-dashed transition-all ${
              isDragging
                ? "border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-950"
                : "border-border dark:border-border"
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
                <CameraIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-2 text-muted-foreground dark:text-muted-foreground">
                  Ziehen Sie Dateien hierher oder
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
                >
                  Dateien auswählen
                </button>
                <p className="mt-2 text-xs text-muted-foreground">
                  JPG, PNG, GIF, MP4, PDF (max. 50MB)
                </p>
              </div>
            )}
          </div>
        )}

        {/* Galerie-Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {galleryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveGalleryTab(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  activeGalleryTab === tab.id
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Galerie-Inhalt */}
        <div className="mb-6">
          <ActiveGalleryComponent
            images={images}
            isEditMode={isEditMode}
            onImageClick={handleImageClick}
            onEditImage={handleEditImage}
            onDeleteImage={handleDeleteImage}
          />
        </div>

        {/* Hinzufügen Button für Edit Mode */}
        {isEditMode && (
          <div className="flex justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted px-6 py-4 transition-all hover:border-purple-500 hover:bg-purple-50 dark:border-border dark:bg-muted dark:hover:border-purple-500 dark:hover:bg-purple-950"
            >
              <PlusIcon className="h-6 w-6 text-muted-foreground" />
              <span className="text-muted-foreground">Weitere Dateien hinzufügen</span>
            </button>
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
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 p-6 dark:from-blue-950 dark:to-cyan-950">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-white/50 p-3 backdrop-blur-sm dark:bg-white/10">
              <SparklesIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-muted-foreground dark:text-white">
              AI‑Bildverbesserung
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {aiEnhancements.map((enhancement, index) => (
              <button
                key={index}
                className="flex flex-col items-center gap-2 rounded-lg bg-white/50 p-4 backdrop-blur-sm transition-all hover:bg-white hover:shadow-sm dark:bg-white/10 dark:hover:bg-white/20"
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
          <div className="h-full w-full max-w-6xl bg-white dark:bg-muted">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4 dark:border-border">
              <h3 className="text-xl font-bold">Bildeditor</h3>
              <div className="flex items-center gap-2">
                <button className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                  <CheckIcon className="mr-2 inline h-4 w-4" /> Speichern
                </button>
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="rounded-lg bg-muted p-2 hover:bg-muted dark:bg-muted dark:hover:bg-muted"
                >
                  <Trash2Icon className="h-5 w-5" />
                </button>
              </div>
            </div>
            {/* Toolbar */}
            <div className="flex items-center gap-2 border-b border-border p-4 dark:border-border">
              <button className="rounded-lg p-2 hover:bg-muted dark:hover:bg-muted">
                <CropIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setRotation(rotation + 90)}
                className="rounded-lg p-2 hover:bg-muted dark:hover:bg-muted"
              >
                <RotateCwIcon className="h-5 w-5" />
              </button>
              <div className="mx-2 h-6 w-px bg-muted dark:bg-muted" />
              <button className="rounded-lg p-2 hover:bg-muted dark:hover:bg-muted">
                <SunIcon className="h-5 w-5" />
              </button>
              <button className="rounded-lg p-2 hover:bg-muted dark:hover:bg-muted">
                <ContrastIcon className="h-5 w-5" />
              </button>
              <button className="rounded-lg p-2 hover:bg-muted dark:hover:bg-muted">
                <DropletsIcon className="h-5 w-5" />
              </button>
              <div className="mx-2 h-6 w-px bg-muted dark:bg-muted" />
              <button className="rounded-lg p-2 hover:bg-muted dark:hover:bg-muted">
                <FilterIcon className="h-5 w-5" />
              </button>
              <div className="mx-2 h-6 w-px bg-muted dark:bg-muted" />
              <button
                onClick={() => setZoom(Math.max(25, zoom - 10))}
                className="rounded-lg p-2 hover:bg-muted dark:hover:bg-muted"
              >
                <ZoomOutIcon className="h-5 w-5" />
              </button>
              <span className="px-2 text-sm">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                className="rounded-lg p-2 hover:bg-muted dark:hover:bg-muted"
              >
                <ZoomInIcon className="h-5 w-5" />
              </button>
            </div>
            {/* Editor Area */}
            <div className="flex h-[calc(100%-200px)]">
              {/* Filterliste */}
              <div className="w-48 border-r border-border p-4 dark:border-border">
                <h4 className="mb-3 font-semibold">Filter</h4>
                <div className="space-y-2">
                  {filters.map((filter) => (
                    <button
                      key={filter.name}
                      onClick={() => applyFilter(filter.name)}
                      className={`w-full rounded-lg p-2 text-left text-sm transition-all ${
                        selectedFilter === filter.name
                          ? "bg-purple-600 text-white"
                          : "hover:bg-muted dark:hover:bg-muted"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Bild */}
              <div className="flex flex-1 items-center justify-center bg-muted dark:bg-muted">
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
              <div className="w-64 border-l border-border p-4 dark:border-border">
                <h4 className="mb-3 font-semibold">Anpassungen</h4>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">
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
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white backdrop-blur-md hover:bg-white/20"
          >
            <XIcon className="h-6 w-6" />
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
          <div className="rounded-lg bg-white p-6 dark:bg-muted">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
              <p className="font-medium">Dateien werden hochgeladen...</p>
            </div>
            <div className="h-2 w-64 overflow-hidden rounded-full bg-muted dark:bg-muted">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Validierung */}
      {images.length === 0 && (
        <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
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
