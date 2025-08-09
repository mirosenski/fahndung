export const CATEGORY_MAP = {
  Straftaeter: "WANTED_PERSON",
  Vermisst: "MISSING_PERSON",
  Vermisste: "MISSING_PERSON",
  UnbekannteTote: "UNKNOWN_DEAD",
  Sachen: "STOLEN_GOODS",
} as const;

export const PRIORITY_MAP = {
  Dringend: "urgent",
  "Sehr hoch": "urgent",
  Hoch: "high",
  Normal: "normal",
  Niedrig: "normal",
} as const;

export function pronounOf(sex?: "m" | "w"): "er" | "sie" | "die Person" {
  if (sex === "m") return "er";
  if (sex === "w") return "sie";
  return "die Person";
}

export const DEMO_DEFAULTS = {
  phone: "+49 711 899-0000",
  email: "hinweise@polizei-bw.de",
  hintUrl: "https://hinweisportal.polizei-bw.de",
  department: "Polizeipräsidium Stuttgart",
  availableHours: "Mo–Fr 08:00–18:00",
};

export type PlaceholderContext = Record<
  string,
  string | number | undefined | null
>;

export function resolvePlaceholders(
  template: string,
  ctx: PlaceholderContext,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = ctx[key];
    return value !== undefined && value !== null && String(value).length > 0
      ? String(value)
      : "";
  });
}



