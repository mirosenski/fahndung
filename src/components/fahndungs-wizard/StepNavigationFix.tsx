import { useRouter, useSearchParams } from "next/navigation";

interface NavigationProps {
  currentStep: number;
  data: any;
  onNext?: () => void;
  onBack?: () => void;
}

export function useStepNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const saveToSearchParams = (stepKey: string, data: any) => {
    // Erstelle neue URLSearchParams basierend auf den aktuellen
    const newParams = new URLSearchParams(searchParams.toString());

    // Serialisiere die Daten, aber entferne File-Objekte
    const serializedData = JSON.parse(
      JSON.stringify(data, (key, value) => {
        // File-Objekte können nicht serialisiert werden
        if (value instanceof File) {
          return null;
        }
        return value;
      }),
    );

    // Speichere in URL params
    newParams.set(stepKey, encodeURIComponent(JSON.stringify(serializedData)));

    return newParams.toString();
  };

  const loadFromSearchParams = (stepKey: string) => {
    const param = searchParams.get(stepKey);
    if (!param) return null;

    try {
      return JSON.parse(decodeURIComponent(param));
    } catch (error) {
      console.error(`Error parsing ${stepKey}:`, error);
      return null;
    }
  };

  const navigateToStep = (
    stepNumber: number,
    currentData?: any,
    currentStepKey?: string,
  ) => {
    let url = `/fahndungen/neu/step${stepNumber}`;

    // Wenn Daten vorhanden sind, speichere sie
    if (currentData && currentStepKey) {
      const params = saveToSearchParams(currentStepKey, currentData);

      // Füge alle anderen Steps hinzu
      for (let i = 1; i <= 5; i++) {
        const stepKey = `step${i}`;
        if (stepKey !== currentStepKey) {
          const stepData = loadFromSearchParams(stepKey);
          if (stepData) {
            const newParams = new URLSearchParams(params);
            newParams.set(
              stepKey,
              encodeURIComponent(JSON.stringify(stepData)),
            );
            url = `${url}?${newParams.toString()}`;
            router.push(url);
            return;
          }
        }
      }

      url = `${url}?${params}`;
    } else {
      // Behalte alle bestehenden Parameter
      const params = searchParams.toString();
      if (params) {
        url = `${url}?${params}`;
      }
    }

    router.push(url);
  };

  return {
    saveToSearchParams,
    loadFromSearchParams,
    navigateToStep,
  };
}

// Beispiel-Verwendung in einer Step-Komponente:
export function StepNavigationButtons({
  currentStep,
  data,
  onValidate,
}: {
  currentStep: number;
  data: any;
  onValidate: () => boolean;
}) {
  const { navigateToStep } = useStepNavigation();

  const handleNext = () => {
    if (onValidate && !onValidate()) {
      return;
    }

    // Speichere aktuelle Daten und navigiere zum nächsten Step
    navigateToStep(currentStep + 1, data, `step${currentStep}`);
  };

  const handleBack = () => {
    // Speichere aktuelle Daten und navigiere zum vorherigen Step
    navigateToStep(currentStep - 1, data, `step${currentStep}`);
  };

  return (
    <div className="mt-8 flex justify-between">
      {currentStep > 1 && (
        <button
          type="button"
          onClick={handleBack}
          className="rounded-lg bg-gray-200 px-6 py-2 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          Zurück
        </button>
      )}

      <button
        type="button"
        onClick={handleNext}
        className="ml-auto rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
      >
        {currentStep === 5 ? "Zur Zusammenfassung" : "Weiter"}
      </button>
    </div>
  );
}
