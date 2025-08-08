"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Phone as PhoneIcon,
  Mail as MailIcon,
  User as UserIcon,
  Shield as ShieldIcon,
  Clock as ClockIcon,
  Save as SaveIcon,
  ChevronLeft as ChevronLeftIcon,
  CheckCircle2 as CheckCircle2Icon,
  Building2 as Building2Icon,
  UserCheck as UserCheckIcon,
  PhoneCall as PhoneCallIcon,
  MailCheck as MailCheckIcon,
  CalendarClock as CalendarClockIcon,
  Camera as CameraIcon,
  Copy as CopyIcon,
  FileText as FileTextIcon,
  FileSpreadsheet as FileSpreadsheetIcon,
  Share2 as Share2Icon,
  Check as CheckIcon,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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

export default function ModernContactCategory({
  data,
  isEditMode,
  updateField,
  onPrevious,
  onSave,
}: ContactCategoryProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string>("");
  const [contactPhoto, setContactPhoto] = useState<string | null>(null);
  const [copiedAction, setCopiedAction] = useState<string | null>(null);

  const step5 = data.step5 ?? {
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
    department: "",
    availableHours: "",
  };

  const isComplete = Boolean(
    step5.contactPerson && step5.contactPhone && step5.department,
  );

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

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setContactPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = async (text: string, action: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAction(action);
      setTimeout(() => setCopiedAction(null), 2000);
    } catch (err) {
      console.error("Fehler beim Kopieren:", err);
    }
  };

  const generateCSV = () => {
    const csvContent = `Name,Abteilung,Telefon,E-Mail,Erreichbarkeit\n"${step5.contactPerson}","${step5.department}","${step5.contactPhone}","${step5.contactEmail || ""}","${step5.availableHours || ""}"`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "kontakt.csv";
    link.click();
  };

  const generateExcel = () => {
    // Einfache Excel-ähnliche Datei als HTML-Tabelle
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <table>
            <tr><th>Name</th><th>Abteilung</th><th>Telefon</th><th>E-Mail</th><th>Erreichbarkeit</th></tr>
            <tr><td>${step5.contactPerson}</td><td>${step5.department}</td><td>${step5.contactPhone}</td><td>${step5.contactEmail || ""}</td><td>${step5.availableHours || ""}</td></tr>
          </table>
        </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "kontakt.xls";
    link.click();
  };

  const shareContact = async () => {
    const contactText = `Kontakt: ${step5.contactPerson}\nAbteilung: ${step5.department}\nTelefon: ${step5.contactPhone}${step5.contactEmail ? `\nE-Mail: ${step5.contactEmail}` : ""}${step5.availableHours ? `\nErreichbarkeit: ${step5.availableHours}` : ""}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Kontaktinformationen",
          text: contactText,
        });
      } catch (err) {
        console.error("Fehler beim Teilen:", err);
      }
    } else {
      // Fallback: Kopieren in Zwischenablage
      await copyToClipboard(contactText, "share");
    }
  };

  if (!isEditMode) {
    // Kontaktkarten-Ansicht
    return (
      <div className="w-full space-y-6">
        {/* Kontaktkarte */}
        <div className="rounded-3xl bg-white p-6 shadow-xl dark:bg-gray-800">
          {/* Header mit Foto - Moderneres Design */}
          <div className="mb-8">
            <div className="flex items-center gap-6">
              {/* Profilbild mit verbessertem Design */}
              <div className="relative">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 shadow-lg ring-4 ring-white dark:ring-gray-800">
                  {contactPhoto ? (
                    <Image
                      src={contactPhoto}
                      alt="Kontaktperson"
                      width={112}
                      height={112}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-14 w-14 text-white" />
                  )}
                </div>
                {/* Status-Indikator */}
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 shadow-lg">
                  <div className="h-3 w-3 rounded-full bg-white"></div>
                </div>
              </div>

              {/* Kontakt-Info mit verbesserter Typografie */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {step5.contactPerson || "Kontaktperson"}
                </h2>
                <p className="mt-1 text-lg font-medium text-blue-600 dark:text-blue-400">
                  {step5.department || "Abteilung"}
                </p>
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <ShieldIcon className="h-4 w-4" />
                    Verifiziert
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    Verfügbar
                  </span>
                </div>
              </div>

              {/* Schnell-Aktionen */}
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const contactText = `${step5.contactPerson}\n${step5.department}\n${step5.contactPhone}${step5.contactEmail ? `\n${step5.contactEmail}` : ""}`;
                    await copyToClipboard(contactText, "copy");
                  }}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  {copiedAction === "copy" ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <CopyIcon className="h-4 w-4" />
                  )}
                  {copiedAction === "copy" ? "Kopiert!" : "Kopieren"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await shareContact();
                  }}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  <Share2Icon className="h-4 w-4" />
                  Teilen
                </Button>
              </div>
            </div>
          </div>

          {/* Kontaktdaten in Karten */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Telefon */}
            <div className="group rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-blue-400 dark:hover:bg-blue-900/20">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900">
                  <PhoneIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Telefon
                  </p>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {step5.contactPhone || "Nicht angegeben"}
                  </p>
                </div>
              </div>
            </div>

            {/* E-Mail */}
            <div className="group rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all duration-200 hover:border-green-300 hover:bg-green-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-green-400 dark:hover:bg-green-900/20">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900">
                  <MailIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    E-Mail
                  </p>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {step5.contactEmail || "Nicht angegeben"}
                  </p>
                </div>
              </div>
            </div>

            {/* Abteilung */}
            <div className="group rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all duration-200 hover:border-purple-300 hover:bg-purple-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-purple-400 dark:hover:bg-purple-900/20">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900">
                  <Building2Icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Abteilung
                  </p>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {step5.department || "Nicht angegeben"}
                  </p>
                </div>
              </div>
            </div>

            {/* Erreichbarkeit */}
            <div className="group rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all duration-200 hover:border-orange-300 hover:bg-orange-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-orange-400 dark:hover:bg-orange-900/20">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900">
                  <ClockIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Erreichbarkeit
                  </p>
                  <p className="mt-1 whitespace-pre-wrap font-semibold text-gray-900 dark:text-white">
                    {step5.availableHours || "Nicht angegeben"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Export-Buttons */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={generateCSV}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <FileTextIcon className="h-4 w-4" />
              Als CSV exportieren
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={generateExcel}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <FileSpreadsheetIcon className="h-4 w-4" />
              Als Excel exportieren
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Edit-Mode (ursprüngliche Formular-Ansicht)
  return (
    <div className="w-full space-y-4 px-4 pb-20 sm:space-y-6 sm:px-6 lg:px-8">
      {/* Kompakter Header */}
      <div className="rounded-lg bg-white p-4 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div></div>
        </div>
      </div>

      {/* Hauptinhalt - Mobile First */}
      <div className="space-y-4">
        {/* Erste Reihe: Kontaktperson und Abteilung */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Kontaktperson mit Foto */}
          <Card className="border-0 bg-white shadow-sm dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserCheckIcon className="h-5 w-5 text-blue-600" />
                Kontaktperson
                {isEditMode && (
                  <Badge
                    variant="destructive"
                    className="ml-1 h-5 px-1.5 text-xs"
                  >
                    Pflicht
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Foto Upload */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                    {contactPhoto ? (
                      <Image
                        src={contactPhoto}
                        alt="Kontaktperson"
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  {isEditMode && (
                    <label className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700">
                      <CameraIcon className="h-3 w-3" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="flex-1">
                  {isEditMode ? (
                    <Input
                      value={step5.contactPerson}
                      onChange={(e) =>
                        updateField("step5", "contactPerson", e.target.value)
                      }
                      onFocus={() => setFocusedField("contactPerson")}
                      onBlur={() => setFocusedField(null)}
                      className={`h-12 transition-all ${focusedField === "contactPerson" ? "ring-2 ring-blue-500" : ""}`}
                      placeholder="z. B. Kommissar Schmidt"
                    />
                  ) : (
                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                      <UserIcon className="h-5 w-5 text-gray-500" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {step5.contactPerson || "Nicht angegeben"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Abteilung */}
          <Card className="border-0 bg-white shadow-sm dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2Icon className="h-5 w-5 text-blue-600" />
                Abteilung
                {isEditMode && (
                  <Badge
                    variant="destructive"
                    className="ml-1 h-5 px-1.5 text-xs"
                  >
                    Pflicht
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                    placeholder="z. B. Kriminalpolizei Stuttgart"
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
            </CardContent>
          </Card>
        </div>

        {/* Zweite Reihe: Telefonnummer, E-Mail, Erreichbarkeit */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Telefonnummer */}
          <Card className="border-0 bg-white shadow-sm dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <PhoneCallIcon className="h-5 w-5 text-blue-600" />
                Telefonnummer
                {isEditMode && (
                  <Badge
                    variant="destructive"
                    className="ml-1 h-5 px-1.5 text-xs"
                  >
                    Pflicht
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                    placeholder="+49 711 8990-0"
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
            </CardContent>
          </Card>

          {/* E-Mail */}
          <Card className="border-0 bg-white shadow-sm dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MailCheckIcon className="h-5 w-5 text-blue-600" />
                E‑Mail
                {isEditMode && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 px-1.5 text-xs"
                  >
                    Optional
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Erreichbarkeit */}
          <Card className="border-0 bg-white shadow-sm dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarClockIcon className="h-5 w-5 text-blue-600" />
                Erreichbarkeit
                {isEditMode && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 px-1.5 text-xs"
                  >
                    Optional
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditMode ? (
                <Textarea
                  value={step5.availableHours}
                  onChange={(e) =>
                    updateField("step5", "availableHours", e.target.value)
                  }
                  onFocus={() => setFocusedField("availableHours")}
                  onBlur={() => setFocusedField(null)}
                  className={`min-h-[80px] transition-all ${focusedField === "availableHours" ? "ring-2 ring-blue-500" : ""}`}
                  placeholder="Mo–Fr: 08:00 – 18:00 Uhr&#10;Sa: 09:00 – 14:00 Uhr&#10;Notfallhotline 24/7"
                  rows={3}
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
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
              <SaveIcon className="mr-2 h-4 w-4" /> Speichern
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
