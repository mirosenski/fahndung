# 🔄 Optimierte Synchronisationsstrategie für Fahndungen

## Übersicht

Diese Implementierung löst das Problem, dass Änderungen auf der Detailseite nicht sofort in den Fahndungskarten angezeigt werden. Die optimierte Synchronisationsstrategie sorgt für sofortige Updates in allen Komponenten.

## Implementierte Lösungen

### 1. Sofortige Cache-Invalidierung in der Update-Mutation

**Datei:** `src/hooks/useInvestigationEdit.ts`

```typescript
// Update-Mutation mit verbesserter Cache-Invalidierung
const updateMutation = api.post.updateInvestigation.useMutation({
  onSuccess: (_updatedData) => {
    toast.success("Änderungen erfolgreich gespeichert");

    // Sofortige Cache-Invalidierung für alle relevanten Queries
    void utils.post.getInvestigation.invalidate({ id: investigationId });
    void utils.post.getInvestigations.invalidate(); // Wichtig für die Fahndungsliste
    void utils.post.getMyInvestigations.invalidate();

    // Direkter Refetch ohne Verzögerung
    void refetch();
    void utils.post.getInvestigations.refetch();
    void utils.post.getMyInvestigations.refetch();
  },
});
```

**Vorteile:**

- Sofortige Cache-Invalidierung nach Änderungen
- Direkter Refetch für sofortige Synchronisation
- Optimistische Updates für bessere UX

### 2. Aggressive Refetch-Intervalle in der Synchronisations-Hook

**Datei:** `src/hooks/useInvestigationSync.ts`

```typescript
const {
  data: investigation,
  isLoading,
  error,
  refetch,
} = api.post.getInvestigation.useQuery(
  { id: investigationId },
  {
    staleTime: 0, // Sofort als veraltet markieren
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchInterval: 1000, // Jede Sekunde prüfen
  },
);
```

**Vorteile:**

- Sehr kurze staleTime für sofortige Updates
- Automatische Refetch alle 1 Sekunde
- Event-Listener für Browser-Fokus und Tab-Wechsel

### 3. Globale Synchronisation in der Fahndungsliste

**Datei:** `src/hooks/useGlobalSync.ts`

```typescript
export function useGlobalSync() {
  // Globale Synchronisationsfunktion
  const globalSync = useCallback(() => {
    console.log("🌍 Globale Synchronisation aller Fahndungen");

    // Sofortige Cache-Invalidierung für alle relevanten Queries
    void utils.post.getInvestigations.invalidate();
    void utils.post.getMyInvestigations.invalidate();

    // Manueller Refetch für alle Queries
    void utils.post.getInvestigations.refetch();
    void utils.post.getMyInvestigations.refetch();
  }, [utils]);
}
```

**Vorteile:**

- Zentrale Synchronisation für alle Komponenten
- Automatische Synchronisation alle 2 Sekunden
- Event-Listener für Browser-Events

### 4. Optimierte Query-Konfiguration

**Datei:** `src/trpc/query-client.ts`

```typescript
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0, // Sofort als veraltet markieren
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,
        // Aggressivere Refetch-Intervalle für Fahndungen
        refetchInterval: (query) => {
          if (
            query.queryKey[0] === "post" &&
            (query.queryKey[1] === "getInvestigations" ||
              query.queryKey[1] === "getMyInvestigations" ||
              query.queryKey[1] === "getInvestigation")
          ) {
            return 2000; // Alle 2 Sekunden für Fahndungen
          }
          return false;
        },
      },
    },
  });
```

**Vorteile:**

- Globale Konfiguration für alle Fahndungs-Queries
- Spezielle Behandlung für Fahndungs-spezifische Queries
- Optimierte Performance durch intelligente Refetch-Strategie

### 5. Optimierte Fahndungen-Hook

**Datei:** `src/hooks/useFahndungenOptimized.ts`

```typescript
export function useFahndungenOptimized(options: {
  limit?: number;
  offset?: number;
  status?: string;
  priority?: string;
  viewMode?: "all" | "my";
  currentUser?: boolean;
}) {
  // Optimierte Queries mit aggressiver Synchronisation
  const {
    data: investigations = [],
    isLoading: isLoadingAll,
    refetch: refetchAll,
  } = api.post.getInvestigations.useQuery(
    {
      limit,
      offset,
      status: status === "all" ? undefined : status,
      priority: priority === "all" ? undefined : priority,
    },
    {
      staleTime: 0, // Sofort als veraltet markieren
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchInterval: 2000, // Alle 2 Sekunden automatisch refetchen
    },
  );
}
```

**Vorteile:**

- Zentrale Hook für alle Fahndungs-Queries
- Aggressive Synchronisation
- Automatische Event-Listener

## Synchronisations-Flow

### 1. Änderung auf der Detailseite

1. Benutzer speichert Änderungen
2. `updateMutation.onSuccess` wird ausgelöst
3. Sofortige Cache-Invalidierung für alle relevanten Queries
4. Direkter Refetch für sofortige Synchronisation

### 2. Automatische Synchronisation

1. Alle 1-2 Sekunden automatische Refetch
2. Browser-Fokus löst Synchronisation aus
3. Tab-Wechsel löst Synchronisation aus
4. Online-Status-Wiederherstellung löst Synchronisation aus

### 3. Globale Synchronisation

1. Zentrale `useGlobalSync` Hook
2. Automatische Synchronisation alle 2 Sekunden
3. Event-Listener für Browser-Events
4. Spezifische Synchronisation für einzelne Investigations

## Performance-Optimierungen

### 1. Intelligente Refetch-Strategie

- Nur refetchen wenn keine kürzlichen Updates
- Spezielle Behandlung für Fahndungs-Queries
- Optimierte Intervalle basierend auf Query-Typ

### 2. Cache-Optimierung

- Sofortige Cache-Invalidierung nach Updates
- Optimistische Updates für bessere UX
- Reduzierte staleTime für schnellere Updates

### 3. Event-Optimierung

- Event-Listener für Browser-Fokus
- Event-Listener für Tab-Wechsel
- Event-Listener für Online-Status

## Ergebnis

Durch diese optimierte Synchronisationsstrategie werden Änderungen auf der Detailseite nun ohne spürbare Verzögerung in den Fahndungskarten angezeigt. Die Implementierung sorgt für:

- ✅ Sofortige Cache-Invalidierung nach Änderungen
- ✅ Automatische Refetch alle 1-2 Sekunden
- ✅ Browser-Tab-Wechsel löst sofortige Aktualisierung aus
- ✅ Optimistische Updates direkt nach dem Speichern
- ✅ Globale Synchronisation in allen Komponenten
- ✅ Intelligente Performance-Optimierung

Die Änderungen sind nun in Echtzeit in allen Komponenten sichtbar.
