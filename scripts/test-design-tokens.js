#!/usr/bin/env node

/**
 * Test-Script für Design-Tokens
 * Validiert die korrekte Struktur und Verfügbarkeit der Design-Tokens
 */

const {
  colors,
  layout,
  componentClasses,
  components,
} = require("../src/lib/design-tokens.ts");

function testDesignTokens() {
  console.log("🧪 Teste Design-Tokens...\n");

  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Colors existieren
  try {
    if (
      colors.background.primary &&
      colors.text.primary &&
      colors.border.primary
    ) {
      console.log("✅ Colors-Tokens sind verfügbar");
      testsPassed++;
    } else {
      throw new Error("Colors-Tokens fehlen");
    }
  } catch (error) {
    console.log("❌ Colors-Tokens Test fehlgeschlagen:", error.message);
    testsFailed++;
  }

  // Test 2: Layout existiert
  try {
    if (layout.container && layout.section) {
      console.log("✅ Layout-Tokens sind verfügbar");
      testsPassed++;
    } else {
      throw new Error("Layout-Tokens fehlen");
    }
  } catch (error) {
    console.log("❌ Layout-Tokens Test fehlgeschlagen:", error.message);
    testsFailed++;
  }

  // Test 3: ComponentClasses existieren
  try {
    if (componentClasses.badge && componentClasses.badge.base) {
      console.log("✅ Badge-ComponentClasses sind verfügbar");
      testsPassed++;
    } else {
      throw new Error("Badge-ComponentClasses fehlen");
    }
  } catch (error) {
    console.log(
      "❌ Badge-ComponentClasses Test fehlgeschlagen:",
      error.message,
    );
    testsFailed++;
  }

  // Test 4: Components existieren
  try {
    if (components.button && components.button.base) {
      console.log("✅ Button-Components sind verfügbar");
      testsPassed++;
    } else {
      throw new Error("Button-Components fehlen");
    }
  } catch (error) {
    console.log("❌ Button-Components Test fehlgeschlagen:", error.message);
    testsFailed++;
  }

  // Test 5: Card-ComponentClasses existieren
  try {
    if (componentClasses.card && componentClasses.card.base) {
      console.log("✅ Card-ComponentClasses sind verfügbar");
      testsPassed++;
    } else {
      throw new Error("Card-ComponentClasses fehlen");
    }
  } catch (error) {
    console.log("❌ Card-ComponentClasses Test fehlgeschlagen:", error.message);
    testsFailed++;
  }

  console.log(`\n📊 Test-Ergebnisse:`);
  console.log(`   - Bestanden: ${testsPassed}`);
  console.log(`   - Fehlgeschlagen: ${testsFailed}`);
  console.log(`   - Gesamt: ${testsPassed + testsFailed}`);

  if (testsFailed === 0) {
    console.log(
      "\n🎉 Alle Tests bestanden! Design-Tokens sind korrekt konfiguriert.",
    );
    process.exit(0);
  } else {
    console.log(
      "\n⚠️  Einige Tests fehlgeschlagen. Bitte überprüfen Sie die Design-Tokens.",
    );
    process.exit(1);
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Design-Token Test Tool

Verwendung:
  node scripts/test-design-tokens.js [options]

Optionen:
  --help, -h    Zeigt diese Hilfe
  
Beispiele:
  node scripts/test-design-tokens.js
    `);
    process.exit(0);
  }

  testDesignTokens();
}

module.exports = { testDesignTokens };
