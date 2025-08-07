import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // 🚀 OPTIMIERTE CACHE-STRATEGIE FÜR SCHNELLE NAVIGATION
        staleTime: 20 * 60 * 1000, // 20 Minuten Cache (erhöht für bessere Performance)
        // 🚀 REDUZIERTE REFETCH-STRATEGIEN FÜR SCHNELLERE NAVIGATION
        refetchOnWindowFocus: false, // Verhindert unnötige Refetches bei Navigation
        refetchOnMount: false, // Verhindert Refetch beim Tab-Wechsel
        refetchOnReconnect: true,
        // 🚀 OPTIMIERTE RETRY-STRATEGIE
        retry: 1, // Reduziert für schnellere Fehlerbehandlung
        retryDelay: 200, // Reduziert für schnellere Retries
        // 🚀 INTELLIGENTE REFETCH-INTERVALLE
        refetchInterval: (query) => {
          // Spezielle Behandlung für Fahndungs-Queries
          if (
            query.queryKey[0] === "post" &&
            (query.queryKey[1] === "getInvestigations" ||
              query.queryKey[1] === "getMyInvestigations" ||
              query.queryKey[1] === "getInvestigation")
          ) {
            return 600000; // Alle 10 Minuten als Fallback (erhöht für bessere Performance)
          }
          return false; // Kein automatisches Refetch für andere Queries
        },
        // 🚀 PERFORMANCE-OPTIMIERUNGEN
        gcTime: 45 * 60 * 1000, // 45 Minuten Garbage Collection (erhöht)
        networkMode: "online",
        // 🚀 NEUE OPTION: PREFETCH-OPTIMIERUNG
        placeholderData: (previousData: unknown) => previousData, // Behält alte Daten während Refetch
        // 🚀 OPTIMIERTE DEDUPLICATION
        structuralSharing: true, // Verhindert unnötige Re-Renders
      },
      mutations: {
        // 🚀 OPTIMIERTE MUTATION-STRATEGIE
        retry: 1, // Reduziert für schnellere Fehlerbehandlung
        retryDelay: 200, // Reduziert für schnellere Retries
        networkMode: "online",
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
