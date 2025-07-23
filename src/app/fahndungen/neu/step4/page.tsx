"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import PageLayout from "~/components/layout/PageLayout";
import Step4LocationMap from "~/app/components/fahndungs-wizard/Step4-LocationMap";
import type {
  Step1Data,
  Step2Data,
  Step3Data,
  Step4Data,
} from "@/types/fahndung-wizard";

function Step4PageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [previousData, setPreviousData] = useState<{
    step1: Step1Data | null;
    step2: Step2Data | null;
    step3: Step3Data | null;
  }>({
    step1: null,
    step2: null,
    step3: null,
  });

  const [step4Data, setStep4Data] = useState<Step4Data>({
    mainLocation: null,
    additionalLocations: [],
    searchRadius: 5,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const step1Param = searchParams.get("step1");
        const step2Param = searchParams.get("step2");
        const step3Param = searchParams.get("step3");

        if (step1Param && step2Param && step3Param) {
          setPreviousData({
            step1: JSON.parse(decodeURIComponent(step1Param)) as Step1Data,
            step2: JSON.parse(decodeURIComponent(step2Param)) as Step2Data,
            step3: JSON.parse(decodeURIComponent(step3Param)) as Step3Data,
          });
        } else {
          router.push("/fahndungen/neu");
        }
      } catch (error) {
        console.error("Datenfehler:", error);
        router.push("/fahndungen/neu");
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, [searchParams, router]);

  const handleUpdate = (data: Step4Data) => {
    setStep4Data(data);
  };

  const handleNext = () => {
    const params = new URLSearchParams({
      step1: searchParams.get("step1")!,
      step2: searchParams.get("step2")!,
      step3: searchParams.get("step3")!,
      step4: encodeURIComponent(JSON.stringify(step4Data)),
    });

    router.push(`/fahndungen/neu/step5?${params.toString()}`);
  };

  const handleBack = () => {
    router.push(`/fahndungen/neu/step3?${searchParams.toString()}`);
  };

  if (isLoading) {
    return (
      <PageLayout variant="dashboard">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
            <p className="mt-2 text-gray-600">Daten werden geladen...</p>
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
                href="/fahndungen/neu/step3"
                className="mr-4 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Schritt 4: Geografische Analyse
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Markieren Sie relevante Orte und definieren Sie den Suchradius
                </p>
              </div>
            </div>

            <div className="p-6">
              {/* Progress Indicator */}
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fortschritt: 4/6 Schritte
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    67% abgeschlossen
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: "67%" }}
                  ></div>
                </div>
              </div>

              {/* Data Summary */}
              <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bisherige Informationen:
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <span className="font-medium">Titel:</span>{" "}
                    {previousData.step1?.title}
                  </div>
                  <div>
                    <span className="font-medium">Aktenzeichen:</span>{" "}
                    {previousData.step1?.caseNumber}
                  </div>
                  <div>
                    <span className="font-medium">Kategorie:</span>{" "}
                    {previousData.step1?.category}
                  </div>
                  <div>
                    <span className="font-medium">Priorität:</span>{" "}
                    {previousData.step2?.priority}
                  </div>
                </div>
              </div>

              {/* Main Component */}
              <Step4LocationMap
                data={step4Data}
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

export default function Step4Page() {
  return (
    <Suspense
      fallback={
        <PageLayout variant="dashboard">
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
              <p className="mt-2 text-gray-600">Lade Seite...</p>
            </div>
          </div>
        </PageLayout>
      }
    >
      <Step4PageContent />
    </Suspense>
  );
}
