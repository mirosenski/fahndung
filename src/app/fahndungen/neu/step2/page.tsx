"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PageLayout from "~/components/layout/PageLayout";
import Step2ExtendedInfo from "~/app/components/fahndungs-wizard/Step2-ExtendedInfo";
import type { Step1Data, Step2Data } from "@/types/fahndung-wizard";

function Step2PageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data>({
    shortDescription: "",
    description: "",
    priority: "normal",
    tags: [],
  });

  useEffect(() => {
    const dataParam = searchParams.get("data");
    const step1Param = searchParams.get("step1");

    if (dataParam) {
      try {
        const parsedData = JSON.parse(
          decodeURIComponent(dataParam),
        ) as Step1Data;
        setStep1Data(parsedData);
      } catch (error) {
        console.error("Fehler beim Parsen der Daten:", error);
        router.push("/fahndungen/neu");
      }
    } else if (step1Param) {
      try {
        const parsedData = JSON.parse(
          decodeURIComponent(step1Param),
        ) as Step1Data;
        setStep1Data(parsedData);
      } catch (error) {
        console.error("Fehler beim Parsen der Daten:", error);
        router.push("/fahndungen/neu");
      }
    } else {
      router.push("/fahndungen/neu");
    }
  }, [searchParams, router]);

  const handleUpdate = (data: Step2Data) => {
    setStep2Data(data);
    console.log("Schritt 2 Daten aktualisiert:", data);
  };

  const handleNext = () => {
    // Weiter zu Schritt 3 mit beiden Datensätzen
    const step1Param = encodeURIComponent(JSON.stringify(step1Data));
    const step2Param = encodeURIComponent(JSON.stringify(step2Data));

    router.push(
      `/fahndungen/neu/step3?step1=${step1Param}&step2=${step2Param}`,
    );
  };

  const handleBack = () => {
    if (step1Data) {
      // Zurück zu Schritt 1 mit Daten
      const step1Param = encodeURIComponent(JSON.stringify(step1Data));
      router.push(`/fahndungen/neu?step1=${step1Param}`);
    } else {
      router.push("/fahndungen/neu");
    }
  };

  if (!step1Data) {
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
                href="/fahndungen/neu"
                className="mr-4 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Schritt 2: Erweiterte Informationen
              </h1>
            </div>

            <div className="p-6">
              {/* Schritt 1 Zusammenfassung */}
              <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <h3 className="mb-2 text-sm font-medium text-blue-800 dark:text-blue-200">
                  Schritt 1 - Zusammenfassung:
                </h3>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p>
                    <strong>Titel:</strong> {step1Data.title}
                  </p>
                  <p>
                    <strong>Kategorie:</strong> {step1Data.category}
                  </p>
                  <p>
                    <strong>Aktenzeichen:</strong> {step1Data.caseNumber}
                  </p>
                </div>
              </div>

              {/* Schritt 2 Komponente */}
              <Step2ExtendedInfo
                data={step2Data}
                onUpdate={handleUpdate}
                onNext={handleNext}
                onBack={handleBack}
              />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default function Step2Page() {
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
      <Step2PageContent />
    </Suspense>
  );
}
