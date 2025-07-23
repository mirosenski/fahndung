# Fahndung - PTLS

Polizei-Technisches Logistik-System mit vollständiger shadcn/ui Integration.

## 🎨 shadcn/ui Integration

Dieses Projekt ist vollständig mit [shadcn/ui](https://ui.shadcn.com/) integriert und bietet:

### ✨ Features

- **Open Code**: Vollständiger Zugriff auf alle Komponenten
- **Dark Mode**: Vollständig funktionsfähiges Theme-System
- **AI-Ready**: Optimiert für KI-Tools und Code-Generierung
- **Accessible**: Vollständige Tastatur-Navigation und Screen Reader Support
- **Composable**: Konsistente API für alle Komponenten

### 🎯 Komponenten

#### Theme System

- `ModeToggle` - Dropdown-basierter Theme-Switch
- `ThemeProvider` - next-themes Integration
- `NoSSR` - Hydration-sichere Komponenten

#### UI Komponenten

- `Button` - Alle Varianten (default, secondary, outline, ghost, link, destructive)
- `Card` - Karten-Layout mit Header, Content, Description
- `DropdownMenu` - Vollständig zugängliche Dropdowns

### 🚀 Verwendung

```tsx
import { Button } from "~/components/ui/button"
import { ModeToggle } from "~/components/ui/mode-toggle"
import { NoSSR } from "~/components/ui/no-ssr"

// In Komponenten
<NoSSR>
  <ModeToggle />
</NoSSR>

<Button variant="outline" size="lg">
  Klick mich
</Button>
```

### 🎨 Design System

#### Farben (OKLCH)

- `primary` - Hauptfarbe
- `secondary` - Sekundärfarbe
- `muted` - Gedämpfte Farbe
- `accent` - Akzentfarbe
- `destructive` - Fehlerfarbe

#### Typografie

- `text-foreground` - Haupttext
- `text-muted-foreground` - Gedämpfter Text
- `text-primary-foreground` - Text auf Primärfarbe

### ⌨️ Tastatur-Navigation

Alle Komponenten sind vollständig tastaturzugänglich:

- **Tab** - Navigation zwischen Elementen
- **Enter/Leertaste** - Aktivieren von Buttons/Dropdowns
- **Pfeiltasten** - Navigieren in Dropdowns
- **Escape** - Schließen von Dropdowns

### 🌙 Dark Mode

Das Theme-System unterstützt:

- **Hell-Modus** - Standard Light Theme
- **Dunkel-Modus** - Dark Theme
- **System-Modus** - Automatische Erkennung

### 🔧 Konfiguration

#### components.json

```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "~/components",
    "utils": "~/lib/utils"
  }
}
```

#### globals.css

Verwendet OKLCH-Farbraum für bessere Farbdarstellung und Dark Mode Support.

### 📱 Demo

Besuchen Sie `/theme-demo` um alle Features zu testen:

- Theme Toggle mit Dropdown
- Button-Varianten
- Farbpalette
- Typografie
- Zugänglichkeit

### 🛠️ Entwicklung

```bash
# Development Server starten
pnpm dev

# Komponenten hinzufügen
pnpm dlx shadcn@latest add [component-name]

# Build
pnpm build
```

### 📦 Abhängigkeiten

- `next-themes` - Theme Management
- `@radix-ui/react-dropdown-menu` - Dropdown Komponenten
- `class-variance-authority` - Komponenten-Varianten
- `clsx` & `tailwind-merge` - CSS-Klassen Management
- `lucide-react` - Icons

### 🎯 Best Practices

1. **Hydration-Sicherheit**: Verwenden Sie `NoSSR` für client-seitige Komponenten
2. **Zugänglichkeit**: Alle Komponenten sind ARIA-konform
3. **Performance**: Optimierte CSS-Variablen und Tailwind
4. **Konsistenz**: Einheitliches Design-System

### 🔄 Migration

Das bestehende Theme-System bleibt kompatibel und kann parallel verwendet werden.

---

**shadcn/ui** - "This is not a component library. It is how you build your component library."
