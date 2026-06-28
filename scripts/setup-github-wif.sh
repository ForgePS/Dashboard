#!/bin/bash
# One-time setup for keyless GitHub Actions deploy (no JSON keys).
# Run in Google Cloud Shell: bash scripts/setup-github-wif.sh
set -euo pipefail

PROJECT_ID="firehouse-dashboards"
POOL_ID="github-deploy"
PROVIDER_ID="github"
REPO="ForgePS/Dashboard"
SA_EMAIL="firebase-adminsdk-fbsvc@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud config set project "$PROJECT_ID"
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"

if ! gcloud iam workload-identity-pools describe "$POOL_ID" --location=global --project="$PROJECT_ID" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools create "$POOL_ID" \
    --project="$PROJECT_ID" \
    --location=global \
    --display-name="GitHub Actions deploy"
fi

if ! gcloud iam workload-identity-pools providers describe "$PROVIDER_ID" \
  --workload-identity-pool="$POOL_ID" --location=global --project="$PROJECT_ID" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_ID" \
    --project="$PROJECT_ID" \
    --location=global \
    --workload-identity-pool="$POOL_ID" \
    --display-name="GitHub" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
    --attribute-condition="assertion.repository_owner == 'ForgePS'"
fi

gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" \
  --project="$PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.repository/${REPO}"

PROVIDER="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/providers/${PROVIDER_ID}"

echo ""
echo "Setup complete. Add these GitHub repository VARIABLES (Settings -> Secrets and variables -> Actions -> Variables):"
echo ""
echo "GCP_WORKLOAD_IDENTITY_PROVIDER=${PROVIDER}"
echo "GCP_SERVICE_ACCOUNT=${SA_EMAIL}"
echo ""
echo "Then run Actions -> Deploy Firebase -> Run workflow"
