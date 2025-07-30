"use client";

import React from "react";
import FahndungWizardContainer from "~/components/fahndungen/FahndungWizardContainer";
import ProtectedRoute from "~/components/ProtectedRoute";

export default function EnhancedNeueFahndungPage() {
  return (
    <ProtectedRoute requiredRoles={["admin", "super_admin"]}>
      <FahndungWizardContainer
        mode="create"
        title="Neue Fahndung erstellen"
        description="Erstellen Sie eine neue Fahndung mit unserem erweiterten Wizard"
      />
    </ProtectedRoute>
  );
}
