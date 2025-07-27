import { cn } from "~/lib/utils";
import { colors, componentClasses } from "~/lib/design-tokens";

interface UniversalBadgeProps {
  content: string;
  className?: string;
  variant?: "default" | "category" | "priority" | "status" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
}

// Übersetzungsfunktion für Labels
const translateLabel = (content: string): string => {
  const translations: Record<string, string> = {
    // Kategorien
    "WANTED_PERSON": "Gesuchte Person",
    "MISSING_PERSON": "Vermisste Person", 
    "UNKNOWN_DEAD": "Unbekannter Toter",
    "STOLEN_GOODS": "Gestohlene Gegenstände",
    
    // Prioritäten
    "normal": "Normal",
    "urgent": "Dringend",
    "new": "Neu",
    
    // Status
    "draft": "Entwurf",
    "active": "Aktiv",
    "published": "Veröffentlicht",
    "archived": "Archiviert",
    
    // Fallback
    "default": content,
  };
  
  return translations[content] ?? content;
};

export default function UniversalBadge({
  content,
  className = "",
  variant = "default",
  size = "md",
}: UniversalBadgeProps) {
  // Größen-Klassen
  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-1 text-xs", 
    lg: "px-3 py-1.5 text-sm",
  };

  // Variant-spezifische Styles mit Design-Tokens
  const getVariantStyles = () => {
    switch (variant) {
      case "category":
        return colors.status.info;
      case "priority":
        return colors.status.warning;
      case "status":
        return colors.status.success;
      case "success":
        return colors.status.success;
      case "warning":
        return colors.status.warning;
      case "error":
        return colors.status.error;
      case "info":
        return colors.status.info;
      default:
        return componentClasses.badge.default;
    }
  };

  return (
    <span
      className={cn(
        componentClasses.badge.base,
        sizeClasses[size],
        getVariantStyles(),
        className
      )}
    >
      {translateLabel(content)}
    </span>
  );
}
