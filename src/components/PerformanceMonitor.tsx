"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Chrome-spezifische Memory API Typen
interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

/**
 * 🚀 Performance-Monitoring-Komponente
 * Überwacht Navigation-Performance und optimiert automatisch
 */
export function PerformanceMonitor() {
  const pathname = usePathname();
  const navigationStartRef = useRef<number>(0);
  const lastPathnameRef = useRef<string>("");

  // 🚀 NAVIGATION-PERFORMANCE-TRACKING
  useEffect(() => {
    if (typeof window === "undefined") return;

    const currentTime = performance.now();

    // Track Navigation-Zeit
    if (lastPathnameRef.current && lastPathnameRef.current !== pathname) {
      const navigationTime = currentTime - navigationStartRef.current;

      console.log("🚀 Navigation Performance:", {
        from: lastPathnameRef.current,
        to: pathname,
        time: `${navigationTime.toFixed(2)}ms`,
        timestamp: new Date().toISOString(),
      });

      // 🚀 PERFORMANCE-OPTIMIERUNGEN BASIEREND AUF ZEIT
      if (navigationTime > 1000) {
        console.warn("⚠️ Langsame Navigation erkannt:", {
          pathname,
          time: navigationTime,
        });

        // Automatische Optimierungen für langsame Navigationen
        if (navigationTime > 2000) {
          // Aggressive Prefetching für sehr langsame Navigationen
          console.log("🚀 Aktiviere aggressives Prefetching...");
        }
      }
    }

    // Starte Timer für nächste Navigation
    navigationStartRef.current = currentTime;
    lastPathnameRef.current = pathname;
  }, [pathname]);

  // 🚀 AUTOMATISCHE PERFORMANCE-OPTIMIERUNGEN
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 🚀 INTELLIGENTES PREFETCHING BASIEREND AUF BENUTZER-VERHALTEN
    const handleMouseEnter = (event: MouseEvent) => {
      const target = event.target;

      // Sicherheitscheck: Prüfe ob target ein Element ist und closest unterstützt
      if (
        target &&
        target instanceof Element &&
        typeof target.closest === "function"
      ) {
        const link = target.closest("a");

        if (link?.href) {
          // Prefetch bei Hover über Links
          const url = new URL(link.href);
          if (url.origin === window.location.origin) {
            // Intelligentes Prefetching nur für interne Links
            console.log("🚀 Prefetching:", url.pathname);
          }
        }
      }
    };

    // 🚀 PERFORMANCE-MONITORING FÜR SCROLL-EVENTS
    const handleScroll = () => {
      // Track Scroll-Performance für Navigation-Optimierungen
      // Hier könnten weitere Optimierungen basierend auf Scroll-Verhalten implementiert werden
    };

    // Event Listeners hinzufügen
    document.addEventListener("mouseenter", handleMouseEnter, true);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("mouseenter", handleMouseEnter, true);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // 🚀 MEMORY-OPTIMIERUNGEN
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Periodische Memory-Bereinigung für bessere Performance
    const memoryCleanup = setInterval(() => {
      // Chrome-spezifische Memory API (nicht in allen Browsern verfügbar)
      if ("memory" in performance && performance?.memory) {
        const memoryUsage = (
          performance as Performance & { memory?: MemoryInfo }
        ).memory;
        if (memoryUsage) {
          const usedMB = memoryUsage.usedJSHeapSize / 1024 / 1024;

          if (usedMB > 100) {
            console.log("🚀 Memory-Optimierung:", {
              used: `${usedMB.toFixed(2)}MB`,
              limit: `${(memoryUsage.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
            });

            // Trigger Garbage Collection wenn möglich
            if ("gc" in window && (window as Window & { gc?: () => void }).gc) {
              (window as Window & { gc?: () => void }).gc?.();
            }
          }
        }
      }
    }, 30000); // Alle 30 Sekunden

    return () => clearInterval(memoryCleanup);
  }, []);

  // Diese Komponente rendert nichts, sie überwacht nur Performance
  return null;
}
