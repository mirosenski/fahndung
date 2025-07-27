# Design-System Dokumentation

## 🎨 Übersicht

Dieses Projekt verwendet ein zentrales Design-System basierend auf **shadcn/ui** und **Tailwind CSS 4.1** mit CSS-Variablen für konsistente Styling-Patterns.

## 📋 Design-Tokens

### Farben

Alle Farben sind als CSS-Variablen definiert und unterstützen Dark Mode:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
}
```

### Verwendung

```tsx
import { colors, layout, componentClasses } from "~/lib/design-tokens";

// Hintergrund
<div className={colors.background.primary}>

// Text
<p className={colors.text.primary}>

// Border
<div className={colors.border.primary}>

// Layout
<div className={layout.container}>
```

## 🧩 Komponenten

### Button

```tsx
import { Button } from "~/components/ui/button";

<Button variant="default" size="lg">
  Klick mich
</Button>;
```

**Varianten:**

- `default` - Primärer Button
- `destructive` - Gefährliche Aktionen
- `outline` - Sekundäre Aktionen
- `secondary` - Tertiäre Aktionen
- `ghost` - Subtile Aktionen
- `link` - Link-ähnlicher Button

**Größen:**

- `default` - Standard
- `sm` - Klein
- `lg` - Groß
- `icon` - Quadratisch für Icons

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Titel</CardTitle>
  </CardHeader>
  <CardContent>Inhalt</CardContent>
</Card>;
```

### Badge

```tsx
import UniversalBadge from "~/components/ui/UniversalBadge";

<UniversalBadge content="WANTED_PERSON" variant="category" size="md" />;
```

**Varianten:**

- `default` - Standard
- `category` - Kategorien (blau)
- `priority` - Prioritäten (orange)
- `status` - Status (grün)
- `success` - Erfolg (grün)
- `warning` - Warnung (gelb)
- `error` - Fehler (rot)
- `info` - Information (blau)

## 🔧 Migration

### Von Gray-Klassen zu Design-Tokens

**Vorher:**

```tsx
<div className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
```

**Nachher:**

```tsx
<div className="bg-muted text-muted-foreground">
```

### Migration-Script

```bash
# Migration ausführen
node scripts/migrate-to-design-tokens.js

# Dry-Run (nur Anzeige der Änderungen)
node scripts/migrate-to-design-tokens.js --dry-run
```

## 📝 Best Practices

### 1. Design-Tokens verwenden

```tsx
// ❌ Vermeiden
<div className="bg-gray-100 text-gray-800">

// ✅ Verwenden
<div className={colors.background.muted + " " + colors.text.secondary}>
```

### 2. Komponenten-Varianten nutzen

```tsx
// ❌ Vermeiden
<button className="bg-blue-500 text-white px-4 py-2 rounded">

// ✅ Verwenden
<Button variant="default" size="lg">
```

### 3. Konsistente Spacing

```tsx
// Layout-Tokens verwenden
<div className={layout.container}>
  <section className={layout.section}>
    <Card className={componentClasses.card.base}>
```

### 4. Dark Mode Support

Alle Komponenten unterstützen automatisch Dark Mode über CSS-Variablen.

## 🎯 Komponenten-Architektur

### Struktur

```
src/
├── components/
│   ├── ui/           # shadcn/ui Komponenten
│   ├── layout/       # Layout-Komponenten
│   ├── dashboard/    # Dashboard-spezifische Komponenten
│   └── shared/       # Gemeinsame Komponenten
├── lib/
│   ├── design-tokens.ts  # Zentrale Design-Tokens
│   └── utils.ts          # Utility-Funktionen
└── styles/
    ├── globals.css       # Globale Styles
    └── focus.css         # Fokus-Styles
```

### Neue Komponenten erstellen

1. **Design-Tokens definieren:**

```tsx
// In lib/design-tokens.ts
export const components = {
  myComponent: {
    base: "base-classes",
    variant1: "variant-classes",
    variant2: "variant-classes",
  },
};
```

2. **Komponente implementieren:**

```tsx
import { cn } from "~/lib/utils";
import { components } from "~/lib/design-tokens";

const MyComponent = ({ className, variant = "base", ...props }) => (
  <div className={cn(components.myComponent[variant], className)} {...props} />
);
```

## 🔍 Qualitätssicherung

### Linting

```bash
# Design-Token Compliance prüfen
npm run lint:design-tokens

# Gray-Klassen finden
npm run find-gray-classes
```

### Automatisierte Tests

```bash
# Komponenten-Tests
npm run test:components

# Visual Regression Tests
npm run test:visual
```

## 📚 Ressourcen

- [shadcn/ui Dokumentation](https://ui.shadcn.com/)
- [Tailwind CSS 4.1 Dokumentation](https://tailwindcss.com/)
- [Radix UI Komponenten](https://www.radix-ui.com/)
- [CSS-Variablen Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

## 🚀 Nächste Schritte

1. **Migration abschließen:** Alle Gray-Klassen zu Design-Tokens migrieren
2. **Komponenten erweitern:** Fehlende shadcn/ui Komponenten hinzufügen
3. **Tests implementieren:** Automatisierte Tests für Design-Konsistenz
4. **Dokumentation erweitern:** Storybook oder ähnliches für Komponenten-Dokumentation
