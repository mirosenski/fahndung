// Zentrale Design-Token-Verwaltung für konsistente Styling-Patterns
import { cn } from "~/lib/utils";

// Farb-Tokens
export const colors = {
  // Hintergrund
  background: {
    primary: "bg-background",
    secondary: "bg-card",
    muted: "bg-muted",
    accent: "bg-accent",
  },
  // Text
  text: {
    primary: "text-foreground",
    secondary: "text-muted-foreground",
    accent: "text-accent-foreground",
    destructive: "text-destructive",
  },
  // Border
  border: {
    primary: "border-border",
    secondary: "border-muted",
    accent: "border-accent",
    destructive: "border-destructive",
  },
  // Status
  status: {
    success:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
} as const;

// Layout-Tokens
export const layout = {
  container: "container mx-auto px-4",
  section: "py-8",
  card: "rounded-lg border bg-card text-card-foreground shadow-xs",
  cardHover:
    "rounded-lg border bg-card text-card-foreground shadow-xs transition-shadow hover:shadow-md",
} as const;

// Komponenten-Tokens
export const components = {
  input: {
    base: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    error: "border-destructive focus-visible:ring-destructive",
    success: "border-green-500 focus-visible:ring-green-500",
  },
  badge: {
    base: "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
    default: "bg-secondary text-secondary-foreground",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive:
      "border-transparent bg-destructive text-destructive-foreground",
  },
  button: {
    base: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
    variants: {
      default:
        "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
      destructive:
        "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
      outline:
        "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
      secondary:
        "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    },
    sizes: {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3",
      lg: "h-10 rounded-md px-6",
      icon: "size-9",
    },
  },
} as const;

// Utility-Funktionen für konsistente Verwendung
export const createComponentClass = (
  baseClass: string,
  variant?: string,
  size?: string,
  className?: string,
) => {
  return cn(baseClass, variant, size, className);
};

// Spezielle Komponenten-Klassen
export const componentClasses = {
  // Badge-Komponenten
  badge: {
    base: "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
    default: "bg-secondary text-secondary-foreground",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive:
      "border-transparent bg-destructive text-destructive-foreground",
  },
  // Card-Komponenten
  card: {
    base: "rounded-lg border bg-card text-card-foreground shadow-xs",
    header: "flex flex-col space-y-1.5 p-6",
    title: "text-2xl font-semibold leading-none tracking-tight",
    description: "text-sm text-muted-foreground",
    content: "p-6 pt-0",
    footer: "flex items-center p-6 pt-0",
  },
  // Form-Komponenten
  form: {
    label:
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
    description: "text-sm text-muted-foreground",
    message: "text-sm font-medium",
    messageError: "text-sm font-medium text-destructive",
    messageSuccess: "text-sm font-medium text-green-600",
  },
  // Navigation
  nav: {
    item: "text-muted-foreground hover:text-foreground transition-colors",
    itemActive: "text-foreground font-medium",
    itemDisabled: "text-muted-foreground cursor-not-allowed",
  },
  // Tables
  table: {
    wrapper: "w-full overflow-auto",
    table: "w-full caption-bottom text-sm",
    header: "border-b border-border bg-muted/50",
    headerCell:
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground",
    row: "border-b border-border transition-colors hover:bg-muted/50",
    cell: "p-4 align-middle",
  },
} as const;

// Migration-Hilfsfunktionen
export const migrateGrayClasses = {
  // Hintergrund
  "bg-gray-100": "bg-muted",
  "bg-gray-200": "bg-muted",
  "bg-gray-50": "bg-muted/50",
  "bg-gray-800": "bg-card",
  "bg-gray-900": "bg-background",
  "bg-white": "bg-background",

  // Text
  "text-gray-900": "text-foreground",
  "text-gray-800": "text-foreground",
  "text-gray-700": "text-foreground",
  "text-gray-600": "text-muted-foreground",
  "text-gray-500": "text-muted-foreground",
  "text-gray-400": "text-muted-foreground",
  "text-gray-300": "text-muted-foreground",

  // Border
  "border-gray-200": "border-border",
  "border-gray-300": "border-border",
  "border-gray-600": "border-border",
  "border-gray-700": "border-border",
} as const;

// Utility für Migration
export const migrateClass = (className: string): string => {
  let migratedClass = className;

  Object.entries(migrateGrayClasses).forEach(([oldClass, newClass]) => {
    migratedClass = migratedClass.replace(new RegExp(oldClass, "g"), newClass);
  });

  return migratedClass;
};
