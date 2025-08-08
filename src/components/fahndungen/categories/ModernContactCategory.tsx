"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Phone,
  Mail,
  User,
  Shield,
  Clock,
  CheckCircle2,
  Building2,
  UserCheck,
  PhoneCall,
  MailCheck,
  CalendarClock,
  Copy,
  FileText,
  Share2,
  Check,
  AlertCircle,
  Globe,
  Bell,
  FileEdit,
  Plus,
  X,
  Upload,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
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

interface Step5Data {
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  department?: string;
  availableHours?: string;
  publishStatus?: string;
  urgencyLevel?: string;
  requiresApproval?: boolean;
  visibility?: {
    internal?: boolean;
    regional?: boolean;
    national?: boolean;
    international?: boolean;
  };
  notifications?: {
    emailAlerts?: boolean;
    smsAlerts?: boolean;
    appNotifications?: boolean;
    pressRelease?: boolean;
  };
  articlePublishing?: {
    publishAsArticle?: boolean;
    generateSeoUrl?: boolean;
    customSlug?: string;
    seoTitle?: string;
    seoDescription?: string;
    keywords?: string[];
    author?: string;
    readingTime?: number;
  };
}

export default function ModernContactCategory({
  data,
  isEditMode,
  updateField,
}: ContactCategoryProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string>("");
  const [contactPhoto, setContactPhoto] = useState<string | null>(null);
  const [copiedAction, setCopiedAction] = useState<string | null>(null);
  const [keywordInput, setKeywordInput] = useState("");

  const step5Data = (data.step5 ?? {}) as Step5Data;
  // Hilfsfunktionen für deutsche Labels
  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case "WANTED_PERSON":
        return "Straftäter";
      case "MISSING_PERSON":
        return "Vermisste Person";
      case "UNKNOWN_DEAD":
        return "Unbekannte Tote";
      case "STOLEN_ITEMS":
        return "Gestohlene Sachen";
      default:
        return "Fahndung";
    }
  };

  const getStatusLabel = (priority?: string) => {
    switch (priority) {
      case "new":
        return "NEU";
      case "urgent":
        return "DRINGEND";
      case "normal":
        return "AKTIV";
      case "expired":
        return "ABGELAUFEN";
      default:
        return "AKTIV";
    }
  };

  const getPublishStatusLabel = (status?: string) => {
    switch (status) {
      case "draft":
        return "Entwurf";
      case "review":
        return "Zur Überprüfung";
      case "scheduled":
        return "Geplant";
      case "published":
        return "Veröffentlicht";
      case "immediate":
        return "Sofort veröffentlichen";
      default:
        return "Veröffentlicht";
    }
  };

  const getVisibilityLabel = (visibility?: string) => {
    switch (visibility) {
      case "internal":
        return "Intern";
      case "regional":
        return "Regional";
      case "national":
        return "National";
      case "international":
        return "International";
      default:
        return "Intern";
    }
  };

  const getNotificationLabel = (notification?: string) => {
    switch (notification) {
      case "emailAlerts":
        return "E-Mail";
      case "smsAlerts":
        return "SMS";
      case "appNotifications":
        return "App";
      case "pressRelease":
        return "Presse";
      default:
        return "E-Mail";
    }
  };

  const step5 = {
    contactPerson: step5Data.contactPerson ?? "",
    contactPhone: step5Data.contactPhone ?? "",
    contactEmail: step5Data.contactEmail ?? "",
    department: step5Data.department ?? "",
    availableHours: step5Data.availableHours ?? "",
    publishStatus: step5Data.publishStatus ?? "published",
    urgencyLevel: step5Data.urgencyLevel ?? "urgent",
    requiresApproval: step5Data.requiresApproval ?? false,
    visibility: {
      internal: step5Data.visibility?.internal ?? true,
      regional: step5Data.visibility?.regional ?? true,
      national: step5Data.visibility?.national ?? false,
      international: step5Data.visibility?.international ?? false,
    },
    notifications: {
      emailAlerts: step5Data.notifications?.emailAlerts ?? true,
      smsAlerts: step5Data.notifications?.smsAlerts ?? false,
      appNotifications: step5Data.notifications?.appNotifications ?? true,
      pressRelease: step5Data.notifications?.pressRelease ?? false,
    },
    articlePublishing: {
      publishAsArticle: step5Data.articlePublishing?.publishAsArticle ?? false,
      generateSeoUrl: step5Data.articlePublishing?.generateSeoUrl ?? false,
      customSlug: step5Data.articlePublishing?.customSlug ?? "",
      seoTitle: step5Data.articlePublishing?.seoTitle ?? "",
      seoDescription: step5Data.articlePublishing?.seoDescription ?? "",
      keywords: step5Data.articlePublishing?.keywords ?? [],
      author: step5Data.articlePublishing?.author ?? "",
      readingTime: step5Data.articlePublishing?.readingTime ?? 0,
    },
  };

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

  const copyToClipboard = async (text: string, action: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAction(action);
      setTimeout(() => setCopiedAction(null), 2000);
    } catch (err) {
      console.error("Fehler beim Kopieren:", err);
    }
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
      await copyToClipboard(contactText, "share");
    }
  };

  const addKeyword = () => {
    if (
      keywordInput.trim() &&
      !step5.articlePublishing.keywords.includes(keywordInput.trim())
    ) {
      updateField("step5", "articlePublishing", {
        ...step5.articlePublishing,
        keywords: [...step5.articlePublishing.keywords, keywordInput.trim()],
      });
      setKeywordInput("");
    }
  };

  const removeKeyword = (index: number) => {
    updateField("step5", "articlePublishing", {
      ...step5.articlePublishing,
      keywords: step5.articlePublishing.keywords.filter(
        (_: string, i: number) => i !== index,
      ),
    });
  };

  const updateVisibility = (
    key: keyof typeof step5.visibility,
    value: boolean,
  ) => {
    updateField("step5", "visibility", { ...step5.visibility, [key]: value });
  };

  const updateNotifications = (
    key: keyof typeof step5.notifications,
    value: boolean,
  ) => {
    updateField("step5", "notifications", {
      ...step5.notifications,
      [key]: value,
    });
  };

  const renderContactCard = () => (
    <div className="space-y-6">
      {/* Mittlere Karte: Fall-Informationen */}
      <div className="rounded-3xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
          Fall-Informationen
        </h3>

        {/* Fahndungs-Header mit Hauptbild */}
        <div className="mb-6 flex items-center gap-6">
          <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 via-red-600 to-pink-600 shadow-lg ring-4 ring-white dark:ring-gray-800">
            {data.step3?.mainImage ? (
              <Image
                src={data.step3.mainImage}
                alt="Fahndungsbild"
                width={112}
                height={112}
                className="h-full w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
                onError={(e) => {
                  // Fallback zu einem lokalen Platzhalterbild
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23374151'/%3E%3Ctext x='400' y='300' font-family='Arial' font-size='48' fill='white' text-anchor='middle' dominant-baseline='middle'%3EFahndungsbild%3C/text%3E%3C/svg%3E";
                }}
              />
            ) : (
              <FileText className="h-14 w-14 text-white" />
            )}
          </div>
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              >
                {getCategoryLabel(data.step1?.category)}
              </Badge>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
              >
                {getStatusLabel(data.step2?.priority)}
              </Badge>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.step1?.title ?? "Fahndung"}
            </h2>
          </div>
        </div>

        {/* Fallnummer und Datum */}
        <div className="mt-6 rounded-lg border border-gray-200 p-4 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fallnummer:
                </span>
                <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                  {data.step1?.caseNumber ?? "POL-2025-K-767297-A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Datum:
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {new Date().toLocaleDateString("de-DE")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Kurze Beschreibung was passiert ist */}
        <div className="mt-6 rounded-lg border border-gray-200 p-4 dark:border-gray-600">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Was ist passiert:
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {data.step2?.shortDescription ?? "Keine Beschreibung verfügbar"}
              </span>
            </div>
          </div>
        </div>

        {/* Adresse/Ort wo es passiert ist */}
        <div className="mt-6 rounded-lg border border-gray-200 p-4 dark:border-gray-600">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Ort/Adresse:
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {data.step4?.mainLocation?.address ??
                  "Reutlingen, Landkreis Reutlingen, Baden-Württemberg, Deutschland"}
              </span>
            </div>
          </div>
        </div>

        {/* Status-Informationen */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Veröffentlichungsstatus */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900">
                <FileEdit className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Veröffentlichungsstatus
                </p>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                  {getPublishStatusLabel(
                    data.step5?.publishStatus ?? "published",
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Dringlichkeitsstufe */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Dringlichkeitsstufe
                </p>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                  {getStatusLabel(data.step2?.priority)}
                </p>
              </div>
            </div>
          </div>

          {/* Sichtbarkeit */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-800">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900">
                <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Sichtbarkeit
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {Object.entries(step5.visibility).map(([key, value]) =>
                    value ? (
                      <Badge key={key} variant="outline" className="text-xs">
                        {getVisibilityLabel(key)}
                      </Badge>
                    ) : null,
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Benachrichtigungen */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-800">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900">
                <Bell className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Benachrichtigungen
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {Object.entries(step5.notifications).map(([key, value]) =>
                    value ? (
                      <Badge
                        key={key}
                        variant="outline"
                        className="bg-green-50 text-xs text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      >
                        {getNotificationLabel(key)}
                      </Badge>
                    ) : null,
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Untere Karte: Kontakt und Kontaktperson */}
      <div className="rounded-3xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
          Kontakt
        </h3>

        <div className="flex items-center gap-6">
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
                <User className="h-14 w-14 text-white" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 shadow-lg">
              <div className="h-3 w-3 rounded-full bg-white"></div>
            </div>
            {isEditMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setContactPhoto(e.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                }}
                className="absolute -bottom-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 shadow-lg hover:bg-blue-600"
              >
                <Upload className="h-3 w-3 text-white" />
              </Button>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {step5.contactPerson ?? "Kontaktperson"}
            </h2>
            <p className="mt-1 text-lg font-medium text-blue-600 dark:text-blue-400">
              {step5.department ?? "Abteilung"}
            </p>
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Verifiziert
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Verfügbar
              </span>
            </div>
          </div>
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
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copiedAction === "copy" ? "Kopiert!" : "Kopieren"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareContact}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <Share2 className="h-4 w-4" />
              Teilen
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Phone,
              label: "Telefon",
              value: step5.contactPhone,
              color: "blue",
            },
            {
              icon: Mail,
              label: "E-Mail",
              value: step5.contactEmail,
              color: "green",
            },
            {
              icon: Building2,
              label: "Abteilung",
              value: step5.department,
              color: "purple",
            },
            {
              icon: Clock,
              label: "Erreichbarkeit",
              value: step5.availableHours,
              color: "orange",
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className={`group rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all duration-200 hover:border-${color}-300 hover:bg-${color}-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-${color}-400 dark:hover:bg-${color}-900/20`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${color}-100 dark:bg-${color}-900`}
                >
                  <Icon
                    className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {label}
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {value || "Nicht angegeben"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderArticlePublishing = () =>
    step5.articlePublishing.publishAsArticle && (
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-800">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900">
            <FileEdit className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Artikel-Veröffentlichung
            </p>
            <div className="mt-2 space-y-2">
              {step5.articlePublishing.seoTitle && (
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  <span className="text-gray-500">SEO-Titel:</span>{" "}
                  {step5.articlePublishing.seoTitle}
                </p>
              )}
              {step5.articlePublishing.seoDescription && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-gray-500">SEO-Beschreibung:</span>{" "}
                  {step5.articlePublishing.seoDescription}
                </p>
              )}
              {step5.articlePublishing.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-gray-500">Keywords:</span>
                  {step5.articlePublishing.keywords.map(
                    (keyword: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );

  if (!isEditMode) {
    return (
      <div className="w-full space-y-6">
        {renderContactCard()}

        {renderArticlePublishing()}
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 px-4 pb-20 sm:space-y-6 sm:px-6 lg:px-8">
      <div className="rounded-lg bg-white p-4 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[
            {
              icon: UserCheck,
              label: "Kontaktperson",
              value: step5.contactPerson,
              required: true,
              type: "text",
              placeholder: "z. B. Kommissar Schmidt",
            },
            {
              icon: Building2,
              label: "Abteilung",
              value: step5.department,
              required: true,
              type: "text",
              placeholder: "z. B. Kriminalpolizei Stuttgart",
            },
          ].map(({ icon: Icon, label, value, required, type, placeholder }) => (
            <Card
              key={label}
              className="border-0 bg-white shadow-sm dark:bg-gray-800"
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon className="h-5 w-5 text-blue-600" />
                  {label}
                  {required && (
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
                <div className="relative">
                  <Input
                    value={value}
                    onChange={(e) =>
                      updateField(
                        "step5",
                        label.toLowerCase().replace(/\s+/g, ""),
                        e.target.value,
                      )
                    }
                    onFocus={() => setFocusedField(label)}
                    onBlur={() => setFocusedField(null)}
                    className={`h-12 transition-all ${focusedField === label ? "ring-2 ring-blue-500" : ""}`}
                    placeholder={placeholder}
                    type={type}
                  />
                  {value && (
                    <CheckCircle2 className="absolute right-3 top-3.5 h-5 w-5 text-green-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[
            {
              icon: PhoneCall,
              label: "Telefonnummer",
              value: step5.contactPhone,
              required: true,
              type: "tel",
              placeholder: "+49 711 8990-0",
            },
            {
              icon: MailCheck,
              label: "E‑Mail",
              value: step5.contactEmail,
              required: false,
              type: "email",
              placeholder: "kontakt@polizei-bw.de",
            },
            {
              icon: CalendarClock,
              label: "Erreichbarkeit",
              value: step5.availableHours,
              required: false,
              type: "textarea",
              placeholder:
                "Mo–Fr: 08:00 – 18:00 Uhr\nSa: 09:00 – 14:00 Uhr\nNotfallhotline 24/7",
            },
          ].map(({ icon: Icon, label, value, required, type, placeholder }) => (
            <Card
              key={label}
              className="border-0 bg-white shadow-sm dark:bg-gray-800"
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon className="h-5 w-5 text-blue-600" />
                  {label}
                  {required ? (
                    <Badge
                      variant="destructive"
                      className="ml-1 h-5 px-1.5 text-xs"
                    >
                      Pflicht
                    </Badge>
                  ) : (
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
                {type === "textarea" ? (
                  <Textarea
                    value={value}
                    onChange={(e) =>
                      updateField(
                        "step5",
                        label.toLowerCase().replace(/\s+/g, ""),
                        e.target.value,
                      )
                    }
                    onFocus={() => setFocusedField(label)}
                    onBlur={() => setFocusedField(null)}
                    className={`min-h-[80px] transition-all ${focusedField === label ? "ring-2 ring-blue-500" : ""}`}
                    placeholder={placeholder}
                    rows={3}
                  />
                ) : (
                  <div className="relative">
                    <Input
                      value={value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        updateField(
                          "step5",
                          label.toLowerCase().replace(/\s+/g, ""),
                          val,
                        );
                        if (type === "email") validateEmail(val);
                      }}
                      onFocus={() => setFocusedField(label)}
                      onBlur={() => setFocusedField(null)}
                      className={`h-12 transition-all ${focusedField === label ? "ring-2 ring-blue-500" : ""} ${type === "email" && emailError ? "border-red-500" : ""}`}
                      placeholder={placeholder}
                      type={type}
                    />
                    {value && (type !== "email" || !emailError) && (
                      <CheckCircle2 className="absolute right-3 top-3.5 h-5 w-5 text-green-500" />
                    )}
                    {type === "email" && emailError && (
                      <p className="mt-1 text-xs text-red-500">{emailError}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Veröffentlichungseinstellungen
          </h3>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[
              {
                icon: FileEdit,
                label: "Veröffentlichungsstatus",
                value: step5.publishStatus,
                options: [
                  { value: "draft", label: "Entwurf" },
                  { value: "review", label: "Zur Überprüfung" },
                  { value: "scheduled", label: "Geplant" },
                  { value: "immediate", label: "Sofort veröffentlichen" },
                ],
              },
              {
                icon: AlertCircle,
                label: "Dringlichkeitsstufe",
                value: step5.urgencyLevel,
                options: [
                  { value: "low", label: "Niedrig" },
                  { value: "medium", label: "Mittel" },
                  { value: "high", label: "Hoch" },
                  { value: "critical", label: "Kritisch" },
                ],
              },
            ].map(({ icon: Icon, label, value, options }) => (
              <Card
                key={label}
                className="border-0 bg-white shadow-sm dark:bg-gray-800"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className="h-5 w-5 text-blue-600" />
                    {label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={value}
                    onValueChange={(val) =>
                      updateField(
                        "step5",
                        label.toLowerCase().replace(/\s+/g, ""),
                        val,
                      )
                    }
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Status wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map(({ value: optValue, label: optLabel }) => (
                        <SelectItem key={optValue} value={optValue}>
                          {optLabel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Sichtbarkeit
          </h3>
          <Card className="border-0 bg-white shadow-sm dark:bg-gray-800">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {Object.entries(step5.visibility).map(([key, value]) => (
                  <label
                    key={key}
                    className="flex items-center space-x-2 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    <Checkbox
                      checked={value}
                      onCheckedChange={(checked: boolean) =>
                        updateVisibility(
                          key as keyof typeof step5.visibility,
                          checked,
                        )
                      }
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {key === "internal" && "Intern"}
                      {key === "regional" && "Regional"}
                      {key === "national" && "National"}
                      {key === "international" && "International"}
                    </span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Benachrichtigungen
          </h3>
          <Card className="border-0 bg-white shadow-sm dark:bg-gray-800">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {Object.entries(step5.notifications).map(([key, value]) => (
                  <label
                    key={key}
                    className="flex items-center space-x-2 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    <Checkbox
                      checked={value}
                      onCheckedChange={(checked: boolean) =>
                        updateNotifications(
                          key as keyof typeof step5.notifications,
                          checked,
                        )
                      }
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {key === "emailAlerts" && "E-Mail-Benachrichtigungen"}
                      {key === "smsAlerts" && "SMS-Benachrichtigungen"}
                      {key === "appNotifications" && "App-Benachrichtigungen"}
                      {key === "pressRelease" && "Pressemitteilung"}
                    </span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Artikel-Veröffentlichung
          </h3>
          <Card className="border-0 bg-white shadow-sm dark:bg-gray-800">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={step5.articlePublishing.publishAsArticle}
                    onCheckedChange={(checked: boolean) =>
                      updateField("step5", "articlePublishing", {
                        ...step5.articlePublishing,
                        publishAsArticle: checked,
                      })
                    }
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Als Artikel veröffentlichen
                  </span>
                </label>
                {step5.articlePublishing.publishAsArticle && (
                  <div className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-600">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          SEO-Titel
                        </label>
                        <Input
                          value={step5.articlePublishing.seoTitle ?? ""}
                          onChange={(e) =>
                            updateField("step5", "articlePublishing", {
                              ...step5.articlePublishing,
                              seoTitle: e.target.value,
                            })
                          }
                          className="h-12"
                          placeholder="SEO-optimierter Titel"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          SEO-Beschreibung
                        </label>
                        <Textarea
                          value={step5.articlePublishing.seoDescription ?? ""}
                          onChange={(e) =>
                            updateField("step5", "articlePublishing", {
                              ...step5.articlePublishing,
                              seoDescription: e.target.value,
                            })
                          }
                          rows={2}
                          className="min-h-[80px]"
                          placeholder="SEO-Beschreibung für Suchmaschinen"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Keywords
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addKeyword())
                          }
                          className="flex-1"
                          placeholder="Keyword eingeben..."
                        />
                        <Button
                          type="button"
                          onClick={addKeyword}
                          size="sm"
                          className="px-4"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {step5.articlePublishing.keywords.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {step5.articlePublishing.keywords.map(
                            (keyword: string, index: number) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              >
                                {keyword}
                                <button
                                  type="button"
                                  onClick={() => removeKeyword(index)}
                                  className="ml-1 hover:text-blue-600"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
