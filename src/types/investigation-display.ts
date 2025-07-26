export type DisplayMode = "summary" | "detail" | "card" | "preview";

export interface InvestigationDisplayProps {
  mode: DisplayMode;
  data: Record<string, unknown>;
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
import { INVESTIGATION_CATEGORIES } from "./categories";

export const categoryLabels = INVESTIGATION_CATEGORIES;

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
