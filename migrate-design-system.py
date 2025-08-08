#!/usr/bin/env python3
# Datei: migrate-design-system.py

import os
import re
import sys
import shutil
from pathlib import Path
from datetime import datetime

# Farben für Terminal‑Ausgabe
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
BLUE = '\033[94m'
RESET = '\033[0m'

def create_backup(src_dir: Path):
    """Erstellt ein Backup des src-Verzeichnisses."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = Path(f"src_backup_{timestamp}")
    
    if backup_dir.exists():
        shutil.rmtree(backup_dir)
    
    shutil.copytree(src_dir, backup_dir)
    print(f"{BLUE}📦 Backup erstellt: {backup_dir}{RESET}")
    return backup_dir

def migrate_design_system():
    """Migriert das gesamte Projekt auf das neue Design‑System."""

    project_root = Path('.')
    src_dir = project_root / 'src'

    if not src_dir.exists():
        print(f"{RED}❌ Fehler: src/ Ordner nicht gefunden!{RESET}")
        print(f"Bitte das Skript im Projekt‑Root ausführen (wo src/ liegt)")
        return False

    # Backup erstellen
    backup_dir = create_backup(src_dir)

    # Ersetzungsregeln - verbesserte Regex-Patterns
    replacements = [
        # Border‑Radius - präzisere Patterns
        (r'\brounded-sm\b', 'rounded-lg'),
        (r'\brounded-md\b', 'rounded-lg'),
        (r'\brounded-xl\b', 'rounded-lg'),
        (r'\brounded-2xl\b', 'rounded-lg'),
        (r'\brounded-3xl\b', 'rounded-lg'),

        # Grautöne – Background (verbesserte Regex)
        (r'\bbg-gray-(?:50|100|200|300|400|500|600|700|800|900)\b', 'bg-muted'),
        # Grautöne – Text
        (r'\btext-gray-(?:50|100|200|300|400|500|600|700|800|900)\b', 'text-muted-foreground'),
        # Grautöne – Border
        (r'\bborder-gray-(?:50|100|200|300|400|500|600|700|800|900)\b', 'border-border'),

        # Dark‑Mode Grautöne
        (r'\bdark:bg-gray-(?:50|100|200|300|400|500|600|700|800|900)\b', 'dark:bg-card'),
        (r'\bdark:text-gray-(?:50|100|200|300|400|500|600|700|800|900)\b', 'dark:text-muted-foreground'),
        (r'\bdark:border-gray-(?:50|100|200|300|400|500|600|700|800|900)\b', 'dark:border-border'),

        # Shadow‑System
        (r'\bshadow-(?:md|lg|xl|2xl)\b', 'shadow-sm'),
    ]

    # Klassen, die nicht ersetzt werden sollen
    skip_patterns = [
        'rounded-full',
        'rounded-none',
        'shadow-none',
        'shadow-xs',
    ]

    total_files = 0
    modified_files = 0
    total_replacements = 0
    errors = []

    print(f"{BLUE}🚀 Starte Design‑System‑Migration...{RESET}\n")

    for file_path in src_dir.rglob('*'):
        if file_path.suffix in ['.tsx', '.jsx', '.ts', '.js']:
            total_files += 1
            try:
                content = file_path.read_text(encoding='utf-8')
                original = content
                file_repl = 0

                for pattern, replacement in replacements:
                    # Skip, wenn der Treffer einer Ausnahme entspricht
                    def _repl(match: re.Match) -> str:
                        group = match.group(0)
                        if any(skip in group for skip in skip_patterns):
                            return group
                        return replacement

                    matches = len(re.findall(pattern, content))
                    if matches:
                        content = re.sub(pattern, _repl, content)
                        file_repl += matches
                        total_replacements += matches

                if content != original:
                    file_path.write_text(content, encoding='utf-8')
                    modified_files += 1
                    rel_path = file_path.relative_to(project_root)
                    print(f"{GREEN}✓{RESET} {rel_path} ({file_repl} Ersetzungen)")

            except Exception as e:
                error_msg = f"Fehler bei {file_path}: {e}"
                errors.append(error_msg)
                print(f"{RED}✗{RESET} {error_msg}")

    # Neue zentrale Datei anlegen
    design_system_path = src_dir / 'lib' / 'design-system.ts'
    create_design_system_file(design_system_path)

    print(f"\n{GREEN}{'='*60}{RESET}")
    print(f"{GREEN}✅ Migration abgeschlossen!{RESET}\n")
    print(f"📊 Statistik:")
    print(f"   • Dateien durchsucht: {total_files}")
    print(f"   • Dateien geändert:  {modified_files}")
    print(f"   • Ersetzungen gesamt: {total_replacements}")
    print(f"   • Design‑System erstellt: {design_system_path.relative_to(project_root)}")
    print(f"   • Backup erstellt: {backup_dir}")
    
    if errors:
        print(f"\n{RED}⚠️  Fehler aufgetreten:{RESET}")
        for error in errors:
            print(f"   • {error}")
    
    print(f"\n{YELLOW}⚠️  Nächste Schritte:{RESET}")
    print(f"   1. Änderungen prüfen: git diff")
    print(f"   2. App testen: pnpm dev")
    print(f"   3. Wenn alles passt: git add -A && git commit -m 'feat: Design‑System Migration'")
    print(f"   4. Bei Problemen: Backup wiederherstellen aus {backup_dir}")

    return True

def create_design_system_file(path: Path):
    """Schreibt eine zentrale design-system.ts Datei."""
    content = '''// Zentrales Design‑System (generiert durch migrate-design-system.py)

import { cn } from "~/lib/utils";

// Border Radius System
export const borderRadius = {
  default: "rounded-lg",
  avatar: "rounded-full",
  none: "rounded-none",
} as const;

// Shadows
export const shadows = {
  default: "shadow-sm",
  none: "shadow-none",
  xs: "shadow-xs",
} as const;

// Spacing (Beispiel)
export const spacing = {
  xs: "p-1",
  sm: "p-2",
  md: "p-3",
  lg: "p-4",
  xl: "p-6",
  "2xl": "p-8",
  "3xl": "p-12",
} as const;

// Komponenten‑Konfiguration (Beispiele)
export const components = {
  button: {
    base: cn(borderRadius.default, shadows.default, "transition-all hover:shadow-md"),
    variants: {
      primary: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      outline: "border border-border bg-background",
      ghost: "bg-transparent hover:bg-accent",
      destructive: "bg-destructive text-destructive-foreground",
    },
  },
  card: {
    base: cn(borderRadius.default, shadows.default, "bg-card text-card-foreground border border-border"),
  },
  // Weitere Komponenten ...
} as const;

export const getDesignToken = <T extends keyof typeof borderRadius>(
  token: T,
): typeof borderRadius[T] => borderRadius[token];

export const getShadow = <T extends keyof typeof shadows>(
  token: T,
): typeof shadows[T] => shadows[token];

export const getSpacing = <T extends keyof typeof spacing>(
  token: T,
): typeof spacing[T] => spacing[token];

// Export‑Typen
export type BorderRadius = keyof typeof borderRadius;
export type Shadow = keyof typeof shadows;
export type Spacing = keyof typeof spacing;
'''

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding='utf-8')
    print(f"{GREEN}✓{RESET} Design‑System erstellt: {path.relative_to(Path('.'))}")

if __name__ == "__main__":
    if not Path('src').exists():
        print(f"{RED}❌ Fehler: Bitte im Projekt‑Root ausführen (wo src/ liegt){RESET}")
        sys.exit(1)

    success = migrate_design_system()
    sys.exit(0 if success else 1)
