#!/bin/bash
# Fix für falsche ?? Verwendung
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/!\([a-zA-Z_]*\) ?? !\([a-zA-Z_]*\)/!\1 || !\2/g'
# Fix für andere TypeScript Fehler
pnpm typecheck 2>&1 | grep "error TS" | head -5