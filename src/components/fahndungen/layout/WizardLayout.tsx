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
  const isMobileView = isMobile ?? responsiveIsMobile;

  const BottomNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white dark:border-border dark:bg-muted">
      <div className="flex items-center justify-between p-4">
        <button
          onClick={onPrevious}
          disabled={currentStep === 1}
          className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-4 py-2 ${
            currentStep === 1
              ? "cursor-not-allowed bg-muted text-muted-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted dark:bg-muted dark:text-muted-foreground"
          }`}
        >
          <ArrowLeft className="h-5 w-5" />
          {!isMobileView && <span className="ml-2">Zurück</span>}
        </button>

        <div className="mx-4 flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-muted dark:bg-muted">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <p className="mt-1 text-center text-xs text-muted-foreground dark:text-muted-foreground">
            Schritt {currentStep} von {totalSteps}
          </p>
        </div>

        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-4 py-2 ${
            canProceed
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "cursor-not-allowed bg-muted text-muted-foreground"
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
        <div className="rounded-lg bg-white p-8 shadow-sm dark:bg-muted">
          {children}
        </div>
      </div>
    </div>
  );

  const MobileLayout = () => (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 p-4 pb-32">
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-muted">
          {children}
        </div>
      </div>
      <BottomNavigation />
    </div>
  );

  return isMobileView ? <MobileLayout /> : <DesktopLayout />;
};

export default WizardLayout;
