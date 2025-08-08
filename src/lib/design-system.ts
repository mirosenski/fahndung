// Zentrales Design‑System (generiert durch migrate-design-system.py)

import { cn } from "~/lib/utils";

// Border Radius System
export const borderRadius = {
  default: "rounded-lg",
  avatar: "rounded-full",
  none: "rounded-none",
} as const;

// Shadows
export const shadows = {
  default: "shadow-sm",
  none: "shadow-none",
  xs: "shadow-xs",
} as const;

// Spacing (Beispiel)
export const spacing = {
  xs: "p-1",
  sm: "p-2",
  md: "p-3",
  lg: "p-4",
  xl: "p-6",
  "2xl": "p-8",
  "3xl": "p-12",
} as const;

// Komponenten‑Konfiguration (Beispiele)
export const components = {
  button: {
    base: cn(borderRadius.default, shadows.default, "transition-all hover:shadow-md"),
    variants: {
      primary: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      outline: "border border-border bg-background",
      ghost: "bg-transparent hover:bg-accent",
      destructive: "bg-destructive text-destructive-foreground",
    },
  },
  card: {
    base: cn(borderRadius.default, shadows.default, "bg-card text-card-foreground border border-border"),
  },
  // Weitere Komponenten ...
} as const;

export const getDesignToken = <T extends keyof typeof borderRadius>(
  token: T,
): typeof borderRadius[T] => borderRadius[token];

export const getShadow = <T extends keyof typeof shadows>(
  token: T,
): typeof shadows[T] => shadows[token];

export const getSpacing = <T extends keyof typeof spacing>(
  token: T,
): typeof spacing[T] => spacing[token];

// Export‑Typen
export type BorderRadius = keyof typeof borderRadius;
export type Shadow = keyof typeof shadows;
export type Spacing = keyof typeof spacing;
