"use client";

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import Image from "next/image";
import {
  Info,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Heart,
  Share2,
  X,
  Upload,
  Camera,
  Maximize2,
  Map,
} from "lucide-react";
import type { UIInvestigationData } from "~/lib/types/investigation.types";

// Types
interface OverviewCategoryProps {
  data: {
    step1?: {
      title?: string;
      caseNumber?: string;
      category?: string;
    };
    step2?: {
      priority?: string;
      shortDescription?: string;
    };
    step3?: {
      mainImage?: string | null;
      additionalImages?: string[];
    };
    step4?: {
      mainLocation?: {
        address?: string;
      } | null;
    };
    step5?: {
      contactPerson?: string;
      contactPhone?: string;
      contactEmail?: string;
      department?: string;
      availableHours?: string;
    };
  };
  isEditMode: boolean;
  updateField: (
    step: keyof UIInvestigationData,
    field: string,
    value: unknown,
  ) => void;
  onNext: () => void;
}

interface TouchGesture {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

// Memoized OverviewCategory für bessere Performance
const OverviewCategory = React.memo(function OverviewCategory({
  data,
  isEditMode,
  updateField,
  onNext,
}: OverviewCategoryProps) {
  // Debug-Logging
  console.log("🔍 DEBUG: OverviewCategory erhält Daten:", {
    hasData: !!data,
    step1: data?.step1,
    step2: data?.step2,
    step3: data?.step3,
    step4: data?.step4,
    step5: data?.step5,
    isEditMode,
  });

  // State Management
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [touchGesture, setTouchGesture] = useState<TouchGesture | null>(null);

  // Refs für Performance
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const swipeThreshold = 50;

  // Memoized Touch Handlers für Mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    setTouchGesture({
      startX: touch.clientX,
      startY: touch.clientY,
      endX: touch.clientX,
      endY: touch.clientY,
    });
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchGesture) return;
      const touch = e.touches[0];
      if (!touch) return;

      setTouchGesture((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          endX: touch.clientX,
          endY: touch.clientY,
        };
      });
    },
    [touchGesture],
  );

  const handleTouchEnd = useCallback(() => {
    if (!touchGesture) return;

    const deltaX = touchGesture.endX - touchGesture.startX;
    const deltaY = touchGesture.endY - touchGesture.startY;

    // Horizontale Swipe für Bildwechsel
    if (
      Math.abs(deltaX) > swipeThreshold &&
      Math.abs(deltaX) > Math.abs(deltaY)
    ) {
      const images = data.step3?.additionalImages ?? [];
      if (images.length > 0) {
        if (deltaX > 0) {
          // Swipe nach rechts - vorheriges Bild
          setSelectedImageIndex((prev) =>
            prev > 0 ? prev - 1 : images.length - 1,
          );
        } else {
          // Swipe nach links - nächstes Bild
          setSelectedImageIndex((prev) =>
            prev < images.length - 1 ? prev + 1 : 0,
          );
        }
      }
    }

    setTouchGesture(null);
  }, [touchGesture, data.step3?.additionalImages]);

  // Memoized Image Data
  const imageData = useMemo(() => {
    const mainImage = data.step3?.mainImage;
    const additionalImages = data.step3?.additionalImages ?? [];
    const allImages = mainImage
      ? [mainImage, ...additionalImages]
      : additionalImages;

    return {
      mainImage,
      additionalImages,
      allImages,
      currentImage: allImages[selectedImageIndex] ?? mainImage,
    };
  }, [data.step3?.mainImage, data.step3?.additionalImages, selectedImageIndex]);

  // Memoized Category Data
  const categoryData = useMemo(() => {
    const category = data.step1?.category;
    return {
      icon: getCategoryIcon(category),
      label: getCategoryLabel(category),
      style: getCategoryStyle(category),
    };
  }, [data.step1?.category]);

  // Memoized Priority Data
  const priorityData = useMemo(() => {
    const priority = data.step2?.priority;
    return {
      style: getPriorityStyle(priority),
      dotColor: getPriorityDotColor(priority),
      label: getPriorityLabel(priority),
    };
  }, [data.step2?.priority]);

  // Memoized Contact Data
  const contactData = useMemo(() => {
    return {
      person: data.step5?.contactPerson ?? "Polizei",
      phone: data.step5?.contactPhone ?? "+49 711 8990-0",
      email: data.step5?.contactEmail ?? "",
      department: data.step5?.department ?? "Polizeipräsidium",
      hours: data.step5?.availableHours ?? "24/7",
    };
  }, [data.step5]);

  // Memoized Location Data
  const locationData = useMemo(() => {
    return {
      address: data.step4?.mainLocation?.address ?? "Keine Adresse angegeben",
      hasLocation: !!data.step4?.mainLocation?.address,
    };
  }, [data.step4?.mainLocation?.address]);

  // Memoized File Upload Handler
  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Simuliere Upload-Progress
        for (let i = 0; i <= 100; i += 10) {
          setUploadProgress(i);
          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        // Hier würde der echte Upload-Code stehen
        console.log("Dateien hochgeladen:", files);

        // Update field mit neuen Bildern
        const imageUrls = Array.from(files).map((file) =>
          URL.createObjectURL(file),
        );
        void updateField("step3", "additionalImages", imageUrls);

        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 1000);
      } catch (error) {
        console.error("Upload-Fehler:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [updateField],
  );

  // Memoized Drag and Drop Handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      void handleFileUpload(e.dataTransfer.files);
    },
    [handleFileUpload],
  );

  // Memoized Image Navigation
  const nextImage = useCallback(() => {
    if (imageData.allImages.length > 1) {
      setSelectedImageIndex((prev) =>
        prev < imageData.allImages.length - 1 ? prev + 1 : 0,
      );
    }
  }, [imageData.allImages.length]);

  const previousImage = useCallback(() => {
    if (imageData.allImages.length > 1) {
      setSelectedImageIndex((prev) =>
        prev > 0 ? prev - 1 : imageData.allImages.length - 1,
      );
    }
  }, [imageData.allImages.length]);

  // Memoized Fullscreen Handler
  const toggleFullscreen = useCallback(() => {
    setIsImageFullscreen(!isImageFullscreen);
  }, [isImageFullscreen]);

  // Memoized Keyboard Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isImageFullscreen) {
        switch (e.key) {
          case "Escape":
            setIsImageFullscreen(false);
            break;
          case "ArrowLeft":
            previousImage();
            break;
          case "ArrowRight":
            nextImage();
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isImageFullscreen, previousImage, nextImage]);

  // Memoized Content Sections
  const headerSection = useMemo(
    () => (
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-2xl">{categoryData.icon}</span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryData.style}`}
              >
                {categoryData.label}
              </span>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              {data.step1?.title ?? "Unbekannte Fahndung"}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Fallnummer: {data.step1?.caseNumber ?? "N/A"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${priorityData.style}`}
            >
              <div
                className={`h-2 w-2 rounded-full ${priorityData.dotColor}`}
              ></div>
              {priorityData.label}
            </div>
          </div>
        </div>
      </div>
    ),
    [data.step1?.title, data.step1?.caseNumber, categoryData, priorityData],
  );

  const descriptionSection = useMemo(
    () => (
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
          Kurzbeschreibung
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          {data.step2?.shortDescription ?? "Keine Beschreibung verfügbar."}
        </p>
      </div>
    ),
    [data.step2?.shortDescription],
  );

  const imageSection = useMemo(
    () => (
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Bilder ({imageData.allImages.length})
          </h2>
          {isEditMode && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
            >
              <Upload className="h-4 w-4" />
              Bilder hinzufügen
            </button>
          )}
        </div>

        {imageData.allImages.length > 0 ? (
          <div className="relative">
            <div
              ref={imageContainerRef}
              className={`relative overflow-hidden rounded-lg border-2 border-dashed ${
                isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {imageData.currentImage && (
                <div className="relative">
                  <Image
                    src={imageData.currentImage}
                    alt="Fahndungsbild"
                    width={600}
                    height={400}
                    className="h-64 w-full object-cover"
                    onClick={toggleFullscreen}
                    onError={(e) => {
                      console.error(
                        "❌ Bild-Ladefehler:",
                        imageData.currentImage,
                      );
                      // Fallback zu einem Platzhalter-Bild
                      const target = e.target as HTMLImageElement;
                      target.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJpbGQgZmVobHQ8L3RleHQ+PC9zdmc+";
                    }}
                  />
                </div>
              )}

              {imageData.allImages.length > 1 && (
                <>
                  <button
                    onClick={previousImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}

              <button
                onClick={toggleFullscreen}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>

            {imageData.allImages.length > 1 && (
              <div className="mt-3 flex justify-center gap-2">
                {imageData.allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`h-2 w-2 rounded-full ${
                      index === selectedImageIndex
                        ? "bg-blue-600"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
            <div className="text-center">
              <Camera className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                Keine Bilder verfügbar
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>
    ),
    [
      imageData,
      isEditMode,
      isDragging,
      selectedImageIndex,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      toggleFullscreen,
      nextImage,
      previousImage,
      handleFileUpload,
    ],
  );

  const locationSection = useMemo(
    () => (
      <div className="mb-6">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <MapPin className="h-5 w-5" />
          Standort
        </h2>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-gray-700 dark:text-gray-300">
            {locationData.address}
          </p>
          {locationData.hasLocation && (
            <button className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
              <Map className="h-4 w-4" />
              Auf Karte anzeigen
            </button>
          )}
        </div>
      </div>
    ),
    [locationData],
  );

  const contactSection = useMemo(
    () => (
      <div className="mb-6">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Phone className="h-5 w-5" />
          Kontakt
        </h2>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {contactData.person}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {contactData.phone}
              </span>
            </div>
            {contactData.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  {contactData.email}
                </span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Info className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {contactData.department}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {contactData.hours}
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    [contactData],
  );

  const actionSection = useMemo(
    () => (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
            <Share2 className="h-4 w-4" />
            Teilen
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
            <Heart className="h-4 w-4" />
            Merken
          </button>
        </div>
        <button
          onClick={onNext}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Weiter
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    ),
    [onNext],
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      {headerSection}
      {descriptionSection}
      {imageSection}
      {locationSection}
      {contactSection}
      {actionSection}

      {/* Fullscreen Modal */}
      {isImageFullscreen && imageData.currentImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <button
            onClick={toggleFullscreen}
            className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          >
            <X className="h-6 w-6" />
          </button>
          <Image
            src={imageData.currentImage}
            alt="Fahndungsbild (Vollbild)"
            width={800}
            height={600}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white p-6 dark:bg-gray-800">
            <div className="mb-4 text-center">
              <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bilder werden hochgeladen...
              </p>
            </div>
            <div className="w-64 rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// Helper Functions
function getCategoryIcon(category?: string): string {
  switch (category) {
    case "WANTED_PERSON":
      return "🚨";
    case "MISSING_PERSON":
      return "👤";
    case "UNKNOWN_DEAD":
      return "⚰️";
    case "STOLEN_GOODS":
      return "💎";
    default:
      return "📋";
  }
}

function getCategoryLabel(category?: string): string {
  switch (category) {
    case "WANTED_PERSON":
      return "STRAFTÄTER";
    case "MISSING_PERSON":
      return "VERMISSTE PERSON";
    case "UNKNOWN_DEAD":
      return "UNBEKANNTE TOTE";
    case "STOLEN_GOODS":
      return "GESTOHLENE SACHE";
    default:
      return "UNBEKANNT";
  }
}

function getCategoryStyle(category?: string): string {
  switch (category) {
    case "WANTED_PERSON":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "MISSING_PERSON":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "UNKNOWN_DEAD":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    case "STOLEN_GOODS":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}

function getPriorityStyle(priority?: string): string {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "new":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    default:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
  }
}

function getPriorityDotColor(priority?: string): string {
  switch (priority) {
    case "urgent":
      return "bg-red-500";
    case "new":
      return "bg-green-500";
    default:
      return "bg-blue-500";
  }
}

function getPriorityLabel(priority?: string): string {
  switch (priority) {
    case "urgent":
      return "Dringend";
    case "new":
      return "Neu";
    default:
      return "Normal";
  }
}

export default OverviewCategory;
