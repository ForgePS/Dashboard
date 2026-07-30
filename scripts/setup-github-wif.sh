#!/bin/bash
# One-time setup for keyless GitHub Actions deploy (no JSON keys).
# Run in Google Cloud Shell: bash scripts/setup-github-wif.sh
set -euo pipefail

PROJECT_ID="firehouse-dashboards"
POOL_ID="github-deploy"
PROVIDER_ID="github"
REPO="ForgePS/Dashboard"
SA_EMAIL="firebase-adminsdk-fbsvc@${PROJECT_ID}.iam.gserviceaccount.com"
GITHUB_VARS_URL="https://github.com/${REPO}/settings/variables/actions"
GITHUB_ACTIONS_URL="https://github.com/${REPO}/actions/workflows/deploy-firebase.yml"

echo "==> Configuring Workload Identity Federation for ${REPO}"

gcloud config set project "$PROJECT_ID"
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"

echo "==> Enabling required APIs"
gcloud services enable \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  cloudresourcemanager.googleapis.com \
  firebase.googleapis.com \
  cloudfunctions.googleapis.com \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  --project="$PROJECT_ID"

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

echo "==> Granting deploy roles to ${SA_EMAIL}"
for ROLE in \
  roles/firebase.admin \
  roles/cloudfunctions.developer \
  roles/run.admin \
  roles/iam.serviceAccountUser \
  roles/storage.admin \
  roles/cloudbuild.builds.editor \
  roles/artifactregistry.writer; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="$ROLE" \
    --condition=None \
    --quiet
done

# Cloud Functions deploy requires ActAs on the runtime service accounts.
APPENGINE_SA="${PROJECT_ID}@appspot.gserviceaccount.com"
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
for RUNTIME_SA in "$APPENGINE_SA" "$COMPUTE_SA" "$SA_EMAIL"; do
  if gcloud iam service-accounts describe "$RUNTIME_SA" --project="$PROJECT_ID" >/dev/null 2>&1; then
    echo "==> Granting Service Account User on ${RUNTIME_SA}"
    gcloud iam service-accounts add-iam-policy-binding "$RUNTIME_SA" \
      --project="$PROJECT_ID" \
      --member="serviceAccount:${SA_EMAIL}" \
      --role="roles/iam.serviceAccountUser" \
      --quiet
  fi
done

gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" \
  --project="$PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.repository/${REPO}" \
  --quiet

PROVIDER="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/providers/${PROVIDER_ID}"

echo ""
echo "================================================================"
echo "GitHub Actions auto-deploy is configured in GCP."
echo ""
echo "Add these repository VARIABLES (not secrets):"
echo "  ${GITHUB_VARS_URL}"
echo ""
echo "  Name: GCP_WORKLOAD_IDENTITY_PROVIDER"
echo "  Value:"
echo "  ${PROVIDER}"
echo ""
echo "  Name: GCP_SERVICE_ACCOUNT"
echo "  Value:"
echo "  ${SA_EMAIL}"
echo ""
echo "Then trigger a deploy:"
echo "  ${GITHUB_ACTIONS_URL}"
echo "  -> Run workflow -> Run workflow"
echo ""
echo "After that, every push to main deploys automatically."
echo "================================================================"
