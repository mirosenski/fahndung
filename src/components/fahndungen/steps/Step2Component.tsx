"use client";

import React, { useState, useEffect } from "react";
import { useDebounce } from "~/hooks/useDebounce";
import { X, Wand2 } from "lucide-react";
import {
  generateDemoShortDescription,
  generateDemoDescription,
} from "@/lib/demo/autofill";
import type { Step2Data, WizardData } from "../types/WizardTypes";

interface Step2ComponentProps {
  data: Step2Data;
  onChange: (data: Step2Data) => void;
  wizard?: Partial<WizardData>;
  showValidation?: boolean;
}

const Step2Component: React.FC<Step2ComponentProps> = ({
  data,
  onChange,
  wizard,
  showValidation = false,
}) => {
  const [tagInput, setTagInput] = useState("");

  // Lokale States für alle Textfelder
  const [localShortDescription, setLocalShortDescription] = useState(
    data.shortDescription,
  );
  const [localDescription, setLocalDescription] = useState(data.description);
  const [localFeatures, setLocalFeatures] = useState(data.features);

  // Debounced values to reduce frequent state updates while typing. When the
  // user stops typing for the specified delay, these values change and
  // propagate to the parent wizard via onChange.
  const debouncedShortDescription = useDebounce(localShortDescription, 300);
  const debouncedDescription = useDebounce(localDescription, 300);
  const debouncedFeatures = useDebounce(localFeatures, 300);

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

  // Propagate debounced field values to the wizard state. Only update when
  // there is a change to avoid unnecessary renders.
  useEffect(() => {
    if (
      debouncedShortDescription !== data.shortDescription ||
      debouncedDescription !== data.description ||
      debouncedFeatures !== data.features
    ) {
      onChange({
        ...data,
        shortDescription: debouncedShortDescription,
        description: debouncedDescription,
        features: debouncedFeatures,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedShortDescription, debouncedDescription, debouncedFeatures]);

  // Commit-Funktionen (veraltet): Der Wizard erhält seine Daten jetzt
  // automatisch über die debounced States. Diese Funktion bleibt als
  // Fallback bestehen, falls andere Komponenten sie aufrufen.
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
        <h2 className="mb-2 text-2xl font-bold text-muted-foreground dark:text-white">
          Schritt 2: Beschreibung & Details
        </h2>
        <p className="text-muted-foreground dark:text-muted-foreground">
          Fügen Sie detaillierte Informationen zur Fahndung hinzu
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
            Kurzbeschreibung *
          </label>
          <p className="mb-2 text-xs text-muted-foreground dark:text-muted-foreground">
            Mindestens 20 Zeichen. Kurze Zusammenfassung für die Kartenansicht.
          </p>
          <div className="relative">
            <textarea
              value={localShortDescription}
              onChange={(e) => setLocalShortDescription(e.target.value)}
              onBlur={commitChanges}
              rows={2}
              className={`w-full rounded-lg border px-3 py-2 pr-10 focus:outline-none focus:ring-1 dark:border-border dark:bg-muted dark:text-white ${
                showValidation && (localShortDescription?.length ?? 0) < 20
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                  : "border-border focus:border-blue-500 focus:ring-blue-500"
              }`}
              placeholder="Kurze Zusammenfassung für die Kartenansicht..."
              required
            />
            <button
              type="button"
              aria-label="Demo füllen"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"
              onClick={() => {
                const demo = generateDemoShortDescription({
                  ...(wizard ?? {}),
                  step2: data,
                });
                setLocalShortDescription(demo);
                commitChanges();
              }}
            >
              <Wand2 className="h-4 w-4" />
            </button>
          </div>
          {showValidation && (localShortDescription?.length ?? 0) < 20 && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              Kurzbeschreibung muss mindestens 20 Zeichen haben
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
            Detaillierte Beschreibung *
          </label>
          <p className="mb-2 text-xs text-muted-foreground dark:text-muted-foreground">
            Mindestens 50 Zeichen. Ausführliche Beschreibung der Fahndung.
          </p>
          <div className="relative">
            <textarea
              value={localDescription}
              onChange={(e) => setLocalDescription(e.target.value)}
              onBlur={commitChanges}
              rows={6}
              className={`w-full rounded-lg border px-3 py-2 pr-10 focus:outline-none focus:ring-1 dark:border-border dark:bg-muted dark:text-white ${
                showValidation && (localDescription?.length ?? 0) < 50
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                  : "border-border focus:border-blue-500 focus:ring-blue-500"
              }`}
              placeholder="Ausführliche Beschreibung der Fahndung..."
              required
            />
            <button
              type="button"
              aria-label="Demo füllen"
              className="absolute right-2 top-2 rounded p-1 text-muted-foreground hover:bg-muted"
              onClick={() => {
                const demo = generateDemoDescription({
                  ...(wizard ?? {}),
                  step2: data,
                });
                setLocalDescription(demo);
                commitChanges();
              }}
            >
              <Wand2 className="h-4 w-4" />
            </button>
          </div>
          {showValidation && (localDescription?.length ?? 0) < 50 && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              Beschreibung muss mindestens 50 Zeichen haben
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
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
              className="w-full rounded-lg border border-border px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white"
            >
              <option value="normal">Normal</option>
              <option value="urgent">Dringend</option>
              <option value="new">Neu</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
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
                className="flex-1 rounded-lg border border-border px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white"
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
            <label className="mb-2 block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
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
          <label className="mb-2 block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
            Besondere Merkmale
          </label>
          <textarea
            value={localFeatures}
            onChange={(e) => setLocalFeatures(e.target.value)}
            onBlur={commitChanges}
            rows={4}
            className="w-full rounded-lg border border-border px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white"
            placeholder="z.B. Narben, Tattoos, besondere Kleidung, Auffälligkeiten..."
          />
        </div>
      </div>
    </div>
  );
};

export default Step2Component;
