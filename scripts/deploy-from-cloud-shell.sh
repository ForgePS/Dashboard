#!/bin/bash
# One-time deploy from Google Cloud Shell (no service account keys required).
# Open https://shell.cloud.google.com while signed in as jeremy@havoccalls.com
set -euo pipefail

PROJECT_ID="firehouse-dashboards"
REPO_DIR="${HOME}/Dashboard-deploy"

gcloud config set project "$PROJECT_ID"

if [ ! -d "$REPO_DIR/.git" ]; then
  git clone https://github.com/ForgePS/Dashboard.git "$REPO_DIR"
else
  git -C "$REPO_DIR" pull origin main
fi

cd "$REPO_DIR"
npm ci
npx firebase-tools deploy --only functions,hosting --non-interactive --project "$PROJECT_ID"

echo ""
echo "Deploy complete. Verify:"
echo "  https://firehouse-dashboards.web.app/api/signage-playlist?station=1"
echo "  https://firehouse-dashboards.web.app/station1/mvix?station=1"
