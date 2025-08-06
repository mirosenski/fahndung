"use client";

import React from "react";
import { Info, Calendar, Eye, User, Shield, Clock } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { CaseNumberDetailed } from "~/components/ui/CaseNumberDisplay";

import type { UIInvestigationData } from "~/lib/types/investigation.types";

interface OverviewCategoryProps {
  data: UIInvestigationData;
  isEditMode: boolean;
  updateField: (
    step: keyof UIInvestigationData,
    field: string,
    value: unknown,
  ) => void;
  onNext: () => void;
}

export default function OverviewCategory({
  data,
  isEditMode,
  updateField,
  onNext,
}: OverviewCategoryProps) {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10">
          <div className="mb-4 flex items-center gap-2">
            {isEditMode ? (
              <>
                <Select
                  value={data.step1.category}
                  onValueChange={(value) =>
                    updateField("step1", "category", value)
                  }
                >
                  <SelectTrigger className="w-auto border-white/30 bg-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MISSING_PERSON">Vermisste</SelectItem>
                    <SelectItem value="WANTED_PERSON">Straftäter</SelectItem>
                    <SelectItem value="UNKNOWN_DEAD">
                      Unbekannte Tote
                    </SelectItem>
                    <SelectItem value="STOLEN_GOODS">Sachen</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={data.step2.priority}
                  onValueChange={(value) =>
                    updateField("step2", "priority", value)
                  }
                >
                  <SelectTrigger className="w-auto border-white/30 bg-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Dringend</SelectItem>
                    <SelectItem value="new">Neu</SelectItem>
                  </SelectContent>
                </Select>
              </>
            ) : (
              <>
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                  {data.step1.category === "MISSING_PERSON"
                    ? "Vermisste"
                    : data.step1.category === "WANTED_PERSON"
                      ? "Straftäter"
                      : data.step1.category === "UNKNOWN_DEAD"
                        ? "Unbekannte Tote"
                        : "Sachen"}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    data.step2.priority === "urgent"
                      ? "bg-red-500/20 text-red-100"
                      : data.step2.priority === "new"
                        ? "bg-green-500/20 text-green-100"
                        : "bg-gray-500/20 text-gray-100"
                  }`}
                >
                  {data.step2.priority === "urgent"
                    ? "Dringend"
                    : data.step2.priority === "new"
                      ? "Neu"
                      : "Normal"}
                </span>
              </>
            )}
          </div>

          {isEditMode ? (
            <Input
              value={data.step1.title}
              onChange={(e) => updateField("step1", "title", e.target.value)}
              className="mb-2 border-white/30 bg-white/10 text-3xl font-bold text-white placeholder-white/70"
              placeholder="Titel eingeben..."
            />
          ) : (
            <h1 className="mb-2 text-3xl font-bold">{data.step1.title}</h1>
          )}

          {isEditMode ? (
            <Textarea
              value={data.step2.shortDescription}
              onChange={(e) =>
                updateField("step2", "shortDescription", e.target.value)
              }
              className="border-white/30 bg-white/10 text-lg text-blue-100 placeholder-white/70"
              placeholder="Kurze Beschreibung..."
              rows={2}
            />
          ) : (
            <p className="text-lg text-blue-100">
              {data.step2.shortDescription}
            </p>
          )}

          <div className="mt-4 flex items-center gap-4 text-sm text-blue-100">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date().toLocaleDateString("de-DE")}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />0 Aufrufe
            </span>
          </div>
        </div>
      </div>

      {/* Case Number */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <CaseNumberDetailed caseNumber={data.step1.caseNumber ?? ""} />
      </div>

      {/* Quick Actions */}
      {isEditMode && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Schnellaktionen
          </h3>
          <div className="flex gap-3">
            <Button onClick={onNext} className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Zur Beschreibung
            </Button>
          </div>
        </div>
      )}

      {/* Contact Information Preview */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Kontakt (Vorschau)
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">
              {data.step5.contactPerson || "Nicht angegeben"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">
              {data.step5.department || "Nicht angegeben"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">
              {data.step5.availableHours || "Nicht angegeben"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
