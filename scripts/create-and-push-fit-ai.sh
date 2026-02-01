#!/usr/bin/env bash
# Creates the FIT_AI GitHub repo and pushes this project.
# Run: gh auth login   (first time only, then complete the browser step)
# Then: ./scripts/create-and-push-fit-ai.sh

set -e
cd "$(dirname "$0")/.."

echo "Checking GitHub auth..."
if ! gh auth status &>/dev/null; then
  echo "Not logged in to GitHub. Run: gh auth login"
  echo "Complete the browser step, then run this script again."
  exit 1
fi

echo "Creating repository FIT_AI on GitHub..."
gh repo create FIT_AI --public --source=. --remote=origin --description "FIT_AI - AI-Powered Fitness App MVP" --push

echo "Done. Your project is at: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)"
