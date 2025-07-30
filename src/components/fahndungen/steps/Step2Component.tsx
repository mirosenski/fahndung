"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Step2Data } from "../types/WizardTypes";

interface Step2ComponentProps {
  data: Step2Data;
  onChange: (data: Step2Data) => void;
}

const Step2Component: React.FC<Step2ComponentProps> = ({ data, onChange }) => {
  const [tagInput, setTagInput] = useState("");

  // Lokale States für alle Textfelder
  const [localShortDescription, setLocalShortDescription] = useState(
    data.shortDescription,
  );
  const [localDescription, setLocalDescription] = useState(data.description);
  const [localFeatures, setLocalFeatures] = useState(data.features);

  // Synchronisiere mit externen Änderungen
  useEffect(() => {
    setLocalShortDescription(data.shortDescription);
  }, [data.shortDescription]);

  useEffect(() => {
    setLocalDescription(data.description);
  }, [data.description]);

  useEffect(() => {
    setLocalFeatures(data.features);
  }, [data.features]);

  // Commit-Funktionen
  const commitChanges = () => {
    onChange({
      ...data,
      shortDescription: localShortDescription,
      description: localDescription,
      features: localFeatures,
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !data.tags.includes(tagInput.trim())) {
      onChange({
        ...data,
        tags: [...data.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    onChange({
      ...data,
      tags: data.tags.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Schritt 2: Beschreibung & Details
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Fügen Sie detaillierte Informationen zur Fahndung hinzu
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Kurzbeschreibung *
          </label>
          <textarea
            value={localShortDescription}
            onChange={(e) => setLocalShortDescription(e.target.value)}
            onBlur={commitChanges}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="Kurze Zusammenfassung für die Kartenansicht..."
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Detaillierte Beschreibung *
          </label>
          <textarea
            value={localDescription}
            onChange={(e) => setLocalDescription(e.target.value)}
            onBlur={commitChanges}
            rows={6}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="Ausführliche Beschreibung der Fahndung..."
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Priorität *
            </label>
            <select
              value={data.priority}
              onChange={(e) =>
                onChange({
                  ...data,
                  priority: e.target.value as Step2Data["priority"],
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="normal">Normal</option>
              <option value="urgent">Dringend</option>
              <option value="new">Neu</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tags hinzufügen
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Tag eingeben..."
              />
              <button
                type="button"
                onClick={addTag}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Tags anzeigen */}
        {data.tags.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Aktuelle Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {data.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="ml-1 hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Besondere Merkmale
          </label>
          <textarea
            value={localFeatures}
            onChange={(e) => setLocalFeatures(e.target.value)}
            onBlur={commitChanges}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="z.B. Narben, Tattoos, besondere Kleidung, Auffälligkeiten..."
          />
        </div>
      </div>
    </div>
  );
};

export default Step2Component;
