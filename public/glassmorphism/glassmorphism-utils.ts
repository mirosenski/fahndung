// Glassmorphism Utility Classes für Tailwind CSS
// Füge diese zu deiner tailwind.config.js hinzu

export const glassmorphismPlugin = {
  theme: {
    extend: {
      colors: {
        glass: {
          light: "rgba(255, 255, 255, 0.25)",
          DEFAULT: "rgba(255, 255, 255, 0.15)", 
          dark: "rgba(0, 0, 0, 0.15)",
        },
      },
      backgroundImage: {
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%)",
        "glass-gradient-dark": "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%)",
        "noise": "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" /%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noise)\" opacity=\"0.02\" /%3E%3C/svg%3E')",
      },
      backdropBlur: {
        xs: "2px",
        "3xl": "64px",
      },
      backdropSaturate: {
        25: ".25",
        175: "1.75",
        200: "2",
      },
      boxShadow: {
        "glass": "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        "glass-lg": "0 16px 48px 0 rgba(31, 38, 135, 0.2)",
        "glass-inset": "inset 0 2px 4px 0 rgba(255, 255, 255, 0.4)",
        "glass-dark": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      animation: {
        "aurora": "aurora 8s ease-in-out infinite",
        "gradient-x": "gradient-x 15s ease infinite",
        "shimmer": "shimmer 3s ease-in-out infinite",
        "blob": "blob 7s infinite",
      },
    },
  },
  plugins: [
    function ({ addUtilities, theme }: any) {
      const newUtilities = {
        // Glass Base Styles
        ".glass": {
          backgroundColor: "rgba(255, 255, 255, 0.65)",
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: theme("boxShadow.glass"),
        },
        ".glass-dark": {
          backgroundColor: "rgba(17, 24, 39, 0.65)",
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: theme("boxShadow.glass-dark"),
        },
        
        // Glass Variants
        ".glass-subtle": {
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        },
        ".glass-strong": {
          backgroundColor: "rgba(255, 255, 255, 0.45)",
          backdropFilter: "blur(24px) saturate(200%)",
          WebkitBackdropFilter: "blur(24px) saturate(200%)",
        },
        ".glass-clear": {
          backgroundColor: "rgba(255, 255, 255, 0.25)",
          backdropFilter: "blur(40px) saturate(150%)",
          WebkitBackdropFilter: "blur(40px) saturate(150%)",
        },
        
        // Special Effects
        ".glass-shimmer": {
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: "-50%",
            left: "-50%",
            width: "200%",
            height: "200%",
            background: "linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)",
            animation: "shimmer 3s infinite",
          },
        },
        ".glass-noise": {
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            inset: "0",
            backgroundImage: theme("backgroundImage.noise"),
            opacity: "0.03",
            pointerEvents: "none",
          },
        },
        
        // Interactive States
        ".glass-hover": {
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.75)",
            boxShadow: theme("boxShadow.glass-lg"),
            transform: "translateY(-2px)",
          },
        },
        ".glass-active": {
          "&:active": {
            transform: "scale(0.98)",
          },
        },
      };

      addUtilities(newUtilities);
    },
  ],
};

// Glassmorphism Utility Functions

export function glassClasses(
  variant: "subtle" | "default" | "strong" | "clear" = "default",
  isDark = false
): string {
  const base = isDark ? "glass-dark" : "glass";
  
  const variants = {
    subtle: "glass-subtle",
    default: base,
    strong: "glass-strong", 
    clear: "glass-clear",
  };

  return `${variants[variant]} glass-noise transition-all duration-300`;
}

export function glassCardClasses(
  blur: "sm" | "md" | "lg" | "xl" | "2xl" = "md",
  saturate: number = 150
): string {
  return `
    relative overflow-hidden rounded-2xl
    bg-white/70 dark:bg-gray-900/70
    backdrop-blur-${blur} backdrop-saturate-[${saturate}%]
    border border-white/30 dark:border-gray-700/40
    shadow-glass dark:shadow-glass-dark
    before:absolute before:inset-0 before:-z-10
    before:bg-glass-gradient dark:before:bg-glass-gradient-dark
  `.trim();
}

// Responsive Glass Effect Hook
export function useResponsiveGlass() {
  if (typeof window === "undefined") return "default";
  
  // Reduziere Effekte auf mobilen Geräten für bessere Performance
  const isMobile = window.innerWidth < 768;
  const isLowEnd = navigator.hardwareConcurrency <= 4;
  
  if (isMobile || isLowEnd) {
    return "subtle"; // Weniger intensive Effekte
  }
  
  return "default";
}

// Tailwind Config Extension
export const tailwindGlassConfig = {
  content: [],
  theme: {
    extend: glassmorphismPlugin.theme.extend,
  },
  plugins: glassmorphismPlugin.plugins,
};

// Example: tailwind.config.js
/*
import { tailwindGlassConfig } from "./glassmorphism-utils";

export default {
  ...tailwindGlassConfig,
  content: [
    "./src/**\/*.{js,ts,jsx,tsx}",
  ],
  // Weitere Konfiguration...
};
*/