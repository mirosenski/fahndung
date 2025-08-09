"use client";

import { useEffect } from "react";
// Import the shared warn function. In production builds this will no-op,
// preventing console noise.
import { warn } from "~/lib/logger";
import { usePathname } from "next/navigation";
import { useNavigationOptimizer } from "~/hooks/useNavigationOptimizer";
import { api } from "~/trpc/react";

/**
 * 🚀 Optimierte Layout-Komponente mit intelligenter Navigation
 * Beschleunigt Navigationen durch vorausschauendes Laden und Caching
 */
export function OptimizedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const safePathname = pathname ?? "";
  const { prefetchCommonRoutes } = useNavigationOptimizer();
  const utils = api.useUtils();

  // 🚀 INTELLIGENTES PREFETCHING BASIEREND AUF AKTUELLER SEITE
  useEffect(() => {
    try {
      // Prefetch häufig besuchte Seiten beim ersten Laden
      prefetchCommonRoutes();

      // 🚀 SEITENSPEZIFISCHE OPTIMIERUNGEN
      if (safePathname === "/") {
        // Auf Homepage: Prefetch Dashboard und Fahndungen
        utils.post.getInvestigations
          .prefetch({ limit: 20, offset: 0 })
          .catch((error) => warn(error));
      } else if (safePathname === "/fahndungen") {
        // Auf Fahndungen-Seite: Prefetch Detailseiten für erste Ergebnisse
        utils.post.getInvestigations
          .prefetch({ limit: 10, offset: 0 })
          .catch((error) => warn(error));
      } else if (
        safePathname.startsWith("/fahndungen/") &&
        !safePathname.includes("/neu")
      ) {
        // Auf Detailseite: Prefetch verwandte Fahndungen
        utils.post.getInvestigations
          .prefetch({ limit: 5, offset: 0 })
          .catch((error) => warn(error));
      } else if (safePathname === "/dashboard") {
        // Auf Dashboard: Prefetch Benutzer-spezifische Daten
        utils.post.getMyInvestigations
          .prefetch({ limit: 10, offset: 0 })
          .catch((error) => warn(error));
      }
    } catch (error) {
      // Fehler beim Prefetching sind nicht kritisch - nur loggen
      warn("⚠️ Prefetch-Fehler (nicht kritisch):", error);
    }
  }, [safePathname, prefetchCommonRoutes, utils]);

  // 🚀 OPTIMIERTE CACHE-INVALIDIERUNG
  useEffect(() => {
    try {
      // Cache für aktuelle Seite warmhalten
      if (safePathname.startsWith("/fahndungen/") && !safePathname.includes("/neu")) {
        const investigationId = safePathname.split("/").pop();
        if (investigationId) {
          // Validiere die ID vor dem Prefetching
          const isValidId =
            investigationId && investigationId.trim().length > 0;
          if (isValidId) {
            utils.post.getInvestigation
              .prefetch({ id: investigationId })
              .catch((error) => {
                // Nur warnen, nicht als kritischen Fehler behandeln
                warn(
                  "⚠️ Investigation Prefetch-Fehler (nicht kritisch):",
                  error,
                );
              });
          }
        }
      }
    } catch (error) {
      // Fehler beim Prefetching sind nicht kritisch - nur loggen
      warn("⚠️ Investigation Prefetch-Fehler (nicht kritisch):", error);
    }
  }, [safePathname, utils]);

  return <>{children}</>;
}
