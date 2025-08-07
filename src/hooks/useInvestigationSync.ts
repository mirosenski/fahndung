import { useEffect, useCallback, useRef } from "react";
import { api } from "~/trpc/react";
import { isValidInvestigationId } from "~/lib/utils/validation";

// TypeScript-Typen für die Investigation
interface Investigation {
  id: string;
  title: string;
  case_number: string;
  description: string;
  short_description: string;
  status: string;
  priority: "normal" | "urgent" | "new";
  category: string;
  location: string;
  station: string;
  features: string;
  date: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to?: string;
  tags: string[];
  metadata: Record<string, unknown>;
  contact_info?: Record<string, unknown>;
  created_by_user?: {
    name: string;
    email: string;
  };
  assigned_to_user?: {
    name: string;
    email: string;
  };
  images?: Array<{
    id: string;
    url: string;
    alt_text?: string;
    caption?: string;
  }>;
  published_as_article?: boolean;
  article_slug?: string;
  article_content?: {
    blocks: Array<{
      type: string;
      content: Record<string, unknown>;
      id?: string;
    }>;
  };
  article_meta?: {
    seo_title?: string;
    seo_description?: string;
    og_image?: string;
    keywords?: string[];
    author?: string;
    reading_time?: number;
  };
  article_published_at?: string;
  article_views?: number;
}

/**
 * Hook für bessere Synchronisation zwischen Fahndungskarten und Detailseiten
 * Stellt sicher, dass Änderungen sofort in allen Komponenten sichtbar sind
 */
export function useInvestigationSync(investigationId: string) {
  const utils = api.useUtils();
  const lastUpdateRef = useRef(0);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoggedRef = useRef(false);

  // Validiere investigationId
  const isValidId = isValidInvestigationId(investigationId);

  // Bestimme ID-Typ für optimierte Synchronisation
  const idType = useCallback(() => {
    if (!investigationId) return "invalid";
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(investigationId)) {
      return "uuid";
    }
    if (/^(?:POL-)?\d{4}-[A-Z]-\d{3,6}(?:-[A-Z])?$/.test(investigationId)) {
      return "case_number";
    }
    return "unknown";
  }, [investigationId]);

  // Optimierte Synchronisation basierend auf ID-Typ
  useEffect(() => {
    if (!isValidId) return;

    const type = idType();
    if (process.env.NODE_ENV === "development") {
      console.log("🔄 Investigation Sync konfiguriert:", {
        id: investigationId,
        type,
        isValid: isValidId,
      });
    }
  }, [investigationId, idType, isValidId]);

  // Query mit optimierter Synchronisation und Validierung
  const {
    data: investigation,
    isLoading,
    error,
    refetch,
  } = api.post.getInvestigation.useQuery(
    { id: investigationId },
    {
      enabled: isValidId, // Nur ausführen wenn ID gültig ist
      staleTime: 15 * 60 * 1000, // 15 Minuten Cache (erhöht für bessere Performance)
      refetchOnWindowFocus: false, // Verhindert unnötige Refetches
      refetchOnMount: false, // Verhindert Refetch beim Tab-Wechsel
      refetchOnReconnect: true,
      refetchInterval: 300000, // Alle 5 Minuten als Fallback (erhöht)
      retry: (failureCount, error) => {
        // Retry-Logik verbessern
        if (failureCount < 2) { // Reduziert von 3 auf 2
          if (process.env.NODE_ENV === "development") {
            console.log(`🔄 Retry ${failureCount + 1}/2 für getInvestigation`);
          }
          return true;
        }
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Max retries erreicht für getInvestigation:", error);
        }
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 10000), // Reduziert
    },
  );

  // Debug-Logs nur in Development und nur bei Änderungen
  useEffect(() => {
    if (investigation && !hasLoggedRef.current && process.env.NODE_ENV === "development") {
      console.log("✅ Investigation geladen:", {
        id: (investigation as Investigation).id,
        title: (investigation as Investigation).title,
        case_number: (investigation as Investigation).case_number,
      });
      hasLoggedRef.current = true;
    }
  }, [investigation]);

  // Optimierte Cache-Invalidierung mit reduzierter Frequenz
  const invalidateCache = useCallback(() => {
    if (!isValidId) return;

    const now = Date.now();
    if (now - lastUpdateRef.current > 30000) { // Erhöht auf 30 Sekunden
      lastUpdateRef.current = now;
      void utils.post.getInvestigation.invalidate({ id: investigationId });
    }
  }, [investigationId, utils, isValidId]);

  // Optimierte Synchronisation mit reduzierter Frequenz
  useEffect(() => {
    if (!isValidId) return;

    // Reduzierte Synchronisation alle 5 Minuten
    syncIntervalRef.current = setInterval(() => {
      const now = Date.now();
      if (now - lastUpdateRef.current > 300000) { // Nur alle 5 Minuten synchronisieren
        lastUpdateRef.current = now;
        void refetch();
      }
    }, 300000); // Reduziert auf 5 Minuten

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [investigationId, refetch, isValidId]);

  // Optimierte manuelle Synchronisation
  const manualSync = useCallback(async () => {
    if (!isValidId) return;

    const now = Date.now();
    if (now - lastUpdateRef.current > 30000) { // Erhöht auf 30 Sekunden
      lastUpdateRef.current = now;
      await refetch();
    }
  }, [refetch, isValidId]);

  return {
    investigation,
    isLoading: isLoading || !isValidId, // Loading auch wenn ID ungültig
    error,
    refetch: manualSync,
    invalidateCache,
  };
}
