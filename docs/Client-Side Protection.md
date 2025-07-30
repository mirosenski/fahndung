# Client-Side Protection - Implementierung

## ✅ Was wurde implementiert:

### 1. Erweiterte ProtectedRoute Komponente

- **Datei**: `src/components/ProtectedRoute.tsx`
- **Funktionen**:
  - Authentifizierungsprüfung
  - Rollenprüfung mit `requiredRoles` Parameter
  - Loading States und Error Handling
  - Automatische Weiterleitung bei fehlenden Berechtigungen

### 2. Wizard-Seite (/fahndungen/neu/enhanced)

- **Datei**: `src/app/fahndungen/neu/enhanced/page.tsx`
- **Schutz**: Admin/Super-Admin nur
- **Implementierung**: ProtectedRoute mit `requiredRoles={["admin", "super_admin"]}`

### 3. Bearbeitungsseite (/fahndungen/[slug]/bearbeiten)

- **Datei**: `src/app/fahndungen/[slug]/bearbeiten/page.tsx`
- **Umstellung**: Von Server zu Client Component
- **Schutz**: Editor/Admin/Super-Admin
- **Implementierung**: ProtectedRoute mit `requiredRoles={["editor", "admin", "super_admin"]}`
- **tRPC Integration**: Verwendet `api.post.getInvestigation.useQuery` und `api.post.getInvestigations.useQuery`
- **SEO-Slug Unterstützung**: Unterstützt sowohl Fallnummern als auch SEO-Slugs für die Bearbeitung

### 4. Bearbeitungsbutton in Detailseite

- **Datei**: `src/components/fahndungen/FahndungDetailContent.tsx`
- **Schutz**: Editor/Admin/Super-Admin nur sichtbar
- **Implementierung**: Rollenprüfung mit `canEdit()` Hilfsfunktion

### 5. Hilfsfunktionen für Rollenprüfungen

- **Datei**: `src/lib/auth.ts`
- **Funktionen**:
  - `hasRole(profile, requiredRoles)`: Allgemeine Rollenprüfung
  - `canEdit(profile)`: Prüft Bearbeitungsrechte
  - `canCreate(profile)`: Prüft Erstellungsrechte
  - `canDelete(profile)`: Prüft Löschrechte
  - `canManageUsers(profile)`: Prüft Benutzerverwaltungsrechte
  - `canAccessWizard(profile)`: Prüft Wizard-Zugriff

## 🔒 Aktuelle Autorisierungsmatrix:

| Route                               | User | Editor | Admin | Super Admin |
| ----------------------------------- | ---- | ------ | ----- | ----------- |
| `/fahndungen` (Liste)               | ✅   | ✅     | ✅    | ✅          |
| `/fahndungen/[id]` (Detail)         | ✅   | ✅     | ✅    | ✅          |
| `/fahndungen/neu/enhanced` (Wizard) | ❌   | ❌     | ✅    | ✅          |
| `/fahndungen/[id]/bearbeiten`       | ❌   | ✅     | ✅    | ✅          |
| Bearbeitungsbutton                  | ❌   | ✅     | ✅    | ✅          |

## 🎯 Implementierungsdetails:

### ProtectedRoute Komponente

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredRoles?: ("user" | "editor" | "admin" | "super_admin")[];
}
```

### Verwendung in Seiten

```typescript
// Wizard-Seite
<ProtectedRoute requiredRoles={["admin", "super_admin"]}>
  <FahndungWizardContainer />
</ProtectedRoute>

// Bearbeitungsseite
<ProtectedRoute requiredRoles={["editor", "admin", "super_admin"]}>
  <EnhancedFahndungWizard />
</ProtectedRoute>
```

### Rollenprüfung in Komponenten

```typescript
// Bearbeitungsbutton
{canEdit(session?.profile ?? null) && (
  <Link href={editUrl}>
    <Edit3 className="h-4 w-4" />
    Bearbeiten
  </Link>
)}
```

## 🔧 SEO-Slug Unterstützung:

### Bearbeitungsseite

Die Bearbeitungsseite unterstützt jetzt sowohl Fallnummern als auch SEO-Slugs:

- **Fallnummern**: Direkte Unterstützung (z.B. `2024-K-001`)
- **SEO-Slugs**: Automatische Auflösung über Titel-Slug (z.B. `vermisste-person-muenchen`)

### Implementierung

```typescript
// tRPC Query für alle Fahndungen (für Slug-Auflösung)
const investigationsQuery = api.post.getInvestigations.useQuery(
  { limit: 50 },
  {
    enabled: !!slug && !/^(?:POL-)?\d{4}-[A-Z]-\d{3,6}(?:-[A-Z])?$/.test(slug),
  },
);

// Dynamische Slug-Auflösung
void import("~/lib/seo").then(({ generateSeoSlug }) => {
  for (const investigation of investigationsQuery.data) {
    const expectedSlug = generateSeoSlug(investigation.title);
    if (expectedSlug === slug) {
      setInvestigationId(investigation.case_number);
      return;
    }
  }
});
```

## ⚠️ Wichtige Punkte:

1. **Alle geschützten Seiten sind Client Components** (`"use client"`)
2. **useAuth Hook** wird für Session-Daten verwendet
3. **Keine Server-Side Redirects** in App Router
4. **Loading States** sind für UX wichtig
5. **Session-Daten** sind nur Client-Side verfügbar
6. **Middleware** kann keine Supabase-Sessions validieren

## 🔧 Technische Details:

### Session-Typen

```typescript
interface Session {
  user: {
    id: string;
    email: string;
  };
  profile: UserProfile | null;
}

interface UserProfile {
  role: "admin" | "editor" | "user" | "super_admin";
  // ... weitere Felder
}
```

### Rollenprüfung

```typescript
export const hasRole = (
  profile: UserProfile | null,
  requiredRoles: string[],
): boolean => {
  if (!profile?.role) return false;
  return requiredRoles.includes(profile.role);
};
```

## 🚀 Nächste Schritte:

1. **Header-Komponente** ist bereits korrekt implementiert
2. **"+Fahndung" Button** nur für Admin/Super-Admin
3. **Rollenbasierte Anzeige** funktioniert

## 📋 Status:

- ✅ ProtectedRoute mit Rollenprüfung
- ✅ Wizard-Seite geschützt
- ✅ Bearbeitungsseite umgestellt
- ✅ Bearbeitungsbutton mit Rollenprüfung
- ✅ Hilfsfunktionen für Rollenprüfungen
- ✅ Loading States und Error Handling
- ✅ tRPC Integration
- ✅ SEO-Slug Unterstützung für Bearbeitung

Die Client-Side Protection ist vollständig implementiert und entspricht dem Plan!
