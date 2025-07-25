"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PageLayout from "~/components/layout/PageLayout";
import Step3ImagesDocuments from "~/app/components/fahndungs-wizard/Step3-ImagesDocuments";
import Step3ImagesDocumentsEnhanced from "~/app/components/fahndungs-wizard/Step3-ImagesDocumentsEnhanced";
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
    imagePreviews: [],
  });
  const [useEnhancedVersion, setUseEnhancedVersion] = useState(true);

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
    // Ensure imagePreviews is always present
    const updatedData = {
      ...data,
      imagePreviews: data.imagePreviews || [],
    };
    setStep3Data(updatedData);
    console.log("Schritt 3 Daten aktualisiert:", updatedData);
  };

  const handleNext = () => {
    if (!step1Data) {
      console.error("Step1 Daten fehlen");
      return;
    }

    // Validate that we have at least one image
    if (!step3Data.mainImage && step3Data.additionalImages.length === 0) {
      alert("Bitte laden Sie mindestens ein Bild hoch.");
      return;
    }

    // Prepare data for next step
    const step3Param = encodeURIComponent(JSON.stringify(step3Data));
    const step1Param = encodeURIComponent(JSON.stringify(step1Data));
    const step2Param = encodeURIComponent(JSON.stringify(step2Data));

    // Navigate to step 4 with all data
    router.push(
      `/fahndungen/neu/step4?step1=${step1Param}&step2=${step2Param}&step3=${step3Param}`,
    );
  };

  const handleBack = () => {
    if (!step1Data) {
      router.push("/fahndungen/neu");
      return;
    }

    // Navigate back to step 2 with step1 data
    const step1Param = encodeURIComponent(JSON.stringify(step1Data));
    router.push(`/fahndungen/neu/step2?step1=${step1Param}`);
  };

  if (!step1Data || !step2Data) {
    return (
      <PageLayout variant="dashboard">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="text-center">
                <div className="mb-4 text-6xl">⏳</div>
                <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                  Lade Daten...
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Bitte warten Sie, während die vorherigen Schritte geladen
                  werden.
                </p>
              </div>
            </div>
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

              {/* Version Toggle */}
              <div className="mb-6 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Komponenten-Version
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Wählen Sie zwischen der erweiterten Version mit
                      Media-Galerie und der klassischen Version
                    </p>
                  </div>
                  <label className="flex cursor-pointer items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={useEnhancedVersion}
                      onChange={(e) => setUseEnhancedVersion(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">
                      Erweiterte Version verwenden
                    </span>
                  </label>
                </div>
              </div>

              {/* Schritt 3 Komponente */}
              <Suspense
                fallback={
                  <div className="flex items-center justify-center p-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  </div>
                }
              >
                {useEnhancedVersion ? (
                  <Step3ImagesDocumentsEnhanced
                    data={step3Data}
                    onUpdate={handleUpdate}
                    onNext={handleNext}
                    onBack={handleBack}
                    caseNumber={step1Data.caseNumber}
                  />
                ) : (
                  <Step3ImagesDocuments
                    data={step3Data}
                    onUpdate={handleUpdate}
                    onNext={handleNext}
                    onBack={handleBack}
                    caseNumber={step1Data.caseNumber}
                  />
                )}
              </Suspense>
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
        <div className="flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <Step3PageContent />
    </Suspense>
  );
}
