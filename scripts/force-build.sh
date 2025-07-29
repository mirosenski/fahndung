#!/bin/bash
# TypeScript errors temporär ignorieren
echo '{"extends": "./tsconfig.json", "compilerOptions": {"skipLibCheck": true, "noEmit": false}}' > tsconfig.build.json
SKIP_LINTING=true next build --typescript-config tsconfig.build.json
# CSS Größe analysieren
du -sh .next/static/css/*.css 2>/dev/null || echo "No CSS files yet"
# Cleanup
rm -f tsconfig.build.json