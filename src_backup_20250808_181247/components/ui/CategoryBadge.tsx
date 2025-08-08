import { getCategoryLabel } from "@/types/translations";
import { getCategoryStyles } from "@/types/categories";

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export default function CategoryBadge({
  category,
  className = "",
}: CategoryBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getCategoryStyles(category)} ${className}`}
    >
      {getCategoryLabel(category)}
    </span>
  );
}
