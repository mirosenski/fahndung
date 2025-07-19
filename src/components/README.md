# Komponenten-Struktur

Diese Ordnerstruktur folgt den Next.js Best Practices für die Organisation von UI-Komponenten.

## 📁 Ordner-Struktur

```
src/components/
├── layout/          # Layout-Komponenten (Header, Footer, Sidebar, etc.)
├── ui/              # Basis-UI-Komponenten (Button, Input, Card, etc.)
├── forms/           # Formular-Komponenten (LoginForm, RegisterForm, etc.)
└── README.md        # Diese Datei
```

## 🎯 Verwendungsrichtlinien

### `layout/` - Layout-Komponenten

- **Header.tsx** - Hauptnavigation und Logo
- **Footer.tsx** - Fußbereich (falls benötigt)
- **Sidebar.tsx** - Seitenleiste (falls benötigt)
- **Layout.tsx** - Haupt-Layout-Wrapper

### `ui/` - Basis-UI-Komponenten

- **Button.tsx** - Wiederverwendbare Buttons
- **Input.tsx** - Eingabefelder
- **Card.tsx** - Karten-Komponenten
- **Modal.tsx** - Modal-Dialoge
- **Badge.tsx** - Badges/Labels

### `forms/` - Formular-Komponenten

- **LoginForm.tsx** - Anmeldeformular
- **RegisterForm.tsx** - Registrierungsformular
- **SearchForm.tsx** - Suchformulare

## 📝 Naming Conventions

- **PascalCase** für Komponenten-Dateien: `Header.tsx`
- **camelCase** für Ordner: `layout/`, `ui/`
- **Beschreibende Namen**: `UserProfileCard.tsx` statt `Card.tsx`

## 🔗 Import-Beispiele

```tsx
// Layout-Komponenten
import Header from "~/components/layout/Header";

// UI-Komponenten
import Button from "~/components/ui/Button";
import Card from "~/components/ui/Card";

// Formular-Komponenten
import LoginForm from "~/components/forms/LoginForm";
```

## ✅ Best Practices

1. **Wiederverwendbarkeit**: Komponenten sollten generisch und wiederverwendbar sein
2. **Props-Interface**: Immer TypeScript-Interfaces für Props definieren
3. **Default Props**: Sinnvolle Standardwerte setzen
4. **Dokumentation**: JSDoc-Kommentare für komplexe Komponenten
5. **Testing**: Komponenten sollten testbar sein

## 🚀 Neue Komponenten erstellen

1. Wähle den passenden Ordner (`layout/`, `ui/`, `forms/`)
2. Erstelle die Komponente mit PascalCase-Namen
3. Definiere TypeScript-Interfaces für Props
4. Füge JSDoc-Kommentare hinzu
5. Teste die Komponente
