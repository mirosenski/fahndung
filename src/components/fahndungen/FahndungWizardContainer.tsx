"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  FileText,
  BarChart3,
  CreditCard,
} from "lucide-react";
import { useResponsive } from "~/hooks/useResponsive";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { generateNewCaseNumber } from "~/lib/utils/caseNumberGenerator";

// Import separate Komponenten
import Step1Component from "./steps/Step1Component";
import Step2Component from "./steps/Step2Component";
import Step3Component from "./steps/Step3Component";
import Step4Component from "./steps/Step4Component";
import Step5Component from "./steps/Step5Component";
import Step6Summary from "./steps/Step6Summary";
import LivePreviewCard from "./preview/LivePreviewCard";
import StatsOverview from "./preview/StatsOverview";
import DetailPagePreview from "./preview/DetailPagePreview";

// Import Types
import type { WizardData, PreviewMode } from "./types/WizardTypes";

const PREVIEW_MODES: PreviewMode[] = [
  { id: "card", label: "Karte", icon: CreditCard },
  { id: "detail", label: "Detail", icon: Eye },
  { id: "stats", label: "Stats", icon: BarChart3 },
];

// Container-Komponente für Fahndung Wizard
const FahndungWizardContainer = ({
  initialData,
  mode = "create",
  onBack,
  backUrl,
  title,
  description,
}: {
  initialData?: Partial<WizardData>;
  mode?: "create" | "edit";
  onBack?: () => void;
  backUrl?: string;
  title?: string;
  description?: string;
}) => {
  const router = useRouter();
  const { isMobile, isDesktop } = useResponsive();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<"card" | "detail" | "stats">(
    "card",
  );
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const [wizardData, setWizardData] = useState<Partial<WizardData>>({
    step1: initialData?.step1 ?? {
      title: "",
      category: "MISSING_PERSON",
      caseNumber: "", // Zunächst leer lassen!
    },
    step2: initialData?.step2 ?? {
      shortDescription: "",
      description: "",
      priority: "normal",
      tags: [],
      features: "",
    },
    step3: initialData?.step3 ?? {
      mainImage: null,
      additionalImages: [],
      documents: [],
    },
    step4: initialData?.step4 ?? {
      mainLocation: null,
      additionalLocations: [],
      searchRadius: 5,
    },
    step5: initialData?.step5 ?? {
      contactPerson: "",
      contactPhone: "",
      contactEmail: "",
      department: "",
      availableHours: "Mo-Fr 8:00-16:00 Uhr",
      publishStatus: "draft",
      urgencyLevel: "medium",
      requiresApproval: false,
      visibility: {
        internal: true,
        regional: false,
        national: false,
        international: false,
      },
      notifications: {
        emailAlerts: true,
        smsAlerts: false,
        appNotifications: true,
        pressRelease: false,
      },
      articlePublishing: {
        publishAsArticle: false,
        generateSeoUrl: false,
        seoTitle: "",
        seoDescription: "",
        keywords: [],
      },
    },
  });

  // DEBUG: Render Counter
  const renderCount = useRef(0);
  renderCount.current += 1;
  console.log(`🔴 CONTAINER RENDER #${renderCount.current}`);

  // DEBUG: State Changes
  useEffect(() => {
    console.log("🟡 wizardData changed:", wizardData);
  }, [wizardData]);

  // Setze caseNumber nur auf dem Client, wenn noch nicht gesetzt
  React.useEffect(() => {
    if (!isInitialized) {
      // Verwende Timestamp für bessere Eindeutigkeit
      const uniqueCaseNumber = generateNewCaseNumber(
        "MISSING_PERSON", // Verwende festen Wert statt wizardData.step1?.category
        "draft",
      );
      setWizardData((prev) => ({
        ...prev,
        step1: {
          ...prev.step1!,
          caseNumber: prev.step1?.caseNumber ?? uniqueCaseNumber,
        },
      }));
      setIsInitialized(true);
    }
  }, [isInitialized]); // NUR isInitialized als Dependency!

  // tRPC Mutation für das Erstellen von Fahndungen
  const createInvestigation = api.post.createInvestigation.useMutation({
    onSuccess: (data) => {
      console.log("✅ Fahndung erfolgreich erstellt:", data);
      if (wizardData.step5?.publishStatus === "immediate") {
        router.push(`/fahndungen/${data.id}`);
      } else {
        router.push("/fahndungen");
      }
    },
    onError: (error) => {
      console.error("❌ Fehler beim Erstellen der Fahndung:", error);
    },
  });

  // tRPC Mutation für das Aktualisieren von Fahndungen
  // TODO: Implementiere updateInvestigation wenn Edit-Modus benötigt wird
  // const updateInvestigation = api.post.updateInvestigation.useMutation({
  //   onSuccess: (data) => {
  //     console.log("✅ Fahndung erfolgreich aktualisiert:", data);
  //     router.push(`/fahndungen/${data.id}`);
  //   },
  //   onError: (error) => {
  //     console.error("❌ Fehler beim Aktualisieren der Fahndung:", error);
  //   },
  // });

  const steps = [
    { id: 1, label: "Grundinfo", icon: FileText },
    { id: 2, label: "Beschreibung", icon: Eye },
    { id: 3, label: "Medien", icon: FileText },
    { id: 4, label: "Ort", icon: Eye },
    { id: 5, label: "Kontakt", icon: Eye },
    { id: 6, label: "Zusammenfassung", icon: Check },
  ];

  // Layout Components
  const DesktopLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">{children}</div>
  );

  const MobileLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="flex min-h-screen flex-col">{children}</div>
  );

  const PreviewTabs = () => (
    <div className="flex justify-around border-b border-gray-200 dark:border-gray-700">
      {PREVIEW_MODES.map((mode) => (
        <button
          key={mode.id}
          onClick={() => setPreviewMode(mode.id)}
          className={`flex flex-1 items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition-colors ${
            previewMode === mode.id
              ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          <mode.icon className="h-4 w-4" />
          <span className={isMobile ? "hidden" : ""}>{mode.label}</span>
        </button>
      ))}
    </div>
  );

  const BottomNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between p-4">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-4 py-2 ${
            currentStep === 1
              ? "cursor-not-allowed bg-gray-100 text-gray-400"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          <ArrowLeft className="h-5 w-5" />
          {!isMobile && <span className="ml-2">Zurück</span>}
        </button>

        <div className="mx-4 flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>
          <p className="mt-1 text-center text-xs text-gray-600 dark:text-gray-400">
            Schritt {currentStep} von 6
          </p>
        </div>

        <button
          onClick={handleNext}
          disabled={!canProceedToNextStep()}
          className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-4 py-2 ${
            canProceedToNextStep()
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "cursor-not-allowed bg-gray-300 text-gray-500"
          }`}
        >
          {!isMobile && <span className="mr-2">Weiter</span>}
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  const renderPreviewContent = () => {
    switch (previewMode) {
      case "card":
        return (
          <div className="space-y-4">
            <h3 className="text-center text-lg font-semibold text-gray-900 dark:text-white">
              Live-Vorschau Ihrer Fahndungskarte
            </h3>
            <LivePreviewCard data={wizardData} />
          </div>
        );

      case "detail":
        return (
          <div className="space-y-4 p-4">
            <h3 className="text-lg font-semibold">Detailseite Vorschau</h3>
            <DetailPagePreview data={wizardData} />
          </div>
        );

      case "stats":
        return (
          <div className="space-y-4 p-4">
            <h3 className="text-lg font-semibold">Validierung & Statistiken</h3>
            <StatsOverview data={wizardData} />
          </div>
        );

      default:
        return null;
    }
  };

  const updateStepData = useCallback(
    (step: keyof WizardData, data: WizardData[keyof WizardData]) => {
      console.log(`🔵 UPDATE CALLED: ${step}`, data);

      // WICHTIG: Prüfe ob sich wirklich was geändert hat
      setWizardData((prev) => {
        if (JSON.stringify(prev[step]) === JSON.stringify(data)) {
          console.log("⚪ NO CHANGE - skipping update");
          return prev; // Keine Änderung!
        }
        console.log("🟢 UPDATING STATE");
        return {
          ...prev,
          [step]: data,
        };
      });
    },
    [],
  );

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return wizardData.step1?.title && wizardData.step1?.category;
      case 2:
        return (
          wizardData.step2?.shortDescription && wizardData.step2?.description
        );
      case 3:
        return wizardData.step3?.mainImage;
      case 4:
        return wizardData.step4?.mainLocation;
      case 5:
        return (
          wizardData.step5?.contactPerson && wizardData.step5?.contactPhone
        );
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (canProceedToNextStep() && currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const finalStatus =
        wizardData.step5?.publishStatus === "immediate" ? "published" : "draft";

      if (mode === "edit") {
        // TODO: Implementiere updateInvestigation mit der korrekten ID
        // await updateInvestigation.mutateAsync({
        //   id: investigationId,
        //   title: wizardData.step1?.title ?? "",
        //   description: wizardData.step2?.description ?? "",
        //   status: finalStatus,
        //   priority: wizardData.step2?.priority ?? "normal",
        //   category: wizardData.step1?.category ?? "MISSING_PERSON",
        //   location: wizardData.step4?.mainLocation?.address ?? "",
        //   contact_info: {
        //     person: wizardData.step5?.contactPerson ?? "",
        //     phone: wizardData.step5?.contactPhone ?? "",
        //     email: wizardData.step5?.contactEmail ?? "",
        //   },
        //   tags: [
        //     wizardData.step1?.category ?? "",
        //     wizardData.step2?.priority ?? "",
        //     ...(wizardData.step2?.tags ?? []),
        //   ],
        //   mainImageUrl: wizardData.step3?.mainImageUrl ?? undefined,
        //   additionalImageUrls: wizardData.step3?.additionalImageUrls ?? undefined,
        // });
        console.log("📝 Edit mode - updateInvestigation not yet implemented");
      } else {
        await createInvestigation.mutateAsync({
          title: wizardData.step1?.title ?? "",
          description: wizardData.step2?.description ?? "",
          short_description: wizardData.step2?.shortDescription ?? "", // Kurze Beschreibung hinzugefügt
          status: finalStatus,
          priority: wizardData.step2?.priority ?? "normal",
          category: wizardData.step1?.category ?? "MISSING_PERSON",
          location: wizardData.step4?.mainLocation?.address ?? "",
          contact_info: {
            person: wizardData.step5?.contactPerson ?? "",
            phone: wizardData.step5?.contactPhone ?? "",
            email: wizardData.step5?.contactEmail ?? "",
          },
          tags: [
            wizardData.step1?.category ?? "",
            wizardData.step2?.priority ?? "",
            ...(wizardData.step2?.tags ?? []),
          ],
          // Bild-URLs hinzufügen
          mainImageUrl: wizardData.step3?.mainImageUrl ?? undefined,
          additionalImageUrls:
            wizardData.step3?.additionalImageUrls ?? undefined,
        });
      }
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Fehler beim Speichern der Fahndung");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          wizardData.step1 && (
            <Step1Component
              data={wizardData.step1}
              onChange={(data) => updateStepData("step1", data)}
            />
          )
        );
      case 2:
        return (
          wizardData.step2 && (
            <Step2Component
              data={wizardData.step2}
              onChange={(data) => updateStepData("step2", data)}
            />
          )
        );
      case 3:
        return (
          wizardData.step3 && (
            <Step3Component
              data={wizardData.step3}
              onChange={(data) => updateStepData("step3", data)}
            />
          )
        );
      case 4:
        return (
          wizardData.step4 && (
            <Step4Component
              data={wizardData.step4}
              onChange={(data) => updateStepData("step4", data)}
            />
          )
        );
      case 5:
        return (
          wizardData.step5 && (
            <Step5Component
              data={wizardData.step5}
              onChange={(data) => updateStepData("step5", data)}
            />
          )
        );
      case 6:
        return (
          <Step6Summary
            data={wizardData}
            showPreview={showPreview}
            onTogglePreview={() => setShowPreview(!showPreview)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            mode={mode}
          />
        );
      default:
        return null;
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      router.push(backUrl);
    } else {
      router.push("/fahndungen");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Zurück zur Übersicht</span>
            </button>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {title ??
              (mode === "create"
                ? "Neue Fahndung erstellen"
                : "Fahndung bearbeiten")}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {description ??
              (mode === "create"
                ? "Erstellen Sie eine neue Fahndung mit unserem erweiterten Wizard"
                : "Bearbeiten Sie die bestehende Fahndung")}
          </p>
        </div>

        {/* Progress Indicator - nur auf Desktop */}
        {!isMobile && (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Fortschritt: {currentStep} von {steps.length} Schritten
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round((currentStep / steps.length) * 100)}% abgeschlossen
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      currentStep >= step.id
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-800"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      currentStep >= step.id
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-4 h-1 w-16 ${
                        currentStep > step.id
                          ? "bg-blue-500"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Desktop Layout */}
        {isDesktop && (
          <DesktopLayout>
            {/* Main Content */}
            <div className="xl:col-span-2">
              <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
                {renderCurrentStep()}

                {/* Desktop Navigation */}
                {currentStep < 6 && (
                  <div className="mt-8 flex justify-between border-t border-gray-200 pt-6 dark:border-gray-700">
                    <button
                      onClick={handlePrevious}
                      disabled={currentStep === 1}
                      className={`flex items-center gap-2 rounded-lg px-4 py-2 ${
                        currentStep === 1
                          ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Zurück
                    </button>

                    <button
                      onClick={handleNext}
                      disabled={!canProceedToNextStep()}
                      className={`flex items-center gap-2 rounded-lg px-6 py-2 ${
                        canProceedToNextStep()
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-600"
                      }`}
                    >
                      Weiter
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Sidebar */}
            <div className="xl:col-span-1">
              <div className="sticky top-8">
                <div className="rounded-lg bg-white shadow-lg dark:bg-gray-800">
                  <PreviewTabs />
                  <div className="p-6">{renderPreviewContent()}</div>
                </div>
              </div>
            </div>
          </DesktopLayout>
        )}

        {/* Mobile/Tablet Layout */}
        {!isDesktop && (
          <MobileLayout>
            {/* Sticky Header für Mobile */}
            <div className="sticky top-0 z-40 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between p-4">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Zurück</span>
                </button>
                <h2 className="text-lg font-semibold">
                  Schritt {currentStep} von 6
                </h2>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 pb-32">
              <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
                {renderCurrentStep()}
              </div>

              {/* Mobile Preview Toggle */}
              <button
                onClick={() => setShowMobilePreview(!showMobilePreview)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 py-3 dark:bg-gray-700"
              >
                <Eye className="h-4 w-4" />
                <span>
                  Vorschau {showMobilePreview ? "ausblenden" : "anzeigen"}
                </span>
              </button>

              {/* Mobile Preview */}
              {showMobilePreview && (
                <div className="mt-4 rounded-lg bg-white shadow-lg dark:bg-gray-800">
                  <PreviewTabs />
                  <div className="p-4">{renderPreviewContent()}</div>
                </div>
              )}
            </div>

            {/* Bottom Navigation */}
            <BottomNavigation />
          </MobileLayout>
        )}
      </div>
    </div>
  );
};

export default FahndungWizardContainer;
