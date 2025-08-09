"use client";

import React, { useState, useEffect } from "react";
import { useDebounce } from "~/hooks/useDebounce";
import { FileText, Wand2 } from "lucide-react";
import { getCategoryOptions } from "@/types/categories";
import { generateNewCaseNumber } from "~/lib/utils/caseNumberGenerator";
import type { Step1Data, WizardData } from "../types/WizardTypes";
import { generateDemoTitle } from "@/lib/demo/autofill";

interface Step1ComponentProps {
  data: Step1Data;
  onChange: (data: Step1Data) => void;
  wizard?: Partial<WizardData>;
  showValidation?: boolean;
}

const Step1Component: React.FC<Step1ComponentProps> = ({
  data,
  onChange,
  wizard,
  showValidation = false,
}) => {
  // Lokaler State für den Titel
  const [localTitle, setLocalTitle] = useState(data.title);
  const [titleTouched, setTitleTouched] = useState(false);
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [localVariant, setLocalVariant] = useState(data.variant);
  const [localDepartment, setLocalDepartment] = useState(data.department);
  const [localCaseDate, setLocalCaseDate] = useState<string>(data.caseDate);
  const [localPriority, setLocalPriority] = useState<Step1Data["priority"]>(
    data.priority,
  );
  const [localPriorityUntil, setLocalPriorityUntil] = useState<string>(
    data.priorityUntil ?? "",
  );

  // Debounced version of the title to reduce frequent state updates. When the
  // user stops typing for the specified delay, the debounced value changes
  // and we propagate it to the parent via onChange.
  const debouncedTitle = useDebounce(localTitle, 300);

  // Synchronisiere lokalen State mit data.title wenn sich data ändert
  useEffect(() => {
    setLocalTitle(data.title);
  }, [data.title]);

  useEffect(() => {
    setLocalVariant(data.variant);
  }, [data.variant]);

  // Stadt/Region wird nicht mehr in Step 1 geführt (liegt in Step 4)

  useEffect(() => {
    setLocalDepartment(data.department);
  }, [data.department]);

  useEffect(() => {
    setLocalCaseDate(data.caseDate);
  }, [data.caseDate]);

  useEffect(() => {
    setLocalPriority(data.priority);
  }, [data.priority]);

  useEffect(() => {
    setLocalPriorityUntil(data.priorityUntil ?? "");
  }, [data.priorityUntil]);

  // Propagate debounced title changes to the parent wizard. Only update
  // when the debounced value differs from the current data.title to
  // prevent unnecessary updates.
  useEffect(() => {
    if (debouncedTitle !== data.title) {
      onChange({ ...data, title: debouncedTitle });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTitle]);

  const generateCaseNumber = (category: string): string => {
    return generateNewCaseNumber(category as Step1Data["category"], "draft");
  };

  const handleCategoryChange = (category: string) => {
    onChange({
      ...data,
      category: category as Step1Data["category"],
      caseNumber: generateCaseNumber(category),
      variant: "",
    });
  };

  const isTitleInvalid =
    (showValidation || titleTouched) &&
    (localTitle.length < 5 || localTitle.length > 100);
  const isCategoryInvalid =
    (showValidation || categoryTouched) && !data.category;
  const isDepartmentInvalid = showValidation && !localDepartment;
  const isCaseDateInvalid = showValidation && !localCaseDate;
  const isVariantInvalid = showValidation && !localVariant;
  const isPriorityInvalid = showValidation && !localPriority;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-muted-foreground dark:text-white">
          Schritt 1: Grundinformationen
        </h2>
        <p className="text-muted-foreground dark:text-muted-foreground">
          Legen Sie die grundlegenden Informationen für die Fahndung fest
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* 1. Kategorie */}
        <div>
          <label
            className={`mb-1 block text-sm font-medium text-muted-foreground dark:text-muted-foreground ${
              isCategoryInvalid ? "underline decoration-red-500" : ""
            }`}
            style={
              isCategoryInvalid ? { textDecorationStyle: "wavy" } : undefined
            }
          >
            1. Kategorie *
          </label>
          <p className="mb-2 text-xs text-muted-foreground dark:text-muted-foreground">
            Bitte eine passende Kategorie auswählen.
          </p>
          <select
            value={data.category ?? ""}
            onChange={(e) => {
              if (!categoryTouched) setCategoryTouched(true);
              handleCategoryChange(e.target.value);
            }}
            onBlur={() => setCategoryTouched(true)}
            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 dark:border-border dark:bg-muted dark:text-white ${
              isCategoryInvalid
                ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                : "border-border focus:border-blue-500 focus:ring-blue-500"
            }`}
          >
            <option value="" disabled>
              Bitte Kategorie auswählen …
            </option>
            {getCategoryOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {isCategoryInvalid && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              Bitte eine Kategorie auswählen
            </p>
          )}
        </div>

        {/* 2. Dienststelle */}
        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
            2. Dienststelle
          </label>
          <select
            value={localDepartment}
            onChange={(e) => {
              setLocalDepartment(e.target.value);
              onChange({ ...data, department: e.target.value });
            }}
            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 dark:border-border dark:bg-muted dark:text-white ${
              isDepartmentInvalid
                ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                : "border-border focus:border-blue-500 focus:ring-blue-500"
            }`}
          >
            <option value="">Bitte Dienststelle auswählen …</option>
            {[
              "LKA",
              "Aalen",
              "Freiburg",
              "Heilbronn",
              "Karlsruhe",
              "Konstanz",
              "Ludwigsburg",
              "Mannheim",
              "Offenburg",
              "Pforzheim",
              "Ravensburg",
              "Reutlingen",
              "Stuttgart",
              "Ulm",
            ].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground dark:text-muted-foreground">
            Freie Eingabe später möglich (Schritt 5).
          </p>
        </div>

        {/* 3. Fahndungsdatum */}
        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
            3. Fahndungsdatum
          </label>
          <input
            type="date"
            value={localCaseDate}
            onChange={(e) => {
              setLocalCaseDate(e.target.value);
              onChange({ ...data, caseDate: e.target.value });
            }}
            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 dark:border-border dark:bg-muted dark:text-white ${
              isCaseDateInvalid
                ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                : "border-border focus:border-blue-500 focus:ring-blue-500"
            }`}
          />
          <p className="mt-1 text-xs text-muted-foreground dark:text-muted-foreground">
            Vergangenheit und Zukunft erlaubt.
          </p>
          {isCaseDateInvalid && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              Fahndungsdatum ist erforderlich
            </p>
          )}
        </div>

        {/* 4. Variante (je nach Kategorie) */}
        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
            4. Variante (je nach Kategorie)
          </label>
          <select
            value={localVariant}
            onChange={(e) => {
              setLocalVariant(e.target.value);
              onChange({ ...data, variant: e.target.value });
            }}
            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 dark:border-border dark:bg-muted dark:text-white ${
              isVariantInvalid
                ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                : "border-border focus:border-blue-500 focus:ring-blue-500"
            }`}
          >
            <option value="">Keine Auswahl</option>
            {data.category === "WANTED_PERSON" && (
              <>
                <option value="Diebstahl">Diebstahl</option>
                <option value="Raub">Raub</option>
                <option value="Betrug">Betrug</option>
                <option value="Koerperverletzung">Körperverletzung</option>
                <option value="Cybercrime">Cybercrime</option>
              </>
            )}
            {data.category === "STOLEN_GOODS" && (
              <>
                <option value="Fahrzeug">Fahrzeug</option>
                <option value="Fahrrad">Fahrrad</option>
                <option value="Elektronik">Elektronik</option>
                <option value="Schmuck">Schmuck</option>
              </>
            )}
            {data.category === "MISSING_PERSON" && (
              <>
                <option value="Standard">Standard</option>
                <option value="Kind">Kind</option>
                <option value="Senior">Senior</option>
              </>
            )}
            {data.category === "UNKNOWN_DEAD" && (
              <>
                <option value="Standard">Standard</option>
                <option value="Wasserfund">Wasserfund</option>
                <option value="Waldfund">Waldfund</option>
              </>
            )}
          </select>
          <p className="mt-1 text-xs text-muted-foreground dark:text-muted-foreground">
            Beeinflusst die Textbausteine für den Zauberstab.
          </p>
          {isVariantInvalid && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              Variante ist erforderlich
            </p>
          )}
        </div>

        {/* 5. Titel der Fahndung */}
        <div>
          <label
            className={`mb-1 block text-sm font-medium text-muted-foreground dark:text-muted-foreground ${
              isTitleInvalid ? "underline decoration-red-500" : ""
            }`}
            style={isTitleInvalid ? { textDecorationStyle: "wavy" } : undefined}
          >
            5. Titel der Fahndung *
          </label>
          <p className="mb-2 text-xs text-muted-foreground dark:text-muted-foreground">
            Bitte mindestens 5 und maximal 100 Zeichen eingeben.
          </p>
          <div className="relative">
            <input
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={() => setTitleTouched(true)}
              className={`w-full rounded-lg border px-3 py-2 pr-10 focus:outline-none focus:ring-1 dark:border-border dark:bg-muted dark:text-white ${
                isTitleInvalid
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                  : "border-border focus:border-blue-500 focus:ring-blue-500"
              }`}
              placeholder="z.B. Vermisste - Maria Schmidt"
              required
            />
            <button
              type="button"
              aria-label="Demo füllen"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"
              onClick={() => {
                const offense = localVariant || undefined;
                const demo = generateDemoTitle(
                  {
                    ...(wizard ?? {}),
                    step1: {
                      ...data,
                      variant: localVariant,
                      department: localDepartment,
                    },
                  },
                  {
                    offenseType: offense,
                    department: localDepartment || undefined,
                  },
                );
                setLocalTitle(demo);
                setTitleTouched(true);
              }}
            >
              <Wand2 className="h-4 w-4" />
            </button>
          </div>
          {isTitleInvalid && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              Titel muss 5–100 Zeichen lang sein
            </p>
          )}
        </div>

        {/* 6. Priorität * */}
        <div>
          <label
            className={`mb-1 block text-sm font-medium text-muted-foreground dark:text-muted-foreground ${
              isPriorityInvalid ? "underline decoration-red-500" : ""
            }`}
            style={
              isPriorityInvalid ? { textDecorationStyle: "wavy" } : undefined
            }
          >
            6. Priorität *
          </label>
          <p className="mb-2 text-xs text-muted-foreground dark:text-muted-foreground">
            Steuert Sichtbarkeit und Markierung. &quot;Neu&quot; wird standardmäßig 1 Tag
            markiert.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Platzhalter-Label für identische vertikale Ausrichtung */}
            <div>
              <label className="mb-1 block text-sm font-medium opacity-0">
                Priorität *
              </label>
              <select
                value={localPriority}
                onChange={(e) => {
                  const value = e.target.value as Step1Data["priority"];
                  setLocalPriority(value);
                  onChange({ ...data, priority: value });
                }}
                className={`h-11 min-h-[44px] w-full rounded-lg border px-3 py-2 leading-none focus:outline-none focus:ring-1 dark:border-border dark:bg-muted dark:text-white ${
                  isPriorityInvalid
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                    : "border-border focus:border-blue-500 focus:ring-blue-500"
                }`}
              >
                <option value="new">Neu</option>
                <option value="urgent">Dringend</option>
                <option value="normal">Standard</option>
              </select>
            </div>

            {/* Optional: 'Neu bis' nur sichtbar, wenn Priorität = new */}
            <div className={localPriority === "new" ? "" : "opacity-50"}>
              <label className="mb-1 block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                Neu bis (optional)
              </label>
              <input
                type="date"
                value={localPriorityUntil}
                onChange={(e) => {
                  setLocalPriorityUntil(e.target.value);
                  onChange({ ...data, priorityUntil: e.target.value });
                }}
                className="h-11 min-h-[44px] w-full rounded-lg border px-3 py-2 leading-none focus:outline-none focus:ring-1 dark:border-border dark:bg-muted dark:text-white"
                placeholder="yyyy-mm-dd"
              />
                  <p className="mt-1 text-xs text-muted-foreground dark:text-muted-foreground">
                    Leer lassen für Standard (1 Tag). Setze ein Datum, wenn die
                    &quot;Neu&quot;-Markierung länger gelten soll.
                  </p>
            </div>
          </div>
          {isPriorityInvalid && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              Priorität ist erforderlich
            </p>
          )}
        </div>

        {/* 6. Aktenzeichen (nur Anzeige, automatisch generiert) */}
        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
            7. Aktenzeichen
          </label>
          <p className="mb-2 text-xs text-muted-foreground dark:text-muted-foreground">
            Automatisch bei Kategorienwechsel; wird unten generiert.
          </p>
          <div className="w-full rounded-lg border border-border bg-muted px-3 py-2 font-mono text-muted-foreground dark:border-border dark:bg-muted dark:text-muted-foreground">
            {data.caseNumber || "Wird nach Kategorie-Auswahl erstellt"}
          </div>
        </div>

        {/* Entfernt: Stadt/Region Auswahl – Ort wird in Schritt 4 gesetzt */}

        {/* Aktenzeichen Info */}
        <div className="rounded-lg border border-border bg-muted p-4 dark:border-border dark:bg-muted">
          <div className="mb-2 flex items-center space-x-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
              Aktenzeichen Format:
            </span>
          </div>
          <div className="text-xs text-muted-foreground dark:text-muted-foreground">
            Format: [Präfix]-[Jahr]-[Monat]-[Nummer] | Wird automatisch bei
            Kategorieänderung generiert
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1Component;
