"use client";

import React from "react";
import FahndungWizardContainer from "./FahndungWizardContainer";
import type { WizardData } from "./types/WizardTypes";

// Vereinfachte Wizard-Komponente für die Erstellung
const EnhancedFahndungWizard = ({
  initialData,
  mode = "create",
}: {
  initialData?: Partial<WizardData>;
  mode?: "create" | "edit";
}) => {
  return (
    <FahndungWizardContainer
      initialData={initialData}
      mode={mode}
      title={
        mode === "create" ? "Neue Fahndung erstellen" : "Fahndung bearbeiten"
      }
      description={
        mode === "create"
          ? "Erstellen Sie eine neue Fahndung mit unserem erweiterten Wizard"
          : "Bearbeiten Sie die bestehende Fahndung"
      }
    />
  );
};

export default EnhancedFahndungWizard;
