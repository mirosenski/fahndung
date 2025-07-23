"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PageLayout from "~/components/layout/PageLayout";
import Step3ImagesDocuments from "~/app/components/fahndungs-wizard/Step3-ImagesDocuments";
import type { Step1Data, Step2Data, Step3Data } from "@/types/fahndung-wizard";

function Step3PageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);
  const [step3Data, setStep3Data] = useState<Step3Data>({
    mainImage: null,
    additionalImages: [],
    documents: [],
  });

  useEffect(() => {
    const step1Param = searchParams.get("step1");
    const step2Param = searchParams.get("step2");

    if (step1Param && step2Param) {
      try {
        const step1 = JSON.parse(decodeURIComponent(step1Param)) as Step1Data;
        const step2 = JSON.parse(decodeURIComponent(step2Param)) as Step2Data;
        setStep1Data(step1);
        setStep2Data(step2);
      } catch (error) {
        console.error("Fehler beim Parsen der Daten:", error);
        router.push("/fahndungen/neu");
      }
    } else {
      router.push("/fahndungen/neu");
    }
  }, [searchParams, router]);

  const handleUpdate = (data: Step3Data) => {
    setStep3Data(data);
    console.log("Schritt 3 Daten aktualisiert:", data);
  };

  const handleNext = () => {
    // Weiter zu Schritt 4 mit allen bisherigen Daten
    const params = new URLSearchParams({
      step1: encodeURIComponent(JSON.stringify(step1Data)),
      step2: encodeURIComponent(JSON.stringify(step2Data)),
      step3: encodeURIComponent(JSON.stringify(step3Data)),
    });

    router.push(`/fahndungen/neu/step4?${params.toString()}`);
  };

  const handleBack = () => {
    // Zurück zu Schritt 2 mit Daten
    const params = new URLSearchParams({
      data: encodeURIComponent(JSON.stringify(step1Data)),
    });
    router.push(`/fahndungen/neu/step2?${params.toString()}`);
  };

  if (!step1Data || !step2Data) {
    return (
      <PageLayout variant="dashboard">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Lade Daten...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout variant="dashboard">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <Link
                href="/fahndungen/neu/step2"
                className="mr-4 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Schritt 3: Bilder & Dokumente
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Laden Sie Bilder und Dokumente für die Fahndung hoch
                </p>
              </div>
            </div>

            <div className="p-6">
              {/* Fortschrittsanzeige */}
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fortschritt: 3 von 6 Schritten
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    50% abgeschlossen
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: "50%" }}
                  ></div>
                </div>
              </div>

              {/* Bisherige Daten Zusammenfassung */}
              <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bisherige Informationen:
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <strong>Titel:</strong> {step1Data.title}
                  </div>
                  <div>
                    <strong>Aktenzeichen:</strong> {step1Data.caseNumber}
                  </div>
                  <div>
                    <strong>Kategorie:</strong> {step1Data.category}
                  </div>
                  <div>
                    <strong>Priorität:</strong> {step2Data.priority}
                  </div>
                </div>
              </div>

              {/* Schritt 3 Komponente */}
              <Step3ImagesDocuments
                data={step3Data}
                onUpdate={handleUpdate}
                onNext={handleNext}
                onBack={handleBack}
                caseNumber={step1Data.caseNumber}
              />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default function Step3Page() {
  return (
    <Suspense
      fallback={
        <PageLayout variant="dashboard">
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Lade Seite...</p>
            </div>
          </div>
        </PageLayout>
      }
    >
      <Step3PageContent />
    </Suspense>
  );
}
