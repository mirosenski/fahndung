"use client";

import React from "react";
import ProtectedRoute from "~/components/ProtectedRoute";
import EnhancedFahndungWizard from "~/components/fahndungen/EnhancedFahndungWizard";

export default function EnhancedNeueFahndungPage() {
  return (
    <ProtectedRoute requiredRoles={["editor", "admin", "super_admin"]}>
      <EnhancedFahndungWizard mode="create" />
    </ProtectedRoute>
  );
}
