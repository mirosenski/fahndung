"use client";

import { useState } from "react";
import { Hash } from "lucide-react";
import type { Step2Data } from "@/types/fahndung-wizard";

interface Step2Props {
  data: Step2Data;
  onUpdate: (data: Step2Data) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2ExtendedInfo({
  data,
  onUpdate,
  onNext,
  onBack,
}: Step2Props) {
  const [shortDescription, setShortDescription] = useState(
    data.shortDescription,
  );
  const [description, setDescription] = useState(data.description);
  const [priority, setPriority] = useState(data.priority);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(data.tags);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleNext = () => {
    onUpdate({
      shortDescription,
      description,
      priority,
      tags,
    });
    onNext();
  };

  const isValid =
    shortDescription.trim().length > 0 && description.trim().length > 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Erweiterte Informationen</h2>

      {/* Kurzbeschreibung */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Kurzbeschreibung *
          <span className="ml-2 font-normal text-gray-500">
            ({shortDescription.length}/200 Zeichen)
          </span>
        </label>
        <textarea
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value.slice(0, 200))}
          className="textarea-dark-mode-sm"
          rows={3}
          placeholder="Kurze Zusammenfassung für die Übersicht..."
          required
        />
      </div>

      {/* Ausführliche Beschreibung */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Ausführliche Beschreibung *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="textarea-dark-mode-sm"
          rows={8}
          placeholder="Detaillierte Beschreibung des Falls..."
          required
        />
      </div>

      {/* Priorität */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Priorität
        </label>
        <div className="flex gap-4">
          {[
            { value: "normal", label: "Normal", color: "gray" },
            { value: "urgent", label: "Dringend", color: "red" },
            { value: "new", label: "Neu", color: "blue" },
          ].map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                value={option.value}
                checked={priority === option.value}
                onChange={(e) =>
                  setPriority(e.target.value as "normal" | "urgent" | "new")
                }
                className="mr-2"
              />
              <span
                className={`rounded-full px-3 py-1 text-sm bg-${option.color}-100 text-${option.color}-800`}
              >
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Tags
          <span className="ml-2 font-normal text-gray-500">
            (Enter drücken zum Hinzufügen)
          </span>
        </label>
        <div className="mb-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm"
            >
              <Hash className="mr-1 h-3 w-3" />
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-2 text-gray-500 hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          className="input-dark-mode-sm"
          placeholder="Tag eingeben und Enter drücken..."
        />
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
          disabled={!isValid}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Schritt 3
        </button>
      </div>
    </div>
  );
}
