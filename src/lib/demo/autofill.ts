import presets from "@/lib/demo/presets.json";
import type { PresetsShape } from "@/lib/demo/presets.types";
import type { WizardData } from "@/components/fahndungen/types/WizardTypes";
import { DEMO_DEFAULTS, resolvePlaceholders } from "@/lib/demo/helpers";

type PresetCategoryKey =
  | "Straftaeter"
  | "Vermisst"
  | "UnbekannteTote"
  | "Sachen";

function wizardToPresetCategory(
  cat: WizardData["step1"]["category"],
): PresetCategoryKey | null {
  switch (cat) {
    case "WANTED_PERSON":
      return "Straftaeter";
    case "MISSING_PERSON":
      return "Vermisst";
    case "UNKNOWN_DEAD":
      return "UnbekannteTote";
    case "STOLEN_GOODS":
      return "Sachen";
    default:
      return null;
  }
}

function extractCity(address?: string | null): string {
  if (!address) return "";
  const firstComma = address.split(",")[0]?.trim();
  return firstComma ?? address.trim();
}

export interface DemoOverrides {
  offenseType?: string; // e.g., Diebstahl, Raub, ...
  regionCity?: string; // preferred city name when no map location yet
  department?: string; // override department/dienststelle
}

function buildContext(
  data: Partial<WizardData>,
  overrides?: DemoOverrides,
): Record<string, string> {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const yyyy = now.getFullYear();
  const mmNum = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  let city =
    overrides?.regionCity ??
    data.step1?.regionCity ??
    extractCity(data.step4?.mainLocation?.address ?? "");

  // Fallback: wenn keine Karte/Region vorhanden ist, nutze die Dienststelle
  // als Stadt, sofern sie einer bekannten Stadt entspricht (alles außer LKA)
  if (!city || city.length === 0) {
    const dept = data.step1?.department ?? data.step5?.department ?? "";
    const knownCities = [
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
    ];
    if (knownCities.includes(dept)) {
      city = dept;
    }
  }
  return {
    city,
    dienststelle:
      overrides?.department ??
      data.step1?.department ??
      data.step5?.department ??
      DEMO_DEFAULTS.department,
    date: `${yyyy}-${mmNum}-${dd}`,
    time: `${hh}:${mm}`,
    caseNumber: data.step1?.caseNumber ?? "",
    amount: "1000",
    age: "35",
    height: "180",
    build: "schlanke",
    clothing: "dunkle Jacke, Jeans",
    itemBrand: "",
    model: "",
    serial: "",
    color: "",
    features: data.step2?.features ?? "",
    hintUrl: DEMO_DEFAULTS.hintUrl,
    phone: DEMO_DEFAULTS.phone,
    email: DEMO_DEFAULTS.email,
    locationDetail: "Innenstadt",
    tattoo: "Herz",
    personName: "Unbekannte Person",
    pronoun: "die Person",
  };
}

function pickFirst(arr?: string[]): string | null {
  if (!arr || arr.length === 0) return null;
  return arr[0] ?? null;
}

export function generateDemoTitle(
  data: Partial<WizardData>,
  overrides?: DemoOverrides,
): string {
  const catKey = wizardToPresetCategory(data.step1?.category ?? "");
  const ctx = buildContext(data, overrides);
  if (!catKey) return resolvePlaceholders("Fahndung – {city}", ctx);

  let template: string | null = null;
  const P: PresetsShape = presets as unknown as PresetsShape;
  if (catKey === "Vermisst") {
    // Wähle nach Variante, fallback auf Standard
    const variant = data.step1?.variant ?? "Standard";
    template =
      pickFirst(P.Vermisst?.[variant]?.Titel) ??
      pickFirst(P.Vermisst?.["Standard"]?.Titel);
  } else if (catKey === "Straftaeter") {
    const offense = overrides?.offenseType ?? "Diebstahl";
    template = pickFirst(P.Straftaeter?.[offense]?.Titel);
    if (!template && offense) {
      // Generischer Fallback, falls Variante noch nicht in presets vorhanden ist
      template = `${offense} in {city} – Zeugen gesucht`;
    }
  } else if (catKey === "UnbekannteTote") {
    const variant = data.step1?.variant ?? "Standard";
    template =
      pickFirst(P.UnbekannteTote?.[variant]?.Titel) ??
      pickFirst(P.UnbekannteTote?.["Standard"]?.Titel);
  } else if (catKey === "Sachen") {
    template = pickFirst(P.Sachen?.Fahrrad?.Titel);
  }
  return resolvePlaceholders(template ?? "Fahndung – {city}", ctx);
}

export function generateDemoShortDescription(
  data: Partial<WizardData>,
  overrides?: DemoOverrides,
): string {
  const catKey = wizardToPresetCategory(data.step1?.category ?? "");
  const ctx = buildContext(data, overrides);
  if (!catKey) return resolvePlaceholders("Kurzbeschreibung – {city}", ctx);
  let template: string | null = null;
  const P: PresetsShape = presets as unknown as PresetsShape;
  if (catKey === "Vermisst") {
    // Für Kurzbeschreibung nutzen wir die erste Zeile der Beschreibung
    const variant = data.step1?.variant ?? "Standard";
    template =
      pickFirst(P.Vermisst?.[variant]?.Beschreibung) ??
      pickFirst(P.Vermisst?.["Standard"]?.Beschreibung);
  } else if (catKey === "Straftaeter") {
    const offense = overrides?.offenseType ?? "Diebstahl";
    template = pickFirst(P.Straftaeter?.[offense]?.Beschreibung);
    if (!template && offense) {
      template = `Am {date} entwendete der unbekannte Täter in {city} Gegenstände. Kategorie: ${offense}.`;
    }
  } else if (catKey === "UnbekannteTote") {
    const variant = data.step1?.variant ?? "Standard";
    template =
      pickFirst(P.UnbekannteTote?.[variant]?.Beschreibung) ??
      pickFirst(P.UnbekannteTote?.["Standard"]?.Beschreibung);
  } else if (catKey === "Sachen") {
    template = pickFirst(P.Sachen?.Fahrrad?.Beschreibung);
  }
  return resolvePlaceholders(template ?? "Kurzbeschreibung – {city}", ctx);
}

export function generateDemoDescription(
  data: Partial<WizardData>,
  overrides?: DemoOverrides,
): string {
  // Für jetzt identisch zur ShortDescription; später können wir längere Textbausteine unterscheiden
  return generateDemoShortDescription(data, overrides);
}

export function fillContactDefaults(
  data: Partial<WizardData>,
): Partial<WizardData> {
  return {
    ...data,
    step5: {
      ...data.step5!,
      contactPerson: data.step5?.contactPerson ?? "KHK Müller",
      contactPhone: data.step5?.contactPhone ?? DEMO_DEFAULTS.phone,
      contactEmail: data.step5?.contactEmail ?? DEMO_DEFAULTS.email,
      department: data.step5?.department ?? DEMO_DEFAULTS.department,
      availableHours:
        data.step5?.availableHours ?? DEMO_DEFAULTS.availableHours,
    },
  } as Partial<WizardData>;
}
