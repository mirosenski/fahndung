import React from "react";

interface AccessibilityIconProps {
  isActive?: boolean;
  className?: string;
  variant?: "outline" | "filled";
}

export const AccessibilityIcon = ({
  isActive = false,
  className = "",
  variant = "outline",
}: AccessibilityIconProps) => {
  const src =
    variant === "filled" || isActive
      ? "/images/icon-accessability-fill.svg"
      : "/images/icon-accessability.svg";
  return <img src={src} className={className} aria-hidden="true" alt="" />;
};
