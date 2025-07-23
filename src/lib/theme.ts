"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  setResolvedTheme: (theme: "light" | "dark") => void;
  systemTheme: "light" | "dark";
  setSystemTheme: (theme: "light" | "dark") => void;
}

export const useTheme = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: "system",
      setTheme: (theme) => {
        const currentTheme = get().theme;
        if (currentTheme !== theme) {
          set({ theme });
        }
      },
      resolvedTheme:
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
      setResolvedTheme: (resolvedTheme) => {
        const currentResolvedTheme = get().resolvedTheme;
        if (currentResolvedTheme !== resolvedTheme) {
          set({ resolvedTheme });
        }
      },
      systemTheme:
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
      setSystemTheme: (systemTheme) => {
        const currentSystemTheme = get().systemTheme;
        if (currentSystemTheme !== systemTheme) {
          set({ systemTheme });
        }
      },
    }),
    {
      name: "theme-storage",
    },
  ),
);

// Theme-Klassen für Tailwind 4.1
export const themeClasses = {
  // Hintergrund
  bg: {
    primary: "bg-background",
    secondary: "bg-background-secondary",
    tertiary: "bg-background-tertiary",
    card: "bg-card",
    muted: "bg-muted",
  },
  // Text
  text: {
    primary: "text-foreground",
    secondary: "text-foreground-secondary",
    muted: "text-foreground-muted",
    accent: "text-accent-foreground",
  },
  // Border
  border: {
    primary: "border-border",
    secondary: "border-border-secondary",
    accent: "border-accent",
  },
  // Buttons
  button: {
    primary: "btn btn-primary",
    secondary: "btn btn-secondary",
    outline: "btn btn-outline",
    ghost: "btn btn-ghost",
    link: "btn btn-link",
    destructive: "btn btn-destructive",
    success: "btn bg-success text-success-foreground hover:bg-success/90",
    warning: "btn bg-warning text-warning-foreground hover:bg-warning/90",
  },
  // Input
  input: {
    base: "input",
    error: "input border-error focus-visible:ring-error",
    success: "input border-success focus-visible:ring-success",
  },
  // Cards
  card: {
    base: "card",
    header: "card-header",
    title: "card-title",
    description: "card-description",
    content: "card-content",
    footer: "card-footer",
  },
  // Badges
  badge: {
    default: "badge badge-default",
    secondary: "badge badge-secondary",
    destructive: "badge badge-destructive",
    outline: "badge badge-outline",
    success: "badge border-transparent bg-success text-success-foreground",
    warning: "badge border-transparent bg-warning text-warning-foreground",
  },
  // Alerts
  alert: {
    base: "alert",
    destructive: "alert alert-destructive",
    success: "alert border-success/50 text-success",
    warning: "alert border-warning/50 text-warning",
  },
  // Layout
  layout: {
    page: "min-h-screen bg-background",
    container: "container mx-auto px-4",
    section: "py-8",
    header: "border-b border-border bg-background",
    footer: "border-t border-border bg-background-secondary",
  },
  // Navigation
  nav: {
    item: "text-foreground-secondary hover:text-foreground transition-colors",
    itemActive: "text-foreground font-medium",
    itemDisabled: "text-foreground-muted cursor-not-allowed",
  },
  // Tables
  table: {
    wrapper: "w-full overflow-auto",
    table: "w-full caption-bottom text-sm",
    header: "border-b border-border bg-background-secondary",
    headerCell:
      "h-12 px-4 text-left align-middle font-medium text-foreground-secondary",
    row: "border-b border-border transition-colors hover:bg-background-secondary/50",
    cell: "p-4 align-middle",
  },
  // Forms
  form: {
    label:
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
    description: "text-sm text-foreground-muted",
    message: "text-sm font-medium",
    messageError: "text-sm font-medium text-error",
    messageSuccess: "text-sm font-medium text-success",
  },
  // Modals
  modal: {
    overlay: "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
    content:
      "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg",
    header: "flex flex-col space-y-1.5 text-center sm:text-left",
    footer: "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
    title: "text-lg font-semibold leading-none tracking-tight",
    description: "text-sm text-foreground-muted",
  },
  // Dropdown
  dropdown: {
    content:
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-background p-1 shadow-md",
    item: "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    separator: "my-1 h-px bg-border",
  },
  // Tooltip
  tooltip: {
    content:
      "z-50 overflow-hidden rounded-md border bg-background px-3 py-1.5 text-sm text-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  },
  // Progress
  progress: {
    wrapper:
      "relative h-4 w-full overflow-hidden rounded-full bg-background-secondary",
    indicator: "h-full w-full flex-1 bg-primary transition-all",
  },
  // Skeleton
  skeleton: "animate-pulse rounded-md bg-background-secondary",
  // Divider
  divider: "border-t border-border",
  // Scrollbar
  scrollbar: {
    track: "bg-background-secondary",
    thumb: "bg-border rounded hover:bg-border-secondary",
  },
};

// Utility-Funktionen für Theme-Management
export const themeUtils = {
  // System-Theme erkennen
  getSystemTheme: (): "light" | "dark" => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  },

  // Theme-Klasse auf HTML-Element setzen
  applyTheme: (theme: "light" | "dark") => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  },

  // System-Theme-Listener
  setupSystemThemeListener: (callback: (theme: "light" | "dark") => void) => {
    if (typeof window === "undefined")
      return () => {
        // Empty cleanup function for SSR
      };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      callback(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  },

  // Theme-Transition
  enableThemeTransition: () => {
    if (typeof document === "undefined") return;

    const style = document.createElement("style");
    style.textContent = `
      * {
        transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  },

  // Theme-Persistierung
  persistTheme: (theme: Theme) => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem("theme", theme);
  },

  // Theme-Wiederherstellung
  restoreTheme: (): Theme => {
    if (typeof localStorage === "undefined") return "system";
    return (localStorage.getItem("theme") as Theme) || "system";
  },
};

// Hook für Theme-Management
export const useThemeManager = () => {
  const {
    theme,
    setTheme,
    resolvedTheme,
    setResolvedTheme,
    systemTheme,
    setSystemTheme,
  } = useTheme();

  const updateResolvedTheme = (newTheme: "light" | "dark") => {
    setResolvedTheme(newTheme);
    themeUtils.applyTheme(newTheme);
  };

  const handleSystemThemeChange = (newSystemTheme: "light" | "dark") => {
    setSystemTheme(newSystemTheme);
    if (theme === "system") {
      updateResolvedTheme(newSystemTheme);
    }
  };

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);

    if (newTheme === "system") {
      updateResolvedTheme(systemTheme);
    } else {
      updateResolvedTheme(newTheme);
    }

    themeUtils.persistTheme(newTheme);
  };

  return {
    theme,
    resolvedTheme,
    systemTheme,
    changeTheme,
    updateResolvedTheme,
    handleSystemThemeChange,
  };
};
