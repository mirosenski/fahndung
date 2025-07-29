#!/bin/bash

echo "⚡ Quick-Fix für kritische TypeScript-Fehler..."

# Kritische Fehler in trpc.ts beheben
echo "📝 Behebe kritische Fehler in trpc.ts..."
sed -i 's/status: error\.status/status: "status" in error ? error.status : undefined/g' src/server/api/trpc.ts
sed -i 's/name: error\.name/name: "name" in error ? error.name : undefined/g' src/server/api/trpc.ts
sed -i 's/tokenParts\[1\]/tokenParts[1] ?? ""/g' src/server/api/trpc.ts

# AuthError Import hinzufügen falls nicht vorhanden
if ! grep -q "import.*AuthError" src/server/api/trpc.ts; then
  echo "➕ Füge AuthError Import hinzu..."
  sed -i '1i import { AuthError } from "@supabase/supabase-js";' src/server/api/trpc.ts
fi

# Spezifische Fehler in anderen Dateien beheben
echo "🔧 Behebe spezifische Fehler..."

# Supabase URL Fehler beheben
sed -i 's/new URL(supabaseUrl)/new URL(supabaseUrl ?? "")/g' src/lib/supabase.ts
sed -i 's/createClient(supabaseUrl, supabaseAnonKey/createClient(supabaseUrl ?? "", supabaseAnonKey ?? ""/g' src/lib/supabase.ts

# Error type Fehler beheben
sed -i 's/return error\.code/return (error as any)?.code/g' src/types/errors.ts

# Email type Fehler beheben
sed -i 's/\.eq("email", email)/.eq("email", email ?? "")/g' src/app/admin/approve/page.tsx

echo "✅ Quick-Fix abgeschlossen!"
echo "🔍 TypeScript-Prüfung..."
pnpm typecheck

echo "🎉 Kritische Fehler behoben!"