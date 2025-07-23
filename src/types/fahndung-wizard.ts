// Fahndungs-Wizard Struktur - Schritt für Schritt

// SCHRITT 1: Basis-Informationen ✅ (Bereits implementiert)
export interface Step1Data {
  title: string;
  category:
    | "WANTED_PERSON"
    | "MISSING_PERSON"
    | "UNKNOWN_DEAD"
    | "STOLEN_GOODS";
  caseNumber: string; // automatisch generiert
}

// SCHRITT 2: Erweiterte Informationen
export interface Step2Data {
  shortDescription: string; // Kurzbeschreibung (max 200 Zeichen)
  description: string; // Ausführliche Beschreibung
  priority: "normal" | "urgent" | "new";
  tags: string[]; // Tags für bessere Suche
  features?: string; // Merkmale/Beschreibung der Person/Sache
}

// SCHRITT 3: Bilder & Dokumente
export interface Step3Data {
  mainImage: File | null; // Titelbild
  additionalImages: File[]; // Weitere Bilder
  documents: File[]; // Dokumente (PDF, etc.)
}

// SCHRITT 4: Ort & Karte
export interface Step4Data {
  mainLocation: {
    id: string;
    lat: number;
    lng: number;
    address: string;
    type:
      | "main"
      | "tatort"
      | "wohnort"
      | "arbeitsplatz"
      | "sichtung"
      | "sonstiges";
    description?: string;
    timestamp?: Date;
  } | null; // Hauptort / Zuletzt gesehen
  additionalLocations: Array<{
    id: string;
    lat: number;
    lng: number;
    address: string;
    type: "tatort" | "wohnort" | "arbeitsplatz" | "sichtung" | "sonstiges";
    description?: string;
    timestamp?: Date;
  }>; // Weitere relevante Orte
  searchRadius: number; // Suchradius in km
}

// SCHRITT 5: Kontakt & Veröffentlichung
export interface Step5Data {
  // Kontaktdaten
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  department: string;
  availableHours: string;
  alternativeContact?: {
    name: string;
    phone: string;
    email: string;
  };

  // Veröffentlichung
  publishStatus: "draft" | "review" | "scheduled" | "immediate";
  publishDate?: string;
  publishTime?: string;
  expiryDate?: string;

  // Sichtbarkeit & Reichweite
  visibility: {
    internal: boolean;
    regional: boolean;
    national: boolean;
    international: boolean;
  };

  // Benachrichtigungen
  notifications: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    appNotifications: boolean;
    pressRelease: boolean;
  };

  // Zusätzliche Optionen
  urgencyLevel: "low" | "medium" | "high" | "critical";
  requiresApproval: boolean;
  approvalNotes?: string;
}

// Wizard State Management
export interface WizardState {
  currentStep: number;
  data: {
    step1: Step1Data;
    step2: Step2Data;
    step3: Step3Data;
    step4: Step4Data;
    step5: Step5Data;
  };
  isValid: boolean[];
}

// Navigation zwischen Schritten
export const wizardSteps = [
  { id: 1, title: "Basis-Informationen", icon: "FileText" },
  { id: 2, title: "Beschreibung", icon: "Edit" },
  { id: 3, title: "Bilder & Dokumente", icon: "Image" },
  { id: 4, title: "Ort & Karte", icon: "MapPin" },
  { id: 5, title: "Kontakt & Veröffentlichung", icon: "Phone" },
  { id: 6, title: "Zusammenfassung", icon: "CheckCircle" },
] as const;

export type WizardStep = (typeof wizardSteps)[number];
