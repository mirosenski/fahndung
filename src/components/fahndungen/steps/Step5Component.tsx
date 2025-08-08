"use client";

import React, { useState, useEffect } from "react";
import { User, Phone, Mail, Building, Clock, AlertCircle } from "lucide-react";
import type { Step5Data } from "../types/WizardTypes";

interface Step5ComponentProps {
  data: Step5Data;
  onChange: (data: Step5Data) => void;
}

const Step5Component: React.FC<Step5ComponentProps> = ({ data, onChange }) => {
  const [keywordInput, setKeywordInput] = useState("");

  // Lokale States für alle Kontaktfelder
  const [localContactPerson, setLocalContactPerson] = useState(
    data.contactPerson,
  );
  const [localContactPhone, setLocalContactPhone] = useState(data.contactPhone);
  const [localContactEmail, setLocalContactEmail] = useState(data.contactEmail);
  const [localDepartment, setLocalDepartment] = useState(data.department);
  const [localAvailableHours, setLocalAvailableHours] = useState(
    data.availableHours,
  );

  // Synchronisiere mit externen Änderungen
  useEffect(() => {
    setLocalContactPerson(data.contactPerson);
    setLocalContactPhone(data.contactPhone);
    setLocalContactEmail(data.contactEmail);
    setLocalDepartment(data.department);
    setLocalAvailableHours(data.availableHours);
  }, [
    data.contactPerson,
    data.contactPhone,
    data.contactEmail,
    data.department,
    data.availableHours,
  ]);

  // Commit-Funktion
  const commitChanges = () => {
    onChange({
      ...data,
      contactPerson: localContactPerson,
      contactPhone: localContactPhone,
      contactEmail: localContactEmail,
      department: localDepartment,
      availableHours: localAvailableHours,
    });
  };

  const addKeyword = () => {
    if (
      keywordInput.trim() &&
      !data.articlePublishing.keywords.includes(keywordInput.trim())
    ) {
      onChange({
        ...data,
        articlePublishing: {
          ...data.articlePublishing,
          keywords: [...data.articlePublishing.keywords, keywordInput.trim()],
        },
      });
      setKeywordInput("");
    }
  };

  const removeKeyword = (index: number) => {
    onChange({
      ...data,
      articlePublishing: {
        ...data.articlePublishing,
        keywords: data.articlePublishing.keywords.filter((_, i) => i !== index),
      },
    });
  };

  const updateVisibility = (
    key: keyof Step5Data["visibility"],
    value: boolean,
  ) => {
    onChange({
      ...data,
      visibility: {
        ...data.visibility,
        [key]: value,
      },
    });
  };

  const updateNotifications = (
    key: keyof Step5Data["notifications"],
    value: boolean,
  ) => {
    onChange({
      ...data,
      notifications: {
        ...data.notifications,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-muted-foreground dark:text-white">
          Schritt 5: Kontakt & Veröffentlichung
        </h2>
        <p className="text-muted-foreground dark:text-muted-foreground">
          Legen Sie Kontaktdaten und Veröffentlichungseinstellungen fest
        </p>
      </div>

      {/* Kontaktdaten */}
      <div className="space-y-6">
        <div>
          <h3 className="mb-4 text-lg font-semibold text-muted-foreground dark:text-white">
            Kontaktdaten
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                Ansprechpartner *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={localContactPerson}
                  onChange={(e) => setLocalContactPerson(e.target.value)}
                  onBlur={commitChanges}
                  className="w-full rounded-lg border border-border py-2 pl-10 pr-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white"
                  placeholder="z.B. Kriminalhauptkommissar Müller"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                Telefonnummer *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  value={localContactPhone}
                  onChange={(e) => setLocalContactPhone(e.target.value)}
                  onBlur={commitChanges}
                  className="w-full rounded-lg border border-border py-2 pl-10 pr-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white"
                  placeholder="+49 123 456789"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                E-Mail-Adresse
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={localContactEmail}
                  onChange={(e) => setLocalContactEmail(e.target.value)}
                  onBlur={commitChanges}
                  className="w-full rounded-lg border border-border py-2 pl-10 pr-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white"
                  placeholder="kontakt@polizei.de"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                Abteilung
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={localDepartment}
                  onChange={(e) => setLocalDepartment(e.target.value)}
                  onBlur={commitChanges}
                  className="w-full rounded-lg border border-border py-2 pl-10 pr-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white"
                  placeholder="z.B. Kriminalpolizei"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                Verfügbare Zeiten
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={localAvailableHours}
                  onChange={(e) => setLocalAvailableHours(e.target.value)}
                  onBlur={commitChanges}
                  className="w-full rounded-lg border border-border py-2 pl-10 pr-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white"
                  placeholder="Mo-Fr 8:00-16:00 Uhr"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Veröffentlichungseinstellungen */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-muted-foreground dark:text-white">
            Veröffentlichungseinstellungen
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                Veröffentlichungsstatus
              </label>
              <select
                value={data.publishStatus}
                onChange={(e) =>
                  onChange({
                    ...data,
                    publishStatus: e.target.value as Step5Data["publishStatus"],
                  })
                }
                className="w-full rounded-lg border border-border px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white"
              >
                <option value="draft">Entwurf</option>
                <option value="review">Zur Überprüfung</option>
                <option value="scheduled">Geplant</option>
                <option value="immediate">Sofort veröffentlichen</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                Dringlichkeitsstufe
              </label>
              <select
                value={data.urgencyLevel}
                onChange={(e) =>
                  onChange({
                    ...data,
                    urgencyLevel: e.target.value as Step5Data["urgencyLevel"],
                  })
                }
                className="w-full rounded-lg border border-border px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white"
              >
                <option value="low">Niedrig</option>
                <option value="medium">Mittel</option>
                <option value="high">Hoch</option>
                <option value="critical">Kritisch</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sichtbarkeit */}
        <div>
          <h4 className="mb-3 text-sm font-medium text-muted-foreground dark:text-muted-foreground">
            Sichtbarkeit
          </h4>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Object.entries(data.visibility).map(([key, value]) => (
              <label
                key={key}
                className="flex items-center space-x-2 rounded-lg border border-border p-3 hover:bg-muted dark:border-border dark:hover:bg-muted"
              >
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) =>
                    updateVisibility(
                      key as keyof Step5Data["visibility"],
                      e.target.checked,
                    )
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-muted-foreground dark:text-muted-foreground">
                  {key === "internal" && "Intern"}
                  {key === "regional" && "Regional"}
                  {key === "national" && "National"}
                  {key === "international" && "International"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Benachrichtigungen */}
        <div>
          <h4 className="mb-3 text-sm font-medium text-muted-foreground dark:text-muted-foreground">
            Benachrichtigungen
          </h4>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Object.entries(data.notifications).map(([key, value]) => (
              <label
                key={key}
                className="flex items-center space-x-2 rounded-lg border border-border p-3 hover:bg-muted dark:border-border dark:hover:bg-muted"
              >
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) =>
                    updateNotifications(
                      key as keyof Step5Data["notifications"],
                      e.target.checked,
                    )
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-muted-foreground dark:text-muted-foreground">
                  {key === "emailAlerts" && "E-Mail-Benachrichtigungen"}
                  {key === "smsAlerts" && "SMS-Benachrichtigungen"}
                  {key === "appNotifications" && "App-Benachrichtigungen"}
                  {key === "pressRelease" && "Pressemitteilung"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Artikel-Veröffentlichung */}
        <div>
          <h4 className="mb-3 text-sm font-medium text-muted-foreground dark:text-muted-foreground">
            Artikel-Veröffentlichung
          </h4>
          <div className="space-y-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={data.articlePublishing.publishAsArticle}
                onChange={(e) =>
                  onChange({
                    ...data,
                    articlePublishing: {
                      ...data.articlePublishing,
                      publishAsArticle: e.target.checked,
                    },
                  })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-muted-foreground dark:text-muted-foreground">
                Als Artikel veröffentlichen
              </span>
            </label>

            {data.articlePublishing.publishAsArticle && (
              <div className="space-y-4 rounded-lg border border-border p-4 dark:border-border">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                      SEO-Titel
                    </label>
                    <input
                      type="text"
                      value={data.articlePublishing.seoTitle ?? ""}
                      onChange={(e) =>
                        onChange({
                          ...data,
                          articlePublishing: {
                            ...data.articlePublishing,
                            seoTitle: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-lg border border-border px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white"
                      placeholder="SEO-optimierter Titel"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                      SEO-Beschreibung
                    </label>
                    <textarea
                      value={data.articlePublishing.seoDescription ?? ""}
                      onChange={(e) =>
                        onChange({
                          ...data,
                          articlePublishing: {
                            ...data.articlePublishing,
                            seoDescription: e.target.value,
                          },
                        })
                      }
                      rows={2}
                      className="w-full rounded-lg border border-border px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white"
                      placeholder="SEO-Beschreibung für Suchmaschinen"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                    Keywords
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addKeyword())
                      }
                      className="flex-1 rounded-lg border border-border px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white"
                      placeholder="Keyword eingeben..."
                    />
                    <button
                      type="button"
                      onClick={addKeyword}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      +
                    </button>
                  </div>
                  {data.articlePublishing.keywords.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {data.articlePublishing.keywords.map((keyword, index) => (
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
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info-Box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-500" />
          <div className="text-sm">
            <h4 className="font-medium text-blue-900 dark:text-blue-100">
              Veröffentlichungshinweise
            </h4>
            <ul className="mt-2 space-y-1 text-blue-800 dark:text-blue-200">
              <li>• Entwurf: Nur für interne Bearbeitung sichtbar</li>
              <li>• Zur Überprüfung: Wartet auf Freigabe</li>
              <li>
                • Geplant: Wird zu einem bestimmten Zeitpunkt veröffentlicht
              </li>
              <li>• Sofort: Wird sofort öffentlich verfügbar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5Component;
