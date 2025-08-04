import {
  Shield,
  Search,
  FileText,
  Camera,
  Info,
  Images,
  Map,
} from "lucide-react";

// Typ-Definitionen für moderne Fahndungskarte
export type CategoryType =
  | "WANTED_PERSON"
  | "MISSING_PERSON"
  | "UNKNOWN_DEAD"
  | "STOLEN_GOODS";

export type PriorityType = "urgent" | "new" | "normal";

export interface FahndungsData {
  step1: {
    title: string;
    category: CategoryType;
    caseNumber: string;
  };
  step2: {
    shortDescription: string;
    description: string;
    priority: PriorityType;
    tags: string[];
    features: string;
  };
  step3: {
    mainImage: string;
    mainImageUrl?: string; // URL des hochgeladenen Hauptbildes
    additionalImages: string[];
    additionalImageUrls?: string[]; // URLs der hochgeladenen zusätzlichen Bilder
  };
  step4: {
    mainLocation?: { address: string };
  };
  step5: {
    contactPerson: string;
    contactPhone: string;
    contactEmail?: string;
    department: string;
    availableHours: string;
  };
}

export interface ModernFahndungskarteProps {
  data?: FahndungsData;
  className?: string;
  investigationId?: string;
  onAction?: () => void;
  userRole?: string;
  userPermissions?: {
    canEdit?: boolean;
    canDelete?: boolean;
    canPublish?: boolean;
  };
}

export interface FahndungLocation {
  id: string;
  lat: number;
  lng: number;
  address: string;
  type: string;
  investigationId?: string;
  investigationTitle?: string;
  priority?: "normal" | "urgent" | "new";
  category?: string;
  timestamp?: Date;
  lastSeen?: Date;
  description?: string;
  contactInfo?: {
    person?: string;
    phone?: string;
    email?: string;
  };
}

export interface FahndungskarteProps {
  locations: FahndungLocation[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  searchRadius?: number;
  showRadius?: boolean;
  editable?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showLegend?: boolean;
  onLocationAdd?: (location: Omit<FahndungLocation, "id">) => void;
  onLocationUpdate?: (id: string, location: FahndungLocation) => void;
  onLocationRemove?: (id: string) => void;
  _onLocationClick?: (location: FahndungLocation) => void;
  onInvestigationClick?: (investigationId: string) => void;
  className?: string;
}

// Konfigurationen
export const CATEGORY_CONFIG: Record<
  CategoryType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    bg: string;
  }
> = {
  WANTED_PERSON: {
    label: "STRAFTÄTER",
    icon: Shield,
    gradient: "from-red-500 to-red-600",
    bg: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
  },
  MISSING_PERSON: {
    label: "VERMISSTE",
    icon: Search,
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
  },
  UNKNOWN_DEAD: {
    label: "UNBEKANNTE TOTE",
    icon: FileText,
    gradient: "from-gray-500 to-gray-600",
    bg: "bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800",
  },
  STOLEN_GOODS: {
    label: "SACHEN",
    icon: Camera,
    gradient: "from-orange-500 to-orange-600",
    bg: "bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800",
  },
};

export const PRIORITY_CONFIG: Record<
  PriorityType,
  {
    label: string;
    color: string;
    pulse: boolean;
  }
> = {
  urgent: { label: "DRINGEND", color: "bg-red-600", pulse: true },
  new: { label: "NEU", color: "bg-blue-600", pulse: false },
  normal: { label: "STANDARD", color: "bg-gray-500", pulse: false },
};

export const TAB_CONFIG = [
  { id: "overview", label: "Übersicht", icon: Info },
  { id: "description", label: "Details", icon: FileText },
  { id: "media", label: "Medien", icon: Images },
  { id: "location", label: "Ort", icon: Map },
];

// Erweiterte Marker Icons für Fahndungen
export const fahndungMarkerIcons = {
  main: { color: "#DC2626", icon: "🎯", label: "Hauptort" },
  tatort: { color: "#991B1B", icon: "⚠️", label: "Tatort" },
  wohnort: { color: "#2563EB", icon: "🏠", label: "Wohnort" },
  arbeitsplatz: { color: "#7C3AED", icon: "💼", label: "Arbeitsplatz" },
  sichtung: { color: "#F59E0B", icon: "👁️", label: "Sichtung" },
  sonstiges: { color: "#6B7280", icon: "📍", label: "Sonstiges" },
};

// Filter-Optionen
export const filterOptions = {
  type: ["main", "tatort", "wohnort", "arbeitsplatz", "sichtung", "sonstiges"],
  priority: ["urgent", "normal", "new"],
  category: ["WANTED_PERSON", "MISSING_PERSON", "UNKNOWN_DEAD", "STOLEN_GOODS"],
};
