#!/bin/bash
# Update GOOGLE_MAPS_API_KEY for Firebase Cloud Functions (Cloud Shell).
# Usage:
#   bash scripts/update-google-maps-key.sh
#   bash scripts/update-google-maps-key.sh "AIzaSy..."
set -euo pipefail

PROJECT_ID="firehouse-dashboards"
SECRET_NAME="GOOGLE_MAPS_API_KEY"
REPO_DIR="${HOME}/Dashboard-deploy"

API_KEY="${1:-}"
if [ -z "$API_KEY" ]; then
  read -rsp "Paste the Google Maps API key from firehouse-dashboards credentials: " API_KEY
  echo ""
fi

API_KEY="$(printf '%s' "$API_KEY" | tr -d '[:space:]')"
if [ -z "$API_KEY" ]; then
  echo "No API key provided." >&2
  exit 1
fi

gcloud config set project "$PROJECT_ID"

echo "Enabling Secret Manager API (if needed)..."
gcloud services enable secretmanager.googleapis.com --project="$PROJECT_ID" >/dev/null

echo "Creating secret ${SECRET_NAME} (if needed)..."
if ! gcloud secrets describe "$SECRET_NAME" --project="$PROJECT_ID" >/dev/null 2>&1; then
  gcloud secrets create "$SECRET_NAME" \
    --project="$PROJECT_ID" \
    --replication-policy="automatic"
fi

echo "Adding new secret version..."
printf '%s' "$API_KEY" | gcloud secrets versions add "$SECRET_NAME" \
  --project="$PROJECT_ID" \
  --data-file=-

PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
RUNTIME_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
FIREBASE_SA="firebase-adminsdk-fbsvc@${PROJECT_ID}.iam.gserviceaccount.com"

echo "Granting secret access to function service accounts..."
for SA in "$RUNTIME_SA" "$FIREBASE_SA"; do
  gcloud secrets add-iam-policy-binding "$SECRET_NAME" \
    --project="$PROJECT_ID" \
    --member="serviceAccount:${SA}" \
    --role="roles/secretmanager.secretAccessor" >/dev/null 2>&1 || true
done

if [ ! -d "$REPO_DIR/.git" ]; then
  git clone https://github.com/ForgePS/Dashboard.git "$REPO_DIR"
else
  git -C "$REPO_DIR" pull origin main
fi

cd "$REPO_DIR"
npm ci

echo "Redeploying Cloud Functions so the new secret version is picked up..."
npx firebase-tools deploy --only functions --non-interactive --project "$PROJECT_ID"

echo ""
echo "Done. Verify maps health:"
echo "  https://firehouse-dashboards.web.app/api/map/health"
echo ""
echo "Key suffix in use should end with: ...${API_KEY: -6}"
