"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Eye, AlertCircle, Check } from "lucide-react";
import { api } from "~/trpc/react";
import PageLayout from "~/components/layout/PageLayout";

interface NewFahndungForm {
  title: string;
  description: string;
  category:
    | "WANTED_PERSON"
    | "MISSING_PERSON"
    | "UNKNOWN_DEAD"
    | "STOLEN_GOODS";
  priority: "normal" | "urgent" | "new";
  location: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  // Neue Felder für Veröffentlichung
  status: "draft" | "active" | "published";
  features: string;
  case_number: string;
}

export default function NeueFahndungPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<NewFahndungForm>({
    title: "",
    description: "",
    category: "MISSING_PERSON",
    priority: "normal",
    location: "",
    contact_person: "",
    contact_phone: "",
    contact_email: "",
    status: "draft", // Standard: Entwurf
    features: "",
    case_number: "", // Wird automatisch generiert
  });

  // tRPC Mutation für das Erstellen von Fahndungen
  const createInvestigation = api.post.createInvestigation.useMutation({
    onSuccess: (data) => {
      console.log("✅ Fahndung erfolgreich erstellt:", data);
      // Zur Detail-Seite oder Übersicht weiterleiten
      if (formData.status === "published") {
        // Bei Veröffentlichung zur Detail-Seite
        router.push(`/fahndungen/${data.id}`);
      } else {
        // Bei Entwurf zur Übersicht
        router.push("/fahndungen");
      }
    },
    onError: (error) => {
      console.error("❌ Fehler beim Erstellen der Fahndung:", error);
    },
  });

  const handleInputChange = (field: keyof NewFahndungForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (publishNow = false) => {
    try {
      const finalStatus = publishNow ? "published" : formData.status;

      await createInvestigation.mutateAsync({
        title: formData.title,
        description: formData.description,
        status: finalStatus,
        priority: formData.priority,
        category: formData.category,
        location: formData.location,
        contact_info: {
          person: formData.contact_person,
          phone: formData.contact_phone,
          email: formData.contact_email,
        },
        tags: [formData.category, formData.priority],
      });
    } catch (error) {
      console.error("❌ Fehler beim Erstellen der Fahndung:", error);
    }
  };

  // Schritt 1: Grundinformationen
  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Schritt 1: Grundinformationen
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Titel der Fahndung *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="z.B. Vermisste Person - Maria Schmidt"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Kategorie *
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="MISSING_PERSON">Vermisste Person</option>
            <option value="WANTED_PERSON">Gesuchte Person</option>
            <option value="UNKNOWN_DEAD">Unbekannter Toter</option>
            <option value="STOLEN_GOODS">Gestohlene Gegenstände</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Priorität *
          </label>
          <select
            value={formData.priority}
            onChange={(e) => handleInputChange("priority", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="normal">Normal</option>
            <option value="urgent">Dringend</option>
            <option value="new">Neu</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Aktenzeichen
          </label>
          <input
            type="text"
            value={formData.case_number}
            onChange={(e) => handleInputChange("case_number", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="Wird automatisch generiert"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Standort
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="z.B. Berlin, Alexanderplatz"
          />
        </div>
      </div>
    </div>
  );

  // Schritt 2: Beschreibung
  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Schritt 2: Beschreibung & Details
      </h2>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Detaillierte Beschreibung *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          rows={6}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="Ausführliche Beschreibung der Fahndung..."
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Besondere Merkmale
        </label>
        <textarea
          value={formData.features}
          onChange={(e) => handleInputChange("features", e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="z.B. Narben, Tattoos, besondere Kleidung..."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Kontaktperson
          </label>
          <input
            type="text"
            value={formData.contact_person}
            onChange={(e) =>
              handleInputChange("contact_person", e.target.value)
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="Name der Kontaktperson"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Telefon
          </label>
          <input
            type="tel"
            value={formData.contact_phone}
            onChange={(e) => handleInputChange("contact_phone", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="+49 123 456789"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            E-Mail
          </label>
          <input
            type="email"
            value={formData.contact_email}
            onChange={(e) => handleInputChange("contact_email", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="kontakt@polizei.de"
          />
        </div>
      </div>
    </div>
  );

  // Schritt 3: Veröffentlichung
  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Schritt 3: Zusammenfassung & Veröffentlichung
      </h2>

      {/* Zusammenfassung */}
      <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold">Zusammenfassung</h3>
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Titel:
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {formData.title}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Kategorie:
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {formData.category}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Priorität:
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {formData.priority}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Standort:
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {formData.location || "Nicht angegeben"}
            </dd>
          </div>
        </dl>
      </div>

      {/* Veröffentlichungs-Optionen */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold">
          Veröffentlichungs-Optionen
        </h3>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="draft">Entwurf (nicht öffentlich)</option>
              <option value="active">Aktiv (interne Nutzung)</option>
              <option value="published">
                Veröffentlicht (öffentlich sichtbar)
              </option>
            </select>
          </div>

          {formData.status === "published" && (
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <div className="flex items-start">
                <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Öffentliche Veröffentlichung
                  </h4>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    Diese Fahndung wird öffentlich sichtbar und kann von
                    jedermann eingesehen werden.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <X className="h-4 w-4" />
          <span>Abbrechen</span>
        </button>

        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={
              createInvestigation.isPending ||
              !formData.title ||
              !formData.description
            }
            className="flex items-center space-x-2 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>Als Entwurf speichern</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={
              createInvestigation.isPending ||
              !formData.title ||
              !formData.description
            }
            className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Eye className="h-4 w-4" />
            <span>Sofort veröffentlichen</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Zurück</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Neue Fahndung erstellen
            </h1>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    currentStep >= step
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {currentStep > step ? <Check className="h-5 w-5" /> : step}
                </div>
                <span className="ml-2 text-sm font-medium">
                  {step === 1 && "Grundinfo"}
                  {step === 2 && "Beschreibung"}
                  {step === 3 && "Veröffentlichung"}
                </span>
                {step < 3 && (
                  <div
                    className={`mx-4 h-1 w-16 ${
                      currentStep > step ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Navigation (nur für Schritte 1 und 2) */}
          {currentStep < 3 && (
            <div className="mt-8 flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`flex items-center rounded-lg px-4 py-2 ${
                  currentStep === 1
                    ? "cursor-not-allowed bg-gray-200 text-gray-400"
                    : "bg-gray-500 text-white hover:bg-gray-600"
                }`}
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Zurück
              </button>

              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 &&
                    (!formData.title || !formData.category)) ||
                  (currentStep === 2 && !formData.description)
                }
                className="flex items-center rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
              >
                Weiter
                <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
              </button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
