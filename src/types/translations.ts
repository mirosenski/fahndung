// Zentrale Übersetzungslogik für das gesamte System
// Diese Datei definiert alle Übersetzungen für Kategorien und Prioritäten

// Kategorien
export const CATEGORIES = {
  WANTED_PERSON: "Straftäter",
  MISSING_PERSON: "Vermisste",
  UNKNOWN_DEAD: "unbekannte Tote",
  STOLEN_GOODS: "Sachen",
} as const;

// Prioritäten
export const PRIORITIES = {
  urgent: "DRINGEND",
  new: "NEU",
  normal: "NORMAL",
} as const;

// Status
export const STATUS = {
  published: "VERÖFFENTLICHT",
  active: "AKTIV",
  draft: "ENTWURF",
  closed: "GESCHLOSSEN",
} as const;

// Hilfsfunktionen
export const getCategoryLabel = (key: string): string =>
  CATEGORIES[key as keyof typeof CATEGORIES] ?? key;

export const getPriorityLabel = (key: string): string =>
  PRIORITIES[key as keyof typeof PRIORITIES] ?? key;

export const getStatusLabel = (key: string): string =>
  STATUS[key as keyof typeof STATUS] ?? key;

// Universelle Übersetzungsfunktion
export const translateLabel = (content: string): string => {
  // Prüfe ob es eine Kategorie ist
  if (Object.keys(CATEGORIES).includes(content)) {
    return getCategoryLabel(content);
  }
  // Prüfe ob es eine Priorität ist
  if (Object.keys(PRIORITIES).includes(content)) {
    return getPriorityLabel(content);
  }
  // Prüfe ob es ein Status ist
  if (Object.keys(STATUS).includes(content)) {
    return getStatusLabel(content);
  }
  // Fallback: Gib den ursprünglichen Text zurück
  return content;
};

// Typen für TypeScript
export type CategoryKey = keyof typeof CATEGORIES;
export type PriorityKey = keyof typeof PRIORITIES;
export type StatusKey = keyof typeof STATUS;
