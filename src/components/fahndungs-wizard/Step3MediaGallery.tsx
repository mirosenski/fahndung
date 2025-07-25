"use client";

import React, { useState, useEffect } from "react";
import {
  Upload,
  Image,
  X,
  ChevronLeft,
  ChevronRight,
  Grid,
  Check,
  Search,
  FolderOpen,
} from "lucide-react";
import { supabase } from "~/lib/supabase";

interface MediaItem {
  id: string;
  file_name: string;
  file_path: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  directory: string;
  is_public: boolean;
  uploaded_at: string;
  url?: string;
}

interface Step3MediaProps {
  mainImage: File | null;
  additionalImages: File[];
  documents: File[];
  onUpdate: (data: any) => void;
  errors?: any;
}

export default function Step3MediaGallery({
  mainImage,
  additionalImages,
  documents,
  onUpdate,
  errors,
}: Step3MediaProps) {
  const [dragActive, setDragActive] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryItems, setGalleryItems] = useState<MediaItem[]>([]);
  const [selectedGalleryItems, setSelectedGalleryItems] = useState<MediaItem[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDirectory, setSelectedDirectory] = useState("all");
  const [directories, setDirectories] = useState<string[]>([]);

  // Load media gallery items
  useEffect(() => {
    if (showGallery) {
      void loadGalleryItems();
    }
  }, [showGallery, selectedDirectory]);

  const loadGalleryItems = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("media")
        .select("*")
        .eq("media_type", "image")
        .order("uploaded_at", { ascending: false });

      if (selectedDirectory !== "all") {
        query = query.eq("directory", selectedDirectory);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Add public URLs to items
      const itemsWithUrls = (data || []).map((item) => ({
        ...item,
        url: supabase.storage.from("media-gallery").getPublicUrl(item.file_path)
          .data.publicUrl,
      }));

      setGalleryItems(itemsWithUrls);

      // Get unique directories
      const uniqueDirs = [
        ...new Set(data?.map((item) => item.directory) || []),
      ];
      setDirectories(uniqueDirs);
    } catch (error) {
      console.error("Error loading gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  // File upload handlers
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
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const docFiles = files.filter(
      (file) =>
        file.type === "application/pdf" ||
        file.type.includes("document") ||
        file.type.includes("word"),
    );

    if (imageFiles.length > 0) {
      if (!mainImage && imageFiles[0]) {
        onUpdate({ mainImage: imageFiles[0] });
        imageFiles.shift();
      }
      if (imageFiles.length > 0) {
        onUpdate({ additionalImages: [...additionalImages, ...imageFiles] });
      }
    }

    if (docFiles.length > 0) {
      onUpdate({ documents: [...documents, ...docFiles] });
    }
  };

  // Gallery selection handlers
  const handleGallerySelect = (item: MediaItem) => {
    const isSelected = selectedGalleryItems.some(
      (selected) => selected.id === item.id,
    );
    if (isSelected) {
      setSelectedGalleryItems(
        selectedGalleryItems.filter((selected) => selected.id !== item.id),
      );
    } else {
      setSelectedGalleryItems([...selectedGalleryItems, item]);
    }
  };

  const handleApplyGallerySelection = async () => {
    if (selectedGalleryItems.length === 0) return;

    try {
      // Convert selected gallery items to File objects
      const newFiles: File[] = [];

      for (const item of selectedGalleryItems) {
        const response = await fetch(item.url!);
        const blob = await response.blob();
        const file = new File([blob], item.original_name, {
          type: item.mime_type,
        });
        newFiles.push(file);
      }

      // Add first selected as main image if none exists
      if (!mainImage && newFiles[0]) {
        onUpdate({ mainImage: newFiles[0] });
        newFiles.shift();
      }

      // Add rest as additional images
      if (newFiles.length > 0) {
        onUpdate({ additionalImages: [...additionalImages, ...newFiles] });
      }

      // Reset selection and close gallery
      setSelectedGalleryItems([]);
      setShowGallery(false);
    } catch (error) {
      console.error("Error applying gallery selection:", error);
    }
  };

  const removeMainImage = () => {
    onUpdate({ mainImage: null });
  };

  const removeAdditionalImage = (index: number) => {
    const newImages = additionalImages.filter((_, i) => i !== index);
    onUpdate({ additionalImages: newImages });
  };

  const removeDocument = (index: number) => {
    const newDocs = documents.filter((_, i) => i !== index);
    onUpdate({ documents: newDocs });
  };

  const makeMainImage = (index: number) => {
    const newMainImage = additionalImages[index];
    const newAdditionalImages = [...additionalImages];
    newAdditionalImages.splice(index, 1);

    if (mainImage) {
      newAdditionalImages.unshift(mainImage);
    }

    onUpdate({
      mainImage: newMainImage,
      additionalImages: newAdditionalImages,
    });
  };

  // Filter gallery items based on search
  const filteredGalleryItems = galleryItems.filter(
    (item) =>
      item.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.directory.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Medien hinzufügen</h2>

      {/* Upload Area */}
      <div
        className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <p className="mb-2 text-gray-600 dark:text-gray-400">
          Bilder oder Dokumente hier ablegen
        </p>
        <p className="mb-4 text-sm text-gray-500">oder</p>
        <div className="flex justify-center space-x-3">
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*,application/pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => handleFiles(Array.from(e.target.files || []))}
            />
            <span className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Dateien auswählen
            </span>
          </label>
          <button
            onClick={() => setShowGallery(true)}
            className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            <Grid className="mr-2 h-4 w-4" />
            Aus Galerie wählen
          </button>
        </div>
      </div>

      {/* Main Image */}
      <div>
        <h3 className="mb-3 text-lg font-semibold">Hauptbild</h3>
        {mainImage ? (
          <div className="group relative inline-block">
            <img
              src={URL.createObjectURL(mainImage)}
              alt="Hauptbild"
              className="h-40 w-40 rounded-lg object-cover"
            />
            <button
              onClick={removeMainImage}
              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex h-40 w-40 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <Image className="h-12 w-12 text-gray-400" />
          </div>
        )}
        {errors?.mainImage && (
          <p className="mt-1 text-sm text-red-500">{errors.mainImage}</p>
        )}
      </div>

      {/* Additional Images */}
      <div>
        <h3 className="mb-3 text-lg font-semibold">Weitere Bilder</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {additionalImages.map((file, index) => (
            <div key={index} className="group relative">
              <img
                src={URL.createObjectURL(file)}
                alt={`Bild ${index + 1}`}
                className="h-32 w-full rounded-lg object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center space-x-2 rounded-lg bg-black bg-opacity-50 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => makeMainImage(index)}
                  className="rounded bg-white p-1 text-gray-800 hover:bg-gray-100"
                  title="Als Hauptbild setzen"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeAdditionalImage(index)}
                  className="rounded bg-white p-1 text-gray-800 hover:bg-gray-100"
                  title="Entfernen"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Documents */}
      {documents.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold">Dokumente</h3>
          <div className="space-y-2">
            {documents.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <FolderOpen className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeDocument(index)}
                  className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-lg bg-white dark:bg-gray-800">
            {/* Header */}
            <div className="border-b border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  Medien aus Galerie wählen
                </h3>
                <button
                  onClick={() => {
                    setShowGallery(false);
                    setSelectedGalleryItems([]);
                  }}
                  className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Search and Filter */}
              <div className="mt-4 flex space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Suchen..."
                      className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 dark:border-gray-600 dark:bg-gray-700"
                    />
                  </div>
                </div>
                <select
                  value={selectedDirectory}
                  onChange={(e) => setSelectedDirectory(e.target.value)}
                  className="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700"
                >
                  <option value="all">Alle Ordner</option>
                  {directories.map((dir) => (
                    <option key={dir} value={dir}>
                      {dir}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="max-h-[60vh] overflow-y-auto p-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                </div>
              ) : filteredGalleryItems.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  Keine Bilder gefunden
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {filteredGalleryItems.map((item) => {
                    const isSelected = selectedGalleryItems.some(
                      (selected) => selected.id === item.id,
                    );
                    return (
                      <div
                        key={item.id}
                        className={`group relative cursor-pointer rounded-lg border-2 transition-all ${
                          isSelected
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-transparent hover:border-gray-300"
                        }`}
                        onClick={() => handleGallerySelect(item)}
                      >
                        <img
                          src={item.url}
                          alt={item.original_name}
                          className="h-32 w-full rounded-lg object-cover"
                        />
                        {isSelected && (
                          <div className="absolute right-2 top-2 rounded-full bg-blue-500 p-1 text-white">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 rounded-b-lg bg-gradient-to-t from-black/60 to-transparent p-2">
                          <p className="truncate text-xs text-white">
                            {item.original_name}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedGalleryItems.length} Bilder ausgewählt
                </span>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowGallery(false);
                      setSelectedGalleryItems([]);
                    }}
                    className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleApplyGallerySelection}
                    disabled={selectedGalleryItems.length === 0}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    Auswahl übernehmen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
