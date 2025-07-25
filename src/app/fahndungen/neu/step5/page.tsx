"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import PageLayout from "~/components/layout/PageLayout";
import Step5ContactPublication from "~/app/components/fahndungs-wizard/Step5-ContactPublication";
import type {
  Step1Data,
  Step2Data,
  Step3Data,
  Step4Data,
  Step5Data,
} from "@/types/fahndung-wizard";

function Step5PageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [previousData, setPreviousData] = useState<{
    step1: Step1Data | null;
    step2: Step2Data | null;
    step3: Step3Data | null;
    step4: Step4Data | null;
  }>({
    step1: null,
    step2: null,
    step3: null,
    step4: null,
  });

  const [step5Data, setStep5Data] = useState<Step5Data>({
    // Kontaktdaten
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
    department: "",
    availableHours: "Mo-Fr 8:00-16:00 Uhr",
    alternativeContact: undefined,

    // Veröffentlichung
    publishStatus: "draft",
    publishDate: undefined,
    publishTime: undefined,
    expiryDate: undefined,

    // Sichtbarkeit
    visibility: {
      internal: true,
      regional: false,
      national: false,
      international: false,
    },

    // Benachrichtigungen
    notifications: {
      emailAlerts: true,
      smsAlerts: false,
      appNotifications: true,
      pressRelease: false,
    },

    // Zusätzliche Optionen
    urgencyLevel: "medium",
    requiresApproval: false,
    approvalNotes: undefined,

    // Artikel-Publishing (NEU)
    articlePublishing: {
      publishAsArticle: false,
      generateSeoUrl: true,
      customSlug: undefined,
      seoTitle: undefined,
      seoDescription: undefined,
      keywords: [],
      author: undefined,
      readingTime: undefined,
    },
  });

  useEffect(() => {
    const step1Param = searchParams.get("step1");
    const step2Param = searchParams.get("step2");
    const step3Param = searchParams.get("step3");
    const step4Param = searchParams.get("step4");

    if (step1Param && step2Param && step3Param && step4Param) {
      try {
        setPreviousData({
          step1: JSON.parse(decodeURIComponent(step1Param)) as Step1Data,
          step2: JSON.parse(decodeURIComponent(step2Param)) as Step2Data,
          step3: JSON.parse(decodeURIComponent(step3Param)) as Step3Data,
          step4: JSON.parse(decodeURIComponent(step4Param)) as Step4Data,
        });
      } catch (error) {
        console.error("Fehler beim Parsen der Daten:", error);
        router.push("/fahndungen/neu");
      }
    } else {
      router.push("/fahndungen/neu");
    }
  }, [searchParams, router]);

  const handleUpdate = (data: Step5Data) => {
    setStep5Data(data);
    console.log("Schritt 5 Daten aktualisiert:", data);
  };

  const handleNext = () => {
    // Weiter zu Schritt 6 (Zusammenfassung)
    const params = new URLSearchParams({
      step1: searchParams.get("step1")!,
      step2: searchParams.get("step2")!,
      step3: searchParams.get("step3")!,
      step4: searchParams.get("step4")!,
      step5: encodeURIComponent(JSON.stringify(step5Data)),
    });

    router.push(`/fahndungen/neu/step6?${params.toString()}`);
  };

  const handleBack = () => {
    // Zurück zu Schritt 4
    router.push(`/fahndungen/neu/step4?${searchParams.toString()}`);
  };

  if (!previousData.step1) {
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
        <div className="mx-auto max-w-5xl">
          <div className="rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <Link
                href="/fahndungen/neu/step4"
                className="mr-4 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Schritt 5: Kontakt & Veröffentlichung
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Legen Sie Kontaktdaten und Veröffentlichungsoptionen fest
                </p>
              </div>
            </div>

            <div className="p-6">
              {/* Fortschrittsanzeige */}
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fortschritt: 5 von 6 Schritten
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    83% abgeschlossen
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: "83%" }}
                  ></div>
                </div>
              </div>

              {/* Info-Box mit Zusammenfassung */}
              <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex items-start">
                  <AlertCircle className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div className="text-sm">
                    <p className="mb-1 font-medium text-blue-800 dark:text-blue-200">
                      Wichtige Hinweise zur Veröffentlichung:
                    </p>
                    <ul className="list-inside list-disc space-y-1 text-blue-700 dark:text-blue-300">
                      <li>Die Kontaktdaten werden öffentlich sichtbar sein</li>
                      <li>
                        Bei hoher Dringlichkeit werden automatisch alle
                        verfügbaren Kanäle aktiviert
                      </li>
                      <li>
                        Geplante Veröffentlichungen können nachträglich geändert
                        werden
                      </li>
                      <li>
                        Internationale Fahndungen erfordern zusätzliche
                        Freigaben
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Schritt 5 Komponente */}
              <Step5ContactPublication
                data={step5Data}
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

export default function Step5Page() {
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
      <Step5PageContent />
    </Suspense>
  );
}
