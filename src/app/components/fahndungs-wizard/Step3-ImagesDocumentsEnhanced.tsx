import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  Upload,
  X,
  Image as ImageIcon,
  FileText,
  AlertCircle,
  Loader2,
  Grid,
  Check,
  Search,
  FolderOpen,
} from "lucide-react";
import type { Step3Data } from "@/types/fahndung-wizard";
import Step3MediaGallery from "~/components/fahndungs-wizard/Step3MediaGallery";

interface ImageFile {
  file: File;
  preview: string; // Base64 URL
  id: string;
  isMain: boolean; // Local state for UI
}

interface Step3Props {
  data: Step3Data;
  onUpdate: (data: Step3Data) => void;
  onNext: () => void;
  onBack: () => void;
  caseNumber: string; // Für Ordnerstruktur
}

export default function Step3ImagesDocumentsEnhanced({
  data,
  onUpdate,
  onNext,
  onBack,
  caseNumber,
}: Step3Props) {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [documents, setDocuments] = useState<File[]>(data.documents);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useEnhancedGallery, setUseEnhancedGallery] = useState(true);

  // File to Base64 converter
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Initialize from existing data
  useEffect(() => {
    const initializeImages = async () => {
      if (data.imagePreviews && data.imagePreviews.length > 0) {
        // Restore from saved previews
        const restoredImages: ImageFile[] = [];

        // First, add main image if it exists
        if (data.mainImage) {
          const mainPreview = data.imagePreviews.find(
            (preview) => preview.name === data.mainImage!.name,
          );
          if (mainPreview) {
            restoredImages.push({
              file: data.mainImage,
              preview: mainPreview.preview,
              id: mainPreview.id,
              isMain: true,
            });
          }
        }

        // Then add additional images
        for (const preview of data.imagePreviews) {
          if (preview.name !== data.mainImage?.name) {
            const additionalImage = data.additionalImages.find(
              (img) => img.name === preview.name,
            );
            if (additionalImage) {
              restoredImages.push({
                file: additionalImage,
                preview: preview.preview,
                id: preview.id,
                isMain: false,
              });
            }
          }
        }

        setImageFiles(restoredImages);
      } else if (data.mainImage) {
        // Convert existing main image
        try {
          const preview = await fileToBase64(data.mainImage);
          const newImageFile = {
            file: data.mainImage,
            preview,
            id: `main-${Date.now()}`,
            isMain: true,
          };
          setImageFiles([newImageFile]);

          // Update form data with the new preview
          onUpdate({
            ...data,
            imagePreviews: [
              {
                id: newImageFile.id,
                preview: newImageFile.preview,
                name: newImageFile.file.name,
              },
            ],
          });
        } catch (error) {
          console.error("Error converting main image:", error);
        }
      }
    };

    initializeImages();
  }, [data, onUpdate]);

  // Enhanced gallery update handler
  const handleEnhancedGalleryUpdate = (updateData: any) => {
    const updatedData = { ...data };

    if (updateData.mainImage !== undefined) {
      updatedData.mainImage = updateData.mainImage;
    }

    if (updateData.additionalImages !== undefined) {
      updatedData.additionalImages = updateData.additionalImages;
    }

    if (updateData.documents !== undefined) {
      updatedData.documents = updateData.documents;
    }

    onUpdate(updatedData);
  };

  // Drag & Drop Handler
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));

    if (imageFiles.length > 0) {
      await handleImageUpload(imageFiles);
    }
  }, []);

  // Image Upload Handler
  const handleImageUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setIsProcessing(true);
    const newImages: ImageFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file && file.type.startsWith("image/")) {
        try {
          const base64 = await fileToBase64(file);
          const isMain = imageFiles.length === 0 && newImages.length === 0; // First image is main

          newImages.push({
            file,
            preview: base64,
            id: `${Date.now()}-${i}`,
            isMain,
          });
        } catch (error) {
          console.error("Error converting image:", error);
        }
      }
    }

    const updatedImages = [...imageFiles, ...newImages];
    setImageFiles(updatedImages);

    // Update form data
    updateFormData(updatedImages);
    setIsProcessing(false);
  };

  // Update form data with new images
  const updateFormData = (images: ImageFile[]) => {
    const mainImage = images.find((img) => img.isMain)?.file || null;
    const additionalImages = images
      .filter((img) => !img.isMain)
      .map((img) => img.file);

    onUpdate({
      ...data,
      mainImage,
      additionalImages,
      imagePreviews: images.map((img) => ({
        id: img.id,
        preview: img.preview,
        name: img.file.name,
      })),
    });
  };

  // Remove image
  const removeImage = (index: number) => {
    const updatedImages = imageFiles.filter((_, i) => i !== index);

    // If we removed the main image and there are other images, make the first one main
    if (imageFiles[index].isMain && updatedImages.length > 0) {
      updatedImages[0].isMain = true;
    }

    setImageFiles(updatedImages);
    updateFormData(updatedImages);
  };

  // Set main image
  const setMainImage = (index: number) => {
    const updatedImages = imageFiles.map((img, i) => ({
      ...img,
      isMain: i === index,
    }));

    setImageFiles(updatedImages);
    updateFormData(updatedImages);
  };

  // Document handlers
  const handleDocuments = useCallback(
    (files: File[]) => {
      const pdfFiles = files.filter((f) => f.type === "application/pdf");
      const updatedDocs = [...documents, ...pdfFiles].slice(0, 5); // Max 5 documents
      setDocuments(updatedDocs);
      onUpdate({
        ...data,
        documents: updatedDocs,
      });
    },
    [documents, data, onUpdate],
  );

  const removeDocument = (index: number) => {
    const updatedDocs = documents.filter((_, i) => i !== index);
    setDocuments(updatedDocs);
    onUpdate({
      ...data,
      documents: updatedDocs,
    });
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Bilder & Dokumente</h2>

      <div className="rounded-lg bg-blue-50 p-3 text-sm text-gray-600">
        <AlertCircle className="mr-2 inline-block h-4 w-4" />
        Alle Dateien werden unter <strong>
          /fahndungen/{caseNumber}/
        </strong>{" "}
        gespeichert
      </div>

      {/* Gallery Mode Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <div>
          <h3 className="text-lg font-semibold">Medien-Galerie Modus</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Wählen Sie zwischen der erweiterten Galerie und dem klassischen
            Upload
          </p>
        </div>
        <label className="flex cursor-pointer items-center space-x-2">
          <input
            type="checkbox"
            checked={useEnhancedGallery}
            onChange={(e) => setUseEnhancedGallery(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium">
            Erweiterte Galerie verwenden
          </span>
        </label>
      </div>

      {/* Loading Indicator */}
      {isProcessing && (
        <div className="flex items-center justify-center rounded-lg bg-blue-50 p-4">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-600" />
          <span className="text-sm text-blue-600">
            Bilder werden verarbeitet...
          </span>
        </div>
      )}

      {/* Enhanced Gallery Mode */}
      {useEnhancedGallery ? (
        <Step3MediaGallery
          mainImage={data.mainImage}
          additionalImages={data.additionalImages}
          documents={data.documents}
          onUpdate={handleEnhancedGalleryUpdate}
          errors={{}}
        />
      ) : (
        /* Classic Upload Mode */
        <>
          {/* Bilder Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Bilder hochladen *
            </label>
            <div
              className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {imageFiles.length === 0 ? (
                <>
                  <ImageIcon className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                  <p className="mb-2 text-gray-600">
                    Bilder hierher ziehen oder
                  </p>
                  <label className="cursor-pointer">
                    <span className="inline-block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
                      Dateien auswählen
                    </span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files &&
                        handleImageUpload(Array.from(e.target.files))
                      }
                    />
                  </label>
                  <p className="mt-2 text-sm text-gray-500">
                    JPG, PNG oder GIF • Max. 10MB pro Bild
                  </p>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {imageFiles.map((img, index) => (
                    <div key={img.id} className="group relative">
                      <img
                        src={img.preview}
                        alt={`Bild ${index + 1}`}
                        className="h-32 w-full rounded-lg object-cover"
                      />
                      {img.isMain && (
                        <span className="absolute left-2 top-2 rounded bg-blue-600 px-2 py-1 text-xs text-white">
                          Hauptbild
                        </span>
                      )}
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {!img.isMain && (
                        <button
                          onClick={() => setMainImage(index)}
                          className="absolute bottom-2 left-2 rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity hover:bg-gray-700 group-hover:opacity-100"
                        >
                          Hauptbild
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dokumente Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Dokumente (PDF, max. 5)
            </label>
            <div
              className={`rounded-lg border-2 border-dashed p-4 ${
                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(false);
                const files = Array.from(e.dataTransfer.files);
                const pdfFiles = files.filter(
                  (f) => f.type === "application/pdf",
                );
                if (pdfFiles.length > 0) {
                  handleDocuments(pdfFiles);
                }
              }}
            >
              {documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded bg-gray-50 p-2"
                    >
                      <div className="flex items-center">
                        <FileText className="mr-2 h-5 w-5 text-gray-600" />
                        <span className="text-sm">{doc.name}</span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({(doc.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        onClick={() => removeDocument(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <FileText className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    PDF-Dokumente hierher ziehen
                  </p>
                </div>
              )}
              {documents.length < 5 && (
                <label className="cursor-pointer">
                  <div className="mt-3 text-center">
                    <span className="inline-block rounded bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300">
                      PDF auswählen
                    </span>
                  </div>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    accept="application/pdf"
                    onChange={(e) =>
                      e.target.files &&
                      handleDocuments(Array.from(e.target.files))
                    }
                  />
                </label>
              )}
            </div>
          </div>
        </>
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
          onClick={handleNext}
          disabled={!data.mainImage && data.additionalImages.length === 0}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Weiter
        </button>
      </div>
    </div>
  );
}
