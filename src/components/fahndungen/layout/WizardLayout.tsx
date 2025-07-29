"use client";

import React from "react";
import { useResponsive } from "~/hooks/useResponsive";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface WizardLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  canProceed: boolean;
  isMobile?: boolean;
}

const WizardLayout: React.FC<WizardLayoutProps> = ({
  children,
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  canProceed,
  isMobile = false,
}) => {
  const { isMobile: responsiveIsMobile } = useResponsive();
  const isMobileView = isMobile || responsiveIsMobile;

  const BottomNavigation = () => (
    <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between p-4">
        <button
          onClick={onPrevious}
          disabled={currentStep === 1}
          className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-4 py-2 ${
            currentStep === 1
              ? "cursor-not-allowed bg-gray-100 text-gray-400"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          <ArrowLeft className="h-5 w-5" />
          {!isMobileView && <span className="ml-2">Zurück</span>}
        </button>

        <div className="mx-4 flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <p className="mt-1 text-center text-xs text-gray-600 dark:text-gray-400">
            Schritt {currentStep} von {totalSteps}
          </p>
        </div>

        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-4 py-2 ${
            canProceed
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "cursor-not-allowed bg-gray-300 text-gray-500"
          }`}
        >
          {!isMobileView && <span className="mr-2">Weiter</span>}
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  const DesktopLayout = () => (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
      <div className="xl:col-span-2">
        <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
          {children}
        </div>
      </div>
    </div>
  );

  const MobileLayout = () => (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 p-4 pb-32">
        <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
          {children}
        </div>
      </div>
      <BottomNavigation />
    </div>
  );

  return isMobileView ? <MobileLayout /> : <DesktopLayout />;
};

export default WizardLayout;
