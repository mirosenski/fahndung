"use client";

import React from "react";
import {
  Phone,
  Mail,
  User,
  Shield,
  Clock,
  AlertCircle,
  Save,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

import type { UIInvestigationData } from "~/lib/types/investigation.types";

interface ContactCategoryProps {
  data: UIInvestigationData;
  isEditMode: boolean;
  updateField: (
    step: keyof UIInvestigationData,
    field: string,
    value: unknown,
  ) => void;
  onPrevious: () => void;
  onSave: () => void;
}

export default function ContactCategory({
  data,
  isEditMode,
  updateField,
  onPrevious,
  onSave,
}: ContactCategoryProps) {
  // Sicherheitsmaßnahme: Stelle sicher, dass step5 existiert
  const step5 = data.step5 ?? {
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
    department: "",
    availableHours: "",
  };

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Kontaktinformationen
        </h3>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Kontaktperson *
            </Label>
            {isEditMode ? (
              <Input
                value={step5.contactPerson}
                onChange={(e) =>
                  updateField("step5", "contactPerson", e.target.value)
                }
                className="mt-1"
                placeholder="Name der Kontaktperson..."
              />
            ) : (
              <p className="mt-1 text-gray-700 dark:text-gray-300">
                {step5.contactPerson || "Nicht angegeben"}
              </p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Telefonnummer *
            </Label>
            {isEditMode ? (
              <Input
                value={step5.contactPhone}
                onChange={(e) =>
                  updateField("step5", "contactPhone", e.target.value)
                }
                className="mt-1"
                placeholder="Telefonnummer..."
                type="tel"
              />
            ) : (
              <p className="mt-1 text-gray-700 dark:text-gray-300">
                {step5.contactPhone || "Nicht angegeben"}
              </p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              E-Mail (optional)
            </Label>
            {isEditMode ? (
              <Input
                value={step5.contactEmail ?? ""}
                onChange={(e) => {
                  const email = e.target.value.trim();
                  // Leere E-Mail oder gültige E-Mail-Adresse
                  updateField("step5", "contactEmail", email);
                }}
                className="mt-1"
                placeholder="E-Mail-Adresse (optional)..."
                type="email"
              />
            ) : (
              <p className="mt-1 text-gray-700 dark:text-gray-300">
                {step5.contactEmail || "Nicht angegeben"}
              </p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Abteilung *
            </Label>
            {isEditMode ? (
              <Input
                value={step5.department}
                onChange={(e) =>
                  updateField("step5", "department", e.target.value)
                }
                className="mt-1"
                placeholder="Zuständige Abteilung..."
              />
            ) : (
              <p className="mt-1 text-gray-700 dark:text-gray-300">
                {step5.department || "Nicht angegeben"}
              </p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Erreichbarkeit
            </Label>
            {isEditMode ? (
              <Textarea
                value={step5.availableHours}
                onChange={(e) =>
                  updateField("step5", "availableHours", e.target.value)
                }
                className="mt-1"
                placeholder="Erreichbarkeitszeiten, z.B. Mo-Fr 8-16 Uhr..."
                rows={3}
              />
            ) : (
              <p className="mt-1 text-gray-700 dark:text-gray-300">
                {step5.availableHours || "Nicht angegeben"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Details Display */}
      {!isEditMode && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Kontaktdetails
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {step5.contactPerson || "Nicht angegeben"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {step5.contactPhone || "Nicht angegeben"}
              </span>
            </div>
            {step5.contactEmail && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  {step5.contactEmail}
                </span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {step5.department || "Nicht angegeben"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {step5.availableHours || "Nicht angegeben"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Additional Contact Information */}
      {isEditMode && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Zusätzliche Informationen
          </h3>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Notfall-Kontakt
              </Label>
              <Input
                value={""}
                onChange={(e) =>
                  updateField("step5", "contactPhone", e.target.value)
                }
                className="mt-1"
                placeholder="Notfall-Kontaktnummer..."
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Zusätzliche Hinweise
              </Label>
              <Textarea
                value={""}
                onChange={(e) =>
                  updateField("step5", "availableHours", e.target.value)
                }
                className="mt-1"
                placeholder="Zusätzliche Hinweise zur Kontaktaufnahme..."
                rows={3}
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      {isEditMode && (
        <div className="flex justify-between">
          <Button onClick={onPrevious} variant="outline">
            Zurück zu Orten
          </Button>
          <Button
            onClick={onSave}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4" />
            Fahndung speichern
          </Button>
        </div>
      )}

      {/* Validation Warnings */}
      {(!step5.contactPerson || !step5.contactPhone || !step5.department) && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">
              Unvollständige Kontaktdaten
            </span>
          </div>
          <p className="mt-1 text-sm text-yellow-700">
            Kontaktperson, Telefonnummer und Abteilung sind erforderlich.
          </p>
        </div>
      )}

      {/* Success Message */}
      {!isEditMode && step5.contactPerson && step5.contactPhone && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600">
              <div className="h-2 w-2 rounded-full bg-white"></div>
            </div>
            <span className="font-medium text-green-800">
              Kontaktdaten vollständig
            </span>
          </div>
          <p className="mt-1 text-sm text-green-700">
            Alle erforderlichen Kontaktinformationen sind vorhanden.
          </p>
        </div>
      )}
    </div>
  );
}
