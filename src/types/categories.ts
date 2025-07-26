// Zentrale Kategorie-Definition für das gesamte System
// Diese Datei definiert alle Kategorien und ihre deutschen Labels

import { CATEGORIES } from "./translations";

export const INVESTIGATION_CATEGORIES = CATEGORIES;

export type InvestigationCategory = keyof typeof INVESTIGATION_CATEGORIES;

// Helper-Funktionen für Kategorien
export const getCategoryLabel = (category: string): string => {
  return (
    INVESTIGATION_CATEGORIES[category as InvestigationCategory] ?? category
  );
};

export const getCategoryStyles = (category: string): string => {
  const styles: Record<string, string> = {
    WANTED_PERSON:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    MISSING_PERSON:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    UNKNOWN_DEAD:
      "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
    STOLEN_GOODS:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  };
  return styles[category] ?? "bg-gray-100 text-gray-800";
};

// Kategorie-Optionen für Select-Felder
export const getCategoryOptions = () => [
  { value: "MISSING_PERSON", label: "Vermisste" },
  { value: "WANTED_PERSON", label: "Straftäter" },
  { value: "UNKNOWN_DEAD", label: "unbekannte Tote" },
  { value: "STOLEN_GOODS", label: "Sachen" },
];

// Validierung für Kategorien
export const isValidCategory = (
  category: string,
): category is InvestigationCategory => {
  return Object.keys(INVESTIGATION_CATEGORIES).includes(category);
};
