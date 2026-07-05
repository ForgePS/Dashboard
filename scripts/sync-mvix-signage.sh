#!/bin/bash
# Export MVIX schedule 709794 into signage-playlist.json and media assets.
# Usage:
#   export MVIX_ACCESS_TOKEN="your-token"
#   bash scripts/sync-mvix-signage.sh
#
# Optional commit + push:
#   COMMIT=1 bash scripts/sync-mvix-signage.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ -z "${MVIX_ACCESS_TOKEN:-}" ]; then
  echo "Set MVIX_ACCESS_TOKEN to a Bearer token from https://cms.mvix.com" >&2
  exit 1
fi

python3 scripts/export-mvix-schedule.py

echo ""
echo "Export complete."
echo "  Playlist: signage-playlist.json"
echo "  Verify:   cat signage-playlist.json | python3 -c \"import sys,json; d=json.load(sys.stdin); print(d.get('exportedAt'), len(d.get('slots',[])), 'slots')\""

if [ "${COMMIT:-}" = "1" ]; then
  git add signage-playlist.json data/mvix-schedule-*.snapshot.json public/signage/media/
  git add goodman-*-cameras.html signage-camera-*.html 2>/dev/null || true
  if git diff --staged --quiet; then
    echo "No changes to commit."
    exit 0
  fi
  git commit -m "Sync MVIX signage playlist"
  git push origin HEAD
  echo "Committed and pushed. Deploy with scripts/deploy-from-cloud-shell.sh if GitHub Actions deploy is not configured."
fi
