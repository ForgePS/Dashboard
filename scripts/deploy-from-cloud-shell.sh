#!/bin/bash
# Manual deploy from Google Cloud Shell when GitHub Actions credentials are not set up yet.
# Preferred: set up auto-deploy once with:
#   curl -fsSL https://raw.githubusercontent.com/ForgePS/Dashboard/main/scripts/setup-auto-deploy.sh | bash
# Open https://shell.cloud.google.com while signed in as jeremy@havoccalls.com
set -euo pipefail

PROJECT_ID="firehouse-dashboards"
REPO_DIR="${HOME}/Dashboard-deploy"
DEPLOY_SA="firebase-adminsdk-fbsvc@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud config set project "$PROJECT_ID"
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"

echo "==> Ensuring Service Account User on runtime accounts (required for functions deploy)"
APPENGINE_SA="${PROJECT_ID}@appspot.gserviceaccount.com"
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
for RUNTIME_SA in "$APPENGINE_SA" "$COMPUTE_SA"; do
  if gcloud iam service-accounts describe "$RUNTIME_SA" --project="$PROJECT_ID" >/dev/null 2>&1; then
    gcloud iam service-accounts add-iam-policy-binding "$RUNTIME_SA" \
      --project="$PROJECT_ID" \
      --member="serviceAccount:${DEPLOY_SA}" \
      --role="roles/iam.serviceAccountUser" \
      --quiet >/dev/null
  fi
done

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
echo "  https://firehouse-dashboards.web.app/congratulations"
echo "  https://firehouse-dashboards.web.app/api/congratulations"
echo "  https://firehouse-dashboards.web.app/api/signage-playlist?station=1"
