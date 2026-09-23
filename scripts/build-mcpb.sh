#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUNDLE_DIR="$ROOT/mcpb"
OUT="$ROOT/readability.mcpb"
TMP_OUT="$ROOT/.readability.$$.mcpb"

cleanup() { rm -f "$TMP_OUT"; }
trap cleanup EXIT

cp "$ROOT/src/analyzer.js" "$ROOT/plugin/skills/readability/scripts/analyzer.js"
cp "$ROOT/src/check.js" "$ROOT/plugin/skills/readability/scripts/check.js"
cp "$ROOT/skills/readability/SKILL.md" "$ROOT/plugin/skills/readability/SKILL.md"
cp "$ROOT/skills/readability/package.json" "$ROOT/plugin/skills/readability/package.json"
cp "$ROOT/src/analyzer.js" "$ROOT/skills/readability/scripts/analyzer.js"
cp "$ROOT/src/check.js" "$ROOT/skills/readability/scripts/check.js"
cp "$ROOT/src/analyzer.js" "$BUNDLE_DIR/server/analyzer.js"

(cd "$BUNDLE_DIR/server" && npm ci --omit=dev --silent)
(cd "$ROOT" && npx mcpb validate "$BUNDLE_DIR/manifest.json")
(cd "$ROOT" && npx mcpb pack "$BUNDLE_DIR" "$TMP_OUT")

mv "$TMP_OUT" "$OUT"
(cd "$ROOT" && sha256sum "$(basename "$OUT")" > "$(basename "$OUT").sha256")
echo "Built $OUT ($(du -h "$OUT" | cut -f1))"
