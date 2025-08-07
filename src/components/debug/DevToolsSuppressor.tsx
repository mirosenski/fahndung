"use client";

import { useEffect } from "react";

/**
 * Komponente zur Unterdrückung der React DevTools-Warnung
 * Wird nur in Development-Modus geladen
 */
export function DevToolsSuppressor() {
  useEffect(() => {
    // Unterdrücke React DevTools-Warnung
    const originalConsoleLog = console.log as (...args: unknown[]) => void;
    const originalConsoleWarn = console.warn as (...args: unknown[]) => void;
    
    console.log = (...args: unknown[]) => {
      // Filtere React DevTools-Warnung
      const message = args[0];
      if (typeof message === "string" && message.includes("Download the React DevTools")) {
        return;
      }
      originalConsoleLog.apply(console, args);
    };
    
    console.warn = (...args: unknown[]) => {
      // Filtere React DevTools-Warnung
      const message = args[0];
      if (typeof message === "string" && message.includes("Download the React DevTools")) {
        return;
      }
      originalConsoleWarn.apply(console, args);
    };

    // Cleanup beim Unmount
    return () => {
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;
    };
  }, []);

  return null; // Diese Komponente rendert nichts
}
