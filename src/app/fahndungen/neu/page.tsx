"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import PageLayout from "~/components/layout/PageLayout";

function generateCaseNumber(category: string): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  // Kategorie-Präfix
  const prefixes: Record<string, string> = {
    WANTED_PERSON: "ST", // Straftäter
    MISSING_PERSON: "VM", // Vermisste
    UNKNOWN_DEAD: "UT", // Unbekannte Tote
    STOLEN_GOODS: "SG", // Sachen
  };

  const prefix = prefixes[category] ?? "XX";

  // Format: ST-2024-01-001
  return `${prefix}-${year}-${month}-${random}`;
}

export default function NeueFahndungPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("WANTED_PERSON");
  const [error, setError] = useState<string | null>(null);
  const [generatedCaseNumber, setGeneratedCaseNumber] = useState("");

  const router = useRouter();

  // Aktenzeichen bei Kategorie-Änderung neu generieren
  useEffect(() => {
    setGeneratedCaseNumber(generateCaseNumber(category));
  }, [category]);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Bitte geben Sie einen Titel ein");
      return;
    }

    // Daten für Schritt 2 vorbereiten
    const step1Data = {
      title: title.trim(),
      category: category as
        | "WANTED_PERSON"
        | "MISSING_PERSON"
        | "UNKNOWN_DEAD"
        | "STOLEN_GOODS",
      caseNumber: generatedCaseNumber,
    };

    // Zur Schritt 2 Seite weiterleiten mit Daten
    router.push(
      `/fahndungen/neu/step2?data=${encodeURIComponent(JSON.stringify(step1Data))}`,
    );
  };

  return (
    <PageLayout variant="dashboard">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <Link
                href="/fahndungen"
                className="mr-4 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Schritt 1: Basis-Informationen
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Neue Fahndung erstellen
                </p>
              </div>
            </div>

            <div className="p-6">
              {/* Fortschrittsanzeige */}
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fortschritt: 1 von 6 Schritten
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    17% abgeschlossen
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: "17%" }}
                  ></div>
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Basis-Info</span>
                  <span>Beschreibung</span>
                  <span>Bilder</span>
                  <span>Ort</span>
                  <span>Kontakt</span>
                  <span>Zusammenfassung</span>
                </div>
              </div>

              {/* Error Anzeige */}
              {error && (
                <div className="mb-4 rounded border border-red-200 bg-red-100 p-3 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleNext} className="space-y-6">
                <div>
                  <label
                    htmlFor="title"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Titel der Fahndung
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                    placeholder="z.B. Vermisste Person in Stuttgart..."
                    required
                    disabled={false}
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Geben Sie einen aussagekräftigen Titel ein. Die restlichen
                    Details können Sie später ergänzen.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Kategorie
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                    disabled={false}
                  >
                    <option value="WANTED_PERSON">Straftäter</option>
                    <option value="MISSING_PERSON">Vermisste Person</option>
                    <option value="UNKNOWN_DEAD">Unbekannte Tote</option>
                    <option value="STOLEN_GOODS">Sachen</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Wählen Sie die passende Kategorie für diese Fahndung.
                  </p>
                </div>

                {/* Aktenzeichen-Vorschau */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Aktenzeichen wird generiert:
                    </span>
                  </div>
                  <div className="mt-2 font-mono text-lg font-bold text-blue-600 dark:text-blue-400">
                    {generatedCaseNumber}
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Format: [Präfix]-[Jahr]-[Monat]-[Nummer]
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <Link
                    href="/fahndungen"
                    className="rounded bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Abbrechen
                  </Link>
                  <button
                    type="submit"
                    disabled={!title.trim()}
                    className="flex items-center rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Schritt 2
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
