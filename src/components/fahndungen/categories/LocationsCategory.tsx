"use client";

import React from "react";
import { MapPin, AlertCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

import { Label } from "~/components/ui/label";

import type { UIInvestigationData } from "~/lib/types/investigation.types";

interface LocationsCategoryProps {
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

export default function LocationsCategory({
  data,
  isEditMode,
  updateField,
  onNext,
  onPrevious,
}: LocationsCategoryProps) {
  // Sicherheitsmaßnahme: Stelle sicher, dass step4 existiert
  const step4 = data.step4 ?? { mainLocation: null };
  const mainLocation = step4.mainLocation;

  const updateMainLocation = (field: string, value: unknown) => {
    updateField("step4", "mainLocation", {
      ...mainLocation,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Main Location */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Hauptstandort
        </h3>
        {isEditMode ? (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Adresse
              </Label>
              <Input
                value={mainLocation?.address ?? ""}
                onChange={(e) =>
                  updateField("step4", "mainLocation", {
                    ...mainLocation,
                    address: e.target.value,
                  })
                }
                placeholder="Straße, Hausnummer, PLZ, Ort..."
                className="mt-1"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {mainLocation?.address ?? "Standort nicht angegeben"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Location Details */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Standortdetails
        </h3>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Adresse
            </Label>
            {isEditMode ? (
              <Input
                value={mainLocation?.address ?? ""}
                onChange={(e) => updateMainLocation("address", e.target.value)}
                placeholder="Vollständige Adresse..."
                className="mt-1"
              />
            ) : (
              <p className="mt-1 text-gray-700 dark:text-gray-300">
                {mainLocation?.address ?? "Keine Adresse angegeben"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Kartenansicht
        </h3>
        <div className="flex aspect-video items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
          <div className="text-center">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Kartenansicht wird hier angezeigt
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {isEditMode && (
        <div className="flex justify-between">
          <Button onClick={onPrevious} variant="outline">
            Zurück zu Medien
          </Button>
          <Button onClick={onNext} className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Weiter zu Kontakt
          </Button>
        </div>
      )}

      {/* Validation Warnings */}
      {!mainLocation?.address && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">
              Hauptstandort fehlt
            </span>
          </div>
          <p className="mt-1 text-sm text-yellow-700">
            Ein Hauptstandort ist wichtig für die Fahndung.
          </p>
        </div>
      )}
    </div>
  );
}
