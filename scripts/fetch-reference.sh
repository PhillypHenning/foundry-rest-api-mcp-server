#!/usr/bin/env bash
# Re-download the ThreeHats foundryvtt-rest-api-relay docs into reference/ for offline ground-truth.
# These are upstream docs (see reference/SOURCE.md); they are mirrored here for development convenience.
set -euo pipefail

BASE="https://raw.githubusercontent.com/ThreeHats/foundryvtt-rest-api-relay/main"
DEST="$(cd "$(dirname "$0")/.." && pwd)/reference"
mkdir -p "$DEST"

API="index entity clients search structure dnd5e sheet effects encounter chat roll macro playlist scene canvas user utility session fileSystem auth events websocket"
EX="entity clients search structure dnd5e dnd5e-inventory dnd5e-concentration sheet effects effects-list encounter combat-subscribe chat roll macro playlist scene scene-image canvas user utility session fileSystem world-info auth account-security connection-tokens credentials hooks key-request notifications ws-core"
GUIDE="intro installation authentication scoped-keys configuration websocket permission-filtering cross-world-modules first-api-call foundry-module migration-v3-auth"

for f in $API;   do curl -fsSL "$BASE/docs/md/api/$f.md"            -o "$DEST/docs_md_api_$f.md"            || echo "MISS api/$f"; done
for f in $EX;    do curl -fsSL "$BASE/docs/examples/$f-examples.json" -o "$DEST/docs_examples_$f-examples.json" || echo "MISS ex/$f"; done
for f in $GUIDE; do curl -fsSL "$BASE/docs/md/$f.md"                 -o "$DEST/docs_md_$f.md"                 || echo "MISS guide/$f"; done
curl -fsSL "$BASE/README.md"    -o "$DEST/README.md"    || true
curl -fsSL "$BASE/CHANGELOG.md" -o "$DEST/CHANGELOG.md" || true

echo "Reference docs written to $DEST"
