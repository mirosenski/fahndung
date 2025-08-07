import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

/**
 * 🚀 Hook für optimierte Navigation mit intelligentem Prefetching
 * Beschleunigt Navigationen durch vorausschauendes Laden von Daten
 */
export function useNavigationOptimizer() {
  const router = useRouter();
  const utils = api.useUtils();

  // 🚀 INTELLIGENTES PREFETCHING FÜR HÄUFIG BESUCHTE SEITEN
  const prefetchCommonRoutes = useCallback(() => {
    // Prefetch häufig besuchte Seiten
    const commonRoutes = ["/dashboard", "/fahndungen", "/login", "/register"];

    commonRoutes.forEach((route) => {
      router.prefetch(route);
    });
  }, [router]);

  // 🚀 PREFETCH FÜR FAHNDUNGS-DETAILSEITEN
  const prefetchInvestigation = useCallback(
    (title: string, caseNumber: string) => {
      const detailUrl = `/fahndungen/${title}/${caseNumber}`;
      router.prefetch(detailUrl);

      // Prefetch auch die Bearbeitungsseite
      const editUrl = `/fahndungen/${title}/${caseNumber}/edit`;
      router.prefetch(editUrl);
    },
    [router],
  );

  // 🚀 OPTIMIERTE NAVIGATION MIT PREFETCH
  const navigateWithPrefetch = useCallback(
    (href: string, options?: { prefetch?: boolean }) => {
      if (options?.prefetch !== false) {
        router.prefetch(href);
      }

      // Sofortige Navigation
      router.push(href);
    },
    [router],
  );

  // 🚀 INVALIDATE CACHE FÜR SCHNELLERE UPDATES
  const invalidateAndNavigate = useCallback(
    async (href: string, queryKeys?: string[]) => {
      // Cache invalidieren für frische Daten
      if (queryKeys) {
        await Promise.all(queryKeys.map(() => utils.invalidate()));
      }

      // Navigation mit Prefetch
      navigateWithPrefetch(href);
    },
    [utils, navigateWithPrefetch],
  );

  // 🚀 AUTOMATISCHES PREFETCHING BEIM MOUNT
  useEffect(() => {
    // Prefetch häufig besuchte Seiten beim ersten Laden
    prefetchCommonRoutes();
  }, [prefetchCommonRoutes]);

  return {
    navigateWithPrefetch,
    prefetchInvestigation,
    invalidateAndNavigate,
    prefetchCommonRoutes,
  };
}
