"use client";

import React from "react";
import { FileText, AlertCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";

import type { UIInvestigationData } from "~/lib/types/investigation.types";

interface DescriptionCategoryProps {
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

export default function DescriptionCategory({
  data,
  isEditMode,
  updateField,
  onNext,
  onPrevious,
}: DescriptionCategoryProps) {
  return (
    <div className="space-y-6">
      {/* Main Description */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Detaillierte Beschreibung
        </h3>
        {isEditMode ? (
          <Textarea
            value={data.step2.description}
            onChange={(e) =>
              updateField("step2", "description", e.target.value)
            }
            className="whitespace-pre-wrap leading-relaxed"
            rows={12}
            placeholder="Detaillierte Beschreibung des Falls..."
          />
        ) : (
          <p className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300">
            {data.step2.description ?? "Keine Beschreibung verfügbar."}
          </p>
        )}
      </div>

      {/* Features */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Besondere Merkmale
        </h3>
        {isEditMode ? (
          <Textarea
            value={data.step2.features}
            onChange={(e) => updateField("step2", "features", e.target.value)}
            className="whitespace-pre-wrap leading-relaxed"
            rows={8}
            placeholder="Besondere Merkmale, Kennzeichen, Auffälligkeiten..."
          />
        ) : (
          <p className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300">
            {data.step2.features ?? "Keine besonderen Merkmale angegeben."}
          </p>
        )}
      </div>

      {/* Tags */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Tags & Kategorien
        </h3>
        {isEditMode ? (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tags (durch Komma getrennt)
              </Label>
              <Input
                value={data.step2.tags?.join(", ") ?? ""}
                onChange={(e) => {
                  const tags = e.target.value
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag.length > 0);
                  updateField("step2", "tags", tags);
                }}
                className="mt-1"
                placeholder="z.B. vermisst, jugendlich, sportlich"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {data.step2.tags?.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.step2.tags?.length > 0 ? (
              data.step2.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {tag}
                </span>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Keine Tags angegeben.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      {isEditMode && (
        <div className="flex justify-between">
          <Button onClick={onPrevious} variant="outline">
            Zurück zur Übersicht
          </Button>
          <Button onClick={onNext} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Weiter zu Medien
          </Button>
        </div>
      )}

      {/* Validation Warnings */}
      {!data.step2.description && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">
              Beschreibung fehlt
            </span>
          </div>
          <p className="mt-1 text-sm text-yellow-700">
            Eine detaillierte Beschreibung ist wichtig für die Fahndung.
          </p>
        </div>
      )}
    </div>
  );
}
