# Glassmorphism Design System für Headers

Ein modernes, realistisches Glasmorphismus-Design-System mit Tailwind CSS für Ihre Navigation.

## 🎨 Verfügbare Varianten

### 1. **Subtle** (Dezent)
- Leichter Blur-Effekt
- Hohe Transparenz (80%)
- Ideal für minimalistische Designs
- Beste Performance

### 2. **Frosted** (Standard)
- Mittlerer Blur-Effekt
- Ausgewogene Transparenz (60%)
- Klassischer Glass-Look
- Gute Balance zwischen Effekt und Performance

### 3. **Aurora** (Animiert)
- Animierte Farbverläufe
- Irideszierender Effekt
- Starker visueller Impact
- Höherer Performance-Bedarf

### 4. **Premium** (Maximum)
- Maximaler Blur-Effekt
- Multiple Layer für Tiefe
- Radiale Gradienten
- Höchste visuelle Qualität

## 🚀 Quick Start

```tsx
import { GlassmorphismHeader } from "./components/GlassmorphismHeader";

function App() {
  return (
    <GlassmorphismHeader 
      variant="frosted"
      isAuthenticated={true}
      onSearch={(query) => console.log(query)}
    />
  );
}
```

## 📦 Installation

### 1. Dependencies

```bash
npm install clsx tailwind-merge lucide-react
```

### 2. Tailwind Config

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
        '3xl': '64px',
      },
      backdropSaturate: {
        25: '.25',
        175: '1.75',
        200: '2',
      },
      animation: {
        'aurora': 'aurora 8s ease-in-out infinite',
        'gradient-x': 'gradient-x 15s ease infinite',
      },
    },
  },
}
```

### 3. CSS Animationen

Fügen Sie die Animationen aus `glassmorphism.css` zu Ihrer globalen CSS-Datei hinzu.

## 🎯 Best Practices

### Performance

1. **Mobile Optimierung**
   ```tsx
   // Reduziere Effekte auf mobilen Geräten
   const variant = isMobile ? "subtle" : "frosted";
   ```

2. **GPU Acceleration**
   ```css
   .glass-element {
     transform: translateZ(0);
     will-change: transform;
   }
   ```

3. **Reduced Motion**
   ```css
   @media (prefers-reduced-motion: reduce) {
     .glass {
       backdrop-filter: none;
       background: rgba(255, 255, 255, 0.95);
     }
   }
   ```

### Accessibility

1. **Kontraste beachten**
   - Mindestens 4.5:1 für normalen Text
   - 3:1 für großen Text
   - Teste mit verschiedenen Hintergründen

2. **Focus States**
   ```css
   .glass-button:focus-visible {
     outline: 2px solid rgb(59, 130, 246);
     outline-offset: 2px;
   }
   ```

### Design Tips

1. **Hintergrund ist wichtig**
   - Verwende Gradients oder Bilder
   - Bewegte Elemente verstärken den Effekt
   - Vermeide einfarbige Hintergründe

2. **Layering**
   ```tsx
   <div className="relative">
     <BackgroundLayer />
     <GlassLayer />
     <ContentLayer />
   </div>
   ```

3. **Kombinationen**
   - Glass + Shadows für Tiefe
   - Glass + Borders für Definition
   - Glass + Gradients für Farbe

## 🛠️ Erweiterte Anpassungen

### Custom Blur Levels

```tsx
<GlassCard blur="2xl">
  Starker Blur-Effekt
</GlassCard>
```

### Eigene Glass-Komponenten

```tsx
function CustomGlassElement({ children }) {
  return (
    <div className={cn(
      "relative overflow-hidden",
      "bg-white/50 dark:bg-gray-900/50",
      "backdrop-blur-xl backdrop-saturate-150",
      "border border-white/20",
      "shadow-glass",
      "before:absolute before:inset-0",
      "before:bg-gradient-to-br before:from-white/10 before:to-transparent"
    )}>
      {children}
    </div>
  );
}
```

### Dynamische Effekte

```tsx
const [intensity, setIntensity] = useState(50);

<div 
  className="backdrop-blur-md transition-all duration-300"
  style={{
    backgroundColor: `rgba(255, 255, 255, ${intensity / 100})`,
    backdropFilter: `blur(${intensity / 5}px)`
  }}
/>
```

## 🔧 Troubleshooting

### Problem: Blur funktioniert nicht
- Prüfe Browser-Kompatibilität
- Stelle sicher, dass ein Hintergrund vorhanden ist
- Verwende Vendor-Prefixes: `-webkit-backdrop-filter`

### Problem: Performance-Probleme
- Reduziere Blur-Intensität
- Verwende `will-change` sparsam
- Limitiere die Anzahl der Glass-Elemente

### Problem: Schlechte Lesbarkeit
- Erhöhe die Hintergrund-Opazität
- Füge einen subtilen Schatten hinzu
- Verwende dunklere Text-Farben

## 📊 Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| backdrop-filter | ✅ 76+ | ✅ 103+ | ✅ 9+ | ✅ 79+ |
| CSS Grid | ✅ | ✅ | ✅ | ✅ |
| Custom Properties | ✅ | ✅ | ✅ | ✅ |

## 🎨 Inspiration & Credits

- Inspiriert von macOS Big Sur Design
- Windows 11 Fluent Design
- Material You (Google)
- iOS 15+ Design Language

## 📝 Lizenz

MIT - Frei verwendbar für kommerzielle und private Projekte.