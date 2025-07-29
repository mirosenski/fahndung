"use client";

import React from "react";
import { FileText } from "lucide-react";
import { getCategoryOptions } from "@/types/categories";
import { generateNewCaseNumber } from "~/lib/utils/caseNumberGenerator";
import type { Step1Data } from "../types/WizardTypes";

interface Step1ComponentProps {
  data: Step1Data;
  onChange: (data: Step1Data) => void;
}

const Step1Component: React.FC<Step1ComponentProps> = ({ data, onChange }) => {
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Schritt 1: Grundinformationen
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Legen Sie die grundlegenden Informationen für die Fahndung fest
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Titel der Fahndung *
          </label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="z.B. Vermisste - Maria Schmidt"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Kategorie *
            </label>
            <select
              value={data.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {getCategoryOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Aktenzeichen
            </label>
            <input
              type="text"
              value={data.caseNumber}
              onChange={(e) =>
                onChange({ ...data, caseNumber: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="POL-2024-K-001234-A"
            />
          </div>
        </div>

        {/* Aktenzeichen Info */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
          <div className="mb-2 flex items-center space-x-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Aktenzeichen Format:
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Format: [Präfix]-[Jahr]-[Monat]-[Nummer] | Wird automatisch bei
            Kategorieänderung generiert
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1Component;
