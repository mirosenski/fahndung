#!/usr/bin/env node

/**
 * Migration-Script für Design-Tokens
 * Migriert bestehende Gray-Klassen zu shadcn/ui Design-Tokens
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Design-Token Mapping
const MIGRATION_MAP = {
  // Hintergrund
  "bg-gray-100": "bg-muted",
  "bg-gray-200": "bg-muted",
  "bg-gray-50": "bg-muted/50",
  "bg-gray-800": "bg-card",
  "bg-gray-900": "bg-background",
  "bg-white": "bg-background",

  // Text
  "text-gray-900": "text-foreground",
  "text-gray-800": "text-foreground",
  "text-gray-700": "text-foreground",
  "text-gray-600": "text-muted-foreground",
  "text-gray-500": "text-muted-foreground",
  "text-gray-400": "text-muted-foreground",
  "text-gray-300": "text-muted-foreground",

  // Border
  "border-gray-200": "border-border",
  "border-gray-300": "border-border",
  "border-gray-600": "border-border",
  "border-gray-700": "border-border",

  // Dark Mode Varianten
  "dark:bg-gray-800": "dark:bg-card",
  "dark:bg-gray-900": "dark:bg-background",
  "dark:text-gray-400": "dark:text-muted-foreground",
  "dark:text-gray-300": "dark:text-muted-foreground",
  "dark:text-gray-200": "dark:text-muted-foreground",
  "dark:border-gray-700": "dark:border-border",
  "dark:border-gray-600": "dark:border-border",
};

// Komponenten-spezifische Migrationen
const COMPONENT_MIGRATIONS = {
  // Card-Komponenten
  "rounded-lg border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-700 dark:bg-gray-800":
    "rounded-lg border bg-card text-card-foreground shadow-xs",

  // Input-Komponenten
  "rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white":
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",

  // Badge-Komponenten
  "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300":
    "bg-secondary text-secondary-foreground",
};

function migrateContent(content) {
  let migratedContent = content;

  // Komponenten-spezifische Migrationen zuerst
  Object.entries(COMPONENT_MIGRATIONS).forEach(([oldPattern, newPattern]) => {
    const regex = new RegExp(
      oldPattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "g",
    );
    migratedContent = migratedContent.replace(regex, newPattern);
  });

  // Einzelne Klassen-Migrationen
  Object.entries(MIGRATION_MAP).forEach(([oldClass, newClass]) => {
    const regex = new RegExp(`\\b${oldClass}\\b`, "g");
    migratedContent = migratedContent.replace(regex, newClass);
  });

  return migratedContent;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const migratedContent = migrateContent(content);

    if (content !== migratedContent) {
      fs.writeFileSync(filePath, migratedContent, "utf8");
      console.log(`✅ Migriert: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  Keine Änderungen: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Fehler bei ${filePath}:`, error.message);
    return false;
  }
}

function migrateProject() {
  const srcDir = path.join(process.cwd(), "src");
  const patterns = [
    "src/**/*.tsx",
    "src/**/*.ts",
    "src/**/*.jsx",
    "src/**/*.js",
  ];

  let totalFiles = 0;
  let migratedFiles = 0;

  patterns.forEach((pattern) => {
    const files = glob.sync(pattern, { cwd: process.cwd() });

    files.forEach((file) => {
      totalFiles++;
      if (processFile(file)) {
        migratedFiles++;
      }
    });
  });

  console.log(`\n📊 Migration abgeschlossen:`);
  console.log(`   - Gesamt Dateien: ${totalFiles}`);
  console.log(`   - Migriert: ${migratedFiles}`);
  console.log(`   - Unverändert: ${totalFiles - migratedFiles}`);
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Design-Token Migration Tool

Verwendung:
  node scripts/migrate-to-design-tokens.js [options]

Optionen:
  --dry-run     Zeigt Änderungen ohne Speichern
  --help, -h    Zeigt diese Hilfe
  
Beispiele:
  node scripts/migrate-to-design-tokens.js
  node scripts/migrate-to-design-tokens.js --dry-run
    `);
    process.exit(0);
  }

  if (args.includes("--dry-run")) {
    console.log("🔍 Dry-Run Modus - keine Dateien werden geändert");
    // TODO: Implement dry-run mode
  }

  console.log("🚀 Starte Design-Token Migration...\n");
  migrateProject();
}

module.exports = { migrateContent, processFile };
