"use client";

import { useEffect, useCallback } from "react";
import { useThemeManager, themeUtils } from "~/lib/theme";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, systemTheme, updateResolvedTheme, handleSystemThemeChange } =
    useThemeManager();

  // Memoized callback für System-Theme-Änderungen
  const handleSystemThemeChangeMemo = useCallback(
    (newSystemTheme: "light" | "dark") => {
      handleSystemThemeChange(newSystemTheme);
    },
    [handleSystemThemeChange],
  );

  // Memoized callback für Theme-Updates
  const updateResolvedThemeMemo = useCallback(
    (newTheme: "light" | "dark") => {
      updateResolvedTheme(newTheme);
    },
    [updateResolvedTheme],
  );

  // Initiales Setup - nur einmal beim Mount
  useEffect(() => {
    // Initiales Theme setzen
    const initialSystemTheme = themeUtils.getSystemTheme();
    handleSystemThemeChangeMemo(initialSystemTheme);

    if (theme === "system") {
      updateResolvedThemeMemo(initialSystemTheme);
    } else {
      updateResolvedThemeMemo(theme);
    }

    // System-Theme-Listener einrichten
    const cleanup = themeUtils.setupSystemThemeListener(
      handleSystemThemeChangeMemo,
    );

    // Theme-Transitionen aktivieren
    const transitionCleanup = themeUtils.enableThemeTransition();

    return () => {
      cleanup();
      if (transitionCleanup) transitionCleanup();
    };
  }, [handleSystemThemeChangeMemo, theme, updateResolvedThemeMemo]);

  // Theme-Änderungen überwachen - separate useEffect
  useEffect(() => {
    if (theme === "system") {
      updateResolvedThemeMemo(systemTheme);
    } else {
      updateResolvedThemeMemo(theme);
    }
  }, [theme, systemTheme, updateResolvedThemeMemo]);

  return <>{children}</>;
}
