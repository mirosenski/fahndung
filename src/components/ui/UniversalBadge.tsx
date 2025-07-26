import { translateLabel } from "@/types/translations";

interface UniversalBadgeProps {
  content: string;
  className?: string;
  variant?: "default" | "category" | "priority" | "status";
}

export default function UniversalBadge({
  content,
  className = "",
  variant = "default",
}: UniversalBadgeProps) {
  // Standard-Farben basierend auf Variant
  const getDefaultStyles = () => {
    switch (variant) {
      case "category":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "priority":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "status":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${getDefaultStyles()} ${className}`}
    >
      {translateLabel(content)}
    </span>
  );
}
