"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle } from "lucide-react";
import PageLayout from "~/components/layout/PageLayout";
import FahndungsWizard from "~/app/components/fahndungs-wizard/FahndungsWizard";
import { useAuth } from "~/hooks/useAuth";

export default function SimpleWizardTestPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    setIsCompleted(true);
    // Nach 3 Sekunden zurück zum Dashboard
    setTimeout(() => {
      router.push("/dashboard");
    }, 3000);
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  return (
    <PageLayout variant="dashboard" session={session}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Zurück zum Dashboard</span>
            </button>
          </div>

          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              🧪 Einfacher Wizard Test
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              5 Schritte in einer Komponente - Step 4 = Medien
            </p>
          </div>
        </div>

        {/* Success Message */}
        {isCompleted && (
          <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                  Wizard erfolgreich abgeschlossen!
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  Sie werden in 3 Sekunden zum Dashboard zurückgeleitet...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Component */}
        {!isCompleted && (
          <div className="rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <FahndungsWizard onComplete={handleComplete} />
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
          <h3 className="mb-3 text-lg font-semibold text-blue-900 dark:text-blue-100">
            ℹ️ Einfacher Wizard - Test-Info
          </h3>
          <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
            <p>
              <strong>Step 1:</strong> Grundinformationen (Titel, Aktenzeichen,
              Kategorie)
            </p>
            <p>
              <strong>Step 2:</strong> Beschreibung (Kurz- und Langbeschreibung,
              Merkmale)
            </p>
            <p>
              <strong>Step 3:</strong> Kontaktinformationen (Ort, Dienststelle,
              Ansprechpartner)
            </p>
            <p>
              <strong>Step 4:</strong>{" "}
              <span className="font-bold text-blue-900 dark:text-blue-100">
                Medien-Upload
              </span>{" "}
              (Drag & Drop, Bildvorschau)
            </p>
            <p>
              <strong>Step 5:</strong> Überprüfung & Abschluss
            </p>
            <div className="mt-4 rounded bg-blue-100 p-3 dark:bg-blue-800">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                ⚠️ Aktueller Status:
              </p>
              <p className="text-blue-800 dark:text-blue-200">
                Step 4 (Medien) ist nur im lokalen State - keine
                Supabase-Integration vorhanden. Der handleSubmit simuliert nur
                einen API-Call.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
