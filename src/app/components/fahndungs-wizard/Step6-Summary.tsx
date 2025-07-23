"use client";

import { useState } from "react";
import {
  FileText,
  Eye,
  CreditCard,
  Edit2,
  Check,
  AlertCircle,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Image as ImageIcon,
  Download,
  Printer,
} from "lucide-react";
import dynamic from "next/dynamic";
import type {
  Step1Data,
  Step2Data,
  Step3Data,
  Step4Data,
  Step5Data,
} from "@/types/fahndung-wizard";

// Dynamischer Import für die Karte
const InteractiveMap = dynamic(
  () => import("@/components/shared/InteractiveMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse rounded-lg bg-gray-100" />
    ),
  },
);

interface Step6Props {
  data: {
    step1: Step1Data;
    step2: Step2Data;
    step3: Step3Data;
    step4: Step4Data;
    step5: Step5Data;
  };
  onUpdate: (
    step: string,
    data: Step1Data | Step2Data | Step3Data | Step4Data | Step5Data,
  ) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export default function Step6Summary({
  data,
  onUpdate,
  onSubmit,
  onBack,
  isSubmitting,
}: Step6Props) {
  const [activeTab, setActiveTab] = useState<"summary" | "preview" | "card">(
    "summary",
  );
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Helper für Kategorie-Labels
  const categoryLabels = {
    WANTED_PERSON: "Straftäter",
    MISSING_PERSON: "Vermisste Person",
    UNKNOWN_DEAD: "Unbekannte Tote",
    STOLEN_GOODS: "Sachen",
  };

  // Tab 1: Zusammenfassung mit Bearbeitungsmöglichkeit
  const renderSummaryTab = () => (
    <div className="space-y-6">
      {/* Basis-Informationen */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Basis-Informationen</h3>
          <button
            onClick={() =>
              setEditingSection(editingSection === "basic" ? null : "basic")
            }
            className="text-blue-600 hover:text-blue-700"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        </div>

        {editingSection === "basic" ? (
          <div className="space-y-3">
            <input
              type="text"
              value={data.step1.title}
              onChange={(e) =>
                onUpdate("step1", { ...data.step1, title: e.target.value })
              }
              className="w-full rounded-md border px-3 py-2"
            />
            <select
              value={data.step1.category}
              onChange={(e) =>
                onUpdate("step1", {
                  ...data.step1,
                  category: e.target.value as
                    | "WANTED_PERSON"
                    | "MISSING_PERSON"
                    | "UNKNOWN_DEAD"
                    | "STOLEN_GOODS",
                })
              }
              className="w-full rounded-md border px-3 py-2"
            >
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setEditingSection(null)}
              className="rounded bg-green-500 px-3 py-1 text-sm text-white"
            >
              Speichern
            </button>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <p>
              <strong>Titel:</strong> {data.step1.title}
            </p>
            <p>
              <strong>Aktenzeichen:</strong> {data.step1.caseNumber}
            </p>
            <p>
              <strong>Kategorie:</strong> {categoryLabels[data.step1.category]}
            </p>
          </div>
        )}
      </div>

      {/* Beschreibung */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Beschreibung</h3>
          <button
            onClick={() =>
              setEditingSection(
                editingSection === "description" ? null : "description",
              )
            }
            className="text-blue-600 hover:text-blue-700"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        </div>

        {editingSection === "description" ? (
          <div className="space-y-3">
            <textarea
              value={data.step2.shortDescription}
              onChange={(e) =>
                onUpdate("step2", {
                  ...data.step2,
                  shortDescription: e.target.value,
                })
              }
              className="w-full rounded-md border px-3 py-2"
              rows={3}
            />
            <textarea
              value={data.step2.description}
              onChange={(e) =>
                onUpdate("step2", {
                  ...data.step2,
                  description: e.target.value,
                })
              }
              className="w-full rounded-md border px-3 py-2"
              rows={5}
            />
            <button
              onClick={() => setEditingSection(null)}
              className="rounded bg-green-500 px-3 py-1 text-sm text-white"
            >
              Speichern
            </button>
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium">Kurzbeschreibung:</p>
              <p className="text-gray-600">{data.step2.shortDescription}</p>
            </div>
            <div>
              <p className="font-medium">Ausführliche Beschreibung:</p>
              <p className="text-gray-600">{data.step2.description}</p>
            </div>
            <div>
              <p className="font-medium">Priorität:</p>
              <span
                className={`inline-block rounded px-2 py-1 text-xs ${
                  data.step2.priority === "urgent"
                    ? "bg-red-100 text-red-800"
                    : data.step2.priority === "new"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {data.step2.priority}
              </span>
            </div>
            {data.step2.tags.length > 0 && (
              <div>
                <p className="font-medium">Tags:</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {data.step2.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-gray-100 px-2 py-1 text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bilder & Dokumente */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">Bilder & Dokumente</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="flex items-center font-medium">
              <ImageIcon className="mr-2 h-4 w-4" />
              Hauptbild:
            </p>
            <p className="text-gray-600">
              {data.step3.mainImage ? "✓ Hochgeladen" : "✗ Fehlt"}
            </p>
          </div>
          <div>
            <p className="font-medium">Weitere Bilder:</p>
            <p className="text-gray-600">
              {data.step3.additionalImages.length} Dateien
            </p>
          </div>
          <div>
            <p className="font-medium">Dokumente:</p>
            <p className="text-gray-600">{data.step3.documents.length} PDFs</p>
          </div>
        </div>
      </div>

      {/* Orte */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">Orte & Karte</h3>
        <div className="space-y-3 text-sm">
          {data.step4.mainLocation && (
            <div>
              <p className="flex items-center font-medium">
                <MapPin className="mr-2 h-4 w-4" />
                Hauptort:
              </p>
              <p className="text-gray-600">{data.step4.mainLocation.address}</p>
            </div>
          )}
          <p>
            <strong>Weitere Orte:</strong>{" "}
            {data.step4.additionalLocations.length} markiert
          </p>
          <p>
            <strong>Suchradius:</strong> {data.step4.searchRadius} km
          </p>
        </div>
      </div>

      {/* Kontakt & Veröffentlichung */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">
          Kontakt & Veröffentlichung
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium">Ansprechpartner:</p>
            <p className="text-gray-600">{data.step5.contactPerson}</p>
            <p className="text-gray-600">{data.step5.department}</p>
          </div>
          <div>
            <p className="font-medium">Kontakt:</p>
            <p className="flex items-center text-gray-600">
              <Phone className="mr-1 h-3 w-3" />
              {data.step5.contactPhone}
            </p>
            {data.step5.contactEmail && (
              <p className="flex items-center text-gray-600">
                <Mail className="mr-1 h-3 w-3" />
                {data.step5.contactEmail}
              </p>
            )}
          </div>
          <div>
            <p className="font-medium">Status:</p>
            <p className="text-gray-600">{data.step5.publishStatus}</p>
          </div>
          <div>
            <p className="font-medium">Dringlichkeit:</p>
            <p
              className={`font-semibold ${
                data.step5.urgencyLevel === "critical"
                  ? "text-red-600"
                  : data.step5.urgencyLevel === "high"
                    ? "text-orange-600"
                    : data.step5.urgencyLevel === "medium"
                      ? "text-yellow-600"
                      : "text-gray-600"
              }`}
            >
              {data.step5.urgencyLevel.toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Tab 2: Vorschau der Detailseite
  const renderPreviewTab = () => (
    <div className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-lg">
      {/* Header */}
      <div className="mb-6 border-b pb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">{data.step1.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <FileText className="mr-1 h-4 w-4" />
                {data.step1.caseNumber}
              </span>
              <span className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                {new Date().toLocaleDateString("de-DE")}
              </span>
              <span
                className={`rounded px-2 py-1 text-xs font-medium ${
                  data.step2.priority === "urgent"
                    ? "bg-red-100 text-red-800"
                    : data.step2.priority === "new"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {data.step2.priority === "urgent"
                  ? "DRINGEND"
                  : data.step2.priority === "new"
                    ? "NEU"
                    : "NORMAL"}
              </span>
            </div>
          </div>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
            {categoryLabels[data.step1.category]}
          </span>
        </div>
      </div>

      {/* Hauptbild */}
      {data.step3.mainImage && (
        <div className="mb-8">
          <div className="flex h-96 items-center justify-center rounded-lg bg-gray-200">
            <ImageIcon className="h-24 w-24 text-gray-400" />
            <span className="ml-4 text-gray-500">
              Hauptbild wird hier angezeigt
            </span>
          </div>
        </div>
      )}

      {/* Beschreibung */}
      <div className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">Beschreibung</h2>
        <p className="mb-4 text-lg text-gray-700">
          {data.step2.shortDescription}
        </p>
        <p className="whitespace-pre-wrap text-gray-600">
          {data.step2.description}
        </p>
      </div>

      {/* Karte */}
      {data.step4.mainLocation && (
        <div className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">Relevante Orte</h2>
          <div className="h-64 overflow-hidden rounded-lg border">
            <InteractiveMap
              locations={[
                data.step4.mainLocation,
                ...data.step4.additionalLocations,
              ]}
              height="256px"
              showRadius={true}
              searchRadius={data.step4.searchRadius}
              editable={false}
              showSearch={false}
            />
          </div>
        </div>
      )}

      {/* Kontakt */}
      <div className="rounded-lg bg-gray-50 p-6">
        <h2 className="mb-3 text-xl font-semibold">Kontakt</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="font-medium">{data.step5.contactPerson}</p>
            <p className="text-gray-600">{data.step5.department}</p>
          </div>
          <div className="space-y-2">
            <p className="flex items-center text-gray-600">
              <Phone className="mr-2 h-4 w-4" />
              {data.step5.contactPhone}
            </p>
            {data.step5.contactEmail && (
              <p className="flex items-center text-gray-600">
                <Mail className="mr-2 h-4 w-4" />
                {data.step5.contactEmail}
              </p>
            )}
            <p className="text-sm text-gray-500">{data.step5.availableHours}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Tab 3: Fahndungskarte (Vorder- und Rückseite)
  const renderCardTab = () => (
    <div className="space-y-8">
      {/* Vorderseite */}
      <div className="mx-auto max-w-2xl rounded-lg border-2 border-gray-300 bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h2 className="mb-1 text-2xl font-bold">FAHNDUNG</h2>
          <p className="text-sm text-gray-600">
            {categoryLabels[data.step1.category]}
          </p>
        </div>

        {/* Bild-Platzhalter */}
        <div className="mb-6 flex h-64 items-center justify-center rounded-lg bg-gray-200">
          <ImageIcon className="h-20 w-20 text-gray-400" />
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-bold">{data.step1.title}</h3>
            <p className="mt-1 text-sm text-gray-600">
              Aktenzeichen: {data.step1.caseNumber}
            </p>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-700">
              {data.step2.shortDescription}
            </p>
          </div>

          {data.step2.priority === "urgent" && (
            <div className="rounded border border-red-300 bg-red-100 p-3 text-center">
              <p className="font-bold text-red-800">DRINGEND</p>
            </div>
          )}

          <div className="rounded bg-gray-100 p-4 text-center">
            <p className="text-sm font-medium">
              Bei Hinweisen wenden Sie sich an:
            </p>
            <p className="font-bold">{data.step5.contactPhone}</p>
          </div>
        </div>
      </div>

      {/* Rückseite */}
      <div className="mx-auto max-w-2xl rounded-lg border-2 border-gray-300 bg-white p-8 shadow-xl">
        <h3 className="mb-4 text-lg font-bold">Weitere Informationen</h3>

        <div className="space-y-4 text-sm">
          <div>
            <p className="mb-2 font-medium">Beschreibung:</p>
            <p className="text-gray-700">
              {data.step2.description.substring(0, 300)}...
            </p>
          </div>

          {data.step4.mainLocation && (
            <div>
              <p className="mb-2 font-medium">Zuletzt gesehen:</p>
              <p className="text-gray-700">{data.step4.mainLocation.address}</p>
            </div>
          )}

          <div className="border-t pt-4">
            <p className="mb-2 font-medium">Kontakt:</p>
            <p>{data.step5.contactPerson}</p>
            <p>{data.step5.department}</p>
            <p>{data.step5.contactPhone}</p>
            {data.step5.contactEmail && <p>{data.step5.contactEmail}</p>}
          </div>

          <div className="rounded bg-gray-100 p-3 text-center text-xs">
            <p>Erstellt am: {new Date().toLocaleDateString("de-DE")}</p>
            <p className="mt-1 font-mono">{data.step1.caseNumber}</p>
          </div>
        </div>
      </div>

      {/* Aktionen */}
      <div className="flex justify-center space-x-4">
        <button className="flex items-center rounded bg-gray-100 px-4 py-2 hover:bg-gray-200">
          <Download className="mr-2 h-4 w-4" />
          Als PDF speichern
        </button>
        <button className="flex items-center rounded bg-gray-100 px-4 py-2 hover:bg-gray-200">
          <Printer className="mr-2 h-4 w-4" />
          Drucken
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Zusammenfassung & Abschluss</h2>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "summary", label: "Zusammenfassung", icon: FileText },
            { id: "preview", label: "Vorschau Detailseite", icon: Eye },
            { id: "card", label: "Fahndungskarte", icon: CreditCard },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id as "summary" | "preview" | "card")
              }
              className={`flex items-center space-x-2 border-b-2 px-1 py-3 text-sm font-medium ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === "summary" && renderSummaryTab()}
        {activeTab === "preview" && renderPreviewTab()}
        {activeTab === "card" && renderCardTab()}
      </div>

      {/* Veröffentlichungsinfo */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start">
          <AlertCircle className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div>
            <h4 className="mb-2 font-medium text-blue-800">
              Veröffentlichungsstatus
            </h4>
            <p className="text-sm text-blue-700">
              Diese Fahndung wird als{" "}
              <strong>{data.step5.publishStatus}</strong> gespeichert.
              {data.step5.publishStatus === "scheduled" &&
                data.step5.publishDate && (
                  <>
                    {" "}
                    Geplante Veröffentlichung am{" "}
                    {new Date(data.step5.publishDate).toLocaleDateString(
                      "de-DE",
                    )}
                    .
                  </>
                )}
              {data.step5.requiresApproval && (
                <> Eine Freigabe durch einen Vorgesetzten ist erforderlich.</>
              )}
            </p>
          </div>
        </div>
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
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex items-center rounded-lg bg-green-600 px-6 py-3 text-lg font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="mr-3 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
              Wird gespeichert...
            </>
          ) : (
            <>
              <Check className="mr-2 h-5 w-5" />
              Fahndung abschließen
            </>
          )}
        </button>
      </div>
    </div>
  );
}
