import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Optimierte Cache-Strategie für bessere Performance
        staleTime: 5 * 60 * 1000, // 5 Minuten Cache (erhöht von 0)
        // Reduzierte Refetch-Strategien für bessere Performance
        refetchOnWindowFocus: false, // Reduziert von true
        refetchOnMount: true,
        refetchOnReconnect: true,
        // Optimierte Retry-Strategie
        retry: 2, // Reduziert von 1
        retryDelay: 500, // Reduziert von 1000ms
        // Reduzierte Refetch-Intervalle da Real-time Updates aktiv sind
        refetchInterval: (query) => {
          // Spezielle Behandlung für Fahndungs-Queries
          if (
            query.queryKey[0] === "post" &&
            (query.queryKey[1] === "getInvestigations" ||
              query.queryKey[1] === "getMyInvestigations" ||
              query.queryKey[1] === "getInvestigation")
          ) {
            return 30000; // Alle 30 Sekunden als Fallback (erhöht von 10s)
          }
          return false; // Kein automatisches Refetch für andere Queries
        },
        // Performance-Optimierungen
        gcTime: 10 * 60 * 1000, // 10 Minuten Garbage Collection
        networkMode: "online",
      },
      mutations: {
        // Optimistische Updates für sofortige UI-Updates
        retry: 1,
        retryDelay: 500, // Reduziert von 1000ms
        networkMode: "online",
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
