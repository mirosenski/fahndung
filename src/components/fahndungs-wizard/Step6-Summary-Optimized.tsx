"use client";

import React, { useState, useCallback } from "react";
import {
  FileText,
  Eye,
  CreditCard,
  Check,
  AlertCircle,
  X,
  Save,
  Loader2,
} from "lucide-react";

// Import the central display component
import InvestigationDisplay from "@/components/investigation/InvestigationDisplay";
import type {
  Step1Data,
  Step2Data,
  Step3Data,
  Step4Data,
  Step5Data,
} from "@/types/fahndung-wizard";

interface Step6Props {
  data: {
    step1: Step1Data;
    step2: Step2Data;
    step3: Step3Data;
    step4: Step4Data;
    step5: Step5Data;
  };
  onUpdate: (
    step: string,
    data: Step1Data | Step2Data | Step3Data | Step4Data | Step5Data,
  ) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

type StepData = Step1Data | Step2Data | Step3Data | Step4Data | Step5Data;

// Edit Modal Component
const EditModal: React.FC<{
  step: string;
  data: StepData;
  onSave: (data: StepData) => void;
  onClose: () => void;
}> = ({ step, data, onSave, onClose }) => {
  const [formData, setFormData] = useState<StepData>(data);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    onSave(formData);
    setSaving(false);
  };

  const getStepTitle = () => {
    const titles: Record<string, string> = {
      step1: "Basis-Informationen bearbeiten",
      step2: "Beschreibung bearbeiten",
      step3: "Medien bearbeiten",
      step4: "Orte bearbeiten",
      step5: "Kontakt & Veröffentlichung bearbeiten",
    };
    return titles[step] ?? "Bearbeiten";
  };

  const renderStepForm = () => {
    switch (step) {
      case "step1": {
        const stepData = formData as Step1Data;
        return (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Titel</label>
              <input
                type="text"
                value={stepData.title ?? ""}
                onChange={(e) =>
                  setFormData({ ...stepData, title: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Kategorie
              </label>
              <select
                value={stepData.category ?? "WANTED_PERSON"}
                onChange={(e) =>
                  setFormData({
                    ...stepData,
                    category: e.target.value as Step1Data["category"],
                  })
                }
                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="WANTED_PERSON">Straftäter</option>
                <option value="MISSING_PERSON">Vermisste Person</option>
                <option value="UNKNOWN_DEAD">Unbekannte Tote</option>
                <option value="STOLEN_GOODS">Sachen</option>
              </select>
            </div>
          </div>
        );
      }

      case "step2": {
        const stepData = formData as Step2Data;
        return (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Kurzbeschreibung
              </label>
              <textarea
                value={stepData.shortDescription ?? ""}
                onChange={(e) =>
                  setFormData({ ...stepData, shortDescription: e.target.value })
                }
                rows={3}
                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Ausführliche Beschreibung
              </label>
              <textarea
                value={stepData.description ?? ""}
                onChange={(e) =>
                  setFormData({ ...stepData, description: e.target.value })
                }
                rows={6}
                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Priorität
              </label>
              <select
                value={stepData.priority ?? "normal"}
                onChange={(e) =>
                  setFormData({
                    ...stepData,
                    priority: e.target.value as Step2Data["priority"],
                  })
                }
                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="normal">Normal</option>
                <option value="urgent">Dringend</option>
                <option value="new">Neu</option>
              </select>
            </div>
          </div>
        );
      }

      case "step5": {
        const stepData = formData as Step5Data;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Ansprechpartner
                </label>
                <input
                  type="text"
                  value={stepData.contactPerson ?? ""}
                  onChange={(e) =>
                    setFormData({ ...stepData, contactPerson: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Abteilung
                </label>
                <input
                  type="text"
                  value={stepData.department ?? ""}
                  onChange={(e) =>
                    setFormData({ ...stepData, department: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={stepData.contactPhone ?? ""}
                  onChange={(e) =>
                    setFormData({ ...stepData, contactPhone: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">E-Mail</label>
                <input
                  type="email"
                  value={stepData.contactEmail ?? ""}
                  onChange={(e) =>
                    setFormData({ ...stepData, contactEmail: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );
      }

      default:
        return (
          <p className="text-gray-600">
            Bearbeitung für diesen Schritt noch nicht implementiert.
          </p>
        );
    }
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4 dark:bg-gray-800">
          <h2 className="text-xl font-semibold">{getStepTitle()}</h2>
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{renderStepForm()}</div>

        {/* Footer */}
        <div className="sticky bottom-0 flex justify-end space-x-3 border-t bg-white px-6 py-4 dark:bg-gray-800">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Speichern...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Speichern</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function Step6Summary({
  data,
  onUpdate,
  onSubmit,
  onBack,
  isSubmitting = false,
}: Step6Props) {
  const [activeTab, setActiveTab] = useState<"summary" | "preview" | "card">(
    "summary",
  );
  const [editingStep, setEditingStep] = useState<string | null>(null);

  const handleEdit = useCallback((step: string) => {
    setEditingStep(step);
  }, []);

  const handleSaveEdit = useCallback(
    (step: string, newData: StepData) => {
      onUpdate(step, newData);
      setEditingStep(null);
    },
    [onUpdate],
  );

  const tabs = [
    { id: "summary", label: "Zusammenfassung", icon: FileText },
    { id: "preview", label: "Vorschau", icon: Eye },
    { id: "card", label: "Fahndungskarte", icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Zusammenfassung & Abschluss</h2>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id as "summary" | "preview" | "card")
              }
              className={`flex items-center space-x-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              } `}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        <InvestigationDisplay
          mode={
            activeTab === "summary"
              ? "summary"
              : activeTab === "preview"
                ? "preview"
                : "card"
          }
          data={data}
          onEdit={handleEdit}
        />
      </div>

      {/* Edit Modal */}
      {editingStep && (
        <EditModal
          step={editingStep}
          data={data[editingStep as keyof typeof data] as StepData}
          onSave={(newData) => handleSaveEdit(editingStep, newData)}
          onClose={() => setEditingStep(null)}
        />
      )}

      {/* Info Box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-start">
          <AlertCircle className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <div>
            <h4 className="mb-2 font-medium text-blue-800 dark:text-blue-200">
              Veröffentlichungsstatus
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Diese Fahndung wird als{" "}
              <strong>{data.step5.publishStatus}</strong> gespeichert.
              {data.step5.requiresApproval && (
                <> Eine Freigabe durch einen Vorgesetzten ist erforderlich.</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Zurück
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex items-center space-x-2 rounded-lg bg-green-600 px-6 py-3 text-lg font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Wird gespeichert...</span>
            </>
          ) : (
            <>
              <Check className="h-5 w-5" />
              <span>Fahndung abschließen</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
