"use client";

import React from "react";
import FahndungWizardContainer from "~/components/fahndungen/FahndungWizardContainer";

export default function EnhancedNeueFahndungPage() {
  return (
    <FahndungWizardContainer
      mode="create"
      title="Neue Fahndung erstellen"
      description="Erstellen Sie eine neue Fahndung mit unserem erweiterten Wizard"
    />
  );
}
