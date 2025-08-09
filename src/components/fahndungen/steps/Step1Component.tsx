"use client";

import React, { useState, useEffect } from "react";
import { useDebounce } from "~/hooks/useDebounce";
import { FileText } from "lucide-react";
import { getCategoryOptions } from "@/types/categories";
import { generateNewCaseNumber } from "~/lib/utils/caseNumberGenerator";
import type { Step1Data } from "../types/WizardTypes";

interface Step1ComponentProps {
  data: Step1Data;
  onChange: (data: Step1Data) => void;
}

const Step1Component: React.FC<Step1ComponentProps> = ({ data, onChange }) => {
  // Lokaler State für den Titel
  const [localTitle, setLocalTitle] = useState(data.title);
  const [titleTouched, setTitleTouched] = useState(false);
  const [categoryTouched, setCategoryTouched] = useState(false);

  // Debounced version of the title to reduce frequent state updates. When the
  // user stops typing for the specified delay, the debounced value changes
  // and we propagate it to the parent via onChange.
  const debouncedTitle = useDebounce(localTitle, 300);

  // Synchronisiere lokalen State mit data.title wenn sich data ändert
  useEffect(() => {
    setLocalTitle(data.title);
  }, [data.title]);

  // Propagate debounced title changes to the parent wizard. Only update
  // when the debounced value differs from the current data.title to
  // prevent unnecessary updates.
  useEffect(() => {
    if (debouncedTitle !== data.title) {
      onChange({ ...data, title: debouncedTitle });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTitle]);

  const generateCaseNumber = (category: string): string => {
    return generateNewCaseNumber(category as Step1Data["category"], "draft");
  };

  const handleCategoryChange = (category: string) => {
    onChange({
      ...data,
      category: category as Step1Data["category"],
      caseNumber: generateCaseNumber(category),
    });
  };

  const isTitleInvalid =
    titleTouched && (localTitle.length < 5 || localTitle.length > 100);
  const isCategoryInvalid = categoryTouched && !data.category;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-muted-foreground dark:text-white">
          Schritt 1: Grundinformationen
        </h2>
        <p className="text-muted-foreground dark:text-muted-foreground">
          Legen Sie die grundlegenden Informationen für die Fahndung fest
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label
            className={`mb-1 block text-sm font-medium text-muted-foreground dark:text-muted-foreground ${
              isTitleInvalid ? "underline decoration-red-500" : ""
            }`}
            style={isTitleInvalid ? { textDecorationStyle: "wavy" } : undefined}
          >
            Titel der Fahndung *
          </label>
          <p className="mb-2 text-xs text-muted-foreground dark:text-muted-foreground">
            Bitte mindestens 5 und maximal 100 Zeichen eingeben.
          </p>
          <input
            type="text"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={() => setTitleTouched(true)}
            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 dark:border-border dark:bg-muted dark:text-white ${
              isTitleInvalid
                ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                : "border-border focus:border-blue-500 focus:ring-blue-500"
            }`}
            placeholder="z.B. Vermisste - Maria Schmidt"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label
              className={`mb-1 block text-sm font-medium text-muted-foreground dark:text-muted-foreground ${
                isCategoryInvalid ? "underline decoration-red-500" : ""
              }`}
              style={
                isCategoryInvalid ? { textDecorationStyle: "wavy" } : undefined
              }
            >
              Kategorie *
            </label>
            <p className="mb-2 text-xs text-muted-foreground dark:text-muted-foreground">
              Bitte eine passende Kategorie auswählen.
            </p>
            <select
              value={data.category ?? ""}
              onChange={(e) => {
                if (!categoryTouched) setCategoryTouched(true);
                handleCategoryChange(e.target.value);
              }}
              onBlur={() => setCategoryTouched(true)}
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 dark:border-border dark:bg-muted dark:text-white ${
                isCategoryInvalid
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                  : "border-border focus:border-blue-500 focus:ring-blue-500"
              }`}
            >
              <option value="" disabled>
                Bitte Kategorie auswählen …
              </option>
              {getCategoryOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
              Aktenzeichen
            </label>
            <p className="mb-2 text-xs text-muted-foreground dark:text-muted-foreground">
              Automatisch bei Kategorienwechsel; bei Bedarf anpassbar.
            </p>
            <input
              type="text"
              value={data.caseNumber}
              onChange={(e) =>
                onChange({ ...data, caseNumber: e.target.value })
              }
              className="w-full rounded-lg border border-border px-3 py-2 font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white"
              placeholder="POL-2024-K-001234-A"
            />
          </div>
        </div>

        {/* Aktenzeichen Info */}
        <div className="rounded-lg border border-border bg-muted p-4 dark:border-border dark:bg-muted">
          <div className="mb-2 flex items-center space-x-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
              Aktenzeichen Format:
            </span>
          </div>
          <div className="text-xs text-muted-foreground dark:text-muted-foreground">
            Format: [Präfix]-[Jahr]-[Monat]-[Nummer] | Wird automatisch bei
            Kategorieänderung generiert
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1Component;
