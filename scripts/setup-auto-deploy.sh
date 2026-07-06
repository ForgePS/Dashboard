#!/bin/bash
# One-command setup for GitHub Actions auto-deploy.
# Run in Google Cloud Shell while signed in to jeremy@havoccalls.com:
#   curl -fsSL https://raw.githubusercontent.com/ForgePS/Dashboard/main/scripts/setup-auto-deploy.sh | bash
set -euo pipefail

REPO_DIR="${HOME}/Dashboard-setup"
REPO_URL="https://github.com/ForgePS/Dashboard.git"

if [ ! -d "$REPO_DIR/.git" ]; then
  git clone "$REPO_URL" "$REPO_DIR"
else
  git -C "$REPO_DIR" pull origin main
fi

bash "$REPO_DIR/scripts/setup-github-wif.sh"

echo ""
echo "Optional: deploy current production immediately from Cloud Shell:"
echo "  curl -fsSL https://raw.githubusercontent.com/ForgePS/Dashboard/main/scripts/deploy-from-cloud-shell.sh | bash"
