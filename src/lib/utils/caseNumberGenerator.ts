// src/lib/utils/caseNumberGenerator.ts
// Utility für die Generierung von strukturierten Aktennummern

export interface CaseNumberConfig {
  authority: string; // 3 Zeichen (z.B. "POL")
  year: number; // 4 Zeichen (z.B. 2024)
  subject: string; // 2 Zeichen (z.B. "ST", "K", "V")
  sequence: number; // 6 Zeichen mit führenden Nullen
  status: "A" | "G" | "Ü"; // A=Aktiv, G=Geschlossen, Ü=Übertragen
}

export type SubjectMapping = Record<string, string>;

// Mapping von Kategorien zu Sachgebieten
export const CATEGORY_TO_SUBJECT: SubjectMapping = {
  WANTED_PERSON: "K", // Kriminal
  MISSING_PERSON: "K", // Kriminal
  UNKNOWN_DEAD: "K", // Kriminal
  STOLEN_GOODS: "K", // Kriminal
  // Weitere Mappings können hier hinzugefügt werden
};

// Mapping von Status zu Status-Code
export const STATUS_TO_CODE: Record<string, "A" | "G" | "Ü"> = {
  draft: "A",
  active: "A",
  published: "A",
  closed: "G",
  transferred: "Ü",
};

/**
 * Generiert eine strukturierte Aktennummer
 * Format: [BEHÖRDE]-[JAHR]-[SACHGEBIET]-[LAUFNUMMER]-[STATUS]
 * Beispiel: POL-2024-ST-001234-A
 */
export function generateCaseNumber(config: CaseNumberConfig): string {
  const { authority, year, subject, sequence, status } = config;

  // Validierung
  if (authority.length !== 3) {
    throw new Error("Behördenkürzel muss genau 3 Zeichen haben");
  }

  if (year < 2000 || year > 2100) {
    throw new Error("Jahr muss zwischen 2000 und 2100 liegen");
  }

  if (subject.length !== 1) {
    throw new Error("Sachgebiet muss genau 1 Zeichen haben");
  }

  if (sequence < 1 || sequence > 999999) {
    throw new Error("Laufende Nummer muss zwischen 1 und 999999 liegen");
  }

  // Formatierung
  const formattedSequence = sequence.toString().padStart(6, "0");
  const formattedYear = year.toString();

  return `${authority}-${formattedYear}-${subject}-${formattedSequence}-${status}`;
}

/**
 * Parst eine bestehende Aktennummer
 */
export function parseCaseNumber(caseNumber: string): CaseNumberConfig | null {
  const regex = /^([A-Z]{3})-(\d{4})-([A-Z])-(\d{6})-([AGÜ])$/;
  const match = regex.exec(caseNumber);

  if (!match) {
    return null;
  }

  const [, authority, year, subject, sequence, status] = match;

  return {
    authority: authority!,
    year: parseInt(year!, 10),
    subject: subject!,
    sequence: parseInt(sequence!, 10),
    status: status as "A" | "G" | "Ü",
  };
}

/**
 * Generiert eine neue Aktennummer basierend auf Kategorie und Status
 */
export function generateNewCaseNumber(
  category: string,
  status: string,
  authority = "POL",
  currentYear?: number,
): string {
  const year = currentYear ?? new Date().getFullYear();
  const subject = CATEGORY_TO_SUBJECT[category] ?? "K";
  const statusCode = STATUS_TO_CODE[status] ?? "A";

  // Für die Demo verwenden wir eine zufällige Sequenz
  // In der Produktion würde hier eine Datenbankabfrage stehen
  const sequence = Math.floor(Math.random() * 999999) + 1;

  return generateCaseNumber({
    authority,
    year,
    subject,
    sequence,
    status: statusCode,
  });
}

/**
 * Generiert eine neue Aktennummer mit automatischer Sequenz-Bestimmung
 * Diese Funktion sollte in der Produktion verwendet werden
 */
export async function generateNewCaseNumberWithSequence(
  category: string,
  status: string,
  authority = "POL",
  currentYear?: number,
  getNextSequence?: (year: number, subject: string) => Promise<number>,
): Promise<string> {
  const year = currentYear ?? new Date().getFullYear();
  const subject = CATEGORY_TO_SUBJECT[category] ?? "K";
  const statusCode = STATUS_TO_CODE[status] ?? "A";

  let sequence: number;

  if (getNextSequence) {
    // Verwende die bereitgestellte Funktion für die Sequenz
    sequence = await getNextSequence(year, subject);
  } else {
    // Fallback: Zufällige Sequenz für Demo
    sequence = Math.floor(Math.random() * 999999) + 1;
  }

  return generateCaseNumber({
    authority,
    year,
    subject,
    sequence,
    status: statusCode,
  });
}

/**
 * Validiert eine Aktennummer
 */
export function validateCaseNumber(caseNumber: string): boolean {
  return parseCaseNumber(caseNumber) !== null;
}

/**
 * Extrahiert Informationen aus einer Aktennummer
 */
export function getCaseNumberInfo(caseNumber: string) {
  const parsed = parseCaseNumber(caseNumber);
  if (!parsed) {
    return null;
  }

  const subjectLabels: Record<string, string> = {
    ST: "Staatsschutz",
    K: "Kriminal",
    V: "Verkehr",
  };

  const statusLabels: Record<string, string> = {
    A: "Aktiv",
    G: "Geschlossen",
    Ü: "Übertragen",
  };

  return {
    authority: parsed.authority,
    year: parsed.year,
    subject: parsed.subject,
    subjectLabel: subjectLabels[parsed.subject] ?? "Unbekannt",
    sequence: parsed.sequence,
    status: parsed.status,
    statusLabel: statusLabels[parsed.status] ?? "Unbekannt",
    fullNumber: caseNumber,
  };
}
