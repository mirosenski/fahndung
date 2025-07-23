import { useState, useCallback } from "react";
import Image from "next/image";
import {
  Upload,
  X,
  Image as ImageIcon,
  FileText,
  AlertCircle,
} from "lucide-react";

interface Step3Props {
  data: {
    mainImage: File | null;
    additionalImages: File[];
    documents: File[];
  };
  onUpdate: (data: {
    mainImage: File | null;
    additionalImages: File[];
    documents: File[];
  }) => void;
  onNext: () => void;
  onBack: () => void;
  caseNumber: string; // Für Ordnerstruktur
}

export default function Step3ImagesDocuments({
  data,
  onUpdate,
  onNext,
  onBack,
  caseNumber,
}: Step3Props) {
  const [mainImage, setMainImage] = useState<File | null>(data.mainImage);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>(
    data.additionalImages,
  );
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const [documents, setDocuments] = useState<File[]>(data.documents);
  const [dragActive, setDragActive] = useState(false);

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

  const handleDrop = useCallback(
    (e: React.DragEvent, type: "main" | "additional" | "documents") => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = Array.from(e.dataTransfer.files);

      if (type === "main" && files[0]) {
        handleMainImage(files[0]);
      } else if (type === "additional") {
        const imageFiles = files.filter((f) => f.type.startsWith("image/"));
        const newImages = [...additionalImages, ...imageFiles].slice(0, 10);
        setAdditionalImages(newImages);

        // Previews generieren
        imageFiles.forEach((file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            setAdditionalPreviews((prev) => [
              ...prev,
              e.target?.result as string,
            ]);
          };
          reader.readAsDataURL(file);
        });
      } else if (type === "documents") {
        const pdfFiles = files.filter((f) => f.type === "application/pdf");
        setDocuments([...documents, ...pdfFiles].slice(0, 5));
      }
    },
    [additionalImages, documents],
  );

  // Hauptbild Handler
  const handleMainImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Bitte nur Bilddateien auswählen");
      return;
    }

    setMainImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setMainImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Zusätzliche Bilder Handler
  const handleAdditionalImages = useCallback(
    (files: File[]) => {
      const imageFiles = files.filter((f) => f.type.startsWith("image/"));
      const newImages = [...additionalImages, ...imageFiles].slice(0, 10); // Max 10 Bilder
      setAdditionalImages(newImages);

      // Previews für alle neuen Bilder generieren
      const newPreviews: string[] = [];
      imageFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          if (newPreviews.length === imageFiles.length) {
            setAdditionalPreviews((prev) => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    },
    [additionalImages],
  );

  // Dokumente Handler
  const handleDocuments = useCallback(
    (files: File[]) => {
      const pdfFiles = files.filter((f) => f.type === "application/pdf");
      setDocuments([...documents, ...pdfFiles].slice(0, 5)); // Max 5 Dokumente
    },
    [documents],
  );

  // Entfernen Handler
  const removeMainImage = () => {
    setMainImage(null);
    setMainImagePreview(null);
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    setAdditionalPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    onUpdate({
      mainImage,
      additionalImages,
      documents,
    });
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

      {/* Hauptbild */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Titelbild (Hauptbild) *
        </label>
        <div
          className={`rounded-lg border-2 border-dashed p-6 text-center ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={(e) => handleDrop(e, "main")}
        >
          {mainImagePreview ? (
            <div className="relative inline-block">
              <Image
                src={mainImagePreview}
                alt="Hauptbild"
                width={256}
                height={256}
                className="max-h-64 rounded-lg object-contain"
              />
              <button
                onClick={removeMainImage}
                className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <ImageIcon className="mx-auto mb-3 h-12 w-12 text-gray-400" />
              <p className="mb-2 text-gray-600">Bild hierher ziehen oder</p>
              <label className="cursor-pointer">
                <span className="inline-block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
                  Datei auswählen
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files?.[0] && handleMainImage(e.target.files[0])
                  }
                />
              </label>
            </>
          )}
        </div>
      </div>

      {/* Zusätzliche Bilder */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Weitere Bilder (max. 10)
        </label>
        <div
          className={`rounded-lg border-2 border-dashed p-4 ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={(e) => handleDrop(e, "additional")}
        >
          <div className="grid grid-cols-5 gap-4">
            {additionalPreviews.map((preview, index) => (
              <div key={index} className="relative">
                <Image
                  src={preview}
                  alt={`Bild ${index + 1}`}
                  width={96}
                  height={96}
                  className="h-24 w-full rounded object-cover"
                />
                <button
                  onClick={() => removeAdditionalImage(index)}
                  className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {additionalImages.length < 10 && (
              <label className="cursor-pointer">
                <div className="flex h-24 w-full items-center justify-center rounded border-2 border-dashed border-gray-300 hover:border-blue-500">
                  <Upload className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files &&
                    handleAdditionalImages(Array.from(e.target.files))
                  }
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Dokumente */}
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
          onDrop={(e) => handleDrop(e, "documents")}
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
                  e.target.files && handleDocuments(Array.from(e.target.files))
                }
              />
            </label>
          )}
        </div>
      </div>

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
          disabled={!mainImage}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Weiter
        </button>
      </div>
    </div>
  );
}
