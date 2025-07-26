import { translateLabel } from "@/types/translations";

interface StatusBadgeProps {
  content: string;
  className?: string;
}

export default function StatusBadge({
  content,
  className = "",
}: StatusBadgeProps) {
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${className}`}>
      {translateLabel(content)}
    </span>
  );
}
