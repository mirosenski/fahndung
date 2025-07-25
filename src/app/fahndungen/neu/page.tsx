"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X } from "lucide-react";
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
}

export default function NeueFahndungPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<NewFahndungForm>({
    title: "",
    description: "",
    category: "MISSING_PERSON",
    priority: "normal",
    location: "",
    contact_person: "",
    contact_phone: "",
    contact_email: "",
  });

  // tRPC Mutation für das Erstellen von Fahndungen
  const createInvestigation = api.post.createInvestigation.useMutation({
    onSuccess: () => {
      // Erfolgreich erstellt - zur Fahndungen-Übersicht weiterleiten
      router.push("/fahndungen");
    },
    onError: (error) => {
      console.error("❌ Fehler beim Erstellen der Fahndung:", error);
      console.error("Fehler-Details:", {
        message: error.message,
        data: error.data,
        shape: error.shape,
      });
    },
  });

  const handleInputChange = (field: keyof NewFahndungForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Erstelle die Fahndung über die tRPC API
      await createInvestigation.mutateAsync({
        title: formData.title,
        description: formData.description,
        status: "active",
        priority: formData.priority,
        category: formData.category,
        location: formData.location,
        contact_info: {
          person: formData.contact_person,
          phone: formData.contact_phone,
          email: formData.contact_email,
        },
        tags: [formData.category], // Kategorie auch als Tag
      });
    } catch (error) {
      console.error("❌ Fehler beim Erstellen der Fahndung:", error);
      console.error("Fehler-Typ:", typeof error);
      console.error(
        "Fehler-Stack:",
        error instanceof Error ? error.stack : "Kein Stack verfügbar",
      );
    }
  };

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

        {/* Form */}
        <div className="mx-auto max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basis-Informationen */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Basis-Informationen
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Titel *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Titel der Fahndung"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Kategorie *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleInputChange("priority", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Dringend</option>
                    <option value="new">Neu</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Standort
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Stadt, Straße, etc."
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Beschreibung *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Detaillierte Beschreibung der Fahndung..."
                  required
                />
              </div>
            </div>

            {/* Kontakt-Informationen */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Kontakt-Informationen
              </h2>

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
                    onChange={(e) =>
                      handleInputChange("contact_phone", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleInputChange("contact_email", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="kontakt@polizei.de"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
                <span>Abbrechen</span>
              </button>

              <button
                type="submit"
                disabled={
                  createInvestigation.isPending ||
                  !formData.title ||
                  !formData.description
                }
                className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>
                  {createInvestigation.isPending
                    ? "Erstelle..."
                    : "Fahndung erstellen"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
