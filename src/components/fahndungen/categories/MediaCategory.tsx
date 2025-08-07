"use client";

import React from "react";
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Plus,
  AlertCircle,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import Image from "next/image";

import type { UIInvestigationData } from "~/lib/types/investigation.types";

interface InvestigationImage {
  id: string;
  url: string;
  alt_text?: string;
  caption?: string;
}

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

export default function MediaCategory({
  data,
  isEditMode,
  updateField,
  onNext,
  onPrevious,
}: MediaCategoryProps) {
  const images = (data.images as InvestigationImage[]) || [];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Hier würde die tatsächliche Upload-Logik implementiert
      console.log("Uploading images:", files);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter(
      (_: InvestigationImage, i: number) => i !== index,
    );
    updateField("step3", "images", newImages);
  };

  return (
    <div className="space-y-6">
      {/* Media Upload Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Medien hochladen
        </h3>

        {isEditMode && (
          <div className="mb-6">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Bilder und Dokumente
            </Label>
            <div className="mt-2">
              <Button
                variant="outline"
                className="w-full border-2 border-dashed border-gray-300 hover:border-gray-400"
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Dateien auswählen
              </Button>
              <input
                id="image-upload"
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Unterstützte Formate: JPG, PNG, PDF, DOC, DOCX (max. 10MB pro
              Datei)
            </p>
          </div>
        )}

        {/* Image Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {images.length > 0 ? (
            images.map((image: InvestigationImage, index: number) => (
              <div
                key={index}
                className="group relative aspect-video overflow-hidden rounded-lg border border-gray-200"
              >
                <Image
                  src={image.url}
                  alt={image.alt_text ?? "Fahndungsbild"}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                />
                {isEditMode && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage(index)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Entfernen
                    </Button>
                  </div>
                )}
                {image.alt_text && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-xs text-white">
                    {image.alt_text}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {isEditMode
                    ? "Keine Medien vorhanden"
                    : "Keine Bilder verfügbar"}
                </p>
                {isEditMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() =>
                      document.getElementById("image-upload")?.click()
                    }
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Medien hinzufügen
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Media Information */}
      {isEditMode && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Medieninformationen
          </h3>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Bildunterschrift (optional)
              </Label>
              <Input
                placeholder="Beschreibung des Bildes..."
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Copyright-Hinweis
              </Label>
              <Input
                placeholder="Quelle oder Copyright-Information..."
                className="mt-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      {isEditMode && (
        <div className="flex justify-between">
          <Button onClick={onPrevious} variant="outline">
            Zurück zur Beschreibung
          </Button>
          <Button onClick={onNext} className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Weiter zu Orten
          </Button>
        </div>
      )}

      {/* Validation Warnings */}
      {images.length === 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">
              Keine Medien vorhanden
            </span>
          </div>
          <p className="mt-1 text-sm text-yellow-700">
            Bilder oder Dokumente können die Fahndung unterstützen.
          </p>
        </div>
      )}
    </div>
  );
}
