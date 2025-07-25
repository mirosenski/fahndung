

export type DisplayMode = "summary" | "detail" | "card" | "preview";

export interface InvestigationDisplayProps {
  mode: DisplayMode;
  data: Record<string, unknown>; // TODO: Replace with proper investigation type
  onEdit?: (step: string) => void;
  className?: string;
  showEditButtons?: boolean;
}

export interface FlipCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  className?: string;
}

// Helper Types für Kategorien und Prioritäten
export const categoryLabels = {
  WANTED_PERSON: "Straftäter",
  MISSING_PERSON: "Vermisste Person",
  UNKNOWN_DEAD: "Unbekannte Tote",
  STOLEN_GOODS: "Sachen",
} as const;

export const priorityLabels = {
  normal: "Normal",
  urgent: "Dringend",
  new: "Neu",
} as const;

export const urgencyLabels = {
  low: "Niedrig",
  medium: "Mittel",
  high: "Hoch",
  critical: "Kritisch",
} as const;

// Style Helper Functions
export const getCategoryStyles = (category: keyof typeof categoryLabels) => {
  const styles = {
    WANTED_PERSON: "bg-red-100 text-red-800",
    MISSING_PERSON: "bg-blue-100 text-blue-800",
    UNKNOWN_DEAD: "bg-gray-100 text-gray-800",
    STOLEN_GOODS: "bg-yellow-100 text-yellow-800",
  };
  return styles[category];
};

export const getPriorityStyles = (priority: keyof typeof priorityLabels) => {
  const styles = {
    urgent: "bg-red-100 text-red-800",
    new: "bg-blue-100 text-blue-800",
    normal: "bg-gray-100 text-gray-800",
  };
  return styles[priority];
};

export const getUrgencyStyles = (urgency: keyof typeof urgencyLabels) => {
  const styles = {
    critical: "text-red-600 font-bold",
    high: "text-orange-600 font-semibold",
    medium: "text-yellow-600 font-medium",
    low: "text-gray-600",
  };
  return styles[urgency];
};
