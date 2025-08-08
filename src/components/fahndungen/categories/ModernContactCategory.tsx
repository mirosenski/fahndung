"use client";

import React, { useState } from "react";
// Icons aus lucide-react importieren
import {
  Phone as PhoneIcon,
  Mail as MailIcon,
  User as UserIcon,
  Shield as ShieldIcon,
  Clock as ClockIcon,
  AlertCircle as AlertCircleIcon,
  Save as SaveIcon,
  ChevronLeft as ChevronLeftIcon,
  MapPin as MapPinIcon,
  MessageCircle as MessageCircleIcon,
  Bell as BellIcon,
  Globe as GlobeIcon,
  CheckCircle2 as CheckCircle2Icon,
  Sparkles as SparklesIcon,
  Building2 as Building2Icon,
  UserCheck as UserCheckIcon,
  PhoneCall as PhoneCallIcon,
  MailCheck as MailCheckIcon,
  CalendarClock as CalendarClockIcon,
  Info as InfoIcon,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

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

/**
 * ModernContactCategory
 *
 * Eine moderne Kontaktkategorie mit Validierungsstatus, Fortschrittsbalken und
 * optionalen Kontaktoptionen. Icons werden individuell importiert, um die
 * Performance zu optimieren. Das Layout ist responsiv und passt sich von
 * Single‑Column (Mobil) bis zu zwei Spalten auf Desktop an.
 */
export default function ModernContactCategory({
  data,
  isEditMode,
  updateField,
  onPrevious,
  onSave,
}: ContactCategoryProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string>("");
  // Sicherheitsmaßnahme: Step5 initialisieren
  const step5 = data.step5 ?? {
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
    department: "",
    availableHours: "",
  };
  // Completion Status
  const isComplete = Boolean(
    step5.contactPerson && step5.contactPhone && step5.department,
  );

  // E‑Mail Validierung
  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError("");
      return true;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      setEmailError("Bitte geben Sie eine gültige E‑Mail‑Adresse ein");
      return false;
    }
    setEmailError("");
    return true;
  };
  return (
    <div className="w-full space-y-4 px-4 pb-20 sm:space-y-6 sm:px-6 lg:px-8">
      {/* Kategorie Header - ohne Hero-Bild */}
      <div className="rounded-3xl bg-gradient-to-r from-green-50 to-emerald-50 p-6 dark:from-green-950 dark:to-emerald-950">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              Kontaktinformationen
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Wie kann die Öffentlichkeit helfen?
            </p>
          </div>
          <div className="flex gap-2">
            <span className="flex items-center gap-1 rounded-full bg-red-500/80 px-3 py-1 text-xs font-medium text-white">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />{" "}
              LIVE
            </span>
            <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-gray-700 backdrop-blur dark:text-gray-300">
              📞 Kontakt
            </span>
          </div>
        </div>
      </div>
      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="space-y-4 sm:space-y-6 lg:col-span-2">
          {/* Primary Contact Card */}
          <Card className="border-0 bg-white shadow-sm dark:bg-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserCheckIcon className="h-5 w-5 text-blue-600" /> Hauptkontakt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Contact Person */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <UserIcon className="h-4 w-4 text-gray-500" /> Kontaktperson
                  <Badge
                    variant="destructive"
                    className="ml-1 h-5 px-1.5 text-xs"
                  >
                    Pflicht
                  </Badge>
                </Label>
                {isEditMode ? (
                  <div className="relative">
                    <Input
                      value={step5.contactPerson}
                      onChange={(e) =>
                        updateField("step5", "contactPerson", e.target.value)
                      }
                      onFocus={() => setFocusedField("contactPerson")}
                      onBlur={() => setFocusedField(null)}
                      className={`h-12 transition-all ${focusedField === "contactPerson" ? "ring-2 ring-blue-500" : ""}`}
                      placeholder="z. B. Kommissar Schmidt"
                    />
                    {step5.contactPerson && (
                      <CheckCircle2Icon className="absolute right-3 top-3.5 h-5 w-5 text-green-500" />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                    <UserIcon className="h-5 w-5 text-gray-500" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {step5.contactPerson || "Nicht angegeben"}
                    </span>
                  </div>
                )}
              </div>
              {/* Phone */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <PhoneCallIcon className="h-4 w-4 text-gray-500" />{" "}
                  Telefonnummer
                  <Badge
                    variant="destructive"
                    className="ml-1 h-5 px-1.5 text-xs"
                  >
                    Pflicht
                  </Badge>
                </Label>
                {isEditMode ? (
                  <div className="relative">
                    <Input
                      value={step5.contactPhone}
                      onChange={(e) =>
                        updateField("step5", "contactPhone", e.target.value)
                      }
                      onFocus={() => setFocusedField("contactPhone")}
                      onBlur={() => setFocusedField(null)}
                      className={`h-12 transition-all ${focusedField === "contactPhone" ? "ring-2 ring-blue-500" : ""}`}
                      placeholder="+49 711 8990-0"
                      type="tel"
                    />
                    {step5.contactPhone && (
                      <CheckCircle2Icon className="absolute right-3 top-3.5 h-5 w-5 text-green-500" />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                    <PhoneIcon className="h-5 w-5 text-gray-500" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {step5.contactPhone || "Nicht angegeben"}
                    </span>
                  </div>
                )}
              </div>
              {/* Email */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <MailCheckIcon className="h-4 w-4 text-gray-500" /> E‑Mail
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 px-1.5 text-xs"
                  >
                    Optional
                  </Badge>
                </Label>
                {isEditMode ? (
                  <div className="relative">
                    <Input
                      value={step5.contactEmail ?? ""}
                      onChange={(e) => {
                        const email = e.target.value.trim();
                        updateField("step5", "contactEmail", email);
                        validateEmail(email);
                      }}
                      onFocus={() => setFocusedField("contactEmail")}
                      onBlur={() => setFocusedField(null)}
                      className={`h-12 transition-all ${focusedField === "contactEmail" ? "ring-2 ring-blue-500" : ""} ${emailError ? "border-red-500" : ""}`}
                      placeholder="kontakt@polizei-bw.de"
                      type="email"
                    />
                    {step5.contactEmail && !emailError && (
                      <CheckCircle2Icon className="absolute right-3 top-3.5 h-5 w-5 text-green-500" />
                    )}
                    {emailError && (
                      <p className="mt-1 text-xs text-red-500">{emailError}</p>
                    )}
                  </div>
                ) : (
                  step5.contactEmail && (
                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                      <MailIcon className="h-5 w-5 text-gray-500" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {step5.contactEmail}
                      </span>
                    </div>
                  )
                )}
              </div>
              {/* Department */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Building2Icon className="h-4 w-4 text-gray-500" /> Abteilung
                  <Badge
                    variant="destructive"
                    className="ml-1 h-5 px-1.5 text-xs"
                  >
                    Pflicht
                  </Badge>
                </Label>
                {isEditMode ? (
                  <div className="relative">
                    <Input
                      value={step5.department}
                      onChange={(e) =>
                        updateField("step5", "department", e.target.value)
                      }
                      onFocus={() => setFocusedField("department")}
                      onBlur={() => setFocusedField(null)}
                      className={`h-12 transition-all ${focusedField === "department" ? "ring-2 ring-blue-500" : ""}`}
                      placeholder="z. B. Kriminalpolizei Stuttgart"
                    />
                    {step5.department && (
                      <CheckCircle2Icon className="absolute right-3 top-3.5 h-5 w-5 text-green-500" />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                    <ShieldIcon className="h-5 w-5 text-gray-500" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {step5.department || "Nicht angegeben"}
                    </span>
                  </div>
                )}
              </div>
              {/* Available Hours */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <CalendarClockIcon className="h-4 w-4 text-gray-500" />{" "}
                  Erreichbarkeit
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 px-1.5 text-xs"
                  >
                    Optional
                  </Badge>
                </Label>
                {isEditMode ? (
                  <Textarea
                    value={step5.availableHours}
                    onChange={(e) =>
                      updateField("step5", "availableHours", e.target.value)
                    }
                    onFocus={() => setFocusedField("availableHours")}
                    onBlur={() => setFocusedField(null)}
                    className={`min-h-[100px] transition-all ${focusedField === "availableHours" ? "ring-2 ring-blue-500" : ""}`}
                    placeholder="Mo–Fr: 08:00 – 18:00 Uhr\nSa: 09:00 – 14:00 Uhr\nNotfallhotline 24/7"
                    rows={4}
                  />
                ) : (
                  step5.availableHours && (
                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                      <div className="flex items-start gap-3">
                        <ClockIcon className="mt-0.5 h-5 w-5 text-gray-500" />
                        <p className="whitespace-pre-wrap font-medium text-gray-900 dark:text-white">
                          {step5.availableHours}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
          {/* Erweiterte Optionen im Edit‑Modus */}
          {isEditMode && (
            <Card className="border-0 bg-gradient-to-r from-purple-50 to-pink-50 shadow-sm dark:from-purple-950 dark:to-pink-950">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <SparklesIcon className="h-5 w-5 text-purple-600" />{" "}
                  Erweiterte Kontaktoptionen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Button
                    variant="outline"
                    className="h-auto flex-col items-center justify-center gap-2 p-4"
                    type="button"
                  >
                    <MessageCircleIcon className="h-6 w-6 text-blue-600" />
                    <span className="text-sm font-medium">WhatsApp</span>
                    <span className="text-xs text-gray-500">Hinzufügen</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col items-center justify-center gap-2 p-4"
                    type="button"
                  >
                    <GlobeIcon className="h-6 w-6 text-green-600" />
                    <span className="text-sm font-medium">Webseite</span>
                    <span className="text-xs text-gray-500">Verlinken</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col items-center justify-center gap-2 p-4"
                    type="button"
                  >
                    <BellIcon className="h-6 w-6 text-orange-600" />
                    <span className="text-sm font-medium">
                      Push‑Benachrichtigung
                    </span>
                    <span className="text-xs text-gray-500">Aktivieren</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col items-center justify-center gap-2 p-4"
                    type="button"
                  >
                    <MapPinIcon className="h-6 w-6 text-red-600" />
                    <span className="text-sm font-medium">Standort</span>
                    <span className="text-xs text-gray-500">Teilen</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        {/* Rechte Spalte */}
        <div className="space-y-4 sm:space-y-6">
          {/* Status Card */}
          <Card
            className={`border-0 ${isComplete ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950" : "bg-white dark:bg-gray-800"} shadow-sm`}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full ${isComplete ? "bg-green-100 dark:bg-green-900" : "bg-yellow-100 dark:bg-yellow-900"}`}
                >
                  {isComplete ? (
                    <CheckCircle2Icon className="h-8 w-8 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircleIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                  )}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                  {isComplete ? "Kontaktdaten vollständig" : "Fast geschafft!"}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {isComplete
                    ? "Alle erforderlichen Kontaktinformationen sind vorhanden."
                    : "Bitte vervollständigen Sie die markierten Pflichtfelder."}
                </p>
                {!isComplete && (
                  <div className="mt-4 space-y-2 text-left">
                    {!step5.contactPerson && (
                      <div className="flex items-center gap-2 text-xs text-red-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-600" />{" "}
                        Kontaktperson fehlt
                      </div>
                    )}
                    {!step5.contactPhone && (
                      <div className="flex items-center gap-2 text-xs text-red-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-600" />{" "}
                        Telefonnummer fehlt
                      </div>
                    )}
                    {!step5.department && (
                      <div className="flex items-center gap-2 text-xs text-red-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-600" />{" "}
                        Abteilung fehlt
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Quick Contact Summary */}
          {!isEditMode && isComplete && (
            <Card className="border-0 bg-white shadow-sm dark:bg-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <InfoIcon className="h-4 w-4 text-blue-600" /> Schnellkontakt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href={`tel:${step5.contactPhone}`}
                  className="flex items-center gap-3 rounded-lg bg-blue-50 p-3 transition-colors hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900"
                >
                  <PhoneIcon className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Anrufen
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {step5.contactPhone}
                    </p>
                  </div>
                </a>
                {step5.contactEmail && (
                  <a
                    href={`mailto:${step5.contactEmail}`}
                    className="flex items-center gap-3 rounded-lg bg-purple-50 p-3 transition-colors hover:bg-purple-100 dark:bg-purple-950 dark:hover:bg-purple-900"
                  >
                    <MailIcon className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        E‑Mail senden
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {step5.contactEmail}
                      </p>
                    </div>
                  </a>
                )}
              </CardContent>
            </Card>
          )}
          {/* Tips Card */}
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm dark:from-blue-950 dark:to-indigo-950">
            <CardContent className="p-6">
              <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <SparklesIcon className="h-4 w-4 text-blue-600" /> Hinweise
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-600" />
                  <span>
                    Stellen Sie sicher, dass die Kontaktdaten aktuell sind
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-600" />
                  <span>Geben Sie alternative Kontaktmöglichkeiten an</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-600" />
                  <span>Prüfen Sie die Erreichbarkeitszeiten</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Fixed Bottom Navigation */}
      {isEditMode && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:relative sm:border-0 sm:bg-transparent sm:p-0 sm:dark:bg-transparent">
          <div className="flex gap-3">
            <Button
              onClick={onPrevious}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              <ChevronLeftIcon className="mr-2 h-4 w-4" /> Zurück
            </Button>
            <Button
              onClick={onSave}
              disabled={!isComplete}
              className={`flex-1 sm:flex-none ${isComplete ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" : ""}`}
            >
              <SaveIcon className="mr-2 h-4 w-4" /> Fahndung speichern
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
