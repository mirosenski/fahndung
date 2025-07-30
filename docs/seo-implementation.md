# SEO-Implementierung für Fahndungsdetailseiten

## Übersicht

Diese Implementierung fügt SEO-optimierte URLs für Fahndungsdetailseiten hinzu, ohne die bestehende Funktionalität zu beeinträchtigen.

## Implementierte Features

### 1. SEO-URLs
- **Neue Route**: `/fahndungen/seo/[slug]/page.tsx`
- **Format**: `/fahndungen/seo/titel-der-fahndung-2024-k-001`
- **Beispiel**: `/fahndungen/seo/vermisste-person-muenchen-2024-k-001`

### 2. URL-Generierung
- **Funktion**: `generateSeoSlug(title, caseNumber)`
- **Regeln**:
  - Umlaute werden ersetzt (ä→ae, ö→oe, ü→ue, ß→ss)
  - Sonderzeichen werden zu Bindestrichen
  - Mehrfache Bindestriche werden zu einem
  - Fallnummer wird am Ende angehängt

### 3. Validierung
- **Slug-Validierung**: Prüft ob der generierte Slug mit dem Request übereinstimmt
- **Fallnummer-Extraktion**: Extrahiert die Fallnummer aus dem Slug
- **404-Fallback**: Bei ungültigen URLs wird `notFound()` zurückgegeben

### 4. Canonical URLs
- **Metadata**: Jede Detailseite hat eine Canonical URL
- **Alternative URLs**: Alle verfügbaren URLs werden als Alternativen angegeben
- **SEO-Optimierung**: Suchmaschinen wissen, welche URL die Hauptversion ist

## Dateien

### Neue Dateien
- `src/lib/seo.ts` - SEO-Utilities
- `src/app/fahndungen/seo/[slug]/page.tsx` - SEO-Route
- `src/app/fahndungen/[id]/metadata.tsx` - Metadata für bestehende Route

### Angepasste Dateien
- `src/components/fahndungskarte/Fahndungskarte.tsx` - Verwendet SEO-URLs
- `src/middleware.ts` - Vorbereitet für 301 Redirects (optional)

## URL-Beispiele

| Typ | URL | Status |
|-----|-----|--------|
| Alt | `/fahndungen/2024-K-001` | ✅ Funktioniert weiterhin |
| Alt | `/fahndungen/123e4567...` | ✅ Funktioniert weiterhin |
| Neu | `/fahndungen/seo/vermisste-person-muenchen-2024-k-001` | ✅ Neue SEO-URL |

## Sicherheit

### Warum ist das sicher?
1. **Keine DB-Änderungen** - Nutzt existierende `case_number` und `title`
2. **Parallele URLs** - Alte URLs bleiben funktional
3. **Validierung** - Generierter Slug muss mit Request übereinstimmen
4. **SEO-Optimierung** - Canonical Tags und 301 Redirects

### Reversibilität
Die Lösung ist 100% reversibel und kann jederzeit deaktiviert werden, indem die neue Route und ggf. die Middleware entfernt werden.

## Verwendung

### SEO-URL generieren
```typescript
import { generateSeoUrl } from "~/lib/seo";

const seoUrl = generateSeoUrl("Vermisste Person München", "2024-K-001");
// Ergebnis: "/fahndungen/seo/vermisste-person-muenchen-2024-k-001"
```

### Fahndungs-URL mit Fallback
```typescript
import { getFahndungUrl } from "~/lib/seo";

const url = getFahndungUrl(title, caseNumber, id);
// Verwendet SEO-URL wenn möglich, sonst Standard-URL
```

## Zukünftige Erweiterungen

### 301 Redirects (optional)
Die Middleware ist vorbereitet für automatische 301 Redirects von alten URLs zu SEO-URLs:

```typescript
// In src/middleware.ts (auskommentiert)
if (pathname.match(/^\/fahndungen\/(?!seo\/)[^/]+$/)) {
  const id = pathname.split('/').pop();
  const investigation = await fetchInvestigation(id);
  const newPath = `/fahndungen/seo/${generateSeoSlug(investigation.title, investigation.case_number)}`;
  return NextResponse.redirect(new URL(newPath, request.url), 301);
}
```

### Sitemap-Generierung
Für bessere SEO könnte eine automatische Sitemap-Generierung hinzugefügt werden.

## Testing

### Manuelle Tests
1. **Bestehende URLs**: `/fahndungen/2024-K-001` sollte funktionieren
2. **SEO-URLs**: `/fahndungen/seo/vermisste-person-muenchen-2024-k-001` sollte funktionieren
3. **Ungültige URLs**: Sollten 404 zurückgeben
4. **Fahndungskarten**: Sollten zu SEO-URLs verlinken

### Automatisierte Tests
```bash
# Test der SEO-URL-Generierung
npm run test:seo

# Test der URL-Validierung
npm run test:validation
``` 