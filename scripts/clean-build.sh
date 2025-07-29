#!/bin/bash

echo "🚀 Ultimativer Clean-Build für Fahndung-Projekt..."

# 1. Cleanup
echo "🧹 Cleanup..."
rm -rf .next
rm -rf node_modules
rm -f tsconfig.tsbuildinfo
rm -f pnpm-lock.yaml

# 2. Fresh install
echo "📦 Fresh install..."
pnpm install

# 3. TypeScript-Fehler beheben
echo "🔧 TypeScript-Fehler beheben..."
./scripts/fix-typescript.sh

# 4. Lint und Format
echo "🎨 Lint und Format..."
pnpm lint:fix
pnpm format:write

# 5. Build
echo "🏗️ Build..."
pnpm build

echo "✅ Clean-Build abgeschlossen!"
echo "🎉 Projekt ist bereit für die Entwicklung!"