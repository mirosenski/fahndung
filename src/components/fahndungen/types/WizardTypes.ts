// Enhanced Types für den Fahndung Wizard
export interface Step1Data {
  title: string;
  category:
    | "WANTED_PERSON"
    | "MISSING_PERSON"
    | "UNKNOWN_DEAD"
    | "STOLEN_GOODS";
  caseNumber: string;
}

export interface Step2Data {
  shortDescription: string;
  description: string;
  priority: "normal" | "urgent" | "new";
  tags: string[];
  features: string;
}

export interface Step3Data {
  mainImage: File | null;
  additionalImages: File[];
  documents: File[];
}

export interface Step4Data {
  mainLocation: {
    id: string;
    address: string;
    lat: number;
    lng: number;
    type:
      | "main"
      | "tatort"
      | "wohnort"
      | "arbeitsplatz"
      | "sichtung"
      | "sonstiges";
    description?: string;
    timestamp?: Date;
  } | null;
  additionalLocations: Array<{
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
  }>;
  searchRadius: number;
}

export interface Step5Data {
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

export interface WizardData {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  step5: Step5Data;
}

// Preview Mode Types
export interface PreviewMode {
  id: "card" | "detail" | "stats";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Kategorie-Konfiguration
export const CATEGORY_CONFIG = {
  WANTED_PERSON: {
    label: "STRAFTÄTER",
    icon: "Shield",
    gradient: "from-red-500 to-red-600",
    bg: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
  },
  MISSING_PERSON: {
    label: "VERMISSTE",
    icon: "Search",
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
  },
  UNKNOWN_DEAD: {
    label: "UNBEKANNTE TOTE",
    icon: "FileText",
    gradient: "from-gray-500 to-gray-600",
    bg: "bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800",
  },
  STOLEN_GOODS: {
    label: "SACHEN",
    icon: "Camera",
    gradient: "from-orange-500 to-orange-600",
    bg: "bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800",
  },
} as const;

export const PRIORITY_CONFIG = {
  urgent: { label: "DRINGEND", color: "bg-red-600", pulse: true },
  new: { label: "NEU", color: "bg-blue-600", pulse: false },
  normal: { label: "STANDARD", color: "bg-gray-500", pulse: false },
} as const;
