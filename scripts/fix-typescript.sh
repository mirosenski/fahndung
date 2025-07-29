#!/bin/bash

echo "🔧 TypeScript-Fehler automatisch beheben..."

# Kritische Fehler in trpc.ts beheben
echo "📝 Behebe kritische Fehler in trpc.ts..."

# AuthError Import hinzufügen falls nicht vorhanden
if ! grep -q "import.*AuthError" src/server/api/trpc.ts; then
  echo "➕ Füge AuthError Import hinzu..."
  sed -i '1i import { AuthError } from "@supabase/supabase-js";' src/server/api/trpc.ts
fi

# Error properties sicherer machen
sed -i 's/status: error\.status/status: "status" in error ? error.status : undefined/g' src/server/api/trpc.ts
sed -i 's/name: error\.name/name: "name" in error ? error.name : undefined/g' src/server/api/trpc.ts

# Buffer.from mit nullish coalescing absichern
sed -i 's/tokenParts\[1\]/tokenParts[1] ?? ""/g' src/server/api/trpc.ts

echo "✅ Kritische TypeScript-Fehler behoben!"

# Spezifische nullish coalescing Fälle ersetzen (nur wo es Sinn macht)
echo "🔄 Ersetze spezifische || durch ??..."
# Nur in Fällen wo null/undefined erwartet wird
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/\([a-zA-Z_][a-zA-Z0-9_]*\) \|\| \(null\|undefined\)/\1 ?? \2/g' {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/\(null\|undefined\) \|\| \([a-zA-Z_][a-zA-Z0-9_]*\)/\1 ?? \2/g' {} +

echo "✅ Spezifische nullish coalescing Fälle ersetzt!"

# TypeScript prüfen
echo "🔍 TypeScript-Prüfung..."
pnpm typecheck

echo "🎉 TypeScript-Fehler automatisch behoben!"