"use client";

import React, { useState } from "react";
import { User, Phone, Mail, Building, Clock, AlertCircle } from "lucide-react";

interface Step5Data {
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  department: string;
  availableHours: string;
  publishStatus: "draft" | "review" | "scheduled" | "immediate";
  urgencyLevel: "low" | "medium" | "high" | "critical";
  requiresApproval: boolean;
  visibility: {
    internal: boolean;
    regional: boolean;
    national: boolean;
    international: boolean;
  };
  notifications: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    appNotifications: boolean;
    pressRelease: boolean;
  };
  articlePublishing: {
    publishAsArticle: boolean;
    generateSeoUrl: boolean;
    customSlug?: string;
    seoTitle?: string;
    seoDescription?: string;
    keywords: string[];
    author?: string;
    readingTime?: number;
  };
}

interface Step5Props {
  data: Step5Data;
  onChange: (data: Step5Data) => void;
}

const Step5ContactPublication: React.FC<Step5Props> = ({ data, onChange }) => {
  const [keywordInput, setKeywordInput] = useState("");

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
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Schritt 5: Kontakt & Veröffentlichung
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Definieren Sie Kontaktdaten und Veröffentlichungseinstellungen
        </p>
      </div>

      {/* Kontaktdaten */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Ansprechpartner
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Kontaktperson *
            </label>
            <div className="relative">
              <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={data.contactPerson}
                onChange={(e) =>
                  onChange({ ...data, contactPerson: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Name der Kontaktperson"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Telefonnummer *
            </label>
            <div className="relative">
              <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={data.contactPhone}
                onChange={(e) =>
                  onChange({ ...data, contactPhone: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="+49 711 8990-0"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              E-Mail
            </label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={data.contactEmail}
                onChange={(e) =>
                  onChange({ ...data, contactEmail: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="kontakt@polizei.de"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Abteilung
            </label>
            <div className="relative">
              <Building className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={data.department}
                onChange={(e) =>
                  onChange({ ...data, department: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Polizeipräsidium"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Verfügbare Zeiten
          </label>
          <div className="relative">
            <Clock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={data.availableHours}
              onChange={(e) =>
                onChange({ ...data, availableHours: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Mo-Fr 8:00-16:00 Uhr"
            />
          </div>
        </div>
      </div>

      {/* Veröffentlichungseinstellungen */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Veröffentlichungseinstellungen
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="draft">Entwurf (nicht öffentlich)</option>
              <option value="review">Zur Überprüfung</option>
              <option value="scheduled">Geplant</option>
              <option value="immediate">Sofort veröffentlichen</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="low">Niedrig</option>
              <option value="medium">Mittel</option>
              <option value="high">Hoch</option>
              <option value="critical">Kritisch</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="requiresApproval"
            checked={data.requiresApproval}
            onChange={(e) =>
              onChange({ ...data, requiresApproval: e.target.checked })
            }
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
          />
          <label
            htmlFor="requiresApproval"
            className="text-sm text-gray-700 dark:text-gray-300"
          >
            Genehmigung erforderlich
          </label>
        </div>
      </div>

      {/* Sichtbarkeit */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Sichtbarkeit
        </h3>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="internal"
              checked={data.visibility.internal}
              onChange={(e) => updateVisibility("internal", e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
            />
            <label
              htmlFor="internal"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Intern
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="regional"
              checked={data.visibility.regional}
              onChange={(e) => updateVisibility("regional", e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
            />
            <label
              htmlFor="regional"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Regional
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="national"
              checked={data.visibility.national}
              onChange={(e) => updateVisibility("national", e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
            />
            <label
              htmlFor="national"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              National
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="international"
              checked={data.visibility.international}
              onChange={(e) =>
                updateVisibility("international", e.target.checked)
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
            />
            <label
              htmlFor="international"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              International
            </label>
          </div>
        </div>
      </div>

      {/* Benachrichtigungen */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Benachrichtigungen
        </h3>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="emailAlerts"
              checked={data.notifications.emailAlerts}
              onChange={(e) =>
                updateNotifications("emailAlerts", e.target.checked)
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
            />
            <label
              htmlFor="emailAlerts"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              E-Mail Alerts
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="smsAlerts"
              checked={data.notifications.smsAlerts}
              onChange={(e) =>
                updateNotifications("smsAlerts", e.target.checked)
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
            />
            <label
              htmlFor="smsAlerts"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              SMS Alerts
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="appNotifications"
              checked={data.notifications.appNotifications}
              onChange={(e) =>
                updateNotifications("appNotifications", e.target.checked)
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
            />
            <label
              htmlFor="appNotifications"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              App Benachrichtigungen
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="pressRelease"
              checked={data.notifications.pressRelease}
              onChange={(e) =>
                updateNotifications("pressRelease", e.target.checked)
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
            />
            <label
              htmlFor="pressRelease"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Pressemitteilung
            </label>
          </div>
        </div>
      </div>

      {/* Artikel-Veröffentlichung */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Artikel-Veröffentlichung
        </h3>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="publishAsArticle"
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
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
          />
          <label
            htmlFor="publishAsArticle"
            className="text-sm text-gray-700 dark:text-gray-300"
          >
            Als Artikel veröffentlichen
          </label>
        </div>

        {data.articlePublishing.publishAsArticle && (
          <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="SEO-optimierter Titel"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="SEO-Beschreibung (max. 160 Zeichen)"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Keyword hinzufügen..."
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Hinzufügen
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

      {/* Hilfe & Tipps */}
      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h4 className="mb-1 text-sm font-medium text-blue-800 dark:text-blue-200">
              Tipps für Kontakt & Veröffentlichung
            </h4>
            <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
              <li>• Geben Sie vollständige Kontaktdaten für Rückfragen an</li>
              <li>• Wählen Sie die passende Dringlichkeitsstufe</li>
              <li>• Definieren Sie die gewünschte Sichtbarkeit</li>
              <li>• Artikel-Veröffentlichung ermöglicht SEO-Optimierung</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5ContactPublication;
