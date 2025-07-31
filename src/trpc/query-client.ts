import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import SuperJSON from "superjson";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Sofortige Cache-Invalidierung für sofortige Updates
        staleTime: 0, // Sofort als veraltet markieren
        // Aktivierte Refetch-Strategien für bessere Synchronisation
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,
        // Optimistische Updates aktivieren
        retry: 1,
        retryDelay: 1000,
        // Aggressivere Refetch-Intervalle für Fahndungen
        refetchInterval: (query) => {
          // Spezielle Behandlung für Fahndungs-Queries
          if (
            query.queryKey[0] === "post" &&
            (query.queryKey[1] === "getInvestigations" ||
              query.queryKey[1] === "getMyInvestigations" ||
              query.queryKey[1] === "getInvestigation")
          ) {
            return 2000; // Alle 2 Sekunden für Fahndungen
          }
          return false; // Kein automatisches Refetch für andere Queries
        },
      },
      mutations: {
        // Optimistische Updates für sofortige UI-Updates
        retry: 1,
        retryDelay: 1000,
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  });
