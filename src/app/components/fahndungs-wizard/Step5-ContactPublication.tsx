"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  Building,
  User,
  Calendar,
  Clock,
  Globe,
  Lock,
  Bell,
  Shield,
} from "lucide-react";
import type { Step5Data } from "@/types/fahndung-wizard";

interface Step5Props {
  data: Step5Data;
  onUpdate: (data: Step5Data) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step5ContactPublication({
  data,
  onUpdate,
  onNext,
  onBack,
}: Step5Props) {
  const [formData, setFormData] = useState(data);
  const [showAlternativeContact, setShowAlternativeContact] = useState(
    !!data.alternativeContact,
  );

  const updateField = (field: string, value: string | boolean | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateNestedField = (
    parent: string,
    field: string,
    value: string | boolean | undefined,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as Record<string, unknown>),
        [field]: value,
      },
    }));
  };

  const handleNext = () => {
    onUpdate(formData);
    onNext();
  };

  const isValid =
    formData.contactPerson && formData.contactPhone && formData.department;

  // Urgency Level Beschreibungen
  const urgencyDescriptions = {
    low: "Normale Bearbeitung, keine besondere Eile",
    medium: "Erhöhte Priorität, zeitnahe Bearbeitung",
    high: "Dringend, sofortige Aufmerksamkeit erforderlich",
    critical: "Kritisch, höchste Priorität, alle Kanäle nutzen",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Kontakt & Veröffentlichung</h2>

      {/* Hauptkontakt */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 flex items-center text-lg font-semibold">
          <User className="mr-2 h-5 w-5 text-blue-500" />
          Hauptansprechpartner
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Name des Ansprechpartners *
            </label>
            <input
              type="text"
              value={formData.contactPerson}
              onChange={(e) => updateField("contactPerson", e.target.value)}
              className="input-dark-mode-sm"
              placeholder="Max Mustermann"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Dienststelle / Abteilung *
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={formData.department}
                onChange={(e) => updateField("department", e.target.value)}
                className="input-dark-mode-sm py-2 pl-10 pr-3"
                placeholder="Kriminalpolizei Stuttgart"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Telefonnummer *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => updateField("contactPhone", e.target.value)}
                className="input-dark-mode-sm py-2 pl-10 pr-3"
                placeholder="+49 711 1234567"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              E-Mail-Adresse
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => updateField("contactEmail", e.target.value)}
                className="input-dark-mode-sm py-2 pl-10 pr-3"
                placeholder="fahndung@polizei-bw.de"
              />
            </div>
          </div>

          <div className="col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Erreichbarkeit
            </label>
            <input
              type="text"
              value={formData.availableHours}
              onChange={(e) => updateField("availableHours", e.target.value)}
              className="input-dark-mode-sm"
              placeholder="Mo-Fr 8:00-16:00 Uhr, Sa 8:00-12:00 Uhr"
            />
          </div>
        </div>

        {/* Vertretung */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowAlternativeContact(!showAlternativeContact)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {showAlternativeContact
              ? "- Vertretung entfernen"
              : "+ Vertretung hinzufügen"}
          </button>

          {showAlternativeContact && (
            <div className="mt-3 rounded-lg bg-gray-50 p-4">
              <h4 className="mb-3 text-sm font-medium text-gray-700">
                Vertretung / Zweiter Ansprechpartner
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={formData.alternativeContact?.name ?? ""}
                  onChange={(e) =>
                    updateNestedField(
                      "alternativeContact",
                      "name",
                      e.target.value,
                    )
                  }
                  className="input-dark-mode-sm"
                />
                <input
                  type="tel"
                  placeholder="Telefon"
                  value={formData.alternativeContact?.phone ?? ""}
                  onChange={(e) =>
                    updateNestedField(
                      "alternativeContact",
                      "phone",
                      e.target.value,
                    )
                  }
                  className="input-dark-mode-sm"
                />
                <input
                  type="email"
                  placeholder="E-Mail"
                  value={formData.alternativeContact?.email ?? ""}
                  onChange={(e) =>
                    updateNestedField(
                      "alternativeContact",
                      "email",
                      e.target.value,
                    )
                  }
                  className="input-dark-mode-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Veröffentlichung */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 flex items-center text-lg font-semibold">
          <Calendar className="mr-2 h-5 w-5 text-green-500" />
          Veröffentlichungseinstellungen
        </h3>

        {/* Status */}
        <div className="mb-6">
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Veröffentlichungsstatus
          </label>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { value: "draft", label: "Entwurf", icon: Lock, color: "gray" },
              {
                value: "review",
                label: "Zur Prüfung",
                icon: Shield,
                color: "yellow",
              },
              {
                value: "scheduled",
                label: "Geplant",
                icon: Clock,
                color: "blue",
              },
              {
                value: "immediate",
                label: "Sofort",
                icon: Bell,
                color: "green",
              },
            ].map((status) => (
              <button
                key={status.value}
                onClick={() => updateField("publishStatus", status.value)}
                className={`rounded-lg border-2 p-3 transition-all ${
                  formData.publishStatus === status.value
                    ? `border-${status.color}-500 bg-${status.color}-50`
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <status.icon
                  className={`mx-auto mb-1 h-6 w-6 ${
                    formData.publishStatus === status.value
                      ? `text-${status.color}-600`
                      : "text-gray-400"
                  }`}
                />
                <div className="text-sm font-medium">{status.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Zeitplanung für geplante Veröffentlichung */}
        {formData.publishStatus === "scheduled" && (
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Veröffentlichungsdatum
              </label>
              <input
                type="date"
                value={formData.publishDate ?? ""}
                onChange={(e) => updateField("publishDate", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="input-dark-mode-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Uhrzeit
              </label>
              <input
                type="time"
                value={formData.publishTime ?? ""}
                onChange={(e) => updateField("publishTime", e.target.value)}
                className="input-dark-mode-sm"
              />
            </div>
          </div>
        )}

        {/* Ablaufdatum */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Ablaufdatum (optional)
          </label>
          <input
            type="date"
            value={formData.expiryDate ?? ""}
            onChange={(e) => updateField("expiryDate", e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="input-dark-mode-sm max-w-xs"
          />
          <p className="mt-1 text-sm text-gray-500">
            Die Fahndung wird nach diesem Datum automatisch deaktiviert
          </p>
        </div>

        {/* Dringlichkeit */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Dringlichkeitsstufe
          </label>
          <div className="space-y-2">
            {Object.entries(urgencyDescriptions).map(([level, description]) => (
              <label key={level} className="flex cursor-pointer items-start">
                <input
                  type="radio"
                  value={level}
                  checked={formData.urgencyLevel === level}
                  onChange={(e) => updateField("urgencyLevel", e.target.value)}
                  className="mr-3 mt-1"
                />
                <div>
                  <div
                    className={`font-medium ${
                      level === "critical"
                        ? "text-red-600"
                        : level === "high"
                          ? "text-orange-600"
                          : level === "medium"
                            ? "text-yellow-600"
                            : "text-gray-600"
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </div>
                  <div className="text-sm text-gray-500">{description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Sichtbarkeit & Reichweite */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 flex items-center text-lg font-semibold">
          <Globe className="mr-2 h-5 w-5 text-purple-500" />
          Sichtbarkeit & Reichweite
        </h3>

        <div className="space-y-3">
          {[
            {
              key: "internal",
              label: "Intern",
              description: "Nur für Polizei und Behörden",
            },
            {
              key: "regional",
              label: "Regional",
              description: "Lokale und regionale Medien",
            },
            {
              key: "national",
              label: "National",
              description: "Bundesweite Veröffentlichung",
            },
            {
              key: "international",
              label: "International",
              description: "Interpol und internationale Partner",
            },
          ].map((option) => (
            <label key={option.key} className="flex cursor-pointer items-start">
              <input
                type="checkbox"
                checked={
                  formData.visibility[
                    option.key as keyof typeof formData.visibility
                  ]
                }
                onChange={(e) =>
                  updateNestedField("visibility", option.key, e.target.checked)
                }
                className="mr-3 mt-1"
              />
              <div>
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-gray-500">
                  {option.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Benachrichtigungen */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 flex items-center text-lg font-semibold">
          <Bell className="mr-2 h-5 w-5 text-blue-500" />
          Benachrichtigungskanäle
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {[
            {
              key: "emailAlerts",
              label: "E-Mail-Benachrichtigungen",
              icon: Mail,
            },
            { key: "smsAlerts", label: "SMS-Benachrichtigungen", icon: Phone },
            {
              key: "appNotifications",
              label: "App-Benachrichtigungen",
              icon: Bell,
            },
            { key: "pressRelease", label: "Pressemitteilung", icon: Globe },
          ].map((option) => (
            <label
              key={option.key}
              className="flex cursor-pointer items-center"
            >
              <input
                type="checkbox"
                checked={
                  formData.notifications[
                    option.key as keyof typeof formData.notifications
                  ]
                }
                onChange={(e) =>
                  updateNestedField(
                    "notifications",
                    option.key,
                    e.target.checked,
                  )
                }
                className="mr-3"
              />
              <option.icon className="mr-2 h-4 w-4 text-gray-400" />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Freigabe */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
        <label className="flex cursor-pointer items-start">
          <input
            type="checkbox"
            checked={formData.requiresApproval}
            onChange={(e) => updateField("requiresApproval", e.target.checked)}
            className="mr-3 mt-1"
          />
          <div>
            <div className="font-medium text-yellow-800">
              Freigabe erforderlich
            </div>
            <div className="mt-1 text-sm text-yellow-700">
              Diese Fahndung muss vor der Veröffentlichung von einem
              Vorgesetzten freigegeben werden
            </div>
          </div>
        </label>

        {formData.requiresApproval && (
          <div className="mt-3">
            <label className="mb-2 block text-sm font-medium text-yellow-800">
              Anmerkungen zur Freigabe
            </label>
            <textarea
              value={formData.approvalNotes ?? ""}
              onChange={(e) => updateField("approvalNotes", e.target.value)}
              rows={2}
              className="w-full rounded-md border border-yellow-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Hinweise für den Prüfer..."
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="rounded bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
        >
          Zurück
        </button>
        <button
          onClick={handleNext}
          disabled={!isValid}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Weiter zur Zusammenfassung
        </button>
      </div>
    </div>
  );
}
